import { StyleSheet } from 'react-native';
import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from '@src/themes';
import { commonStyles } from '../../styles/commonStyle';
import { external } from '../../styles/externalStyle';

const styles = StyleSheet.create({
  mainContainer: {
    borderTopLeftRadius: windowHeight(15),
    borderTopRightRadius: windowHeight(15),
    marginTop: windowHeight(-15),
    borderWidth: windowHeight(1),
  },
  container: {
    backgroundColor: appColors.lightGray,
    width: windowWidth(130),
    borderRadius: windowHeight(6),
    paddingVertical: windowHeight(10),
    marginHorizontal: windowWidth(12),
    marginTop: windowHeight(10),
    borderWidth: windowHeight(1),
  },
  paymentView: {
    flex: 1
  },
  img: {
    width: windowWidth(75),
    height: windowHeight(25),
    resizeMode: 'contain',
  },
  modalTitle: {
    justifyContent: 'space-between',
    marginTop: windowHeight(5),
  },
  verticalLine: {
    height: windowHeight(12),
    borderRightColor: appColors.border,
    borderRightWidth: windowHeight(0.9),
    marginHorizontal: windowWidth(6),
    marginVertical: windowHeight(2)
  },
  price: {
    color: appColors.primary,
    marginHorizontal: windowWidth(5),
    fontFamily: appFonts.bold,
    fontSize: fontSizes.FONT22
  },
  priceCut: {
    color: appColors.regularText,
    textDecorationLine: 'line-through',
    fontFamily: appFonts.regular,
    marginVertical: windowHeight(2)
  },
  solidLineView: {
    width: '80%',
    paddingVertical: windowHeight(4.5),
  },
  termsText: {
    ...commonStyles.extraBold,
    ...external.pv_10,
  },
  fourPmText: {
    ...commonStyles.extraBold,
  },
  fiveMinAway: {
    ...commonStyles.extraBold,
    ...external.pv_10,
  },
  viewContainer: {
    ...external.ai_center,
    ...external.js_space,
  },
  clock: {
    marginVertical: windowHeight(6),
    marginHorizontal: windowWidth(2),
  },
  carTwo: {
    width: windowHeight(190),
    height: windowWidth(100),
    alignSelf: 'center',
    marginVertical: windowHeight(26),
    marginTop: windowHeight(26),
    resizeMode: 'contain'
  },
  fiftySeven: {
    ...commonStyles.regularText,
    color: appColors.regularText,
    textDecorationLine: 'line-through',
    paddingHorizontal: windowWidth(5),
  },
  carType: {
    ...commonStyles.extraBold,
    ...external.pt_5,
  },
  backBtn: {
    height: windowHeight(32),
    width: windowWidth(48),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: windowHeight(6),
    marginTop: windowHeight(10),
    marginHorizontal: windowWidth(18),
    position: 'absolute',
    zIndex: 1,
    borderWidth: windowHeight(1),
  },
  ridekm: {
    position: 'absolute',
    height: windowHeight(32),
    width: windowWidth(130),
    backgroundColor: appColors.primary,
    top: windowHeight(10),
    right: windowWidth(18),
    zIndex: 1,
    borderWidth: 1,
    borderColor: appColors.primary,
    borderRadius: windowHeight(6),
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden'
  },
  kmText: {
    color: appColors.whiteColor,
    fontSize: fontSizes.FONT14
  },
  rideMin: {
    backgroundColor: appColors.whiteColor,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: appFonts.regular,
    color: appColors.primary
  },
  textInput: {
    top: 0,
    left: windowWidth(6),
    right: 0,
    bottom: 0,
    width: '80%',
    height: '100%',
    padding: 0,
    borderWidth: windowHeight(0),
  },
  coin: {
    justifyContent: 'center',
    paddingHorizontal: windowWidth(10),
    left: windowWidth(8)
  },
  inputcontainer: {
    width: '100%',
    height: windowHeight(40),
    marginTop: windowHeight(4),
    borderRadius: windowHeight(8),
    borderWidth: windowHeight(1),
    overflow: 'hidden',
  },
  title: {
    marginTop: windowHeight(14),
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT20,
  },
  containerCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.whiteColor,
    justifyContent: 'space-between',
    marginBottom: windowHeight(15),
    marginHorizontal: windowWidth(15),
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    borderRadius: windowWidth(8),
  },
  buttonAdd: {
    backgroundColor: appColors.primary,
    height: windowHeight(30),
    width: windowWidth(90),
    borderRadius: windowHeight(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: windowWidth(7),
  },
  buttonAddText: {
    color: appColors.whiteColor,
    fontSize: fontSizes.FONT16,
    fontFamily: appFonts.medium,
  },
  input: {
    fontFamily: appFonts.medium,
    width: '70%'
  },
  payment: {
    fontFamily: appFonts.medium,
    textAlign: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: fontSizes.FONT19,
  },
  paymentContainer: {
    backgroundColor: appColors.whiteColor,
    bottom: windowHeight(10.5),
    marginHorizontal: windowWidth(2.3),
    height: windowHeight(250),
  },
  modalPaymentView: {
    justifyContent: 'space-between',
    paddingHorizontal: windowWidth(18),
    paddingVertical: windowHeight(10),
  },
  imageBg: {
    borderWidth: windowHeight(1),
    borderRadius: windowHeight(8),
    alignItems: 'center',
    justifyContent: 'center',
    width: windowWidth(55),
    height: windowHeight(36),
  },
  paymentImage: {
    width: windowWidth(35),
    height: windowHeight(30),
    resizeMode: 'contain',
  },
  mailInfo: {
    marginHorizontal: windowWidth(15),
    justifyContent: 'center',
  },
  mail: {
    fontFamily: appFonts.regular,
  },
  payBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: windowWidth(9),
    borderRadius: windowHeight(8),
    marginHorizontal: windowWidth(6),
    height: windowHeight(35),
  },
  borderPayment: {
    borderBottomWidth: windowHeight(0.7),
    borderStyle: 'dashed',
    marginHorizontal: windowWidth(15),
    marginVertical: windowHeight(4)
  },
  chooseAnotherAccount: {
    ...commonStyles.mediumTextBlack12,
    fontSize: fontSizes.FONT19,
    color: appColors.primary,
  },
  selectText: {
    fontFamily: appFonts.medium,
  },
  selectedText: {
    color: appColors.primary,
  },
  switchContainer: {
    marginHorizontal: windowWidth(15),
    paddingVertical: windowHeight(10)
  },
  subtitle: {
    fontSize: fontSizes.FONT22,
    lineHeight: windowHeight(14),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.modelBg,
  },
  modalContent: {
    width: '80%',
    padding: windowHeight(18.5),
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(9.8),
    alignItems: 'center',
  },
  modalText: {
    fontSize: fontSizes.FONT16,
    marginBottom: windowHeight(18),
    fontFamily: appFonts.medium,
    textAlign: 'center'
  },
  modalDetail: {
    fontFamily: appFonts.medium,
    textAlign: 'center'
  },
  buttonContainer: {
    justifyContent: 'space-between',
    width: '100%',
    marginTop: windowHeight(15)
  },
  button: {
    padding: windowHeight(8.5),
    borderRadius: windowHeight(5),
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
  confirmButton: {
    backgroundColor: appColors.textRed,
  },
  buttonText: {
    color: appColors.whiteColor,
    fontSize: fontSizes.FONT19,
  },
  warningText: {
    color: appColors.textRed,
    fontFamily: appFonts.medium
  },
  vehicleName: {
    fontFamily: appFonts.semiBold
  },
  recommended: {
    height: windowHeight(40),
    ...external.mh_10,
    marginBottom: windowHeight(10),
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    borderRadius: windowHeight(8),
    backgroundColor: appColors.lightGray,
    justifyContent: 'center',
    ...external.mt_10
  },
  RideRecommendPrice: {
    color: appColors.primaryText,
    fontFamily: appFonts.bold,
    marginHorizontal: windowHeight(12)
  },
  priceTitle: {
    color: appColors.primaryText,
    fontFamily: appFonts.regular
  },
  switchUser: {
    paddingHorizontal: windowWidth(15),
    paddingVertical: windowHeight(8),
    borderRadius: windowHeight(25),
    width: "48%", alignItems: "center",
    justifyContent: "center",
    marginRight: windowHeight(10),
    marginBottom: windowHeight(8)
  },
  userIcon: {
    marginRight: windowWidth(10)
  },
  cardView: {
    justifyContent: "space-between",
    marginHorizontal: windowWidth(20),
  },
  pressable: {
    backgroundColor: appColors.selectPrimary,
    borderRadius: windowHeight(10),
  },
  switchRiderView: {
    justifyContent: "space-between",
    marginTop: windowHeight(10)
  },
  scrollViewStyle: {
    marginBottom: windowHeight(0)
  },
  selectPaymentView: {
    marginVertical: windowHeight(11),
  },
  loaderGIF: {
    width: windowHeight(28),
    height: windowHeight(28)
  },
  selectedOptionView: {
    justifyContent: "space-between",
    marginHorizontal: windowHeight(15),
    marginTop: windowHeight(6),
  },
  serviceImg: {
    height: windowHeight(60),
    width: windowHeight(60),
    resizeMode: "contain",
  },
  iconView: { marginRight: windowWidth(10) },
  renderItemView: {
    paddingHorizontal: windowWidth(15),
    paddingVertical: windowHeight(8),
    borderRadius: windowHeight(25), alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  solidLine: {
    marginTop: windowHeight(10)
  },
  boldText: {
    fontFamily: appFonts.bold,
  }
});

export { styles };
