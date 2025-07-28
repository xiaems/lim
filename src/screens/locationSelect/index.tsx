import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import MapView from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import darkMapStyle from "../darkMapStyle/index";
import Images from "@utils/images";
import { useValues } from "../../../App";
import styles from "./styles";
import { WebView } from "react-native-webview";
import { Back, AddressMarker } from "@src/utils/icons";
import { appColors } from "@src/themes";
import { external } from "@src/styles/externalStyle";
import { useSelector } from "react-redux";
import useSmartLocation from "@src/components/helper/locationHelper";

export function LocationSelect() {
  const { isDark, viewRTLStyle, Google_Map_Key } = useValues();
  const webviewRef = useRef(null);
  const mapCustomStyle = isDark ? darkMapStyle : undefined;
  const [currentAddress, setCurrentAddress] = useState("");
  const [mapType, setMapType] = useState("googleMap");
  const { currentLatitude, currentLongitude } = useSmartLocation();
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const { navigate, goBack } = useNavigation();
  const route = useRoute();
  const { field, screenValue } = route.params || {};
  const [pointerPosition, setPointerPosition] = useState(null);
  const { translateData, taxidoSettingData } = useSelector((state) => state.setting);

  useEffect(() => {
    if (currentLatitude && currentLongitude) {
      setRegion({
        latitude: currentLatitude,
        longitude: currentLongitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
    }
  }, [currentLatitude, currentLongitude]);

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Google_Map_Key}`;
      const response = await fetch(url);
      const data = await response.json();


      if (data?.results.length > 0) {
        setCurrentAddress(data?.results[0].formatted_address);
      } else {
        setCurrentAddress("Address not found");
      }
    } catch (error) {
      console.error("Geocode API Error:", error);
    }
  };


  const onRegionChangeComplete = (newRegion: any) => {
    setRegion(newRegion);
    fetchAddress(newRegion.latitude, newRegion.longitude);
  };

  const handleConfirmLocation = () => {
    navigate(screenValue, {
      selectedAddress: currentAddress,
      fieldValue: field,
    });
  };


  const handleWebViewMessage = useCallback((event: any) => {
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

  return (
    <View style={external.main}>
      <TouchableOpacity activeOpacity={0.7}

        onPress={() => goBack()}
        style={[styles.backView, {

          backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor

        }]}
      >
        <Back />
      </TouchableOpacity>
      {mapType === "googleMap" ? (
        <MapView
          style={styles.mapView}
          region={region}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={true}
          customMapStyle={mapCustomStyle}
        />
      ) : (
        <View style={styles.webView}>
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
      <View style={[styles.textInputContainer, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }, { flexDirection: viewRTLStyle }]}>
        <View style={[styles.addressBtnView, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }]}>
          <AddressMarker />
        </View>
        <View
          style={[styles.inputView, {

            borderColor: isDark ? appColors.darkBorder : appColors.primaryGray,
          }]}
        />

        <TextInput
          style={[styles.textInput, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }, { color: isDark ? appColors.whiteColor : appColors.blackColor }]}
          value={currentAddress || `${translateData.addressNotFound}`}
          placeholder={translateData.searchHere}
          editable={false}
        />
      </View>
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmLocation}
      >
        {/* <Text style={styles.confirmText}>{translateData.confirmLocation}</Text> */}
      </TouchableOpacity>
      <View style={styles.pointerMarker}>
        <Image source={Images.pin} style={styles.pinImage} />
      </View>
    </View>
  );
}








