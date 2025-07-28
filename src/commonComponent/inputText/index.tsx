import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { style } from "./style";
import { appColors } from "@src/themes";
import { InputTextProps } from "./type";
import { external } from "../../styles/externalStyle";
import { useValues } from "../../../App";
import { windowHeight } from "@src/themes";

export function InputText({
  title,
  placeholder,
  icon,
  show,
  showTitle,
  marginVertical,
  backgroundColor,
  placeholderTextColor,
  rightIcon,
  onPress,
  keyboard,
  value,
  onChangeText,
  warningText,
  secureText,
  borderColor,
  editable,
}: InputTextProps) {
  const { bgFullStyle, textRTLStyle, isDark } = useValues();

  return (
    <View style={style.container}>
      {showTitle && (
        <Text style={[style.title, { textAlign: textRTLStyle, color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{title}</Text>
      )}

      <View
        style={[
          style.textInputContainer,

          { marginVertical: marginVertical },
          { backgroundColor: backgroundColor || bgFullStyle },
          borderColor ? {
            borderColor: borderColor, borderWidth: windowHeight(1),
          } : {},]}
      >
        {icon && <View style={{ paddingHorizontal: show ? windowHeight(7) : windowHeight(5), left: windowHeight(4) }}>{icon}</View>}
        <TextInput
          style={[
            style.textInputColor,
            { paddingHorizontal: icon ? windowHeight(5) : windowHeight(13) },

            { textAlign: textRTLStyle },
            { color: isDark ? appColors.whiteColor : appColors.blackColor }
          ]} placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || appColors.regularText}
          keyboardType={keyboard}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureText}
          editable={editable}
        />
        {rightIcon && (
          <TouchableOpacity style={[external.mh_5]} onPress={onPress} activeOpacity={0.7}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {warningText ? (
        <Text style={style.warningText}>{warningText}</Text>
      ) : null}
    </View>
  );
}
