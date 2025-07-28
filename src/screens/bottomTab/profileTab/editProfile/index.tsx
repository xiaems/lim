import { View, BackHandler } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Header } from '@src/commonComponent';
import { ImageContainer } from './imageContainer/index';
import { DataContainer } from './dataContainer/index';
import { useValues } from '../../../../../App';
import { appColors, windowHeight, windowWidth } from '@src/themes';
import { useDispatch, useSelector } from 'react-redux';
import { clearValue, getValue, setValue } from '../../../../utils/localstorage/index';
import { selfData } from '../../../../api/store/actions/accountAction';
import { useAppNavigation } from '@src/utils/navigation';
import { URL } from '@src/api/config';
import { notificationHelper } from '@src/commonComponent';
import { useNavigation } from '@react-navigation/native';

export function EditProfile() {
  const { goBack } = useAppNavigation();
  const { self, loading } = useSelector((state: any) => state.account);
  const { isDark, bgFullStyle } = useValues();
  const [profileImg, setProfileImage] = useState(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigation = useNavigation();

  const { translateData } = useSelector((state: any) => state.setting);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (show) {
          setShow(false);
          return true;
        }
        return false;
      },
    );
    return () => {
      backHandler.remove();
    };
  }, [show]);

  const update = async form => {
    setIsUpdating(true);
    const token = await getValue('token');

    try {
      const formData = new FormData();
      formData.append('name', form.username);
      formData.append('email', form.email);
      formData.append('country_code', form.countryCode);
      formData.append('phone', form.phoneNumber);
      formData.append('_method', 'PUT');
      if (profileImg) {
        formData.append('profile_image', {
          uri: profileImg.uri,
          type: profileImg.type,
          name: profileImg.fileName,
        });
      }
      const response = await fetch(`${URL}/api/updateProfile`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 403) {
        notificationHelper('', 'Please log in again.', 'error');
        await clearValue('token');
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignIn' }],
        });
        return;
      }
      if (!response.ok) {
        const responseData = await response.json();
        console.error('Error updating profile:', responseData);
        notificationHelper('', translateData.profileFail, 'error');
      } else {
        dispatch(selfData());
        notificationHelper(
          '',
          translateData.profileSuccessfully,
          'success',
        );
        goBack();
        if (profileImg) {
          setValue('profile_image_uri', profileImg.uri);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      notificationHelper('', translateData.profileFail, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getData = img => {
    setProfileImage(img);
  };

  return (
    <Header
      value={translateData.profileSettings}
      container={
        <View
          style={{
            backgroundColor: isDark ? bgFullStyle : appColors.lightGray,
            height: '100%',
          }}>
          <View style={{ backgroundColor: isDark ? appColors.bgDark : appColors.whiteColor, height: windowHeight(385), marginHorizontal: windowWidth(20), marginTop: windowHeight(20), borderWidth: 1, borderColor: isDark ? appColors.darkBorder : appColors.border, borderTopLeftRadius: windowHeight(8), borderTopRightRadius: windowHeight(8), borderBottomLeftRadius: windowHeight(5), borderBottomRightRadius: windowHeight(5) }}>
            <ImageContainer data={self} storeProfile={getData} />

            <DataContainer
              data={self}
              updateProfile={update}
              loading={loading}
              showCountryPicker={showCountryPicker}
              setShowCountryPicker={setShowCountryPicker}
              show={show}
              setShow={setShow}
              Update={isUpdating}
            />
          </View>

        </View>
      }
    />
  );
}
