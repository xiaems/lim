import React, { useEffect, useState, useCallback } from "react";
import { Alert, Image, View } from "react-native";
import { external } from "../../../styles/externalStyle";
import { appColors } from "@src/themes";
import Images from "@utils/images";
import { styles } from "./styles";
import { getValue, setValue, deleteValue } from "../../../utils/localstorage/index";
import { useDispatch, useSelector } from "react-redux";
import { homeScreenPrimary, selfData, settingDataGet, taxidosettingDataGet, translateDataGet, userZone } from "../../../api/store/actions";
import { NoInternet } from "@src/components";
import { useAppNavigation } from "@src/utils/navigation";
import { useValues } from "@App";
import DeviceInfo from "react-native-device-info";
import useSmartLocation from "@src/components/helper/locationHelper";
import store from "@src/api/store";

export function Splash() {
  const { replace } = useAppNavigation();
  const { isDark } = useValues();
  const dispatch = useDispatch();
  const { settingData, taxidoSettingData } = useSelector((state) => state.setting);
  const [splashImage, setSplashImage] = useState(null);
  const [showNoInternet, setShowNoInternet] = useState(false);
  const { translateData } = useSelector((state) => state.setting);
  const { currentLatitude, currentLongitude } = useSmartLocation();
  const { zoneValue } = useSelector((state) => state.zone);

  useEffect(() => {
    const loadSplashImage = async () => {
      try {
        const cachedImage = await getValue("splashImage");
        if (cachedImage) setSplashImage(cachedImage);
      } catch (error) {
        console.error("Error loading splash image:", error);
      }
    };
    loadSplashImage();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(homeScreenPrimary())
      await dispatch(taxidosettingDataGet());
      await dispatch(translateDataGet());
      await dispatch(settingDataGet());
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const updateSplashImage = async () => {
      const serverImage = taxidoSettingData?.taxido_values?.setting?.splash_screen?.original_url;
      try {
        if (serverImage) await setValue("splashImage", serverImage);
        else await deleteValue("splashImage");
      } catch (error) {
        console.error("Error updating splash image:", error);
      }
    };
    if (taxidoSettingData) updateSplashImage();
  }, [taxidoSettingData]);

  useEffect(() => {
    if (!settingData?.values?.activation) return;
    if (settingData?.values?.activation?.maintenance_mode === "1") {
      setShowNoInternet(true);
    } else {
      proceedToNextScreen();
    }

  }, [settingData]);

  const proceedToNextScreen = useCallback(async () => {
    try {
      const token = await getValue("token");
      const versionCode = parseInt(await DeviceInfo.getBuildNumber(), 10);
      const requiredVersion = parseInt(taxidoSettingData?.taxido_values?.setting?.app_version, 10) || 0;
      const forceUpdate = taxidoSettingData?.taxido_values?.activation?.force_update === "1";

      if (forceUpdate && versionCode < requiredVersion) {
        Alert.alert("Update Required", "A new version of the app is available. Please update to continue.", [
          { text: "OK", onPress: () => console.log("Redirect to app store") },
        ]);
        return;
      }

      const waitForZone = async () => {
        const maxRetries = 50;
        const dispatchRetryPoint = 25;
        let retries = 0;
        let latestZone = null;

        while (retries < maxRetries) {
          const state = store.getState();
          latestZone = state.zone.zoneValue;

          if (latestZone && Object.keys(latestZone).length > 0) break;
          if (retries === dispatchRetryPoint) {
            dispatch(userZone({ lat: currentLatitude, lng: currentLongitude }));
          }

          await new Promise(resolve => setTimeout(resolve, 200));
          retries++;
        }

        if (latestZone && Object.keys(latestZone).length > 0) {
          if (latestZone.success === false) {
            replace("NoService");
          } else {
            if (token) {
              dispatch(selfData());
              replace("MyTabs");
            } else {
              replace("Onboarding");
            }
          }
        } else {
          replace("NoService");
        }
      };

      await waitForZone();
    } catch (error) {
      console.error("Error in proceedToNextScreen:", error);
    }
  }, [dispatch, replace, taxidoSettingData]);

  const handleRefresh = useCallback(() => {
    dispatch(taxidosettingDataGet());
    dispatch(settingDataGet());
  }, [dispatch]);

  if (showNoInternet) {
    return (
      <NoInternet
        onRefresh={handleRefresh}
        title={translateData.appUnderMaintenance}
        details={translateData.onlineShortly}
        image={isDark ? Images.maintenanceDark : Images.maintenance}
        infoIcon={false}
      />
    );
  }

  return (
    <View style={[external.fx_1, { backgroundColor: appColors.whiteColor }]}>
      <View style={[external.ai_center, external.js_center, external.fx_1]}>
        <Image
          source={splashImage ? { uri: splashImage } : Images.splashUser}
          style={styles.img}
          onError={() => deleteValue("splashImage")}
        />
      </View>
    </View>
  );
}
