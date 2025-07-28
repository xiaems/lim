import { StyleSheet } from 'react-native';
import { appColors, windowHeight } from '@src/themes'; 
import { commonStyles } from '../../../../../../styles/commonStyle';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: windowHeight(17),
    paddingHorizontal: windowHeight(12),
    marginHorizontal: windowHeight(6),
    paddingVertical: windowHeight(7),
  },
  separator: {
    height: '80%',
    width: 1,
    backgroundColor: appColors.primaryGray,
    marginHorizontal: windowHeight(10),
  },
  titleText: {
    ...commonStyles.mediumTextBlack,
  },
  kmText: {
    ...commonStyles.mediumTextBlack,
    color: appColors.primary,
  },
});
