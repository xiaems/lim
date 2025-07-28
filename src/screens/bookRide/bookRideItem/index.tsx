import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import React from 'react';
import { external } from '../../../styles/externalStyle';
import { styles } from '../styles';
import { SolidLine } from '@src/commonComponent';
import { commonStyles } from '../../../styles/commonStyle';
import { appColors } from '@src/themes';
import { Info } from '@src/utils/icons';
import { bookRideItemType } from './types';
import { useValues } from '../../../../App';

export function BookRideItem({
  item,
  onPress,
  isSelected,
  onPressAlternate,
  isDisabled,
}: bookRideItemType) {
  const { bgContainer, bgFullLayout } = useValues();



  return (
    <TouchableOpacity
      activeOpacity={0.7}

      style={[
        styles.container,
        {
          backgroundColor: isSelected ? appColors.selectPrimary : bgFullLayout,
          borderColor: isSelected ? appColors.primary : bgContainer,
        },
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <View style={[external.ai_center]}>
        <Image
          style={[
            styles.img,
            isDisabled && !isSelected && {
              opacity: 0.5,
            },
          ]}
          source={{ uri: item?.vehicle_image_url }}
        />
        <View style={styles.solidLineView}>
          <SolidLine color={appColors.primaryGray} />
        </View>
      </View>

      <TouchableOpacity
        style={[external.fd_row, external.js_space, external.mh_8]}
        onPress={onPressAlternate}
        disabled={isDisabled}
        activeOpacity={0.7}

      >
        <Text
          style={[
            commonStyles.regularText,
            styles.vehicleName,
            isDisabled && !isSelected && { color: 'gray' },
          ]}
        >
          {item.name}
        </Text>
        <View>
          <Info />
        </View>
      </TouchableOpacity>

      {isDisabled && !isSelected && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: appColors.transparentBlack,
            borderRadius: styles.container.borderRadius,
          }}
          pointerEvents="none"
        />
      )}
    </TouchableOpacity>
  );
}
