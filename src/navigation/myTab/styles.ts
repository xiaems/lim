import { StyleSheet } from "react-native";
import {  fontSizes, windowHeight } from "@src/themes";

const styles = StyleSheet.create({
    tabBar: {
        height: windowHeight(57),
        paddingBottom: windowHeight(11),
        paddingTop: windowHeight(10),
        borderTopWidth: windowHeight(1),
    },
    text:{
        fontSize:fontSizes.FONT17
    },

})
export default styles;