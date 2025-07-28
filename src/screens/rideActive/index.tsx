import { View, Text, TouchableOpacity, Modal, Linking, PermissionsAndroid, Platform, ActivityIndicator, } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SolidLine, Button, notificationHelper, Map } from "@src/commonComponent";
import styles from "./styles";
import { Call, Message, Close, Back } from "@utils/icons";
import { useRoute } from "@react-navigation/native";
import { appColors } from "@src/themes";
import { useValues } from "../../../App";
import { ModalContect } from "./component/modalContect/index";
import { TexiDetail } from "./component/texiDetails/index";
import { DriverData } from "./component/driverData/index";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { cancelationDataGet } from "../../api/store/actions/cancelationAction";
import { sosData } from "../../api/store/actions/sosAction";
import { CustomBackHandler } from "@src/components";
import { allRides, rideDataPut } from "@src/api/store/actions/allRideAction";
import { useAppNavigation } from "@src/utils/navigation";
import GetLocation from "react-native-get-location";
import { external } from "@src/styles/externalStyle";
import firestore from '@react-native-firebase/firestore';
import Sound from 'react-native-sound';
import NotificationHelper from "@src/components/helper/localNotificationHelper";

export function RideActive() {
  const dispatch = useDispatch();
  const route = useRoute();
  const { activeRideOTP } = route?.params;
  const { textColorStyle, linearColorStyle, bgFullStyle, bgContainer, textRTLStyle, viewRTLStyle, Google_Map_Key } = useValues();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCancelVisible, setModalCancelVisible] = useState(false);
  const { navigate } = useAppNavigation();
  const [pickupLocation, setPickupLocation] = useState<{
    lat: 21.197905;
    lng: 72.797856;
  } | null>({ lat: 21.197905, lng: 72.797856 });
  const { rideData } = useSelector((state) => state.allRide);
  const { canceldata } = useSelector((state) => state.cancelationReason);
  const { translateData } = useSelector((state) => state.setting);
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const markerRef = useRef(null);
  const previousLocation = useRef(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const updatedLocation = rideData?.location_coordinates?.map((coord) => ({
    latitude: parseFloat(coord.lat),
    longitude: parseFloat(coord.lng),
  }));
  let isSoundPlaying = false;
  const playArrivalSound = () => {
    if (isSoundPlaying) return;
    isSoundPlaying = true;
    try {
      const sound = new Sound(
        'https://res.cloudinary.com/dwsbvqylx/video/upload/v1748766815/mixkit-happy-bells-notification-937_tbin83.wav',
        undefined, // use `undefined`, not `null`
        (error) => {
          if (error) {
            isSoundPlaying = false;
            return;
          }

          sound.play((success) => {
            if (success) {
            } else {
            }

            sound.release();
            isSoundPlaying = false;
          });

          setTimeout(() => {
            sound.stop(() => {
              sound.release();
              isSoundPlaying = false;
            });
          }, 5000);
        }
      );
    } catch (err) {
      isSoundPlaying = false;
    }
  };


  useEffect(() => {
    const unsubscribe = firestore()
      .collection('rides')
      .doc(activeRideOTP?.id?.toString())
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          const status = data?.ride_status?.slug;
          if (status === 'started') {
            if (data?.service_category?.service_category_type == 'package') {
              navigate("PaymentRental", { rideId: activeRideOTP?.id });
            } else {
              navigate("Payment", { rideId: activeRideOTP?.id });
            }
          } else if (status == 'arrived') {
            notificationHelper("", "🚗 Your driver has arrived! Please head to the pickup location.", "success")
            NotificationHelper.showNotification({
              title: 'Driver Has Arrived',
              message: 'Your driver is waiting for you at the pickup spot. Have a safe trip!',
            });
            playArrivalSound();
          }
        }
      });
    return () => unsubscribe();
  }, [activeRideOTP?.id]);


  const calculateBearing = (startLat, startLng, endLat, endLng) => {
    const toRadians = (degree) => degree * (Math.PI / 180);
    const toDegrees = (radian) => radian * (180 / Math.PI);

    const lat1 = toRadians(startLat);
    const lat2 = toRadians(endLat);
    const dLng = toRadians(endLng - startLng);

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    const bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360;
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          startTrackingLocation();
        } else {
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      startTrackingLocation();
    }
  };

  const startTrackingLocation = () => {
    getCurrentLocation();
    const locationInterval = setInterval(() => {
      getCurrentLocation();
    }, 1000);
    return () => clearInterval(locationInterval);
  };

  const getCurrentLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then((loc) => {
        const newLocation = {
          latitude: loc.latitude,
          longitude: loc.longitude,
        };

        if (previousLocation.current) {
          const newHeading = calculateBearing(
            previousLocation.current.latitude,
            previousLocation.current.longitude,
            newLocation.latitude,
            newLocation.longitude
          );
          setHeading(newHeading);
        }

        animateMarker(newLocation);
        setLocation(newLocation);
        previousLocation.current = newLocation;
      })
      .catch((error) => {
        const { code, message } = error;
        console.warn(code, message);
      });
  };

  const animateMarker = (newLocation) => {
    if (markerRef.current) {
      markerRef.current.animateMarkerToCoordinate(newLocation, 500);
    }
  };

  const handleDirectionsReady = (result) => {
    const coords = result.coordinates;
    setRouteCoordinates(coords);
  };

  useEffect(() => {
    requestLocationPermission();
    return () => clearInterval(startTrackingLocation);
  }, []);

  useEffect(() => {
    const zone_id = 2;
    dispatch(sosData(zone_id));
    dispatch(cancelationDataGet());
  }, []);


  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            pickupLocation
          )}&key=${Google_Map_Key}`
        );
        const { results } = response.data;
        if (results.length > 0) {
          const { geometry } = results[0];
          const { location } = geometry;
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      }
    };
    fetchCoordinates();
  }, [pickupLocation]);

  const handlePreeCancel = () => {
    setModalCancelVisible(true);
  };

  const driverData = () => {
    navigate("DriverInfos", { driverInfo: activeRideOTP?.driver });
  };

  const gotoChat = (activeRideOTP) => {
    navigate("ChatScreen", {
      driverId: activeRideOTP?.driver?.id,
      riderId: activeRideOTP?.rider?.id,
      rideId: activeRideOTP?.id,
      driverName: activeRideOTP?.driver?.name,
      driverImage: activeRideOTP?.driver?.profile_image_url,
    });
  };

  const handleCall = (activeRideOTP) => {
    const phoneNumber = `${activeRideOTP?.driver?.phone}`;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const gotoHome = (selectedItem) => {
    const ride_id = activeRideOTP.id;
    let payload: ReviewInterface = {
      status: "cancelled",
      cancellation_reason: selectedItem.title,
      end_time: "",
      distance: 8,
      distance_unit: "km",
    };
    dispatch(rideDataPut({ payload, ride_id }))
      .unwrap()
      .then((res: any) => {
        if (res?.ride_status?.slug == 'cancelled') {
          const rideId = activeRideOTP?.id;

          if (rideId) {
            firestore()
              .collection('rides')
              .doc(rideId.toString())
              .update({
                'ride_status.name': 'Cancelled',
                'ride_status.slug': 'cancelled',
                cancellation_reason: selectedItem.title,
              })
              .then(() => {
                navigate("MyTabs");
                dispatch(allRides());
              })
              .catch(error => {
                console.error('Error updating ride status:', error);
              });
          } else {
            console.warn('rideId not found');
          }
        }

      });
  };


  return (
    <View style={external.main}>
      <CustomBackHandler />
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: bgContainer }]}
        onPress={gotoHome}
        activeOpacity={0.7}
      >
        <Back />
      </TouchableOpacity>
      <View style={styles.mapSection}>
        {activeRideOTP?.location_coordinates?.[0] ? (
          <Map
            userLocation={activeRideOTP?.location_coordinates?.[0] || {}}
            driverId={activeRideOTP?.driver?.id || ""}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={appColors.primary} />
          </View>
        )}
      </View>
      <View style={{ flex: 0.3, backgroundColor: linearColorStyle }} />
      <View style={styles.card}>
        <View style={[styles.subContainer, { backgroundColor: bgFullStyle }]}>
          <View
            style={[styles.profileContainer, { flexDirection: viewRTLStyle }]}
          >
            <DriverData
              driverData={driverData}
              driverDetail={activeRideOTP?.driver}
            />
            <View style={{ flexDirection: viewRTLStyle }}>
              <TouchableOpacity
                style={styles.message}
                onPress={() => gotoChat(activeRideOTP)}
                activeOpacity={0.7}
              >
                <Message />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.call}
                onPress={() => handleCall(activeRideOTP)}
              >
                <Call />
              </TouchableOpacity>
            </View>

            <Modal
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(false);
              }}
            >
              <ModalContect onpress={() => setModalVisible(false)} />
            </Modal>

            <Modal
              transparent={true}
              visible={modalCancelVisible}
              onRequestClose={() => {
                setModalCancelVisible(false);
              }}
            >
              <View style={styles.modalBg}>
                <View
                  style={[
                    styles.modalBgMain,
                    { backgroundColor: linearColorStyle },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.close}
                    onPress={() => setModalCancelVisible(false)}
                  >
                    <Close />
                  </TouchableOpacity>
                  <Text style={[styles.cancelTitle, { color: textColorStyle }]}>
                    {translateData.whyCancel}
                  </Text>
                  {canceldata?.data?.map((item) => (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      key={item.id}
                      style={[
                        styles.container2,
                        {
                          backgroundColor: bgContainer,
                          flexDirection: viewRTLStyle,
                        },
                      ]}
                      onPress={() => gotoHome(item)}
                    >
                      <View style={styles.textContainer}>
                        <Text
                          style={[
                            styles.text,
                            { color: textColorStyle, textAlign: textRTLStyle },
                          ]}
                        >
                          {item.title}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  <Button
                    backgroundColor={appColors.primary}
                    width={300}
                    title={translateData.close}
                    onPress={() => setModalCancelVisible(false)}
                  />
                </View>
              </View>
            </Modal>
          </View>
          <SolidLine />
          <TexiDetail
            otp={activeRideOTP?.otp}
            vehicleData={activeRideOTP}
          />
          <SolidLine />
          <View
            style={[styles.cancelBtnView, {
              flexDirection: viewRTLStyle,

            }]}
          >
            <Button
              title={translateData.cancelRide}
              width={"100%"}
              backgroundColor={appColors.textRed}
              textColor={appColors.whiteColor}
              onPress={handlePreeCancel}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
export default RideActive;
