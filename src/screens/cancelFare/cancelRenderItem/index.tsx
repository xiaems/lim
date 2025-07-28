import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { external } from '../../../styles/externalStyle';
import { styles } from '../style';
import { commonStyles } from '../../../styles/commonStyle';
import { Button, notificationHelper, ProgressBar } from '@src/commonComponent';
import { useValues } from '../../../../App';
import { Star } from '@utils/icons';
import { useDispatch, useSelector } from 'react-redux';
import { allRides, bidUpdate } from '../../../api/store/actions/index';
import { fontSizes, appColors } from '@src/themes';
import { useAppNavigation } from '@src/utils/navigation';
import firestore, { firebase } from '@react-native-firebase/firestore';

export function CancelRender({ item }: { item: any }) {
  const { navigate } = useAppNavigation();
  const { linearColorStyle, bgFullStyle, textColorStyle, viewRTLStyle, textRTLStyle } = useValues();
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);
  const { translateData } = useSelector(state => state.setting);
  const { zoneValue } = useSelector((state: any) => state.zone);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectedLoading, setRejectedLoading] = useState(false);

  const handleAccept = () => {
    setAcceptLoading(true);
    const bid_id = item.id;
    const ride_request_id = item.ride_request_id;

    let payload = {
      status: 'accepted',
    };

    dispatch(bidUpdate({ payload, bid_id }))
      .unwrap()
      .then((res: any) => {
        if (res?.service_category_type === 'schedule') {
          navigate('MyTabs');
          notificationHelper('', 'Ride Scheduled', 'success');
          dispatch(allRides());
          setAcceptLoading(false);
        } else {
          acceptBidRequest(ride_request_id, bid_id, res);
          navigate('RideActive', { activeRideOTP: res });
          setAcceptLoading(false);
        }
      })
      .catch((error: any) => {
        console.error('Bid update error:', error);
        setAcceptLoading(false);
      });
  };


  const acceptBidRequest = async (rideRequestId, acceptedBidId, rideDetails) => {
    if (rideDetails?.id) {
      try {
        const bidsRef = firestore()
          .collection('ride_requests')
          .doc(rideRequestId.toString())
          .collection('bids');

        const snapshot = await bidsRef.get();
        const batch = firestore().batch();

        snapshot.forEach(doc => {
          const ref = doc.ref;
          if (doc.id == acceptedBidId.toString()) {
            batch.set(
              ref,
              { status: 'accepted', ride_id: rideDetails?.id },
              { merge: true },
            );
          } else {
            batch.delete(ref);
          }
        });
        await firestore()
          .collection('rides')
          .doc(rideDetails?.id.toString())
          .set(rideDetails);

        await batch.commit();
        clearRideRequestFields(rideRequestId)
        clearDriverRequest(rideRequestId, rideDetails?.driver?.id)

        // navigate("RideActive", { activeRideOTP: res });

      } catch (error) {
        console.error('❌ Error in handleAccept:', error);
      }
    } else {
      notificationHelper('', 'Somthing Went Wrong', 'error');
    }
  };

  const clearRideRequestFields = async (rideRequestId: string) => {
    try {
      const rideRef = firestore()
        .collection('ride_requests')
        .doc(rideRequestId);
      const rideDoc = await rideRef.get();

      if (rideDoc.exists) {
        const data = rideDoc.data();

        const fieldsToDelete = {};
        Object.keys(data).forEach(key => {
          fieldsToDelete[key] = firebase.firestore.FieldValue.delete(); // Delete all fields
        });

        await rideRef.update(fieldsToDelete);
      } else {
      }
    } catch (error) {
      console.error('❌ Error clearing ride request fields:', error);
    }
  };

  const clearDriverRequest = async (
    rideRequestId: string,
    driver_id: string,
  ) => {
    const driverRideRequestsRef = firestore().collection(
      'driver_ride_requests',
    );

    try {
      // 1. Get ALL drivers (this fetches only documents with relevant data)
      const snapshot = await driverRideRequestsRef.get();
      const batch = firestore().batch();
      snapshot.forEach(doc => {
        const data = doc.data();
        const rideRequests = data.ride_requests || [];

        // 2. Check if this driver has the rideRequestId
        const hasRide = rideRequests.some(r => r.id === rideRequestId);
        if (!hasRide) return; // Skip if not found

        // 3. Filter out the ride to be deleted
        const updatedRides = rideRequests.filter(r => r.id !== rideRequestId);

        // 4. Update only that document
        batch.update(doc.ref, { ride_requests: updatedRides });
      });

      // 5. Commit batch
      await batch.commit();
    } catch (error) {
      console.error('❌ Error clearing driver requests:', error);
    }
  };

  const handleReject = () => {
    setRejectedLoading(true);
    const bid_id = item.id;
    const ride_request_id = item.ride_request_id;

    let payload = {
      status: 'rejected',
    };

    dispatch(bidUpdate({ payload, bid_id }))
      .unwrap()
      .then((res: any) => {
        rejectBidRequest(ride_request_id, bid_id);
        setRejectedLoading(false);
        // deleteDriverRequest(res?.driver_id, ride_request_id)
      })
      .catch((error: any) => {
        console.error('Bid update error:', error);
        setRejectedLoading(false);
      });
  };

  const rejectBidRequest = async (
    rideRequestId: string | number,
    rejectedBidId: string | number,
  ) => {
    try {
      const bidRef = firestore()
        .collection('ride_requests')
        .doc(rideRequestId.toString())
        .collection('bids')
        .doc(rejectedBidId.toString());

      // ✅ Update status and then delete
      await bidRef.set({ status: 'rejected' }, { merge: true });
      await bidRef.delete();
    } catch (error) {
      console.error('❌ Error in handleReject:', error);
    }
  };

  const deleteDriverRequest = async (
    driverId: string,
    rideRequestId: string,
  ) => {
    try {
      const docRef = firestore()
        .collection('driver_ride_requests')
        .doc(driverId.toString());

      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        console.warn(`❌ Document driver_ride_requests/${driverId} not found`);
        return;
      }

      const data = docSnapshot.data();
      const existingRequests = data?.ride_requests || [];

      const updatedRequests = existingRequests.filter(
        (r: { id: string }) => r.id !== rideRequestId.toString(),
      );

      await docRef.update({ ride_requests: updatedRequests });
    } catch (error) { }
  };

  useEffect(() => {
    const totalDuration = 30000; // seconds
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 100 / totalDuration;
        return next > 100 ? 100 : next;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      handleReject();
    }, totalDuration * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View>
      <View style={[styles.container, { backgroundColor: bgFullStyle }]}>
        <ProgressBar value={progress} />
        <View style={[external.ph_10]}>
          <TouchableOpacity
            onPress={() => navigate('DriverDetails')}
            activeOpacity={0.7}>
            <View
              style={[
                external.ai_center,
                external.mt_15,
                external.js_space,
                {
                  flexDirection: viewRTLStyle,

                },
              ]}>
              <View style={[external.ai_center, { flexDirection: viewRTLStyle }]}>
                <Image
                  style={styles.img}
                  source={{ uri: item?.driver?.profile_image_url }}
                />
                <Text
                  style={[
                    styles.titleText,
                    {
                      color: textColorStyle,
                      textAlign: textRTLStyle,
                      fontSize: fontSizes.FONT20,
                    },
                  ]}>
                  {item?.driver?.name}
                </Text>
              </View>
              <Text
                style={[
                  commonStyles.mediumTextBlack12,
                  { color: appColors.primary, fontSize: fontSizes.FONT20 },
                ]}>
                {zoneValue.currency_symbol}
                {item?.amount}
              </Text>
            </View>
            <View
              style={[
                external.mv_5,
                external.js_space,
                { flexDirection: viewRTLStyle },
              ]}>
              <Text style={[commonStyles.regularText, { color: textColorStyle }]}>
                {item?.vehicle_info?.model}
              </Text>
              {item?.driver?.rating && (
                <View style={{ flexDirection: viewRTLStyle }}>
                  <View style={styles.rating}>
                    <Star />
                  </View>
                  <Text
                    style={[commonStyles.regularText, { color: textColorStyle }]}>
                    {item?.driver?.rating}
                  </Text>
                  <Text style={[styles.totalRating, { textAlign: textRTLStyle }]}>
                    {item?.driver?.totalRating}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <View
            style={[
              external.mt_3,
              external.js_space,
              { flexDirection: viewRTLStyle },
            ]}>
            <Button
              title={translateData.skip}
              width={'48%'}
              backgroundColor={linearColorStyle}
              textColor={textColorStyle}
              onPress={handleReject}
              loading={rejectedLoading}
            />
            <Button
              title={translateData.accept}
              width={'48%'}
              backgroundColor={appColors.primary}
              onPress={handleAccept}
              loading={acceptLoading}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
