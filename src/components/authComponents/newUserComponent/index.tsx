import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import styles from './style';
import { NewUserTextProps } from './types';
import { useValues } from '../../../../App';

export function NewUserComponent({
  title,
  subtitle,
  onPress,
}: NewUserTextProps) {
  const { textColorStyle, viewRTLStyle } = useValues();

  return (
    <View style={[styles.newUserContainer, { flexDirection: viewRTLStyle }]}>
      <Text style={styles.newUser}>{title}</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text style={[styles.signUpText, { color: textColorStyle }]}>
          {subtitle}
        </Text>
      </TouchableOpacity>
    </View>
  );
};