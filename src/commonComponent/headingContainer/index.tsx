import { Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import React from 'react';
import { Back } from '@utils/icons';
import { styles } from './style';
import { headerPropType } from './types';
import { useValues } from '../../../App';
import { appColors } from '@src/themes';
import { useAppNavigation } from '@src/utils/navigation';

export function HeaderContainer({
  value,
  show,
  icon,
  onPressIcon,
}: headerPropType) {
  const { textColorStyle, bgContainer, imageRTLStyle, viewRTLStyle, isDark } = useValues();
  const { goBack } = useAppNavigation();
  const flexGrowValue: number | null = show ? null : 0.45;
  const justifyContentValue: 'space-between' | null = show
    ? 'space-between'
    : null;

  return (
    <SafeAreaView
      style={[
        styles.viewContainer,
        { justifyContent: justifyContentValue as any },
        { flexDirection: viewRTLStyle },
      ]}>
      <TouchableOpacity
        onPress={() => goBack()}
        style={{
          flexGrow: flexGrowValue as number,
          flexDirection: viewRTLStyle,
        }}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: bgContainer,
              borderColor: isDark ? appColors.darkBorder : appColors.border,
            },
            { transform: [{ scale: imageRTLStyle }] },
          ]}>
          <Back />
        </View>
      </TouchableOpacity>
      <Text style={[styles.textContainer, { color: textColorStyle }]}>
        {value}
      </Text>
      {show && (
        <TouchableOpacity onPress={onPressIcon} activeOpacity={0.7}
        >{icon}</TouchableOpacity>
      )}
    </SafeAreaView>
  );
};
