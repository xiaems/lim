import { PermissionsAndroid, Platform } from 'react-native';

export const requestLocationPermission = async (): Promise<boolean> => {
    try {
        if (Platform.OS !== 'android') return true;

        const grantedForeground = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (grantedForeground !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('[PermissionHelper] Foreground location not granted');
            return false;
        }

        if (Platform.Version >= 33) {
            const grantedBackground = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
            );

            if (grantedBackground !== PermissionsAndroid.RESULTS.GRANTED) {
                console.warn('[PermissionHelper] Background location not granted');
                return false;
            }
        }

        return true;
    } catch (err) {
        console.warn('[PermissionHelper] Error requesting permissions:', err);
        return false;
    }
};
