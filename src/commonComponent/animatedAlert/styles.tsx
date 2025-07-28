import { StyleSheet } from 'react-native';
import { fontSizes, windowHeight, windowWidth } from '@src/themes';
import { appColors, appFonts } from '@src/themes'; 

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    paddingHorizontal: windowWidth(16),
    paddingBottom: windowHeight(5),
    position: 'absolute',
    bottom: windowHeight(0),
    alignItems: 'center',
    justifyContent: 'space-between',
    height: windowHeight(45),
  },
  text: {
    color: appColors.whiteColor,
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT18,
    marginLeft: windowWidth(10),
  },
});

export default styles;

