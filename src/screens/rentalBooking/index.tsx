import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Button, Header, InputText, SwitchComponent } from '@src/commonComponent';
import { appColors, appFonts, fontSizes, windowHeight } from '@src/themes';
import { Clock } from '@src/utils/icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RentalInterface } from '@src/api/interface/rentalinterface';
import { rentalvehicleRequest } from '@src/api/store/actions';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles';
import { useValues } from '@App';
import { external } from '@src/styles/externalStyle';
import { Calender1 } from '@src/assets/icons/calender1';

export function RentalBooking() {
  const [toggle, setToggle] = useState(false);
  const [getDriver, setGetDriver] = useState(false);
  const { navigate } = useNavigation();
  const route = useRoute();
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [pickupLocation, setPickUpLocation] = useState();
  const [dropLocation, setDropLocation] = useState();
  const [pickUpCoords, setPickupCoords] = useState();
  const [dropCoords, setDropCoords] = useState();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { linearColorStyle, textColorStyle, viewRTLStyle, textRTLStyle, bgContainer, isDark, Google_Map_Key } = useValues();
  const { DateValue, TimeValue, field, categoryId } = route.params || {};
  const { translateData } = useSelector(state => state.setting);
  const [findLoading, setFindLoading] = useState(false);
  const [errors, setErrors] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    invalidRange: '',
    pickupLocation: '',
    dropLocation: '',
  });

  useEffect(() => {
    if (field === 'startTime') {
      setStartDate(DateValue);
      setStartTime(TimeValue);
    } else if (field === 'endTime') {
      setEndDate(DateValue);
      setEndTime(TimeValue);
    }
  }, [DateValue, TimeValue, field]);

  const handleToggle = () => {
    setToggle(prevToggle => !prevToggle);
  };

  const handleToggleDriver = () => {
    setGetDriver(prevToggle => !prevToggle);
  };

  const gotoCalander = (value: any) => {
    navigate('Calander', { fieldValue: value });
  };

  const geocodeAddress = async address => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=${Google_Map_Key}`,
      );
      const dataMap = await response.json();
      if (dataMap.results.length > 0) {
        const location = dataMap.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
    return null;
  };

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const pickup = await geocodeAddress(pickupLocation);
        setPickupCoords(pickup);
        const drop = await geocodeAddress(dropLocation);
        setDropCoords(drop);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [pickupLocation, dropLocation]);

  useEffect(() => {
    setErrors(prevErrors => ({
      ...prevErrors,
      startDate: startDate ? '' : prevErrors.startDate,
      startTime: startTime ? '' : prevErrors.startTime,
      endDate: endDate ? '' : prevErrors.endDate,
      endTime: endTime ? '' : prevErrors.endTime,
      pickupLocation: pickupLocation ? '' : prevErrors.pickupLocation,
      dropLocation: dropLocation ? '' : prevErrors.dropLocation,
    }));
  }, [startDate, startTime, endDate, endTime, dropLocation]);

  const findCar = async () => {
    setFindLoading(true)
    let newErrors = {
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      invalidRange: '',
      pickupLocation: '',
      dropLocation: '',
    };

    let hasError = false;

    if (!pickupLocation) {
      newErrors.pickupLocation = "Please Enter Pickup Location" 
      hasError = true;
    }

    if (toggle && !dropLocation) {
      newErrors.dropLocation = "Please Enter Drop Location" 
      hasError = true;
    }

    if (!startDate) {
      newErrors.startDate = 'Select Date';
      hasError = true;
    }

    if (!startTime) {
      newErrors.startTime = 'Select Time';
      hasError = true;
    }

    if (!endDate) {
      newErrors.endDate = translateData.selectAnEndDate;
      hasError = true;
    }

    if (!endTime) {
      newErrors.endTime = translateData.selectAnEndTime;
      hasError = true;
    }
    if (startDate && startTime && endDate && endTime) {

      const start = `${startDate} ${startTime}`;
      const end = `${endDate} ${endTime}`;
      if (end <= start) {

        newErrors.invalidRange = "End Date & Time must be after start time";
        hasError = true;
      }
    }

    setErrors(newErrors);
    if (hasError) {
      setFindLoading(false);
      return;
    }
    !errors && setFindLoading(true);
    try {
      const pickup = await geocodeAddress(pickupLocation);

      if (pickup) {
        let payload: RentalInterface = {
          locations: [
            {
              lat: pickup?.lat,
              lng: pickup?.lng,
            },
          ],
          service_category: 'rental',
        };

        dispatch(rentalvehicleRequest(payload))
          .unwrap()
          .then(async (res: any) => {
            if (res.success) {
              setFindLoading(false);
              navigate('RentalVehicleSelect', { payload });
            } else {
              setFindLoading(false);
              navigate('RentalVehicleSelect', {
                startDate,
                pickUpCoords,
                pickupLocation,
                dropLocation,
                dropCoords,
                categoryId,
                endDate,
                startTime,
                endTime,
                getDriver,
              });
            }
          })
          .catch((error: any) => {
            console.error('❌ Error in dispatch rentalvehicleRequest:', error);
          });
      } else {
        console.error('❌ Failed to get pickup coordinates');
      }
    } catch (error) {
      console.error('❌ Error in findCar:', error);
    }
  };

  return (
    <View style={external.main}>
      <View style={[{ flex: 1 }, { backgroundColor: linearColorStyle }]}>
        <Header value={translateData.rentalRide} />
        <View style={styles.inputMainView}>
          <InputText
            borderColor={isDark ? appColors.darkBorder : appColors.border}
            placeholder={translateData.enterPickupLocation}
            title={translateData.pickupLocation}
            showTitle={true}
            placeholderText={
              isDark ? appColors.darkText : appColors.regularText
            }
            value={pickupLocation}
            onChangeText={text => {
              setPickUpLocation(text);
              if (text.trim() === '') {
                setErrors(prev => ({
                  ...prev,
                  pickupLocation: translateData.pleaseEnterAPickupLocation,
                }));
              } else {
                setErrors(prev => ({ ...prev, pickupLocation: '' }));
              }
            }}
            warningText={errors.pickupLocation ? errors.pickupLocation : ''}
          />
          {toggle && (
            <InputText
              borderColor={isDark ? appColors.darkBorder : appColors.border}
              placeholder={translateData.dropLocation}
              title={translateData.dropoffLocation}
              showTitle={true}
              placeholderText={
                isDark ? appColors.darkText : appColors.regularText
              }
              value={dropLocation}
              onChangeText={text => {
                setDropLocation(text);
                if (text.trim() === '') {
                  setErrors(prev => ({
                    ...prev,
                    dropLocation: "error"
                  }));
                } else {
                  setErrors(prev => ({ ...prev, dropLocation: '' }));
                }
              }}
              warningText={errors.dropLocation ? errors.dropLocation : ''}
            />
          )}
          <View style={[styles.dropView, { flexDirection: viewRTLStyle }]}>
            <Text
              style={{
                color: textColorStyle,
                fontFamily: appFonts.medium,
              }}>
              {translateData.dropLocations}
            </Text>
            <SwitchComponent
              Enable={toggle}
              onPress={handleToggle}></SwitchComponent>
          </View>
          <View
            style={[
              styles.datetimeView,
              { backgroundColor: bgContainer },
              { borderColor: isDark ? appColors.darkBorder : appColors.border },
            ]}>
            <Text
              style={[
                styles.datetimeText,
                { textAlign: textRTLStyle },
                { color: textColorStyle },
              ]}>
              {translateData.startTimedate}
            </Text>

            <View style={[styles.row, { flexDirection: viewRTLStyle }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => gotoCalander('startTime')}
                style={[
                  styles.clockBtn,
                  { flexDirection: viewRTLStyle },
                  { backgroundColor: linearColorStyle },
                  { borderColor: isDark ? appColors.bgDark : appColors.border },
                ]}>
                <View style={styles.paddingHr}>
                  <Calender1 />
                </View>
                <TextInput
                  placeholder={translateData.selectDate}
                  placeholderTextColor={
                    isDark ? appColors.darkText : appColors.regularText
                  }
                  style={[
                    styles.timeText,
                    {
                      color: isDark
                        ? appColors.whiteColor
                        : appColors.blackColor,
                    },
                  ]}
                  editable={false}
                  value={startDate}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => gotoCalander('startTime')}
                style={[
                  styles.clockBtn,
                  { flexDirection: viewRTLStyle },
                  { backgroundColor: linearColorStyle },
                  { borderColor: isDark ? appColors.bgDark : appColors.border },
                ]}>
                <View style={styles.calenderView}>
                  <Clock color={appColors.regularText} />

                </View>
                <TextInput
                  placeholder={translateData.selectTime}

                  placeholderTextColor={
                    isDark ? appColors.darkText : appColors.regularText
                  }
                  style={[
                    styles.timeText,
                    {
                      color: isDark
                        ? appColors.whiteColor
                        : appColors.blackColor,
                    },
                  ]}
                  editable={false}
                  pointerEvents="none"
                  value={startTime}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: viewRTLStyle,
                marginTop: windowHeight(11),
              }}>
              {errors.startDate ? (
                <Text style={{
                  color: appColors.textRed, fontSize: fontSizes.FONT14SMALL

                }}>
                  {errors.startDate}
                </Text>
              ) : (
                ''
              )}
              {errors.startTime ? (
                <Text
                  style={{
                    color: appColors.textRed,
                    paddingHorizontal: '35%',
                    fontSize: fontSizes.FONT14SMALL

                  }}>
                  {errors.startTime}
                </Text>
              ) : (
                ''
              )}
            </View>
            <Text
              style={[
                styles.datetimeText,
                { textAlign: textRTLStyle },
                { color: textColorStyle },
                { marginTop: windowHeight(18) },
              ]}>
              {translateData.endTimedate}
            </Text>
            <View
              style={{
                flexDirection: viewRTLStyle,
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => gotoCalander('endTime')}
                style={[
                  styles.clockBtn,
                  { flexDirection: viewRTLStyle },
                  { backgroundColor: linearColorStyle },
                  { borderColor: isDark ? appColors.bgDark : appColors.border },
                ]}>
                <View style={styles.paddingHr}>
                  <Calender1 />
                </View>
                <TextInput
                  placeholder={translateData.selectDate}
                  placeholderTextColor={
                    isDark ? appColors.darkText : appColors.regularText
                  }
                  style={[
                    styles.timeText,
                    {
                      color: isDark
                        ? appColors.whiteColor
                        : appColors.blackColor,
                    },
                  ]}
                  editable={false}
                  value={endDate}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => gotoCalander('endTime')}
                style={[
                  styles.clockBtn,
                  { flexDirection: viewRTLStyle },
                  { backgroundColor: linearColorStyle },
                  { borderColor: isDark ? appColors.bgDark : appColors.border },
                ]}>
                <View style={styles.calenderView}>

                  <Clock color={appColors.regularText} />
                </View>
                <TextInput

                  placeholder={translateData.selectTime}
                  placeholderTextColor={
                    isDark ? appColors.darkText : appColors.regularText
                  }
                  style={[
                    styles.timeText,
                    {
                      color: isDark
                        ? appColors.whiteColor
                        : appColors.blackColor,
                    },
                  ]}
                  editable={false}
                  value={endTime}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: viewRTLStyle,
                marginTop: windowHeight(11.5),
              }}>
              {errors.startDate || errors.invalidRange ? (
                <Text style={{
                  color: appColors.textRed, fontSize: fontSizes.FONT14SMALL
                }}>
                  {errors.startDate ? errors.startDate : errors.invalidRange}
                </Text>
              ) : (
                ''
              )}
              {errors.startTime ? (
                <Text
                  style={{
                    color: appColors.textRed,
                    paddingHorizontal: '35%',
                    fontSize: fontSizes.FONT14SMALL
                  }}>
                  {errors.startTime}
                </Text>
              ) : (
                ''
              )}
            </View>
          </View>
          <View
            style={[
              styles.tripMainView,
              { flexDirection: viewRTLStyle },
              { backgroundColor: bgContainer },
              { borderColor: isDark ? appColors.darkBorder : appColors.border },
            ]}>
            <View style={styles.tripSubView}>
              <Text style={[styles.tripText, { textAlign: textRTLStyle }]}>
                {translateData.getDriver}
              </Text>
              <Text style={[styles.noDriverText, { textAlign: textRTLStyle }]}>
                {translateData.getDriverCar}
              </Text>
            </View>
            <View style={styles.switchView}>
              <SwitchComponent
                Enable={getDriver}
                onPress={handleToggleDriver}></SwitchComponent>
            </View>
          </View>
        </View>
        <View style={styles.FindView}>
          <Button
            width={'91%'}
            title={translateData.findNow}
            onPress={findCar}
            loading={findLoading}
          />
        </View>
      </View>
    </View>
  );
}
