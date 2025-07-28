import {StyleSheet} from 'react-native';
import {
  appColors,
  fontSizes,
  windowHeight,
  windowWidth,
  appFonts,
} from '@src/themes';

const styles = StyleSheet.create({
  mapSection: {
    flex: 0.7,
    backgroundColor: appColors.primary,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: windowHeight(230),
    flexDirection: 'column',
  },
  subContainer: {
    height: windowHeight(190),
    marginHorizontal: windowWidth(15),
    borderRadius: windowHeight(5),
    marginVertical: windowHeight(12),
  },
  profileContainer: {
    justifyContent: 'space-between',
    marginHorizontal: windowWidth(15),
    marginVertical: windowHeight(12),
  },
  userImage: {
    height: windowHeight(40),
    width: windowWidth(60),
    resizeMode: 'contain',
  },
  profileData: {
    marginHorizontal: windowWidth(5),
    marginVertical: windowHeight(6),
  },
  name: {
    fontFamily: appFonts.medium,
  },
  rating: {
    fontFamily: appFonts.medium,
    marginHorizontal:windowWidth(4)
  },
  review: {
    color: appColors.regularText,
    fontFamily: appFonts.medium,
    
  },
  message: {
    height: windowHeight(35),
    width: windowWidth(50),
    backgroundColor: appColors.lightGray,
    borderRadius: windowHeight(18),
    marginHorizontal: windowWidth(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  call: {
    height: windowHeight(35),
    width: windowWidth(50),
    backgroundColor: appColors.lightGray,
    borderRadius: windowHeight(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.modelBg,
  },
  modalBgMain: {
    paddingVertical: windowHeight(16),
    paddingHorizontal: windowWidth(20),
    borderRadius: windowHeight(10),
  },
  helpView: {width: '100%', alignItems: 'flex-end'},
  title: {
    textAlign: 'center',
    marginBottom: windowHeight(18),
    fontSize: fontSizes.FONT20,
    fontFamily: appFonts.medium,
    marginTop: windowHeight(5),
  },
  box: {
    height: windowHeight(85),
    width: windowWidth(95),
    marginHorizontal: windowWidth(8),
    borderRadius: windowHeight(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  callReason: {
    textAlign: 'center',
    marginTop: windowHeight(12),
    fontSize: fontSizes.FONT11,
    fontFamily: appFonts.regular,
  },
  cancelTitle: {
    textAlign: 'center',
    marginBottom: windowHeight(12),
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT20,
    marginTop: windowHeight(10),
  },
  detailView: {
    width: '60%',
    height: windowHeight(50),
    justifyContent: 'center',
    paddingTop: windowHeight(2.8),
  },
  texiNo: {
    fontSize: fontSizes.FONT17,
    fontFamily: appFonts.medium,
    marginRight: windowWidth(5),
  },
  textName: {
    fontFamily: appFonts.medium,
    marginTop: windowHeight(2.8),
  },
  pinView: {
    width: '40%',
    height: windowHeight(52),
    justifyContent: 'center',
  },
  pin: {
    backgroundColor: appColors.primary,
    paddingVertical: windowHeight(3),
    paddingHorizontal: windowWidth(11),
    borderRadius: windowHeight(3),
    marginHorizontal: windowWidth(2),
    color: appColors.whiteColor,
  },
  pinTitle: {
    color: appColors.primaryText,
    marginHorizontal: windowWidth(15),
  },
  texiDetail: {
    marginHorizontal: windowWidth(15),
  },
  loader: {
    height: windowHeight(50),
    alignContent: 'center',
    justifyContent: 'center',
  },
  container2: {
    paddingVertical: windowHeight(8),
    paddingHorizontal: windowWidth(12),
    width: windowWidth(378),
    borderRadius: windowHeight(7.9),
    marginBottom: windowHeight(8),
  },
  iconContainer: {
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontFamily: appFonts.regular,
  },
  border: {
    borderRightWidth: windowHeight(0.9),
    borderRightColor: appColors.primaryGray,
    height: windowHeight(12),
    marginVertical: windowHeight(4),
    marginHorizontal: windowWidth(15),
  },
  star: {
    marginVertical: windowHeight(3),
    
  },
  close: {
    borderRadius: windowHeight(13),
    right: windowWidth(12),
    top: windowHeight(16),
    transform: [{translateY: -10}],
    position: 'absolute',
  },
  backBtn: {
    position: 'absolute',
    height: windowWidth(48),
    width: windowWidth(48),
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: appColors.border,
    borderWidth: windowHeight(1),
    borderRadius: windowHeight(7.9),
    marginTop: windowHeight(10),
    marginHorizontal: windowWidth(10),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {width: 100, height: 100},
  cancelBtnView: {
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  icon_image_style: {
    height: 20,
    width: 20,
  },
  vehicle_map_icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  needHelpText: {
    color: appColors.primary,
    fontFamily: appFonts.medium,
    marginHorizontal: windowWidth(25),
  },
  fallbackImage: {
    height: windowHeight(40),
    width: windowWidth(60),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.primary,
    borderRadius: windowHeight(20),
  },
  initialText: {
    fontFamily: appFonts.bold,
    color: appColors.whiteColor,
    fontSize: fontSizes.FONT24,
  },
});
export default styles;
