import { TextInput, View, Text } from 'react-native';
import React, { useState } from 'react';
import { Button, CommonModal } from '@src/commonComponent';
import { external } from '../../../styles/externalStyle';
import { DescriptionText } from './descriptionText/index';
import { PictureCargo } from './pictureCargo/index';
import { useValues } from '../../../../App';
import { Calander } from '../../../screens/dateTimeSchedule/index';
import { appColors } from '@src/themes';
import { CountryCodeContainer } from '@src/screens/auth/signIn/signInComponents';
import { useAppNavigation } from '@src/utils/navigation';
import styles from './styles';
import { useSelector } from 'react-redux';

export function Freight({ pickupLocation, stops, destination, service_ID, zoneValue, service_name, service_category_ID, scheduleDate }) {
  const { navigate } = useAppNavigation();
  const [selected, setSelected] = useState(false);
  const { bgContainer, textColorStyle, textRTLStyle, isDark } = useValues();
  const [descriptionText, setDescriptionText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [parcelWeight, setParcelWeight] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { translateData } = useSelector((state) => state.setting);

  const handleDescriptionChange = (text) => {
    setDescriptionText(text);
  };

  const handleImageSelect = (imageUri) => {
    setSelectedImage(imageUri);
  };

  const closeModal = () => {
    setSelected(false)
  }

  const gotoRide = () => {
    navigate('BookRide', {
      destination,
      stops,
      pickupLocation,
      service_ID,
      zoneValue,
      descriptionText,
      selectedImage,
      parcelWeight,
      service_name,
      receiverName,
      countryCode,
      phoneNumber,
      service_category_ID,
      scheduleDate
    });
  }

  return (
    <View>
      {service_name === 'parcel' ? (
        <View>
          <Text style={[styles.weightText, { color: textColorStyle, textAlign: textRTLStyle }]}>
            {translateData.parcelReceiverName}
          </Text>
          <TextInput
            style={[styles.inputView, {
              backgroundColor: bgContainer,
              borderColor: isDark ? appColors.darkBorder : appColors.border,

              color: textColorStyle,

              textAlign: textRTLStyle,
            }]}
            keyboardType="ascii-capable"
            placeholder={translateData.enterReceiverName}
            placeholderTextColor={appColors.regularText}
            value={receiverName}
            onChangeText={(text) => setReceiverName(text)}
          />
          <Text style={[styles.parcelText, { color: textColorStyle, textAlign: textRTLStyle }]}>
            {translateData.parcelReceiverNumber}
          </Text>
          <CountryCodeContainer
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            backGroundColor={bgContainer}
            borderColor={isDark ? appColors.darkBorder : appColors.border}
          />

          <Text style={[styles.weightText, { color: textColorStyle, textAlign: textRTLStyle }]}>
            {translateData.weightKg} (KG)
          </Text>
          <TextInput
            style={[styles.inputView, {
              backgroundColor: bgContainer,
              borderColor: isDark ? appColors.darkBorder : appColors.border,
              color: textColorStyle,
              textAlign: textRTLStyle
            }]}
            keyboardType="number-pad"
            placeholder={translateData.enterParcelWeight}
            placeholderTextColor={appColors.regularText}
            value={parcelWeight}
            onChangeText={(text) => setParcelWeight(text)}
          />
        </View>
      ) : null}

      <DescriptionText onTextChange={handleDescriptionChange} />
      <PictureCargo onImageSelect={handleImageSelect} service_name={service_name} />

      <View style={[external.mv_15]}>
        <Button title={translateData.bookRide} onPress={gotoRide} />
      </View>
      <CommonModal
        isVisible={selected}
        onPress={() => setSelected(false)}
        value={
          <View>
            <Calander onPress={closeModal} />
            <View style={styles.buttonView}>
              <Button title={translateData.Continue} onPress={() => setSelected(false)} />
            </View>
          </View>
        }
      />
    </View>
  );
};
