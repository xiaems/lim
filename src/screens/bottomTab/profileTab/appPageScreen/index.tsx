import React, { useState, useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {
  HeaderContainer,
  SolidLine,
  SwitchComponent,
  CommonModal,
  Button,
} from "@src/commonComponent";
import { commonStyles } from "../../../../styles/commonStyle";
import { external } from "../../../../styles/externalStyle";
import {
  BackArrow,
  ChangeLanguage,
  DarkTheme,
  RTL,
  CloseCircle,
} from "@utils/icons";
import { styles } from "./style";
import { useValues } from "../../../../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { appColors, appFonts, fontSizes, windowHeight } from "@src/themes";
import { useDispatch, useSelector } from "react-redux";
import { currencyDataGet, translateDataGet } from "../../../../api/store/actions/settingAction";
import { CustomRadioButton } from "../../../../commonComponent/radioButton/customRadioButton/index";
import { serviceDataGet } from "../../../../api/store/actions/serviceAction";
import { getValue } from "@src/utils/localstorage";
import { languageDataGet } from "../../../../api/store/actions/settingAction";

export function AppPageScreen() {
  const {
    isRTL,
    setIsRTL,
    isDark,
    setIsDark,
    textRTLStyle,
    setCurrPrice,
    setCurrSymbol,
    viewRTLStyle,
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
    imageRTLStyle,
    viewSelfRTLStyle,
  } = useValues();

  const { languageData, translateData, currencyData } = useSelector(
    (state) => state.setting
  );
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedPrimary, setSelectedPrimary] = useState("Cab");
  const [languageTitle, setLanguageTitle] = useState();
  const [visible, setModelVisible] = useState(false);
  const [visibleTwo, setModelVisibleTwo] = useState(false);
  const [toggles, setToggles] = useState([
    {
      id: "toggle4",
      title: translateData.appApgeTheme,
      value: isDark,
      icon: <DarkTheme />,
    },
    { id: "toggle5", title: translateData.rtl, value: isRTL, icon: <RTL /> },
  ]);
  const [lngValue, setLngValue] = useState();
  const dispatch = useDispatch();
  const { serviceData } = useSelector((state) => state.service);


  useEffect(() => {
    dispatch(languageDataGet());
    dispatch(currencyDataGet());
    dispatch(serviceDataGet());
  }, [dispatch]);


  const handleToggle = (toggleId: string) => {
    if (toggleId === "toggle4") {
      setIsDark((prevIsDark) => !prevIsDark);
      AsyncStorage.setItem("darkTheme", JSON.stringify(!isDark));
    }
    if (toggleId === "toggle5") {
      setIsRTL((prevIsRTL) => !prevIsRTL);
      AsyncStorage.setItem("rtl", JSON.stringify(!isRTL));
    }
    setToggles((prevToggles) =>
      prevToggles?.map((toggle) =>
        toggle.id === toggleId ? { ...toggle, value: !toggle.value } : toggle
      )
    );
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const selectedLanguage = await AsyncStorage.getItem("selectedLanguage");
        if (selectedLanguage !== null) {
          setSelectedLanguage(selectedLanguage);
          if (selectedLanguage === "en") {
            setLanguageTitle("English");
          } else if (selectedLanguage === "ar") {
            setLanguageTitle("العربية");
          } else if (selectedLanguage === "fr") {
            setLanguageTitle("Français");
          } else if (selectedLanguage === "es") {
            setLanguageTitle("Español");
          }

          if (selectedLanguage === "ar") {
            setIsRTL(true);
          }
        } else {
        }
      } catch (error) { }
    };
    getData();
  }, []);

  const openModal = () => {
    setModelVisibleTwo(true);
    const getData = async () => {
      try {
        const selectedLanguage = await AsyncStorage.getItem("selectedLanguage");
        if (selectedLanguage !== null) {
          setSelectedLanguage(selectedLanguage);
        } else {
        }
      } catch (error) { }
    };
    getData();
  };


  const closeModel = () => {
    setModelVisibleTwo(false);
  };

  const closeLanguage = () => {
    dispatch(translateDataGet())
    setModelVisibleTwo(false);
    AsyncStorage.setItem("selectedLanguage", selectedLanguage);
    if (selectedLanguage === "ar") {
      setIsRTL(true);
    } else {
      setIsRTL(false);
    }
  };


  const openCurrencyModal = () => {
    setModelVisible(true);

    const getData = async () => {
      try {
        const selectedCurrency = await AsyncStorage.getItem("selectedCurrency");

        if (selectedCurrency !== null) {
          setSelectedCurrency(selectedCurrency);
        } else {
        }
      } catch (error) {
        console.error("Error retrieving selected currency:", error);
      }
    };
    getData();
  };

  const closeCurrency = () => {
    setModelVisible(false);
    AsyncStorage.setItem("selectedCurrency", selectedCurrency);
    const selectedOption = currencyData.data.find(
      (option) => option.code === selectedCurrency
    );

    if (selectedOption) {
      setCurrPrice(selectedOption.exchange_rate);
      setCurrSymbol(selectedOption.symbol);
      setSelectedCurrency(selectedOption.code);
    }
  };

  const STORAGE_KEY = "selectedPrimaryService";

  useEffect(() => {
    const loadStoredSelection = async () => {
      const selectedCurrency = await getValue('selectedCurrency')
      if (selectedCurrency) {
        setSelectedCurrency(selectedCurrency)
      }
      try {
        const storedName = await getValue(STORAGE_KEY);
        if (storedName) {
          setSelectedPrimary(storedName);
        } else {
          const primaryItem = serviceData?.data?.find(
            (item) => item.is_primary === 1
          );
          if (primaryItem) {
            setSelectedPrimary(primaryItem.name);
          }
        }
      } catch (error) {
        console.error("Failed to load the stored selection:", error);
      }
    };

    loadStoredSelection();
  }, [serviceData]);



  return (
    <View style={[styles.container, { backgroundColor: linearColorStyle }]}>
      <View style={[styles.headerContainer, { backgroundColor: bgFullStyle }]}>
        <HeaderContainer value={translateData.appPages} />
      </View>
      <View
        style={[styles.appPagesContainer, { backgroundColor: bgFullStyle }]}
      >

        <>
          {toggles?.map((toggle, index) => (
            <View key={toggle.id}>
              <View
                style={[
                  styles.listItemContainer,
                  { flexDirection: viewRTLStyle },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: linearColorStyle },
                  ]}
                >
                  {toggle.icon}
                </View>
                <Text
                  style={[
                    styles.listItemText,
                    { color: textColorStyle },
                    { textAlign: textRTLStyle },
                  ]}
                >
                  {toggle.title}
                </Text>
                <SwitchComponent
                  Enable={toggle.value}
                  onPress={() => handleToggle(toggle.id)}
                />
              </View>
              {index !== toggles.length - 1 && (
                <SolidLine
                  color={isDark ? appColors.darkBorder : appColors.border}
                />
              )}
            </View>
          ))}

          {/* <SolidLine
            color={isDark ? appColors.darkBorder : appColors.border}
          /> */}

          {/* <TouchableOpacity
            activeOpacity={0.7}
            onPress={openCurrencyModal}
            style={[
              styles.listItemContainer,
              { flexDirection: viewRTLStyle },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: linearColorStyle },
              ]}
            >
              <ChangeCurrency />
            </View>
            <View style={[external.fg_95]}>
              <Text
                style={[
                  styles.listItemText,
                  { color: textColorStyle, textAlign: textRTLStyle },
                ]}
              >
                {translateData.changeCurrency}
              </Text>
              <Text
                style={[
                  commonStyles.regularText,
                  external.mh_15,
                  {
                    textAlign: textRTLStyle,
                    marginHorizontal: windowHeight(8),
                  },
                ]}
              >
                {selectedCurrency}
              </Text>
            </View>
            <View style={{ transform: [{ scale: imageRTLStyle }] }}>
              <BackArrow />
            </View>
          </TouchableOpacity> */}

          <SolidLine
            color={isDark ? appColors.darkBorder : appColors.border}
          />

          <TouchableOpacity
            activeOpacity={0.7}

            onPress={openModal}
            style={[
              styles.listItemContainer,
              { flexDirection: viewRTLStyle },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: linearColorStyle },
              ]}
            >
              <ChangeLanguage />
            </View>
            <View style={[external.fg_95]}>
              <Text
                style={[
                  styles.listItemText,
                  { color: textColorStyle, textAlign: textRTLStyle },
                ]}
              >
                {translateData.changeLanguage}
              </Text>
              <Text
                style={[
                  commonStyles.regularText,
                  external.mh_15,
                  {
                    textAlign: textRTLStyle,
                    marginHorizontal: windowHeight(8),
                  },
                ]}
              >
                {selectedLanguage}
              </Text>
            </View>
            <View style={{ transform: [{ scale: imageRTLStyle }] }}>
              <BackArrow />
            </View>
          </TouchableOpacity>

        </>

        <View>
          <CommonModal
            isVisible={visible}
            closeModal={closeCurrency}
            onPress={() => setModelVisible(false)}
            value={
              <View>
                <TouchableOpacity
                  activeOpacity={0.7}

                  style={{ alignItems: viewSelfRTLStyle }}
                  onPress={() => setModelVisible(false)}
                >
                  <CloseCircle />
                </TouchableOpacity>
                <Text
                  style={[
                    commonStyles.mediumTextBlack,
                    external.ti_center,
                    { color: textColorStyle },
                    external.mv_10,
                  ]}
                >
                  {translateData.changeCurrency}
                </Text>

                {currencyData?.data?.map((item, index) => {
                  const isLastItem = index === currencyData.length - 1;
                  return (
                    <View style={{ marginTop: windowHeight(2) }}>
                      <TouchableOpacity
                        onPress={() => setSelectedCurrency(item.code)}
                        activeOpacity={0.7}
                        style={[
                          external.ai_center,
                          external.mv_5,
                          { flexDirection: viewRTLStyle },
                        ]}
                      >
                        <View style={[styles.symbolView, { borderColor: isDark ? appColors.darkBorder : appColors.border }]}>
                          <Text style={styles.symbol}>{item.symbol}</Text>
                        </View>
                        <Text
                          style={[
                            external.mh_10,
                            external.fg_1,
                            {
                              textAlign: textRTLStyle,
                              color: isDark
                                ? appColors.whiteColor
                                : appColors.primaryText,
                              fontSize: fontSizes.FONT17,
                              fontWeight:
                                selectedCurrency === item.code ? "500" : "300",
                            },
                          ]}
                        >
                          {item.code}
                        </Text>
                        <CustomRadioButton
                          selected={selectedCurrency === (item.code)}
                          onPress={() => setSelectedCurrency(item.code)}
                        />
                      </TouchableOpacity>
                      {!isLastItem && (
                        <SolidLine
                          color={isDark ? appColors.darkBorder : appColors.border}
                        />
                      )}
                    </View>
                  );
                })}
                <View style={styles.updateButton2}>
                  <Button title={translateData.update} onPress={closeCurrency} />
                </View>
              </View>
            }
          />
        </View>


        <View>
          <CommonModal
            isVisible={visibleTwo}
            closeModal={closeLanguage}
            onPress={() => setModelVisibleTwo(false)}
            value={
              <View>
                <TouchableOpacity
                  activeOpacity={0.7}

                  style={{ alignItems: viewSelfRTLStyle }}
                  onPress={closeModel}
                >
                  <CloseCircle />
                </TouchableOpacity>
                <Text
                  style={[
                    commonStyles.mediumTextBlack,
                    external.ti_center,
                    { color: textColorStyle },
                    external.mv_10,
                  ]}
                >
                  {translateData.changeLanguage}
                </Text>

                {languageData?.data?.length > 0 &&
                  languageData.data.map((item, index) => {
                    const isLastItem = index === languageData.data.length - 1;
                    return (
                      <View style={styles.languageContainer}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={[
                            external.ai_center,
                            external.mv_5,
                            { flexDirection: viewRTLStyle },
                          ]}
                          onPress={() => {
                            setSelectedLanguage(item.locale);
                            setLngValue(item.name);
                          }}
                        >
                          <Image style={styles.flagImage} source={{ uri: item.flag }} />
                          <Text
                            style={[
                              external.mh_10,
                              external.fg_1,
                              {
                                textAlign: textRTLStyle,
                                color: isDark
                                  ? appColors.whiteColor
                                  : appColors.primaryText,
                                fontSize: fontSizes.FONT17,
                                fontFamily: appFonts.medium,
                                fontWeight:
                                  selectedLanguage === item.locale ? "500" : "300",
                              },
                            ]}
                          >
                            {item.name}
                          </Text>

                          <CustomRadioButton
                            selected={selectedLanguage === item.locale}
                            onPress={() => {
                              setSelectedLanguage(item.locale);
                              setLngValue(item.name
                              );
                            }}
                          />
                        </TouchableOpacity>
                        <View style={styles.lineView}>
                          {!isLastItem && (
                            <SolidLine
                              color={
                                isDark ? appColors.darkBorder : appColors.border
                              }
                            />
                          )}
                        </View>
                      </View>
                    );
                  })}
                <View style={styles.updateButton1}>
                  <Button title={translateData.update} onPress={closeLanguage} />
                </View>
              </View>
            }
          />
        </View>
      </View>
    </View>
  );
}
