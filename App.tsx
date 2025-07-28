import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform, StatusBar, View } from "react-native";
import MyStack from "./src/navigation/index";
import { external } from "./src/styles/externalStyle";
import { imageRTLStyle, textRTLStyle, viewRTLStyle, viewSelfRTLStyle } from "./src/styles/rtlStyle";
import { bgFullStyle, iconColorStyle, linearColorStyle, linearColorStyleTwo, textColorStyle, bgFullLayout, bgContainer, ShadowContainer } from "./src/styles/darkStyle";
import { ThemeContextType } from "./src/utils/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider } from "react-redux";
import store from "./src/api/store/index";
import { LocationProvider } from "./src/utils/locationContext";
import { MenuProvider } from "react-native-popup-menu";
import { NotificationServices, requestUserPermission } from "@src/utils/pushNotificationHandler";
import { LoadingProvider } from "@src/utils/context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NotifierRoot } from "react-native-notifier";
import { enableScreens } from 'react-native-screens';
import NotificationHelper from "@src/components/helper/localNotificationHelper";

enableScreens();

const defaultValues: ThemeContextType = {
  isRTL: false,
  setIsRTL: () => { },
  isDark: false,
  setIsDark: () => { },
  ShadowContainer: "",
  bgContainer: "",
  bgFullLayout: "",
  linearColorStyleTwo: "",
  linearColorStyle: "",
  textColorStyle: "",
  iconColorStyle: "",
  bgFullStyle: "",
  textRTLStyle: "",
  viewRTLStyle: "",
  imageRTLStyle: 0,
  viewSelfRTLStyle: "",
  currSymbol: "",
  setCurrSymbol: () => { },
  currPrice: 0,
  setCurrPrice: () => { },
  setToken: "",
  Google_Map_Key: ''
};
export const CommonContext = createContext<ThemeContextType>(defaultValues);

function App(): React.JSX.Element {
  const [isRTL, setIsRTL] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currSymbol, setCurrSymbolState] = useState("$");
  const [currPrice, setCurrValueState] = useState(1);
  const [token, setToken] = useState("");
  const Google_Map_Key = Platform.OS === 'android'   //enter you map key hear
    ? 'ANDROID_GOOGLE_MAP_KEY'
    : 'IOS_GOOGLE_MAP_KEY'

  useEffect(() => {
    const fetchDarkTheme = async () => {
      try {
        const darkThemeValue = await AsyncStorage.getItem("darkTheme");
        if (darkThemeValue !== null) {
          setIsDark(JSON.parse(darkThemeValue));
        }
      } catch (error) {
        console.error("Error retrieving dark theme value:", error);
      }
    };

    fetchDarkTheme();
    NotificationServices();
    requestUserPermission();
  }, []);

  useEffect(() => {
    const fetchRtl = async () => {
      try {
        const rtlValue = await AsyncStorage.getItem("rtl");
        if (rtlValue !== null) {
          setIsRTL(JSON.parse(rtlValue));
        }
      } catch (error) {
        console.error("Error retrieving rtl value:", error);
      }
    };

    fetchRtl();
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tokenValue = await AsyncStorage.getItem("token");
        if (tokenValue !== null) {
          setToken(JSON.parse(tokenValue));
        }
      } catch (error) {
        console.error("Error retrieving rtl value:", error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const loadCurrencyFromStorage = async () => {
      try {
        const savedCurrSymbol = await AsyncStorage.getItem("currSymbol");
        const savedCurrValue = await AsyncStorage.getItem("currValue");
        if (savedCurrSymbol && savedCurrValue) {
          setCurrSymbolState(savedCurrSymbol);
          setCurrValueState(parseFloat(savedCurrValue));
        }
      } catch (error) {
        console.error("Error loading currency from storage:", error);
      }
    };
    loadCurrencyFromStorage();

    const loadLanguageFromStorage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("selectedLanguage");
        if (savedLanguage) {
        }
      } catch (error) {
        console.error("Error loading language from storage:", error);
      }
    };
    loadLanguageFromStorage();
  }, []);

  const setCurrSymbol = async (symbol: string) => {
    try {
      await AsyncStorage.setItem("currSymbol", symbol);
      setCurrSymbolState(symbol);
    } catch (error) {
      console.error("Error setting currSymbol:", error);
    }
  };

  const setCurrPrice = async (value: number) => {
    try {
      await AsyncStorage.setItem("currValue", value.toString());
      setCurrValueState(value);
    } catch (error) {
      console.error("Error setting currValue:", error);
    }
  };

  const contextValues = {
    isRTL,
    setIsRTL,
    isDark,
    setIsDark,
    ShadowContainer: ShadowContainer(isDark),
    bgContainer: bgContainer(isDark),
    bgFullLayout: bgFullLayout(isDark),
    linearColorStyleTwo: linearColorStyleTwo(isDark),
    linearColorStyle: linearColorStyle(isDark),
    textColorStyle: textColorStyle(isDark),
    iconColorStyle: iconColorStyle(isDark),
    bgFullStyle: bgFullStyle(isDark),
    textRTLStyle: textRTLStyle(isRTL),
    viewRTLStyle: viewRTLStyle(isRTL),
    imageRTLStyle: imageRTLStyle(isRTL),
    viewSelfRTLStyle: viewSelfRTLStyle(isRTL),
    currSymbol,
    setCurrSymbol,
    currPrice,
    setCurrPrice,
    token,
    setToken,
    Google_Map_Key: Google_Map_Key,
  };
  useEffect(() => {
    NotificationHelper.configure();
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ paddingTop: Platform.OS === 'ios' ? 60 : 0 }} />
      <NotifierRoot />
      <MenuProvider>
        <Provider store={store}>
          <LoadingProvider>
            <CommonContext.Provider value={contextValues}>
              <LocationProvider>
                <View style={[external.fx_1]}>
                  <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#000" : "#fff"} />
                  <MyStack />
                </View>
              </LocationProvider>
            </CommonContext.Provider>
          </LoadingProvider>
        </Provider>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}
export const useValues = () => useContext(CommonContext);

export default App;






