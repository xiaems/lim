import { Image, Text, View } from 'react-native';
import React from 'react';
import { commonStyles } from '../../../../../../styles/commonStyle';
import { external } from '../../../../../../styles/externalStyle';
import { driverReviewData } from '../../../../../../data/driverDetails/index';
import Images from '@utils/images'; 
import { styles } from './style';
import { useValues } from '../../../../../../../App';
import { Star } from '@utils/icons';

export function ReviewContainer() {
  const { textRTLStyle, viewRTLStyle, bgContainer, textColorStyle, t } = useValues();
  return (
    <View>
      <Text style={[commonStyles.mediumText23, external.mt_10, { textAlign: textRTLStyle }]}>
        {'Reviews'}
      </Text>
      {driverReviewData?.map((item, index) => (
        <View style={[styles.reviewItemContainer, { backgroundColor: bgContainer }]} key={index}>
          <View style={[styles.userInfoContainer, { flexDirection: viewRTLStyle }]}>
            <Image style={styles.userImage} source={Images.user} />
            <Text style={[styles.userName, { textAlign: textRTLStyle, color: textColorStyle }]}>{item.name}</Text>
            <View style={{ flexDirection: viewRTLStyle }}>
              <View style={styles.starView}>
                <Star />
              </View>
              <Text style={[styles.userRating, { textAlign: textRTLStyle }]}>{item.rating}</Text>
            </View>
          </View>
          <Text style={[styles.subTitle, { textAlign: textRTLStyle, color: textColorStyle }]}>{item.subTitle}</Text>
        </View>
      ))}
    </View>
  );
};
