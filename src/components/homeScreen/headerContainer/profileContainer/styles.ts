import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from "@src/themes";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    mainView: {
        height: windowHeight(50),
        marginTop: windowHeight(10),
    },
    imageView: {
        height: windowHeight(50),
    },
    imageStyle: {
        width: windowHeight(45),
        height: windowHeight(45),
        resizeMode: "cover",
        borderRadius: windowHeight(45),
    },
    textView: {
        alignItems: "center",
        justifyContent: "center",
        width: windowHeight(50),
        height: windowHeight(49),
        backgroundColor: appColors.whiteColor,
        borderRadius: windowHeight(74),
    },
    charText: {
        color: appColors.primary,
        fontFamily: appFonts.bold,
        fontSize: fontSizes.FONT25,
    },
    selfName: {
        fontFamily: appFonts.bold,
        fontSize: fontSizes.FONT25,
        marginVertical: windowHeight(2),
        color: appColors.whiteColor,
    },
    text: {
        fontFamily: appFonts.regular,
        color: appColors.whiteColor,
        marginHorizontal:windowWidth(3)
    },
    viewText: {
        flexDirection: "column",
        justifyContent: "center",
        marginHorizontal: windowHeight(10),
    },
})
export default styles;