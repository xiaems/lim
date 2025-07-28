import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Ac, Back, Bag, Right, Star1 } from "@src/utils/icons";
import { CarType } from "@src/assets/icons/carType";
import { FuelType } from "@src/assets/icons/fuelType";
import { Milage } from "@src/assets/icons/milage";
import { GearType } from "@src/assets/icons/gearType";
import { Seat } from "@src/assets/icons/seat";
import { Speed } from "@src/assets/icons/speed";
import { styles } from "./styles";
import { external } from "@src/styles/externalStyle";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RentalBookinginterface } from "@src/api/interface/rentalinterface";
import { rentalRideRequests } from "@src/api/store/actions";
import { useDispatch, useSelector } from "react-redux";
import { Button, CommonModal, notificationHelper } from "@src/commonComponent";
import { useValues } from "@App";
import { appColors } from "@src/themes";
import { clearValue } from "@src/utils/localstorage";
import firestore from "@react-native-firebase/firestore";
import { AnimatedCircularProgress } from 'react-native-circular-progress';


export function RentalCarDetails() {
  const route = useRoute();
  const { startDates, pickUpCoords, pickupLocation, dropLocation, dropCoords, endDates, convertedStartTime, convertedEndTime, getDriver } = route.params;
  const navigation = useNavigation()
  const dispatch = useDispatch();
  const { rentalVehicleListsDetails } = useSelector((state: any) => state.rentalVehicle);
  const { zoneValue } = useSelector((state: any) => state.zone);
  const { translateData } = useSelector((state) => state.setting);
  const { viewRTLStyle, isDark } = useValues()
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bookLoading, setBookloading] = useState(false);
  const { self } = useSelector((state: any) => state.account);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [rideCancelLoading, setRideCancelLoading] = useState(false);
  const [ride_req_id, setRideReqId] = useState(null);
  const totalSeconds = 60;


  useEffect(() => {
    if (!ride_req_id) return;

    const rideReqId = String(ride_req_id);

    const unsubscribe = firestore()
      .collection('ride_requests')
      .doc(rideReqId)
      .collection('rental_request')
      .doc(rideReqId)
      .onSnapshot(async (docSnapshot) => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          if (data?.status === 'canceled') {
            modelClose();
            notificationHelper("", "Driver Reject Request", 'error');
          } else if (data?.status === 'accepted') {
            setIsModalVisible(false);
            await firestore()
              .collection('ride_requests')
              .doc(rideReqId)
              .collection('rental_request')
              .doc(rideReqId)
              .delete();

            notificationHelper("", "Driver Accept Request", 'success');
            navigation.navigate('PaymentMethod', { rideData: data })
          }

        }
      });
    return () => unsubscribe();
  }, [ride_req_id]);

  const modelClose = async () => {
    setRideCancelLoading(true);
    setIsModalVisible(false);
    setBookloading(false);

    try {
      const rideReqDoc = await firestore()
        .collection('ride_requests')
        .doc(String(ride_req_id)) // Ensure you store this ID somewhere accessible
        .collection('rental_request')
        .doc(String(ride_req_id))
        .get();

      const driverId = rideReqDoc.data()?.driver_id;
      const rideReqId = String(ride_req_id);

      if (driverId) {
        // 1. Remove ride request from driver's list
        await firestore()
          .collection('driver_ride_requests')
          .doc(driverId)
          .update({
            ride_requests: firestore.FieldValue.arrayRemove({
              id: rideReqId,
              driver_id: driverId,
            }),
          });

        // 2. Delete rental_request document
        await firestore()
          .collection('ride_requests')
          .doc(rideReqId)
          .collection('rental_request')
          .doc(rideReqId)
          .delete();
      }

      // 3. Delete ride_request document
      await firestore()
        .collection('ride_requests')
        .doc(rideReqId)
        .delete();
      notificationHelper("", "Rentel Request cancel", 'error');

    } catch (err) {
      console.error('❌ Error during ride cleanup:', err);
    }
  };


  const carDetails = [
    { Icon: CarType, title: rentalVehicleListsDetails.vehicle_subtype },
    { Icon: FuelType, title: rentalVehicleListsDetails.fuel_type },
    { Icon: Milage, title: `${rentalVehicleListsDetails.mileage}` },
    { Icon: GearType, title: rentalVehicleListsDetails.gear_type },
    { Icon: Seat, title: `${rentalVehicleListsDetails?.seatingCapacity || 1} Seat` },
    { Icon: Speed, title: `${rentalVehicleListsDetails.vehicle_speed}` },
    { Icon: Ac, title: rentalVehicleListsDetails.is_ac == 1 ? 'AC' : 'Non AC' },
    { Icon: Bag, title: `${rentalVehicleListsDetails.bag_count}` },
  ];

  const [mainImage, setMainImage] = useState('');
  React.useEffect(() => {
    if (rentalVehicleListsDetails?.rental_vehicle_galleries?.length > 0) {
      setMainImage(rentalVehicleListsDetails.rental_vehicle_galleries[0]);
    } else if (rentalVehicleListsDetails?.normal_image_url) {
      setMainImage(rentalVehicleListsDetails.normal_image_url);
    }
  }, [rentalVehicleListsDetails]);

  const bookRental = async () => {
    setBookloading(true);
    const is_with_driver = getDriver ? "1" : "0";
    let dropLocations =
      dropLocation && dropLocation.trim() ? dropLocation : pickupLocation;

    let payload: RentalBookinginterface = {
      locations: [`${pickupLocation}`, `${dropLocations}`],
      location_coordinates: [
        {
          lat: `${pickUpCoords.lat}`,
          lng: `${pickUpCoords.lng}`,
        },
        {
          lat: `${dropCoords?.lat ?? pickUpCoords.lat}`,
          lng: `${dropCoords?.lng ?? pickUpCoords.lng}`,
        },
      ],
      service_id: '1',
      service_category_id: "5",
      vehicle_type_id: `${rentalVehicleListsDetails.vehicle_type_id}`,
      rental_vehicle_id: `${rentalVehicleListsDetails.id}`,
      is_with_driver: `${is_with_driver}`,
      payment_method: "cash",
      start_time: `${startDates} ${convertedStartTime}`,
      end_time: `${endDates} ${convertedEndTime}`,
      currency_code: zoneValue?.currency_code,
    };

    dispatch(rentalRideRequests(payload))
      .unwrap()
      .then(async (res) => {
        setBookloading(false)
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
        if (res?.id) {
          setRideReqId(res?.id);
          setIsModalVisible(true);
          notificationHelper("", "Rental Request Send", "success");

          const rideReqId = String(res?.id);
          const driverId = String(res?.drivers)
          const dataToSet = {
            rider_id: self?.id,
            ...res?.data,
          };

          try {
            // Update ride_requests
            await firestore()
              .collection('ride_requests')
              .doc(rideReqId)
              .set(dataToSet, { merge: true });

            // Create rental_request
            await firestore()
              .collection('ride_requests')
              .doc(rideReqId)
              .collection('rental_request')
              .doc(rideReqId)
              .set({
                id: rideReqId,
                driver_id: driverId,
                status: 'pending',
                ride_id: '',
              });

            await firestore()
              .collection('driver_ride_requests')
              .doc(String(driverId))
              .set(
                {
                  ride_requests: firestore.FieldValue.arrayUnion({
                    id: rideReqId,
                    driver_id: driverId,
                  }),
                },
                { merge: true }
              );

          } catch (err) {
            console.error('❌ Firestore error:', err);
          }
        } else {
          notificationHelper("", res.message, "error");
        }

      })
      .catch((error) => {
        console.error("Error in booking rental:", error);
      });
  };


  useEffect(() => {
    if (!isModalVisible) return;

    // Reset timer
    setSecondsLeft(60);

    // Start countdown
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          modelClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on modal close
    return () => clearInterval(interval);
  }, [isModalVisible]);


  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View>
      <View style={[styles.backBtn, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }, { borderColor: isDark ? appColors.darkBorder : appColors.border }]}>
        <Back />
      </View>
      <ScrollView style={{ backgroundColor: isDark ? appColors.bgDark : appColors.whiteColor }} showsVerticalScrollIndicator={false}>
        <View>
          <Image source={{ uri: mainImage }} style={styles.mainImg} />
        </View>
        <View style={[styles.subImgContainer, { flexDirection: viewRTLStyle }, { backgroundColor: isDark ? appColors.bgDark : appColors.whiteColor }]}>
          {rentalVehicleListsDetails?.rental_vehicle_galleries
            ?.map((img, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                key={index}
                style={[
                  styles.subImgView,
                  mainImage === img && styles.selectedSubImg,
                ]}
                onPress={() => setMainImage(img)}
              >
                <Image source={{ uri: img }} style={styles.subImg} />
              </TouchableOpacity>
            ))}
        </View>
        <View style={[styles.container]}>
          <View style={[styles.subContainer, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }, { borderColor: isDark ? appColors.darkBorder : appColors.border }]}>
            <View style={[styles.titleView, { flexDirection: viewRTLStyle }]}>
              <Text style={[styles.title, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{rentalVehicleListsDetails.name}</Text>
              <View style={[styles.rateContainer, { flexDirection: viewRTLStyle }]}>
                <Star1 />
                <Text style={styles.rating}>4.0</Text>
              </View>
            </View>

            <View style={[styles.detailContainer, { flexDirection: viewRTLStyle }]}>
              <Text style={styles.detail}>{rentalVehicleListsDetails.description}</Text>
              <View style={external.fd_row}>
                <Text style={styles.price}>
                  {zoneValue?.currency_symbol}{rentalVehicleListsDetails.vehicle_per_day_price}
                  <Text style={styles.day}>/{translateData.day}</Text>
                </Text>
              </View>
            </View>
            <View style={[styles.border, { borderBottomColor: isDark ? appColors.darkBorder : appColors.border }]} />
            <View style={[styles.driverContainer, { flexDirection: viewRTLStyle }]}>
              <Text style={[styles.title, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{translateData.driverPriceText}</Text>
              <View style={external.fd_row}>
                <Text style={styles.price}>
                  {zoneValue?.currency_symbol}{rentalVehicleListsDetails.driver_per_day_charge}
                  <Text style={styles.day}>/{translateData.day}</Text>
                </Text>
              </View>
            </View>

            <View style={[styles.carDetails, { flexDirection: viewRTLStyle }]}>
              {carDetails?.map((detail, index) => (
                <View key={index} style={[styles.detailIcon, { flexDirection: viewRTLStyle }, { backgroundColor: isDark ? appColors.bgDark : appColors.lightGray }]}>
                  <detail.Icon />
                  <Text style={styles.detailTitle}>{detail.title}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.title, external.mt_5, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{translateData.moreInfoText}</Text>
            {rentalVehicleListsDetails?.interior?.map((detail: any, index: number) => (
              <Text key={index} style={styles.description}>
                <Right /> {` ${detail}`}
              </Text>
            ))}
          </View>
          <TouchableOpacity
            style={[external.mv_15]}
            onPress={bookRental}
            activeOpacity={0.7}
          >
            <Button title={translateData.bookNow} onPress={bookRental} loading={bookLoading} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CommonModal
        isVisible={isModalVisible}
        onPress={() => setIsModalVisible(false)}
        value={
          <View>

            <View style={styles.imageWrapper}>
              <AnimatedCircularProgress
                size={100}
                width={10}
                fill={(1 - secondsLeft / totalSeconds) * 100}
                tintColor={appColors.primary}
                backgroundColor={appColors.loaderBackground}
                rotation={0}
                lineCap="round"
              >
                {
                  () => (
                    <Text style={styles.timerText}>
                      {formatTime(secondsLeft)}
                    </Text>
                  )
                }
              </AnimatedCircularProgress>
            </View>

            <Text
              style={[styles.requestSuccess, {
                color: isDark ? appColors.whiteColor : appColors.primaryText,
              }]}
            >
              {translateData.requestSuccessfullySent}
            </Text>
            <Text
              style={styles.modelSuccess}
            >
              {translateData.requestSentSuccess}
            </Text>
            <View
              style={styles.modelButtonView}
            >
              <Button title={translateData.cancel} onPress={modelClose} backgroundColor={appColors.alertRed} />
            </View>
          </View>
        }
      />
    </View>
  );
}
