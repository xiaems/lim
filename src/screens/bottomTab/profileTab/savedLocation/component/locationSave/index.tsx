import React, { useState, useRef, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import MapView from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import darkMapStyle from "@src/screens/darkMapStyle";
import Images from "@utils/images";
import { useValues } from "@App";
import styles from "./styles";
import { WebView } from "react-native-webview";
import { Back, AddressMarker, Close } from "@src/utils/icons";
import { appColors, appFonts, fontSizes, windowHeight } from "@src/themes";
import { Button, CommonModal, notificationHelper } from "@src/commonComponent";
import { SaveLocationDataInterface } from "@src/api/interface/saveLocationinterface";
import { addSaveLocation, updateSaveLocation } from "@src/api/store/actions";
import { useDispatch, useSelector } from "react-redux";
import { userSaveLocation } from "@src/api/store/actions/saveLocationAction";
import { external } from "@src/styles/externalStyle";
import useSmartLocation from "@src/components/helper/locationHelper";



export function LocationSave() {
  const { isDark, linearColorStyle, textColorStyle, viewRTLStyle, textRTLStyle, Google_Map_Key } = useValues();
  const webviewRef = useRef(null);
  const mapCustomStyle = isDark ? darkMapStyle : undefined;
  const [currentAddress, setCurrentAddress] = useState("");
  const [mapType, setMapType] = useState("googleMap");
  const { goBack } = useNavigation();
  const route = useRoute();
  const { mode, locationID } = route.params || {};
  const [pointerPosition, setPointerPosition] = useState(null);
  const [visible, setModelVisible] = useState(false);
  const [locationTitle, setLocationTitle] = useState();
  const dispatch = useDispatch();
  const { translateData, taxidoSettingData } = useSelector((state) => state.setting);
  const { currentLatitude, currentLongitude } = useSmartLocation();
  const [titleError, setTitleError] = useState('');
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Google_Map_Key}`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        setCurrentAddress(data.results[0].formatted_address);
      } else {
        setCurrentAddress("Address not found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);
    fetchAddress(newRegion.latitude, newRegion.longitude);
  };

  const options = [
    { label: `${translateData.home}`, value: "home" },
    { label: `${translateData.work}`, value: "work" },
    { label: `${translateData.other}`, value: "other" },
  ];
  const [selectedOption, setSelectedOption] = useState(options[0].value);


  const handleConfirmLocation = () => {
    setModelVisible(true);
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>OpenStreetMap Center Pointer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; }
          #map { width: 100vw; height: 100vh; position: relative; }
          .center-pointer { 
            position: absolute; 
            left: 50%; 
            top: 50%; 
            transform: translate(-50%, -50%); 
            background: red; 
            width: 10px; 
            height: 10px; 
            border-radius: 50%; 
            z-index: 1000;
          }
        </style>
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      </head>
      <body>
        <div id="map"></div>
        <div class="center-pointer"></div>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            var map = L.map('map').setView([22.720555, 75.858633], 13); // Center the map

            L.tileLayer('http://a.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
              maxZoom: 19,
            }).addTo(map);

            function logAddress(lat, lng) {
              fetch(\`https://nominatim.openstreetmap.org/reverse?lat=\${lat}&lon=\${lng}&format=json\`)
                .then(response => response.json())
                .then(data => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    address: data.display_name,
                    pointerPosition: { lat: lat, lng: lng }
                  }));
                })
                .catch(error => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    address: 'Error fetching address',
                    pointerPosition: { lat: lat, lng: lng }
                  }));
                });
            }

            function logPointerPosition() {
              var center = map.getCenter();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                pointerPosition: { lat: center.lat, lng: center.lng }
              }));
              logAddress(center.lat, center.lng); // Update address when position changes
            }

            logPointerPosition(); // Log pointer position on load

            map.on('moveend', function() {
              logPointerPosition(); // Update address and position on map move
            });
          });
        </script>
      </body>
    </html>
  `;

  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.pointerPosition) {
        setPointerPosition(data.pointerPosition);
        fetchAddress(data.pointerPosition.lat, data.pointerPosition.lng);
      }
      if (data) {
      }
    } catch (error) {
      console.error("Error parsing message from WebView:", error);
    }
  }, []);

  const goback = () => {
    goBack();
  };



  const addAddress = () => {
    if (!locationTitle?.trim()) {
      setTitleError("Please Enter Your Title");
      return;
    }
    setTitleError("");
    const payload: SaveLocationDataInterface = {
      title: locationTitle,
      location: currentAddress,
      type: selectedOption,
    };

    if (mode === "edit") {
      dispatch(updateSaveLocation({ data: payload, locationID }))
        .unwrap()
        .then(() => {
          dispatch(userSaveLocation());
          goback();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      dispatch(addSaveLocation(payload))
        .unwrap()
        .then(() => {
          dispatch(userSaveLocation());
          goback();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
    setModelVisible(false);
  };

  return (
    <View style={external.main}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={goback}
          style={[styles.backView, {
            backgroundColor: linearColorStyle
          }]}
        >
          <Back />
        </TouchableOpacity>
        <View style={[styles.textInputContainer, { backgroundColor: linearColorStyle }, { flexDirection: viewRTLStyle }]}>
          <View
            style={[styles.addressMarkerIcon, {
              backgroundColor: linearColorStyle
            }]}
          >
            <AddressMarker />
          </View>
          <View
            style={[styles.inputLine, {
              borderColor: isDark ? appColors.darkBorder : appColors.primaryGray,
            }]}
          />

          <TextInput
            style={[styles.textInput, { backgroundColor: linearColorStyle }, { color: textColorStyle }]}
            value={currentAddress}
            placeholder={translateData.searchHere}
            editable={false}
            selection={{ start: 0, end: 0 }}
          />
        </View>
      </View>
      {mapType === "googleMap" ? (
        <MapView
          style={styles.mapView}
          region={region}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={true}
          customMapStyle={mapCustomStyle}
        />
      ) : (
        <View style={styles.mapView1}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: mapHtml }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            ref={webviewRef}
            onMessage={handleWebViewMessage}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmLocation}
        activeOpacity={0.7}
      >
        <Text style={styles.confirmText}>{translateData.confirmLocation}</Text>
      </TouchableOpacity>
      <View style={styles.pointerMarker}>
        <Image source={Images.pin} style={styles.pinImage} />
      </View>
      <CommonModal
        isVisible={visible}
        value={
          <View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.modelView}
              onPress={() => setModelVisible(false)}
            >
              <Close />
            </TouchableOpacity>
            <Text style={[styles.title, { color: textColorStyle }]}>{translateData.addNewLocation}</Text>
            <View style={styles.container}>
              <View style={[styles.optionContain, { flexDirection: viewRTLStyle }]}>
                {options.map((option) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    key={option.value}
                    style={[
                      [styles.optionContainer, { flexDirection: viewRTLStyle }, { borderColor: isDark ? appColors.darkBorder : appColors.border }],
                      selectedOption === option.value &&
                      styles.selectedOptionContainer,
                    ]}
                    onPress={() => setSelectedOption(option.value)}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        selectedOption === option.value &&
                        styles.selectedOptionRadio,
                      ]}
                    >
                      {selectedOption === option.value && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedOption === option.value &&
                        styles.selectedOptionLabel,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{
                color: isDark ? appColors.whiteColor : appColors.primaryText,
                fontFamily: appFonts.medium,
                marginTop: windowHeight(8),
                textAlign: textRTLStyle,
              }}>{translateData.addressTitle}</Text>
              <TextInput
                placeholder={translateData.enterYouTitleeeee}
                placeholderTextColor={appColors.regularText}
                style={[
                  styles.titleInput,
                  { color: textColorStyle },
                  { borderColor: isDark ? appColors.darkBorder : appColors.border }, { textAlign: textRTLStyle },
                ]}
                value={locationTitle}
                onChangeText={(text) => {
                  setLocationTitle(text);
                  if (!text.trim()) {
                    setTitleError('Address Title is Required');
                  } else {
                    setTitleError('');
                  }
                }}

              />

              {titleError ? (
                <Text style={{ color: appColors.textRed, fontSize: fontSizes.FONT14SMALL, fontFamily: appFonts.medium }}>
                  {titleError}
                </Text>
              ) : null}

            </View>
            <View style={[styles.btnContainer, { flexDirection: viewRTLStyle }]}>
              <Button
                backgroundColor={appColors.lightButton}
                onPress={() => setModelVisible(false)}
                textColor={appColors.primary}
                title={translateData.cancel}
                width={"47%"}
              />
              <Button
                backgroundColor={appColors.primary}
                onPress={addAddress}
                textColor={appColors.whiteColor}
                title={translateData.save}
                width={"47%"}
              />
            </View>
          </View>
        }
        onPress={() => setModelVisible(false)}
      />
    </View>
  );
}
