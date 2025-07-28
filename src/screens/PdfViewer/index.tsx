import React, { useState } from 'react';
import { View, Dimensions, ActivityIndicator, StyleSheet, Platform, PermissionsAndroid, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { HeaderContainer, notificationHelper } from '@src/commonComponent';
import { appColors, windowHeight } from '@src/themes';
import { Download } from '@src/utils/icons';
import { useValues } from '../../../App';
import RNFetchBlob from 'rn-fetch-blob';
import { useSelector } from 'react-redux';
import { URL } from '@src/api/config';

export function PdfViewer({ route }) {
    const { pdfUrl, token, rideNumber } = route?.params || {};
    const { bgContainer, imageRTLStyle, isDark, bgFullStyle } = useValues();
    const [loading, setLoading] = useState(true);
    const { translateData } = useSelector(state => state.setting);
    const pdfGoogleViewer = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;

    const downloadInvoice = async () => {
        const downloadPath = `${RNFetchBlob.fs.dirs.DownloadDir}/invoice_${rideNumber}.pdf`;
        if (Platform.OS === 'android' && Platform.Version < 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert(
                    'Permission Denied',
                    'Storage permission is required to save the file.',
                );
                return;
            }
        }

        try {
            const res = await RNFetchBlob.config({
                fileCache: true,
                appendExt: 'pdf',
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    path: downloadPath,
                    description: 'Downloading invoice PDF',
                    mime: 'application/pdf',
                    mediaScannable: true,
                },
            }).fetch('GET', `${URL}/api/ride/invoice/${rideNumber}`, {
                Authorization: `Bearer ${token}`,
                Accept: 'application/pdf',
            });
            notificationHelper(``, `${translateData.fileSave} ${res.path()}`, 'success');
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert(`${translateData.downloadError}`, error.message);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={[styles.headerView, { backgroundColor: bgFullStyle }]}>
                <HeaderContainer
                    show={true}
                    icon={
                        <View
                            style={[
                                styles.container,
                                {
                                    backgroundColor: bgContainer,
                                    borderColor: isDark ? appColors.darkBorder : appColors.border,
                                },
                                { transform: [{ scale: imageRTLStyle }] },
                            ]}>
                            <Download
                            />
                        </View>
                    }
                    onPressIcon={downloadInvoice}

                    value="Invoice"
                />
            </View>
            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={appColors.primary} />
                </View>
            )}

            <WebView
                source={{ uri: pdfGoogleViewer }}
                style={{ flex: 1, marginTop: windowHeight(1), width: Dimensions.get('window').width }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={(error) => {
                    setLoading(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loaderContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -25,
        marginLeft: -25,
        zIndex: 10,
    },
    container: {
        width: windowHeight(32),
        height: windowHeight(32),
        backgroundColor: appColors.whiteColor,
        borderWidth: windowHeight(1),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: windowHeight(5),
    },
    headerView: {
        height: windowHeight(60),
    },
});
