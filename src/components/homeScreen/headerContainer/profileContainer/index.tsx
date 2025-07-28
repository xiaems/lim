import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useValues } from "@App";
import styles from "./styles";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Location } from "@src/utils/icons";
import { appColors } from "@src/themes";
import useSmartLocation from "@src/components/helper/locationHelper";
import { getValue } from "@src/utils/localstorage";

export function ProfileContainer() {
  const navigation = useNavigation()
  const { viewRTLStyle, Google_Map_Key } = useValues();
  const { self } = useSelector((state: any) => state.account);
  const { taxidoSettingData } = useSelector((state: any) => state.setting);
  const { currentLatitude, currentLongitude } = useSmartLocation();
  const char = self?.name ? self.name.charAt(0) : "";
  const [welcom, setWelcome] = useState("");
  const [shortAddress, setShortAddress] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);


  useEffect(() => {
    if (
      taxidoSettingData?.taxido_values?.general &&
      Array.isArray(taxidoSettingData?.taxido_values?.general?.greetings)
    ) {

      const greetingsFromApi = taxidoSettingData?.taxido_values?.general?.greetings;
      const goodMorningMsg = greetingsFromApi.find(
        (msg) => typeof msg === "string"
      );
      setWelcome(goodMorningMsg);
    }
  }, [taxidoSettingData?.taxido_values?.general?.greetings]);

  useEffect(() => {
    const getAddress = async () => {
      if (!currentLatitude || !currentLongitude || !Google_Map_Key) return;

      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLatitude},${currentLongitude}&key=${Google_Map_Key}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK') {
          const components = data.results[0].address_components;

          const city = components.find(c =>
            c.types.includes('locality') || c.types.includes('administrative_area_level_2')
          )?.long_name;

          const area = components.find(c =>
            c.types.includes('sublocality') ||
            c.types.includes('neighborhood') ||
            c.types.includes('administrative_area_level_3')
          )?.long_name;

          const formatted = `${area || ''}, ${city || ''}`;
          setShortAddress(formatted);
        } else {
          setShortAddress('Address not found');
          console.warn('Geocoding failed:', data.status);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        setShortAddress('Error fetching address');
      }
    };

    getAddress();
  }, [currentLatitude, currentLongitude, taxidoSettingData]);

  const handleImagePress = () => {
    navigation.navigate("EditProfile");
  };


  useFocusEffect(
    useCallback(() => {
      const fetchStoredImage = async () => {
        const storedImageUri = await getValue("profile_image_uri");
        setLocalImageUri(storedImageUri);
      };
      fetchStoredImage();
    }, [])
  );




  return (
    <View style={[styles.mainView, { flexDirection: viewRTLStyle }]}>
      <TouchableOpacity onPress={handleImagePress} style={styles.imageView} activeOpacity={0.7}>
        {/* {localImageUri || self?.profile_image?.original_url ? (
          <Image
            style={styles.imageStyle}
            source={{ uri: localImageUri || self?.profile_image?.original_url }}
          />
        ) : (
          <View style={styles.textView}>
            <Text style={styles.charText}>{char || "G"}</Text>
          </View>
        )} */}
        {self?.profile_image?.original_url ? (
          <Image
            style={styles.imageStyle}
            source={{ uri: self.profile_image.original_url }}
          />
        ) : localImageUri ? (
          <Image
            style={styles.imageStyle}
            source={{ uri: localImageUri }}
          />
        ) : (
          <View style={styles.textView}>
            <Text style={styles.charText}>{char || "G"}</Text>
          </View>
        )}

      </TouchableOpacity>
      <View style={styles.viewText}>
        <Text style={styles.selfName}>
          {welcom} {self?.name?.split(" ")[0] || "Guest"},
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <Location color={appColors.whiteColor} height={17} />
          <Text style={styles.text}>{shortAddress || 'Fetching address...'}</Text>
        </View>
      </View>
    </View>
  );
}
