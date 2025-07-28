import { Image, Text, View } from 'react-native';
import React from 'react';
import { styles } from '../styles';
import { external } from '../../../styles/externalStyle';
import { commonStyles } from '../../../styles/commonStyle';
import { appColors, appFonts, windowHeight } from '@src/themes';
import { SolidLine, Button } from '@src/commonComponent';
import { modalItemType } from './types';
import { useValues } from '../../../../App';
import { Clock, UserFill, UserFillSmall } from '@utils/icons'
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';

export function ModalContainers({ onPress, selectedItemData, distance }: modalItemType) {

  const { viewRTLStyle, textRTLStyle, textColorStyle, bgContainer, isDark } = useValues();
  const { colors } = useTheme()
  const { translateData } = useSelector((state) => state.setting);
  const { zoneValue } = useSelector((state: any) => state.zone);

  return (
    <View>
      <View style={{ backgroundColor: bgContainer }} >
        <View style={[styles.modalTitle, { flexDirection: viewRTLStyle, }]}>
          <View style={{ flexDirection: viewRTLStyle, justifyContent: 'center', height: windowHeight(18), alignItems: 'center' }}>
            <Text style={[{ color: isDark ? appColors.whiteColor : appColors.primaryText }, styles.boldText]}>{selectedItemData?.name}</Text>
            <View style={[styles.verticalLine, { borderRightColor: colors.border }]} />
            <UserFillSmall />
            <Text style={{ color: appColors.primaryText, fontFamily: appFonts.medium }}>{selectedItemData?.seat}</Text>
          </View>
          <View style={{ flexDirection: viewRTLStyle }}>
            <Text style={styles.price}>
              {zoneValue.currency_symbol}{Math.round(zoneValue?.exchange_rate * (selectedItemData?.min_per_unit_charge * distance))}-
              {zoneValue.currency_symbol}{Math.round(zoneValue?.exchange_rate * (selectedItemData?.max_per_unit_charge * distance))}
            </Text>
          </View>
        </View>
        <View style={styles.solidLine}>
          <SolidLine />
        </View>
        <Image style={styles.carTwo} source={{ uri: selectedItemData?.vehicle_image_url }} />
        <View>
          <View style={[styles.viewContainer, { flexDirection: viewRTLStyle }]}>
            <View style={[{ flexDirection: viewRTLStyle }]}>
              <View style={styles.clock}>
                <Clock color={isDark ? appColors.whiteColor : appColors.primaryText} />
              </View>
              <Text style={[styles.fiveMinAway, { color: textColorStyle }]}>{translateData.time}</Text>
            </View>
          </View>
          <Text style={[commonStyles.regularText, { textAlign: textRTLStyle }]}>
            {translateData.subTitle}
          </Text>
          <View style={styles.solidLine}>
            <SolidLine />
          </View>
          <Text style={[styles.termsText, { color: textColorStyle, textAlign: textRTLStyle }]}>{translateData.terms}</Text>
          <View>
            <Text style={[commonStyles.regularText, external.mb_15, { textAlign: textRTLStyle }]}>
              {'\u2022'} {translateData.bookRideCancelCharge} {zoneValue.currency_symbol}{zoneValue?.exchange_rate * selectedItemData?.cancellation_charge} {translateData.deducted}
            </Text>
            <Text style={[commonStyles.regularText, external.mb_15, { textAlign: textRTLStyle }]}>
              {'\u2022'} {translateData.bookRideArrive} {selectedItemData?.waiting_time_limit} {translateData.forcedCancelTheRide}
            </Text>
          </View>
        </View>
        <View style={[external.mv_10]}>
          <Button title={translateData.done} onPress={onPress} />
        </View>
      </View>
    </View >
  );
};
