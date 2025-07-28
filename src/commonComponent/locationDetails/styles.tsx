import { StyleSheet } from 'react-native';
import { fontSizes, windowHeight, windowWidth } from '@src/themes';
import { commonStyles } from '../../styles/commonStyle';
import { appColors } from '@src/themes';
import { external } from '../../styles/externalStyle';

const styles = StyleSheet.create({
  itemStyle: {
    ...commonStyles.regularText,
    fontSize: fontSizes.FONT16,
    color: appColors.primaryText,
    width :windowWidth(370)
  },
  dashedLine: {
    height: 0.1,
    width: '100%',
    borderBottomWidth: windowHeight(1),
    borderColor: appColors.primaryGray,
    borderStyle: 'dashed',
    marginVertical: windowHeight(8),
  },
  pickUpLocationStyles: {
    ...commonStyles.regularText,
    fontWeight: '300',
    fontSize: fontSizes.FONT16,
    color: appColors.primaryText,
  },
  addressContainer: {
    ...commonStyles.shadowContainer,
    borderRadius: windowHeight(6),
    overflow: 'hidden',
    position: 'relative',
    ...external.fd_row,
    paddingVertical: windowHeight(4),
  },
  icon: {
    borderStyle: 'dotted',
    height: windowHeight(20),
    borderLeftWidth: windowHeight(0.9),
    marginHorizontal: windowHeight(5),
    borderLeftColor: appColors.regularText,
  },
});
export { styles };
