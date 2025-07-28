import { StyleSheet } from 'react-native';
import { appColors, appFonts, windowHeight, windowWidth } from '@src/themes';


const styles = StyleSheet.create({
    backView: {
        borderRadius: windowHeight(7),
        alignItems: "center",
        justifyContent: "center", height: windowHeight(36),
        width: windowHeight(36),
        position: "absolute",
        zIndex: 2,
        left: windowHeight(10),
        top: windowHeight(10),
    },
    textInputContainer: {
        position: 'absolute',
        marginTop: '18%',
        right: windowHeight(10),
        left: windowHeight(10),
        alignItems: 'center',
        borderRadius: windowHeight(6)
    },
    textInput: {
        color: appColors.blackColor,
        width: windowWidth(380),
        fontFamily: appFonts.medium
    },
    pointerMarker: {
        position: 'absolute',
        top: '53%',
        left: '50%',
        width: windowHeight(27),
        height: windowHeight(27),
        transform: [{ translateX: -15 }, { translateY: -15 }],
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        backgroundColor: appColors.primary,
        position: 'absolute',
        height: windowHeight(44),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: windowHeight(6),
        bottom: windowHeight(10),
        right: windowHeight(10),
        left: windowHeight(10),
    },
    confirmText: {
        color: appColors.whiteColor,
        fontFamily: appFonts.semiBold
    },
    pinImage: {
        width: windowHeight(27),
        height: windowHeight(27),
    },
    addressBtnView: {
        width: windowHeight(40),
        height: windowHeight(45),
        backgroundColor: appColors.whiteColor,
        borderRadius: windowHeight(8),
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputView: {
        width: windowWidth(1),
        height: windowHeight(28),
        borderLeftWidth: windowHeight(0.9),
    },
    webView: { height: "91%" },
    mapView: { height: "100%" },
});
export default styles;