import React, { useState, useCallback, useMemo } from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";
import { useDispatch, useSelector } from "react-redux";
import { userSaveLocation, deleteSaveLocation } from "@src/api/store/actions/saveLocationAction";
import { Button, CommonModal, notificationHelper, VerticalLine } from "@src/commonComponent";
import { NoInternet } from "@src/components";
import { useValues } from "../../../../../App";
import { styles } from "./style";
import { external } from "../../../../styles/externalStyle";
import { commonStyles } from "../../../../styles/commonStyle";
import { appColors, fontSizes, windowHeight } from "@src/themes";
import { Delete, Edit, Back, Add, HomeLocation, WorkLocation, OtherLocation, Copy, PickLocation } from "@utils/icons";
import Images from "@src/utils/images";
import { LocationLoader } from "./locationLoader";
import { clearValue } from "@src/utils/localstorage";

export function SavedLocation() {
  const { bgFullStyle, linearColorStyle, textColorStyle, viewRTLStyle, textRTLStyle, isDark } = useValues();
  const { translateData } = useSelector((state: any) => state.setting);
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { saveLocationDataGet, statusCode, loading } = useSelector((state) => state.saveLocation);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const { selectedLocation, savefield } = route.params || {};

  const gotoAdd = useCallback(() => {
    navigation.navigate("LocationSave");
  }, [navigation]);

  const editAddress = useCallback(
    (locationID: number) => {
      navigation.navigate("LocationSave", { mode: "edit", locationID });
    },
    [navigation]
  );

  const deleteAddress = useCallback(() => {
    if (selectedItemId !== null) {
      dispatch(deleteSaveLocation(selectedItemId))
        .unwrap()
        .then((res: any) => {

          if (res.status === 403) {
            notificationHelper('', 'Please log in again.', 'error');
            clearValue('token').then(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
              });
            });
            return;
          }
          // Optional: Success handling
          if (res.status === 200) {
            notificationHelper('', 'Address deleted successfully.', 'success');
            dispatch(userSaveLocation());
          }
        })
        .catch((error) => {
          console.error('Delete location error:', error);
        });
    }
    setModalVisible(false);
  }, [dispatch, selectedItemId]);

  const selectLocation = useCallback(
    (location: string) => {
      if (selectedLocation === "locationDrop") {
        navigation.navigate("Ride", { selectedLocation: location, savefieldValue: savefield });
      } else {
        Clipboard.setString(location);
        notificationHelper("", translateData.copyClipboard, "warning")
      }
    },
    [navigation, selectedLocation]
  );

  const renderLocationIcon = (type: string) => {
    switch (type) {
      case "home":
        return <HomeLocation />;
      case "work":
        return <WorkLocation />;
      default:
        return <OtherLocation />;
    }
  };

  const renderSavedLocationList = useMemo(() => {
    if (!saveLocationDataGet?.data?.length) {
      return (
        <View style={[styles.noDataContainer, { flexDirection: viewRTLStyle }]}>
          <NoInternet
            btnHide
            title={translateData.noLocation}
            details={translateData.noLocationDes}
            image={isDark ? Images.noLocationDark : Images.noLocation}
            infoIcon
            status={`${translateData.statusCode}: ${statusCode}`}
          />
        </View>
      );
    }

    return (
      <ScrollView style={[styles.mainView, external.mh_20]}>
        {saveLocationDataGet.data.map((item) => (
          <TouchableOpacity
            activeOpacity={0.7}

            key={item.id}
            style={[
              external.mb_10,
              styles.containerList,
              {
                backgroundColor: bgFullStyle,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.listItemContainer,
                { flexDirection: viewRTLStyle },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: linearColorStyle },
                ]}
              >
                {renderLocationIcon(item.type)}
              </View>

              <View style={styles.detailsContainer}>
                <Text
                  style={[
                    commonStyles.mediumTextBlack12,
                    {
                      color: textColorStyle,
                      textAlign: textRTLStyle,
                      fontSize: fontSizes.FONT21,
                    },
                  ]}
                >
                  {item.title}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}

                style={external.mh_3}
                onPress={() => selectLocation(item.location)}
              >
                <Copy />
              </TouchableOpacity>

              <VerticalLine dynamicHeight="36%" />

              <TouchableOpacity
                activeOpacity={0.7}

                style={external.mh_3}
                onPress={() => editAddress(item.id)}
              >
                <Edit />
              </TouchableOpacity>

              <VerticalLine dynamicHeight="36%" />

              <TouchableOpacity
                activeOpacity={0.7}
                style={external.mh_2}
                onPress={() => {
                  setSelectedItemId(item.id);
                  setModalVisible(true);
                }}
              >
                <Delete iconColor={appColors.alertRed} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.dashLine,
                {
                  borderBottomColor: isDark
                    ? appColors.darkBorder
                    : appColors.primaryGray,
                },
              ]}
            />

            <View
              style={[
                styles.locationContainer,
                { flexDirection: viewRTLStyle },
              ]}
            >
              <View style={styles.pickLocationView}>
                <PickLocation
                  height={12}
                  width={12}
                  colors={isDark ? appColors.whiteColor : appColors.primaryText}
                />
              </View>

              <Text
                style={[styles.locationText, {
                  color: isDark ? appColors.whiteColor : appColors.primaryText, textAlign: textRTLStyle,
                }]}
              >
                {item.location?.length > 70
                  ? `${item.location.slice(0, 70)}...`
                  : item.location}              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }, [
    saveLocationDataGet,
    bgFullStyle,
    isDark,
    textColorStyle,
    textRTLStyle,
    viewRTLStyle,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: linearColorStyle }]}>
      <View
        style={{
          backgroundColor: isDark ? appColors.darkHeader : appColors.whiteColor,
        }}
      >
        <View
          style={[styles.headerContainers, { flexDirection: viewRTLStyle }]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={navigation.goBack}
            style={[
              styles.backButton,
              { borderColor: isDark ? appColors.darkBorder : appColors.border },
            ]}
          >
            <Back />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: textColorStyle }]}>
            {translateData.savedLocation}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.backButton,
              { borderColor: isDark ? appColors.darkBorder : appColors.border },
            ]}
            onPress={gotoAdd}
          >
            <Add colors={appColors.primaryText} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.locationListView}>
        {loading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <View key={index} style={{ marginBottom: windowHeight(12) }}>
              <LocationLoader />

            </View>
          ))
        ) : (
          renderSavedLocationList
        )}
      </View>


      {modalVisible && (
        <CommonModal
          isVisible={modalVisible}
          onPress={() => setModalVisible(false)}
          value={
            <View>
              <Text
                style={[
                  commonStyles.mediumText23,
                  external.ti_center,
                  { color: textColorStyle },
                ]}
              >
                {translateData.deleteAddress}
              </Text>

              <View
                style={[
                  external.ai_center,
                  external.js_space,
                  external.mt_25,
                  { flexDirection: viewRTLStyle },
                ]}
              >
                <Button
                  backgroundColor={appColors.lightGray}
                  title={translateData.cancel}
                  width="47.5%"
                  onPress={() => setModalVisible(false)}
                  textColor={appColors.primaryText}
                />
                <Button
                  backgroundColor={appColors.textRed}
                  title={translateData.deleteBtn}
                  width="47.5%"
                  onPress={deleteAddress}
                />
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}
