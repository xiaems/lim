import {StyleSheet} from 'react-native';
import {
  windowHeight,
  appFonts,
  appColors,
  fontSizes,
  windowWidth,
} from '@src/themes';

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  view: {
    backgroundColor: appColors.lightGray,
    paddingHorizontal: windowWidth(14),
  },
  scheduleView: {
    justifyContent: 'space-between',
    marginVertical: windowHeight(19),
    marginHorizontal: windowWidth(10),
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    borderRadius: windowHeight(5),
    backgroundColor: appColors.whiteColor,
  },
  cancelledView: {marginHorizontal: windowWidth(20)},
  timeText: {
    color: appColors.regularText,
    fontFamily: appFonts.regular,
  },
  startDateText: {
    color: appColors.primaryText,
    fontFamily: appFonts.medium,
  },
  clockSmall: {
    marginTop: windowHeight(5),
  },
  viewRental: {flexDirection: 'column', padding: windowHeight(12)},
  rentalLine: {
    borderLeftWidth: 1,
    borderColor: appColors.border,
    height: windowHeight(50),
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  citiesView: {
    paddingHorizontal: windowWidth(0),
    marginBottom: windowHeight(0),
  },
  iconView: {marginBottom: windowHeight(28)},
  iconColumn: {
    alignItems: 'center',
    position: 'relative',
  },
  line: {
    position: 'absolute',
    width: windowHeight(0.1),
    height: windowHeight(37),
    borderStyle: 'dashed',
    borderLeftWidth: windowHeight(0.7),
    borderLeftColor: appColors.gray,
    top: windowHeight(16),
  },
  labelColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    paddingVertical: windowHeight(2),
    paddingHorizontal: windowHeight(4),
    marginHorizontal: windowHeight(0),
  },
  label: {
    fontWeight: '500',
    color: appColors.blackColor,
    paddingVertical: windowHeight(10),
    width: '85%',
    bottom: windowHeight(13),
    flex: 1,
    marginHorizontal: windowHeight(4),
  },
  linee: {
    borderLeftWidth: 1,
    borderColor: appColors.border,
    height: windowHeight(42),
    borderStyle: 'dashed',
  },
  scrollView: {
    padding: windowHeight(10),
    borderRadius: windowHeight(5),
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    marginTop: windowHeight(1),
    width: '95.5%',
    alignSelf: 'center',
  },

  stepContainer: {
    alignItems: 'center',
    top: windowHeight(8),
  },
  containerCoupon: {
    alignItems: 'center',
    width: '95.6%',
    justifyContent: 'space-between',
    marginTop: windowHeight(20),
    borderWidth: windowHeight(1),
    borderRadius: windowWidth(8),
    height: windowHeight(46),
    alignSelf: 'center',
  },
  buttonAdd: {
    backgroundColor: appColors.primary,
    height: windowHeight(30),
    width: windowWidth(90),
    borderRadius: windowHeight(3),
    alignItems: 'center',
    justifyContent: 'center',
    right: windowWidth(11),
  },
  buttonAddText: {
    color: appColors.whiteColor,
    fontSize: fontSizes.FONT16,
    fontFamily: appFonts.medium,
  },
  input: {
    fontFamily: appFonts.medium,
    width: '70%',
    marginHorizontal: windowWidth(12),
  },
  labelText: {
    marginHorizontal: windowWidth(15),
    fontFamily: appFonts.medium,
  },
  bottomView: {
    height: windowHeight(35),
    width: windowHeight(35),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: windowHeight(5),
  },
  proceedToPayBtn: {
    backgroundColor: appColors.primary,
    width: '94.5%',
    alignSelf: 'center',
    borderRadius: windowHeight(7),
    position: 'absolute',
    bottom: windowHeight(11),
  },
  paymentMethodView: {
    width: '95.3%',
    borderWidth: windowHeight(1),
    alignSelf: 'center',
    borderRadius: windowHeight(6),
    marginTop: windowHeight(10),
    height: '8.9%',
  },
  paymentMethodText: {
    marginHorizontal: windowWidth(20),
    fontFamily: appFonts.semiBold,
    marginTop: windowHeight(19),
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  viewModal: {
    backgroundColor: appColors.whiteColor,
    padding: windowHeight(15),
    borderRadius: 10,
    width: '92%',
  },
  rideView: {flexDirection: 'row'},
  imageView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userData: {
    backgroundColor: appColors.whiteColor,
    padding: windowHeight(10),
    borderRadius: windowHeight(5),
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    marginBottom: windowHeight(0),
    marginTop: windowHeight(14),
    width: '91%',
    alignSelf: 'center',
  },
  travelText: {
    color: appColors.gray,
    fontSize: fontSizes.FONT18,
    fontFamily: appFonts.regular,
    paddingHorizontal: windowHeight(5),
  },
  talkView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: windowHeight(7),
    marginTop: windowHeight(5),
    top: windowHeight(2),
  },
  dependingView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: windowHeight(7),
    marginTop: windowHeight(0),
  },
  reportRideText: {
    color: appColors.primaryText,
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT22,
    textAlign: 'center',
    marginBottom: windowHeight(10),
  },
  nameView: {flex: 1, marginHorizontal: windowHeight(6)},
  reportRideOptionsView: {
    paddingVertical: windowHeight(5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportRideOptionsViewMain: {paddingHorizontal: windowHeight(1)},
  aboutText: {
    color: appColors.primaryText,
    fontFamily: appFonts.medium,
    marginTop: windowHeight(10),
  },
  textInput: {
    width: '98%',
    marginHorizontal: windowWidth(9),
    height: windowHeight(80),
    textAlignVertical: 'top',
  },
  idCardView: {marginVertical: windowHeight(8)},
  cardMainView: {
    backgroundColor: appColors.whiteColor,
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    flexDirection: 'row',
    paddingHorizontal: windowHeight(12),
    borderRadius: windowHeight(5),
    marginVertical: windowHeight(10),
    elevation: 0.5,
  },
  cancelTextView: {
    height: windowHeight(42),
    width: '99.7%',
    borderRadius: windowHeight(5),
    backgroundColor: appColors.textRed,
    justifyContent: 'center',
  },
  textView: {
    flexDirection: 'row',
    marginHorizontal: windowHeight(1),
    marginTop: windowHeight(8),
    justifyContent: 'space-between',
  },
  reportText: {
    color: appColors.whiteColor,
    textAlign: 'center',
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT19,
  },
  reportTextView: {
    height: windowHeight(37),
    width: '47.5%',
    borderRadius: windowHeight(5),
    backgroundColor: appColors.primary,
    justifyContent: 'center',
  },
  cancelText: {
    color: appColors.whiteColor,
    textAlign: 'center',
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT19,
  },
});
export default styles;
