import { getApp } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import { getMessaging, getToken, onMessage, onNotificationOpenedApp, getInitialNotification, requestPermission, AuthorizationStatus } from '@react-native-firebase/messaging';


export async function requestUserPermission() {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (!granted) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs access to notifications to send you updates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          return;
        }
      }
    } catch (err) {
      return;
    }
  }

  // iOS Firebase messaging permission
  try {
    const app = getApp();
    const messaging = getMessaging(app);
    const authStatus = await requestPermission(messaging);


    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await getFcmToken();
    } else {
    }
  } catch (e) {
  }
}

export const getFcmToken = async () => {

  try {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      const app = getApp();
      const messaging = getMessaging(app);
      fcmToken = await getToken(messaging);

      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
      } else {
      }
    }
  } catch (error) {
  }
};

export const NotificationServices = () => {

  const app = getApp();
  const messaging = getMessaging(app);

  onNotificationOpenedApp(messaging, remoteMessage => {
  });

  onMessage(messaging, async remoteMessage => {
  });

  getInitialNotification(messaging).then(remoteMessage => {
    if (remoteMessage) {

    }
  });
};