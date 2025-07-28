import { View, Text, TextInput, TouchableOpacity, ScrollView, AppState } from "react-native";
import React, { useEffect, useRef, useState } from 'react';
import { Button, CommonModal, Header, notificationHelper } from "@src/commonComponent";
import { appColors } from "@src/themes";
import { Ambulance, IdCard, PickLocation } from "@src/utils/icons";
import { FlatList } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@src/api/store";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ambulancebook } from "@src/api/store/actions";
import styles from "./styles";
import { useValues } from "@App";
import { clearValue } from "@src/utils/localstorage";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import firestore from '@react-native-firebase/firestore';

const TOTAL_TIME = 60;

export function BookAmbulance() {
    const dispatch = useDispatch<AppDispatch>();
    const route = useRoute();
    const { location, lat, lng } = route?.params;
    const [selectedId, setSelectedId] = useState(null);
    const { ambulanceList } = useSelector((state) => state.ambulance);
    const [selectedAmbulance, setSelectedAmbulance] = useState();
    const [waiting, setWaiting] = useState(false);
    const { viewRTLStyle, isDark, textRTLStyle } = useValues()
    const { translateData } = useSelector((state) => state.setting);
    const { zoneValue } = useSelector((state: any) => state.zone);
    const navigation = useNavigation()
    const { self } = useSelector((state: any) => state.account);
    const [rideRequestId, setRideRequestId] = useState();
    const [driverId, setDriverId] = useState();
    const [cancelledManually, setCancelledManually] = useState(false);


    const [remaining, setRemaining] = useState(TOTAL_TIME);
    const [startTime, setStartTime] = useState(Date.now());
    const appState = useRef(AppState.currentState);
    const circularRef = useRef();


    const bookAmbulance = () => {
        setWaiting(true);

        const payload = {
            service_id: 4,
            location_coordinates: [
                {
                    lat: lat,
                    lng: lng
                }
            ],
            locations: [location],
            payment_method: "cash",
            select_type: "manual",
            ambulance_id: selectedAmbulance?.id,
            cucurrency_code: zoneValue?.currency_code
        };

        dispatch(ambulancebook(payload))
            .unwrap()
            .then(async (res: any) => {
                if (res?.status === 403) {
                    notificationHelper('', 'Please log in again.', 'error');
                    clearValue('token').then(() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'SignIn' }],
                        });
                    });
                    return;
                }
                if (res?.status == 200) {
                    setRideRequestId(res?.data?.id)
                    setDriverId(res?.data?.drivers)
                    const ride_request_Id = res?.data?.id;
                    const driver_id = res?.data?.drivers

                    const rideRef = firestore()
                        .collection('ride_requests')
                        .doc(ride_request_Id.toString());

                    // Step 1: Write main ride request document
                    await rideRef.set({
                        rider_id: ride_request_Id,
                        ...res?.data?.data,
                        timestamp: firestore.FieldValue.serverTimestamp(),
                    });

                    // Step 2: Write ambulance request subdocument with same ID (minimal reads)
                    await rideRef
                        .collection('ambulance_request')
                        .doc(ride_request_Id.toString()) // Use same ID to avoid random ones
                        .set({
                            status: 'pending',
                            driver_id: res?.data?.drivers || null,
                            ride_id: res?.ride_id || null,
                            id: ride_request_Id,
                            timestamp: firestore.FieldValue.serverTimestamp(),
                        });

                    await firestore()
                        .collection('driver_ride_requests')
                        .doc(driver_id.toString())
                        .set({
                            ride_requests: firestore.FieldValue.arrayUnion({
                                id: ride_request_Id,
                                driver_id: driver_id,
                            }),
                        }, { merge: true })



                    notificationHelper('', 'Ambulance booked successfully', 'success');

                }
                // Handle successful booking logic here
            })
            .catch((error: any) => {
                console.error('Booking failed:', error);
            });
    };



    useEffect(() => {
        if (!waiting) return;

        const TOTAL_TIME = 60;

        const now = Date.now();
        setStartTime(now);
        setRemaining(TOTAL_TIME);

        const interval = setInterval(() => {
            const currentTime = Date.now();
            const elapsed = Math.floor((currentTime - now) / 1000);
            const timeLeft = Math.max(0, TOTAL_TIME - elapsed);

            setRemaining(timeLeft);

            const fill = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;
            circularRef.current?.animate(fill, 500);

            if (timeLeft === 0 && !cancelledManually) {
                clearInterval(interval);
                handleCancelRide(); // auto cancel
            }
        }, 1000);

        const sub = AppState.addEventListener('change', next => {
            if (appState.current.match(/inactive|background/) && next === 'active') {
                const resumedNow = Date.now();
                const elapsed = Math.floor((resumedNow - now) / 1000);
                const timeLeft = Math.max(0, TOTAL_TIME - elapsed);

                setRemaining(timeLeft);

                const fill = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;
                circularRef.current?.animate(fill, 500);

                if (timeLeft === 0) {
                    clearInterval(interval);
                    handleCancelRide();
                }
            }

            appState.current = next;
        });

        return () => {
            clearInterval(interval);
            sub.remove();
        };
    }, [waiting]); // <- rerun only when modal is visible


    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
    const seconds = String(remaining % 60).padStart(2, '0');

    const handleCancelRide = async () => {
        setCancelledManually(true);

        try {
            const rideRequestIdStr = rideRequestId?.toString();
            const driverIdStr = driverId?.toString();
            if (!rideRequestIdStr || !driverIdStr) return;

            // 1. Delete ambulance_request subdocument
            await firestore()
                .collection('ride_requests')
                .doc(rideRequestIdStr)
                .collection('ambulance_request')
                .doc(rideRequestIdStr)
                .delete();

            // 2. Delete main ride_request document
            await firestore()
                .collection('ride_requests')
                .doc(rideRequestIdStr)
                .delete();

            // 3. Remove the ride from driver_ride_requests array
            await firestore()
                .collection('driver_ride_requests')
                .doc(driverIdStr)
                .update({
                    ride_requests: []  // clear the array but keep the document
                });

            setWaiting(false);
        } catch (error) {
            console.error('Error deleting ride request:', error);
            setWaiting(false);
        }
    };


    useEffect(() => {
        if (!rideRequestId) return;
        const unsubscribe = firestore()
            .collection('ride_requests')
            .doc(rideRequestId.toString())
            .collection('ambulance_request')
            .doc(rideRequestId.toString())  // same doc id in ambulance_request subcollection
            .onSnapshot(async docSnapshot => {
                if (!docSnapshot.exists) return;

                const data = docSnapshot.data(); if (data?.status === 'canceled') {
                    setWaiting(false);

                    notificationHelper('', 'Hospital rejected the request, please find another.', 'error');
                    await firestore()
                        .collection('ride_requests')
                        .doc(rideRequestId.toString())
                        .collection('ambulance_request')
                        .doc(rideRequestId.toString())
                        .delete();

                    // 2. Delete main ride_request document
                    await firestore()
                        .collection('ride_requests')
                        .doc(rideRequestId.toString())
                        .delete();

                    // Reset states or navigate away if needed
                } else if (data?.status === 'accepted') {
                    setWaiting(false);
                    notificationHelper('', 'Your ambulance request has been accepted.', 'success');
                    navigation.navigate('PaymentMethod', { rideData: data });
                }
            }, error => {
                console.error('Firestore listener error:', error);
            });

        return () => unsubscribe();
    }, [rideRequestId]);




    return (
        <View style={styles.mainView}>
            <Header value={translateData.bookAmbulance} />
            <ScrollView style={{ backgroundColor: isDark ? '#1F1F1F' : '#F5F5F5' }}>
                <View
                    style={[styles.mainContainer, { flexDirection: viewRTLStyle, backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor, borderColor: isDark ? appColors.darkBorder : appColors.border }]}
                >
                    <View>
                        <PickLocation />
                    </View>
                    <View style={styles.pickUpView}>
                        <Text
                            style={[styles.pickUp, { textAlign: textRTLStyle, color: isDark ? appColors.whiteColor : appColors.primaryText }]}
                        >
                            {translateData.pickupLocation}
                        </Text>
                        <Text
                            style={[styles.locationText, { textAlign: textRTLStyle }]}
                        >
                            {location?.length > 75 ? location.substring(0, 75) + "..." : location}

                        </Text>
                    </View>
                </View>
                <Text
                    style={[styles.description, { textAlign: textRTLStyle, color: isDark ? appColors.whiteColor : appColors.primaryText }]}
                >
                    {translateData.additionalDescription}
                </Text>
                <View
                    style={[styles.ambulanceView, { flexDirection: viewRTLStyle, backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor, borderColor: isDark ? appColors.darkBorder : appColors.border }]}
                >
                    <View style={styles.idCard}>
                        <IdCard />
                    </View>
                    <View>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor, borderColor: isDark ? appColors.darkBorder : appColors.border, textAlign: textRTLStyle, color: isDark ? appColors.whiteColor : appColors.primaryText }]}
                            multiline
                            numberOfLines={5}
                            placeholder={translateData.writePlaceholder}
                            placeholderTextColor={appColors.gray}
                        />
                    </View>
                </View>
                <Text
                    style={[styles.ambulanceText, { textAlign: textRTLStyle, color: isDark ? appColors.whiteColor : appColors.primaryText }]}
                >
                    {translateData.selectAmbulance}
                </Text>
                <FlatList
                    data={ambulanceList?.data}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                        const isSelected = selectedId === item.id;
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedId(item.id);
                                    setSelectedAmbulance(item);

                                }}
                                style={[styles.container, {
                                    backgroundColor: isSelected
                                        ? (isDark ? appColors.darkPrimary : appColors.lightButton)
                                        : (isDark ? appColors.darkPrimary : appColors.whiteColor)
                                    , borderColor: isSelected ? appColors.price : (isDark ? appColors.darkBorder : appColors.border),
                                }, { flexDirection: viewRTLStyle }]}>
                                <View
                                    style={[styles.bottomView]}
                                >
                                    <Ambulance />
                                </View>
                                <View
                                    style={styles.textView}>
                                    <Text
                                        style={[styles.itemText, { color: isDark ? appColors.whiteColor : appColors.primaryText, textAlign: textRTLStyle }]}
                                    >
                                        {item.name}
                                    </Text>
                                    <Text
                                        style={[styles.text, { textAlign: textRTLStyle }]}>
                                        {translateData.emergencySupport}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
                <CommonModal
                    isVisible={waiting}
                    animationType={'none'}
                    onPress={() => setWaiting(false)}
                    value={
                        <View style={styles.modelView}>
                            <AnimatedCircularProgress
                                ref={circularRef}
                                size={120}
                                width={10}
                                fill={0}
                                tintColor={appColors.primary}
                                backgroundColor={appColors.loaderBackground}
                                rotation={0}
                                lineCap="round"
                            >
                                {() => (
                                    <Text style={styles.timerText}>
                                        {minutes}:{seconds}
                                    </Text>
                                )}
                            </AnimatedCircularProgress>
                            <Text style={styles.ambulanceApprovalText}>{translateData.ambulanceApproval}</Text>
                            <Button title="Cancel" backgroundColor={appColors.alertRed} textColor={appColors.whiteColor} onPress={handleCancelRide} />
                        </View>
                    }
                />
            </ScrollView>
            <View style={styles.btn}>
                <Button title={translateData.bookAmbulance} onPress={bookAmbulance} />
            </View>
        </View>
    );
}
