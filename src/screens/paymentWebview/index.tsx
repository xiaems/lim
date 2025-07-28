import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { allRides, paymentVerify } from '@src/api/store/actions';
import { PaymentVerifyInterface } from '@src/api/interface/paymentInterface';
import { URL } from '@src/api/config';
import styles from './styles';
import firestore from '@react-native-firebase/firestore';
import NotificationHelper from '@src/components/helper/localNotificationHelper';

export function PaymentWebView({ navigation, route }) {

  const [paymentData, setPaymentData] = useState({ token: null, payerID: null });
  const dispatch = useDispatch();

  const handleResponse = async (data) => {
    const url = data.url;
    if (url.includes('token=') && url.includes('PayerID=')) {
      const queryParams = parseQueryParams(url);
      if (queryParams?.token && queryParams?.PayerID) {
        setPaymentData({
          token: queryParams.token,
          payerID: queryParams.PayerID,
        });
        await fetchPaymentData(queryParams.token, queryParams.PayerID);
      }
    }
  };

  const parseQueryParams = (url) => {
    const params = {};
    const queryString = url.split('?')[1];

    if (queryString) {
      queryString.split('&').forEach((param) => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
      });
    }
    return params;
  };

  const fetchPaymentData = async (token, payerID) => {
    const fetchUrl = `${URL}/${route?.params?.selectedPaymentMethod}/status?token=${token}&PayerID=${payerID}`;
    try {
      const response = await fetch(fetchUrl);
      const data = await response.json();

      let payload: PaymentVerifyInterface = {
        item_id: data?.item_id,
        type: data?.type,
        transaction_id: data?.transaction_id
      }

      dispatch(paymentVerify(payload))
        .unwrap()
        .then(async (res: any) => {
          if (res?.id) {
            try {
              const rideDocRef = firestore().collection('rides').doc(res?.id.toString());
              const docSnapshot = await rideDocRef.get();
              if (docSnapshot.exists) {
                await rideDocRef.update({ payment_status: 'COMPLETED' });
                navigation.navigate('MyTabs');
                NotificationHelper.showNotification({
                  title: 'Payment Completed',
                  message: 'Your payment has been processed successfully. Thank you for riding with us! 🎉',
                });
              } else {
                console.warn('Ride document does not exist');
              }
            } catch (error) {
              console.error('Error updating payment method:', error);
            }
            dispatch(allRides())
          }
        })
    } catch (error) {
      console.error('Error fetching payment data:', error);
    }
  };

  return (
    <WebView
      style={styles.modalview}
      startInLoadingState={true}
      incognito={true}
      androidLayerType="hardware"
      cacheEnabled={false}
      cacheMode={'LOAD_NO_CACHE'}
      source={{ uri: route.params.url }}
      onNavigationStateChange={(data) => handleResponse(data)}
    />
  );
}


