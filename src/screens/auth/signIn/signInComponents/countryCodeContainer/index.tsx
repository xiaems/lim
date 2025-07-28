

import React, { useState } from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { commonStyles } from "../../../../../styles/commonStyle";
import { external } from "../../../../../styles/externalStyle";
import { appColors } from "@src/themes";
import styles from "../../styles";
import { useValues } from "../../../../../../App";
import { useSelector } from "react-redux";
import { validateEmail, ValidatePhoneNumber } from "@src/utils/validation";
import CountryPicker, {
} from 'react-native-country-picker-modal';

type CountryCodeContainerProps = {
  countryCode?: string;
  setCountryCode?: (code: string) => void;
  phoneNumber?: string;
  setPhoneNumber?: (number: string) => void;
  width?: number | string;
  backGroundColor?: string;
  textBgColor?: string;
  borderColor?: string;
  borderColor1?: string;
  warning?: boolean;
  setCca2?: (code: string) => void;

};

export function CountryCodeContainer({
  setCca2,
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
  width,
  backGroundColor,
  borderColor,
  borderColor1,
}: CountryCodeContainerProps) {
  const { viewRTLStyle, isDark, textRTLStyle } = useValues();
  const [show, setShow] = useState(false);
  const { translateData } = useSelector((state: any) => state.setting);
  const [numberShow, setNumberShow] = useState(true)
  const [error, setError] = useState('')
  const handleBackgroundPress = () => {
    setShow(false);
  };

  const handleTextChange = (newPhoneNumber: string) => {
    setPhoneNumber(newPhoneNumber);

    const isNumeric = /^\d*$/.test(newPhoneNumber);

    setNumberShow(isNumeric);

    if (isNumeric) {
      const errorMsg = ValidatePhoneNumber(newPhoneNumber);
      if (errorMsg) {
        setError(errorMsg);
        return;
      }
    } else {
      const errorMsg = validateEmail(newPhoneNumber);

      if (errorMsg) {
        setError(errorMsg);
        return;
      }
    }

    setError('');
  };


  const [country, setCountry] = useState({ callingCode: ['1'], cca2: 'US', emoji: '' });
  const [visible, setVisible] = useState(false);



  const onSelect = (selectedCountry) => {
    setCountry(selectedCountry);
    setVisible(false);
    if (setCountryCode) {
      setCountryCode(`+${selectedCountry.callingCode[0]}`);
    }
    if (setCca2) {
      setCca2(selectedCountry.cca2);
    }
  };

  return (
    <View onPress={handleBackgroundPress}>
      <View>
        <View
          style={[
            external.fd_row,
            external.ai_center,
            external.mt_5,
            { flexDirection: viewRTLStyle },
          ]}
        >
          {numberShow && (
            <View
              style={[
                styles.countryCodeContainer,
                {
                  backgroundColor: backGroundColor,
                  borderColor: borderColor1 ? borderColor1 : isDark ? appColors.darkPrimary : appColors.border,
                  alignItems: 'center',
                },
              ]}
            >
              <View>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setVisible(true)}>
                  <CountryPicker
                    countryCode={country.cca2}
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
                    {country.emoji} +{country.callingCode[0]}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View
            style={[
              styles.phoneNumberInput,
              {
                width: numberShow ? (width || "74%") : '100%',

                backgroundColor: backGroundColor,
                flexDirection: viewRTLStyle,
                borderColor: borderColor,
                right: numberShow ? 0 : '3%'

              },
            ]}
          >

            <TextInput
              style={[[commonStyles.regularText, { color: isDark ? appColors.whiteColor : appColors.blackColor }], [styles.inputText, { textAlign: textRTLStyle }]]}
              placeholderTextColor={isDark ? appColors.darkText : appColors.regularText}
              placeholder={translateData.enterNumberandEmailBoth}
              keyboardType="default"
              value={phoneNumber}
              onChangeText={handleTextChange}

            />

          </View>
        </View>
        {error && <Text style={styles.warningText}>{error}</Text>}
      </View>
    </View>
  );
}

