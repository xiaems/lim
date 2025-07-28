import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContextType } from '../themeContext';
import { bgFullStyle, iconColorStyle, linearColorStyle, linearColorStyleTwo, textColorStyle, bgFullLayout, bgContainer, ShadowContainer } from '@src/styles/darkStyle';
import { imageRTLStyle, textRTLStyle, viewRTLStyle, viewSelfRTLStyle } from '@src/styles/rtlStyle';


const defaultValues: ThemeContextType = {
    isRTL: false,
    setIsRTL: () => { },
    isDark: false,
    setIsDark: () => { },
    ShadowContainer: '',
    bgContainer: '',
    bgFullLayout: '',
    linearColorStyleTwo: '',
    linearColorStyle: '',
    textColorStyle: '',
    iconColorStyle: '',
    bgFullStyle: '',
    textRTLStyle: '',
    viewRTLStyle: '',
    imageRTLStyle: 0,
    viewSelfRTLStyle: '',
    currSymbol: '',
    setCurrSymbol: () => { },
    currPrice: 0,
    setCurrPrice: () => { },
    token: '',
    setToken: '',
    googleMapKey: '',
};

export const CommonContext = createContext<ThemeContextType>(defaultValues);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [isRTL, setIsRTL] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [currSymbol, setCurrSymbolState] = useState('$');
    const [currPrice, setCurrValueState] = useState(1);
    const [token, setToken] = useState('');

    const googleMapKey =
        Platform.OS === 'android' ? 'your-android-key' : 'your-ios-key';

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const darkTheme = await AsyncStorage.getItem('darkTheme');
                if (darkTheme) setIsDark(JSON.parse(darkTheme));

                const rtl = await AsyncStorage.getItem('rtl');
                if (rtl) setIsRTL(JSON.parse(rtl));

                const tokenValue = await AsyncStorage.getItem('token');
                if (tokenValue) setToken(JSON.parse(tokenValue));

                const symbol = await AsyncStorage.getItem('currSymbol');
                const value = await AsyncStorage.getItem('currValue');
                if (symbol) setCurrSymbolState(symbol);
                if (value) setCurrValueState(parseFloat(value));
            } catch (error) {
                console.error('Context load error:', error);
            }
        };

        fetchSettings();
    }, []);

    const setCurrSymbol = async (symbol: string) => {
        await AsyncStorage.setItem('currSymbol', symbol);
        setCurrSymbolState(symbol);
    };

    const setCurrPrice = async (value: number) => {
        await AsyncStorage.setItem('currValue', value.toString());
        setCurrValueState(value);
    };

    const contextValues: ThemeContextType = {
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
        googleMapKey,
    };

    return (
        <CommonContext.Provider value={contextValues}>
            {children}
        </CommonContext.Provider>
    );
};

export const useValues = () => useContext(CommonContext);
