import { StyleSheet } from 'react-native';
import { external } from '../../../../../../styles/externalStyle';
import { commonStyles } from '../../../../../../styles/commonStyle';
import {
  fontSizes,
  windowHeight,
  windowWidth,
  appFonts, appColors
} from '@src/themes';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    ...external.fx_1,
  },
  mainContainer: {
    width: '100%',
    height: '30%',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-end',
    flex: 1,
    alignSelf: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  popupContainer: {
    shadowColor: appColors.blackColor,
    borderRadius: windowHeight(3.9),
    ...commonStyles.shadowContainer,
    ...external.pv_10,
    width: windowWidth(430),
    overflow: 'hidden'
  },
  dataContainer: {
    backgroundColor: appColors.lightGray,
    width: windowHeight(80),
    borderRadius: windowHeight(6),
    paddingVertical: windowHeight(11),
    marginHorizontal: windowHeight(9),
    borderWidth: windowHeight(1),
    borderColor: appColors.lightGray

  },
  selectedDataContainer: {
    backgroundColor: appColors.selectPrimary,
    borderColor: appColors.primary,
    borderWidth: windowHeight(1),
  },
  imageItem: {
    width: windowHeight(62),
    height: windowHeight(26)
  },
  lineContainer: {
    width: '80%',
    paddingVertical: windowHeight(5)
  },
  titleContainer: {
    width: '90%',
    backgroundColor: appColors.border,
    borderRadius: windowHeight(6),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: windowHeight(10),
    alignSelf: 'center',
    marginTop: windowHeight(10),
  },
  modalContain: {
    alignItems: 'center',
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
  },
  popupHeader: {
    ...external.fd_row,
    ...external.js_space,
    ...external.ph_10,
    ...external.pt_15,
    ...external.Pb_10,
  },
  popupHeaderText: {
    ...commonStyles.regularText,
    fontSize: fontSizes.FONT19,
    color: appColors.primaryText,
  },
  changeText: {
    ...commonStyles.mediumTextBlack12,
    color: appColors.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  solidLine: {
    marginVertical: windowHeight(1),
  },
  locationContainer: {
    ...external.ph_20,
    ...external.pt_5,
    ...external.fd_row,
    ...external.mt_10,
    ...external.mb_10,
  },
  locationIconContainer: {
    width: windowHeight(24),
    height: windowHeight(24),
    backgroundColor: appColors.lightGreen,
    borderRadius: windowHeight(24),
    ...external.ai_center,
    ...external.js_center,
  },
  locationTextContainer: {
    ...external.mh_5,
  },
  locationTitle: {
    ...commonStyles.mediumTextBlack12,
    ...external.mt_2,
    fontSize: fontSizes.FONT19,
  },
  locationAddress: {
    ...commonStyles.regularText,
    ...external.mt_3,
    width: windowWidth(300),
    lineHeight: windowHeight(18),
  },
  confirmButtonContainer: {
    ...external.mv_15,
  },
  choosePackage: {
    ...commonStyles.extraBold,
    ...external.pt_5,
    ...external.mh_15,
  },
  titleVehicle: {
    color: appColors.primaryText,
    marginVertical: windowHeight(5),
    marginHorizontal: windowWidth(20),
    fontFamily: appFonts.medium
  },
  total: {
    color: appColors.primaryText,
    fontFamily: appFonts.medium
  },
  carTwo: {
    width: 205,
    height: windowHeight(75),
    alignSelf: 'center',
    marginVertical: windowHeight(19),
    marginTop: windowHeight(39),
  },
  close: {
    borderRadius: windowHeight(13),
    right: 0,
    top: windowHeight(8),
    transform: [{ translateY: -10 }],
    position: 'absolute',
  },
  backBtn: {
    height: windowHeight(32),
    width: windowWidth(48),
    position: 'absolute',
    borderRadius: windowHeight(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: appColors.lightGray,
    marginTop: windowHeight(10),
    marginHorizontal: windowWidth(10),
  },
  carType: {
    ...commonStyles.extraBold,
    ...external.mh_15,
  },
  title: {
    color: appColors.primaryText,
    marginTop: windowHeight(10),
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT20,
  },
  inputcontainer: {
    width: '100%',
    height: windowHeight(40),
    flexDirection: 'row',
    marginTop: windowHeight(13),
    borderRadius: windowHeight(8),
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    overflow: 'hidden',
    backgroundColor: appColors.whiteColor,
    alignItems: 'center'
  },
  textInput: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '80%',
    height: '100%',
    color: appColors.blackColor,
    padding: 0,
    borderWidth: 0,
  },
  containerCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.whiteColor,
    justifyContent: 'space-between',
    marginVertical: windowHeight(15),
    marginHorizontal: windowWidth(15),
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    borderRadius: windowWidth(8),
  },
  input: {
    fontFamily: appFonts.medium,
    width: '70%',
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
  payment: {
    fontFamily: appFonts.medium,
    marginVertical: windowHeight(8),
    marginHorizontal: windowWidth(15),
  },
  paymentContainer: {
    backgroundColor: appColors.whiteColor,
    marginBottom: windowHeight(15),
    overflow: 'hidden',
    marginHorizontal: windowWidth(15),
  },
  chooseAnotherAccount: {
    ...commonStyles.mediumTextBlack12,
    ...external.mh_5,
    fontSize: fontSizes.FONT19,
    color: appColors.primary,
  },
  selectText: {
    fontFamily: appFonts.medium,
    marginHorizontal: windowWidth(5)
  },
  separator: {
    borderRightWidth: windowHeight(0.9),
    height: windowHeight(18),
    borderColor: appColors.border,
  },
  modalPaymentView: {
    justifyContent: 'space-between',
    paddingHorizontal: windowWidth(10),
    paddingVertical: windowHeight(10),
  },
  imageBg: {
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    borderRadius: windowHeight(7.5),
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
    marginHorizontal: windowWidth(6),
    justifyContent: 'center',
  },
  mail: {
    fontFamily: appFonts.regular,
  },
  payBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: windowWidth(9),
    borderRadius: windowHeight(7.5),
    marginHorizontal: windowWidth(6),
    height: windowHeight(35),
  },
  borderPayment: {
    borderBottomWidth: windowHeight(0.9),
    borderColor: appColors.primaryGray,
    borderStyle: 'dashed',
    marginHorizontal: windowWidth(15),
  },
  containerDetails: {
    ...StyleSheet.absoluteFillObject,
    ...external.js_end,
    ...external.ai_center,
    ...external.fx_1,
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
  },
  paymentView: {
    flexDirection: 'row',
    flex: 1
  },
  img: {
    width: windowWidth(75),
    height: windowHeight(25),
  },
  modalTitle: {
    justifyContent: 'space-between',
    marginTop: windowHeight(5),
  },
  verticalLine: {
    height: windowHeight(12),
    borderRightColor: appColors.border,
    borderRightWidth: windowHeight(0.9),
    marginHorizontal: windowWidth(4.5),
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
  time: {
    flexDirection: 'row'
  },
  clock: {
    marginVertical: windowHeight(6),
    marginHorizontal: windowWidth(2),
  },
  fiftySeven: {
    ...commonStyles.regularText,
    color: appColors.regularText,
    textDecorationLine: 'line-through',
    paddingHorizontal: windowWidth(5),
  },
  coin: {
    justifyContent: 'center',
    marginHorizontal: windowWidth(10),
    borderWidth: 1,
    borderColor: appColors.border,
    height: windowHeight(22),
    width: windowHeight(22),
    alignItems: 'center',
    borderRadius: windowHeight(20),
  },
  selectedText: {
    color: appColors.primary,
  },
  switchContainer: {
    marginHorizontal: windowWidth(15),
    paddingVertical: windowHeight(15)
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
    padding: windowHeight(17),
    backgroundColor: appColors.whiteColor,
    borderRadius: windowHeight(9),
    alignItems: 'center',
  },
  modalText: {
    fontSize: fontSizes.FONT17,
    marginBottom: windowHeight(18),
    color: appColors.primaryText,
    fontFamily: appFonts.medium,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: windowHeight(9),
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
    fontSize: fontSizes.FONT15,
  },
  warningText: {
    color: appColors.textRed,
    fontFamily: appFonts.medium
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
  recommended: {
    height: windowHeight(40),
    ...external.mh_10,
    marginBottom: windowHeight(10),
    borderWidth: windowHeight(1),
    borderColor: appColors.border,
    borderRadius: windowHeight(4),
    justifyContent: 'center',
    marginTop:windowHeight(12)
  },
  userView: {
    paddingHorizontal: windowWidth(15),
    height: windowHeight(30),
    borderRadius: windowHeight(20),
    alignItems: "center",
    justifyContent: "center",
    width: windowWidth(180),
  },
  cardView: {
    marginHorizontal: windowWidth(5)
  },
  cardMainView: {
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: windowHeight(4),
    height: windowHeight(40),
    width: "93%",
    marginHorizontal: windowWidth(15),
    borderWidth: windowHeight(1),
    borderColor: appColors.border
  },
  switchRiderView: {
    marginHorizontal: windowWidth(15),
    paddingVertical: windowHeight(15),
  },
  linearGradientView: {
    flex: 1,
    position: "absolute",
    bottom: 0
  },
  listView: {
    position: "absolute",
    top: windowHeight(38),
    zIndex: 2
  },
  selectPaymentView: {
    marginVertical: windowHeight(11),
  },
});
export { styles };