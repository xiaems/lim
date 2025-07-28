import React, { useState, useEffect } from "react";
import { TouchableWithoutFeedback, View, BackHandler, TouchableNativeFeedback, TouchableOpacity, Text, TextInput } from "react-native";
import { InputText, Button } from "@src/commonComponent";
import { ArrowDownSmall } from "@utils/icons";
import { styles } from "../style";
import { useValues } from "../../../../../../App";
import { appColors, appFonts, windowHeight, windowWidth } from "@src/themes";
import { commonStyles } from "@src/styles/commonStyle";
import { useTheme } from "@react-navigation/native";
import { useLoadingContext } from "@src/utils/context";
import { SkeletonInput } from "./component";
import { useSelector } from "react-redux";
import CountryPicker, {
  Country,
  CountryCode,
} from 'react-native-country-picker-modal';


export function DataContainer({ data, updateProfile, show, setShow, width, Update }) {
  const { colors } = useTheme();
  const { isDark, viewRTLStyle, isRTL, textColorStyle, textRTLStyle, bgFullStyle, bgContainer, bgFullLayout } = useValues();
  const [currentCallingCode, setCurrentCallingCode] = useState(data?.country_code || "+1"); 
  const [cca2Code, setCca2Code] = useState(data?.cca2 || 'US');                                          
  const [loading, setLoading] = useState(false);
  const { addressLoaded, setAddressLoaded } = useLoadingContext();
  const { translateData } = useSelector((state: any) => state.setting);

useEffect(() => {
  if (data?.cca2) {
    setCca2Code(data.cca2);
  }
}, [data]);

  useEffect(() => {
    if (!addressLoaded) {
      setLoading(true);
      setLoading(false); 
      setAddressLoaded(true);
    }
  }, [addressLoaded, setAddressLoaded]);

  const SkeletonLoader = ({ variant }) => {
    let rectProps = { x: "0%", y: "0", width: "100%" };
    if (variant === 2) {
      rectProps = { x: "0%", y: "0", width: "100%" };
    } else if (variant === 3) {
      rectProps = { x: "0%", y: "0", width: "100%" };
    } else if (variant === 4) {
      rectProps = { x: "0%", y: "80%", width: "100%" };
    }

    return <SkeletonInput x={rectProps.x} width={rectProps.width} />;
  };

  const [phoneNumber, setPhoneNumber] = useState(data?.phone ? data.phone.toString() : "");
  const [form, setForm] = useState({
    username: data?.name,
    email: data?.email,
    countryCode: data?.country_code,
    cca2: cca2Code, 
    phoneNumber: data?.phone ? data.phone.toString() : "",
  });

  
  useEffect(() => {
    if (data?.country_code) {
     
      setCurrentCallingCode(data.country_code);
    }
  }, [data?.country_code]);


  const onChange = (name, value) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const closeCountryPicker = () => {
    setVisible(false); 
  };

  const handleBackgroundPress = () => {
    closeCountryPicker();
  };

  const handleBackPress = () => {
    if (visible) { 
      setVisible(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => {
      backHandler.remove();
    };
  }, [visible]);

  const [visible, setVisible] = useState(false);




  const onSelect = (selectedCountry: Country) => {
  setVisible(false); 
  const newCallingCode = `+${selectedCountry.callingCode[0]}`;
  const newCca2 = selectedCountry.cca2;

  setCurrentCallingCode(newCallingCode);
  setCca2Code(newCca2);
  onChange("countryCode", newCallingCode);
  onChange("cca2", newCca2); 
};


  return (
    <View style={styles.inputContainer}>
      {loading ? (
        <View style={{ marginTop: windowHeight(20), right: windowHeight(7) }}>
          {[1, 2, 3, 4].map((variant) => (
            <View key={variant} style={{ marginBottom: windowHeight(10) }}>
              <SkeletonLoader variant={variant} />
            </View>
          ))}
        </View>
      ) : (
        <>
          <InputText
            title={translateData.userName}
            showTitle={true}
            borderColor={isDark ? bgContainer : appColors.lightGray}
            backgroundColor={isDark ? bgContainer : appColors.lightGray}
            placeholder={translateData.enterUserName}
            placeholderTextColor={
              isDark ? appColors.darkText : appColors.regularText
            }
            show
            value={form.username}
            onChangeText={(value) => onChange("username", value)}
          />
          <Text
            style={[
              {
                color: isDark ? appColors.whiteColor : appColors.primaryText,
                fontFamily: appFonts.medium,
                textAlign: textRTLStyle,
                top: windowHeight(8),
                marginTop: windowHeight(8)
              },
            ]}
          >
            {translateData.mobileNumber}
          </Text>

          <View style={styles.countryMainView}>
              <View>
                <View style={{ flexDirection: viewRTLStyle }}>
                  <View
                    style={[
                      styles.countryCodeContainer,
                      {
                        backgroundColor: isDark ? bgContainer : appColors.lightGray,
                        borderColor: isDark ? bgContainer : appColors.lightGray,
                      },
                    ]}
                  >

                    <View>
                      <TouchableOpacity style={styles.pickerButton} onPress={() => setVisible(true)}>
                        <CountryPicker
                          countryCode={cca2Code as CountryCode}
                          withFilter={true} 
                          withFlag={true}
                          withCallingCode={true}
                          withAlphaFilter={true}
                          withEmoji={true}
                          onSelect={onSelect}
                          visible={visible}
                          onClose={() => setVisible(false)}
                        />
                        <Text style={[styles.codeText, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>
                          {currentCallingCode}
                        </Text>

                      </TouchableOpacity>
                    </View>
                    {visible && ( 
                      <TouchableWithoutFeedback onPress={handleBackgroundPress}>
                        <View style={styles.touchbleView} />
                      </TouchableWithoutFeedback>
                    )}
                  </View>

                  <View
                    style={[
                      styles.phoneNumberInput,
                      {
                        width: width || "71%",
                        backgroundColor: isDark ? bgContainer : appColors.lightGray,
                        borderColor: isDark ? bgContainer : appColors.lightGray,
                      },
                    ]}
                  >
                    <TextInput
                      style={[
                        commonStyles.regularText,
                        {
                          left: isRTL ? windowWidth(145) : windowWidth(13),
                          color: textColorStyle,
                        },
                      ]}
                      placeholderTextColor={
                        isDark ? appColors.darkText : appColors.regularText
                      }
                      placeholder={translateData.enterPhone}
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                    />
                  </View>
                </View>
              </View>
          </View>
          <View style={{ bottom: windowHeight(0) }}>
            <InputText
              title={translateData.email}
              showTitle={true}
              borderColor={isDark ? bgContainer : appColors.lightGray}
              backgroundColor={isDark ? bgContainer : appColors.lightGray}
              placeholder={translateData.enterEmail}
              placeholderTextColor={
                isDark ? appColors.darkText : appColors.regularText
              }
              show
              value={form.email}
              onChangeText={(value) => onChange("email", value)}
            />
          </View>

          <View style={{ flex: 0.67, justifyContent: "space-between" }}>

            <View style={{ marginTop: windowHeight(150), marginHorizontal: windowWidth(-22) }}>
              <Button
                title={translateData.updateProfile}
                onPress={() => updateProfile(form)}
                loading={Update}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}