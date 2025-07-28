import React, { useEffect, useState, useCallback, useContext } from "react";
import { SafeAreaView, ScrollView, View, BackHandler, Text, StatusBar } from "react-native";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import { commonStyles } from "../../../styles/commonStyle";
import { TodayOfferContainer } from "../../../components/homeScreen/todaysOffer";
import { TopCategory } from "../../../components/homeScreen/topCategory";
import { HomeSlider } from "../../../components/homeScreen/slider";
import { HeaderContainer } from "../../../components/homeScreen/headerContainer";
import styles from "./styles";
import { useValues } from "../../../../App";
import { CommonModal, Button } from "@src/commonComponent";
import { external } from "../../../styles/externalStyle";
import { appColors, appFonts, fontSizes } from "@src/themes";
import { LocationContext } from "../../../utils/locationContext";
import { useDispatch, useSelector } from "react-redux";
import { vehicleData, vehicleTypeDataGet } from "../../../api/store/actions/vehicleTypeAction";
import SwipeButton from "@src/commonComponent/sliderButton";
import { useAppNavigation } from "@src/utils/navigation";
import { Recentbooking } from "@src/screens/recentBooking";
import { BottomTitle } from "@src/components";
import { allRides, notificationDataGet, paymentsData, serviceDataGet, taxidosettingDataGet, walletData } from "@src/api/store/actions";
import { HomeLoader } from "../HomeLoader";
import useStoredLocation from "@src/components/helper/useStoredLocation";
import useSmartLocation from "@src/components/helper/locationHelper";


export function HomeScreen() {
  const dispatch = useDispatch();
  const { textColorStyle, viewRTLStyle, isDark } = useValues();
  const isFocused = useIsFocused();
  const [selected, setSelected] = useState(false);
  const context = useContext(LocationContext);
  const { setPickupLocationLocal, setStopsLocal, setDestinationLocal } = context;
  const [isScrolling, setIsScrolling] = useState(true);
  const { translateData } = useSelector((state: any) => state.setting);
  const { reset } = useAppNavigation();
  const { self } = useSelector((state) => state.account);
  const { homeScreenDataPrimary, loading } = useSelector((state) => state.home);
  const { latitude, longitude } = useStoredLocation();
  const { currentLatitude, currentLongitude } = useSmartLocation();

  useEffect(() => {
    dispatch(taxidosettingDataGet());
    dispatch(allRides());
    dispatch(serviceDataGet());
    dispatch(vehicleData());
    dispatch(walletData());
    dispatch(paymentsData());
    dispatch(notificationDataGet());
    getVehicleTypes();
  }, []);

  const getVehicleTypes = async () => {
    const locations = [
      {
        lat: latitude,
        lng: longitude,
      },
    ];
    dispatch(vehicleTypeDataGet({ locations }));
  };

  useEffect(() => {
    const backAction = () => {
      setSelected(true);
      return true;
    };
    if (isFocused) {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      setPickupLocationLocal(null);
      setDestinationLocal(null);
      setStopsLocal([]);
      StatusBar.setBackgroundColor(appColors.primary);
      StatusBar.setBarStyle("light-content");
      return () => {
        StatusBar.setBackgroundColor("transparent");
        StatusBar.setBarStyle("dark-content");
      };
    }, [])
  );

  const exitAndRestart = () => {
    setSelected(false);
    setTimeout(() => {
      BackHandler.exitApp();
      reset({
        index: 0,
        routes: [{ name: "Splash" }],
      });
    }, 500);
  };


  const isDataEmpty =
    !homeScreenDataPrimary ||
    Object.keys(homeScreenDataPrimary).length === 0 ||
    homeScreenDataPrimary === null;

  return (
    <View
      style={[
        commonStyles.flexContainer,
        { backgroundColor: appColors.lightGray },
      ]}
    >
      <SafeAreaView style={styles.container}>
        <HeaderContainer />
      </SafeAreaView>
      {loading || isDataEmpty ? (
        <HomeLoader />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          nestedScrollEnabled={true}
          scrollEnabled={isScrolling}
          contentContainerStyle={[
            styles.containerStyle,
            {
              backgroundColor: isDark
                ? appColors.bgDark
                : appColors.lightGray,
            },
          ]}
        >
          {homeScreenDataPrimary?.banners?.length > 0 && (
            <HomeSlider
              onSwipeStart={() => setIsScrolling(false)}
              onSwipeEnd={() => setIsScrolling(true)}
              bannerData={homeScreenDataPrimary.banners}
            />
          )}
          {homeScreenDataPrimary?.service_categories?.length > 0 && (
            <TopCategory
              categoryData={homeScreenDataPrimary.service_categories}
            />
          )}
          {homeScreenDataPrimary?.recent_rides?.length > 0 && (
            <Recentbooking
              recentRideData={homeScreenDataPrimary.recent_rides}
            />
          )}
          {homeScreenDataPrimary?.coupons?.length > 0 && (
            <View
              style={styles.todayOfferContainer}
            >
              <TodayOfferContainer
                couponsData={homeScreenDataPrimary.coupons}
              />
            </View>
          )}
          <BottomTitle />
        </ScrollView>
      )}
      <View>
        <CommonModal
          animationType="none"
          isVisible={selected}
          onPress={() => setSelected(false)}
          value={
            <View>
              <View style={styles.modelView}>
                <Text
                  style={[
                    external.ti_center,
                    { color: textColorStyle, fontFamily: appFonts.regular, fontSize: fontSizes.FONT22 },
                  ]}
                >
                  {translateData?.exitTitle}
                </Text>
              </View>
              <View
                style={[
                  external.ai_center,
                  external.js_space,
                  external.mt_25,
                  { flexDirection: viewRTLStyle },
                ]}
              >
                <Button
                  width={"47%"}
                  title={translateData.no}
                  onPress={() => setSelected(false)}
                />
                <Button
                  width={"47%"}
                  backgroundColor={appColors.lightGray}
                  title={translateData.yes}
                  textColor={appColors.primaryText}
                  onPress={exitAndRestart}
                />
              </View>
            </View>
          }
        />
      </View>
      {self?.total_active_rides > 0 && (
        <View style={styles.swipeView}>
          <SwipeButton buttonText={translateData.backToActive} />
        </View>
      )}
    </View>
  );
}
