import { SafeAreaView, ScrollView, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Button, HeaderTab } from "@src/commonComponent";
import { external } from "../../../../styles/externalStyle";
import { commonStyles } from "../../../../styles/commonStyle";
import { UserContainer } from "./profileComponent/userContainer/index";
import { ProfileContainer } from "./profileComponent/profileScreen/ProfileContainer";
import { styles } from "./style";
import { useValues } from "../../../../../App";
import { appColors, windowHeight } from "@src/themes";
import { getValue } from "@src/utils/localstorage";
import { useDispatch, useSelector } from "react-redux";
import DeviceInfo from "react-native-device-info";
import { couponListData, ticketDataGet, userSaveLocation } from "@src/api/store/actions";

export function ProfileSetting() {
  const { bgFullStyle, linearColorStyle } = useValues();
  const profileContainerRef = useRef(null);
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const { translateData } = useSelector((state: any) => state.setting);
  const dispatch = useDispatch();
  const [versionCode, setVersionCode] = useState('')

  useEffect(() => {
    const fetchVersion = async () => {
      const version = await DeviceInfo.getVersion()
      setVersionCode(version)
    }
    fetchVersion()
    dispatch(userSaveLocation());
    dispatch(couponListData());
    dispatch(ticketDataGet());
  }, [])

  const handleSignIn = () => {
    if (profileContainerRef.current) {
      profileContainerRef.current.gotoLoginWithoutNotification();
    }
  };

  useEffect(() => {
    const Tokenvalue = async () => {
      const value = await getValue("token");
      setToken(value);
    };
    Tokenvalue();
  }, []);

  return (

    <View style={styles.main}>
      <SafeAreaView style={[styles.container, { backgroundColor: bgFullStyle }]}>
        <View style={[commonStyles.heightHeader]}>
          <HeaderTab tabName={`${translateData.settingTitle}`} />
        </View>

        <ScrollView
          contentContainerStyle={[external.Pb_30]}
          showsVerticalScrollIndicator={false}
          style={[
            commonStyles.flexContainer,
            external.pt_15,
            { backgroundColor: linearColorStyle },
          ]}
        >
          <UserContainer />
          <ProfileContainer ref={profileContainerRef} />
          {token ? (
            <Text style={[styles.versionCode]}>
              {translateData.versionCode}: 0.{versionCode}
            </Text>
          ) : (
            <Text style={[styles.versionCode, { marginTop: windowHeight(11) }]}>
              {translateData.versionCode}: 0.{versionCode}
            </Text>
          )}
        </ScrollView>

        {token ? null : (
          <View style={styles.signInMainView}>
            <View style={styles.signInView}>
              <Button
                title={translateData.signIn}
                textColor={appColors.whiteColor}
                backgroundColor={appColors.primary}
                onPress={handleSignIn}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );


}
