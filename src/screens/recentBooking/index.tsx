import { View, Text, Image, FlatList } from 'react-native';
import React, { useState } from 'react';
import { appColors } from '@src/themes';
import { CalenderSmall, ClockSmall, Gps, PickLocation } from '@src/utils/icons';
import { external } from '@src/styles/externalStyle';
import { styles } from './styles';
import { useValues } from '@App';
import { Button, formatDateTime, notificationHelper } from '@src/commonComponent';
import { useAppNavigation } from '@src/utils/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { userRideLocation, vehicleTypeDataGet } from '@src/api/store/actions';

export function Recentbooking({ recentRideData }) {
    const { bgFullStyle, textColorStyle, viewRTLStyle, isDark, textRTLStyle } = useValues();
    const dispatch = useDispatch();
    const [bookAgainLoading, setBookAgainLoading] = React.useState(false);
    const { zoneValue } = useSelector((state: any) => state.zone);
    const [loadingIndex, setLoadingIndex] = useState(null); // or use item.id

    if (!recentRideData || recentRideData.length === 0) {
        return null;
    }
    const { translateData } = useSelector((state) => state.setting);
    const { navigate } = useAppNavigation();


    const gotoBook = (item) => {
        setBookAgainLoading(true);
        const ride_number = item?.id;
        const destination = item?.locations?.[item.locations.length - 1];
        const stops = [];
        const pickupLocation = item?.locations?.[0];
        const categoryId = item?.service_id;
        const scheduleDate = null;
        const categoryOptionID = item?.service_category_id;
        const service_name = item?.service?.service_type;

        return dispatch(userRideLocation({ ride_number })) 
            .unwrap()
            .then((res: any) => {
                const zoneValue = res?.data[0];
                const payload = {
                    locations: [
                        {
                            lat: item?.location_coordinates[0]?.lat,
                            lng: item?.location_coordinates[0]?.lng,
                        },
                    ],
                    service_id: categoryId,
                    service_category_id: categoryOptionID,
                };

                const dispatchAction = () => dispatch(vehicleTypeDataGet(payload));

                if (item?.service_category?.slug === 'intercity' || item?.service_category?.slug === 'ride') {
                    return dispatchAction().then(() => {
                        navigate("BookRide", {
                            destination,
                            stops,
                            pickupLocation,
                            categoryId,
                            zoneValue,
                            scheduleDate,
                            categoryOptionID,
                        });
                    });
                }

                if (item?.service_category?.slug === 'package') {
                    return dispatchAction().then(() => {
                        navigate("Rental", {
                            pickupLocation,
                            service_ID: categoryId,
                            service_category_ID: categoryOptionID,
                            zoneValue,
                        });
                    });
                }

                if (service_name === 'parcel' || service_name === 'freight') {
                    return dispatchAction().then(() => {
                        navigate("Outstation", {
                            destination,
                            stops,
                            pickupLocation,
                            service_ID: categoryId,
                            zoneValue,
                            service_name,
                            service_category_ID: categoryOptionID,
                        });
                    });
                }
            })
            .catch((error: any) => {
                console.error('Booking failed:', error);
                notificationHelper('', error, "error");
            })
            .finally(() => {
                setBookAgainLoading(false); 
            });
    };

    const renderItem = ({ item, index }) => {
        const { date, time } = formatDateTime(item.created_at);
        return (
            <View
                style={[styles.view, {
                    borderColor: isDark ? appColors.darkBorder : appColors.border,
                    backgroundColor: bgFullStyle,
                }]}>
                <View style={{ flexDirection: viewRTLStyle }}>
                    <View style={styles.viewWidth}>
                        <View style={{ flexDirection: viewRTLStyle }}>
                            <View style={styles.imageView}>
                                <Image source={{
                                    uri: item.vehicle_type.vehicle_image_url
                                }} style={styles.img} />
                            </View>
                            <View style={styles.textView}>
                                <Text style={[styles.textId, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>#{item.ride_number}</Text>
                                <Text style={styles.price}>{zoneValue.currency_symbol}{item.total}</Text>
                                <Text style={[styles.textId, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{Number(item.distance).toFixed(1)} {item.distance_unit}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.viewWidth1}>
                        <View style={[styles.clockSmallView1, { flexDirection: viewRTLStyle }]}>
                            <View style={styles.clockSmall}>
                                <CalenderSmall />
                            </View>
                            <Text style={styles.date}>{date}</Text>
                        </View>
                        <View style={[styles.clockSmallView, { flexDirection: viewRTLStyle }]}>
                            <View style={styles.clockSmall}>
                                <ClockSmall />
                            </View>
                            <Text style={styles.date}>{time}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.border} />
                <View style={[{ flexDirection: viewRTLStyle }, { backgroundColor: bgFullStyle }]}>
                    <View style={[external.fd_column, external.mh_15, external.mt_8]}>
                        <PickLocation height={12} width={12} colors={isDark ? appColors.whiteColor : appColors.primaryText} />
                        <View style={styles.icon} />
                        <Gps height={12} width={12} colors={isDark ? appColors.whiteColor : appColors.primaryText} />
                    </View>
                    <View style={[external.pv_10]}>
                        <Text style={[styles.itemStyle, { color: textColorStyle, width: '100%' }]}>
                            {item?.locations[0]?.length > 42
                                ? `${item.locations[0].slice(0, 42)}...`
                                : item?.locations[0]}
                        </Text>
                        <View style={styles.dashedLine} />
                        <Text style={[styles.pickUpLocationStyles, { color: textColorStyle }]}>{item?.locations[item.locations.length - 1]}</Text>
                    </View>
                </View>

                <Button
                    backgroundColor={appColors.primary}
                    onPress={() => {
                        setLoadingIndex(index);
                        gotoBook(item).finally(() => setLoadingIndex(null));
                    }}
                    textColor={appColors.whiteColor}
                    title={translateData.BookAgainTextttt}
                    loading={loadingIndex === index}
                />

            </View>
        )
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: isDark ? appColors.bgDark : appColors.lightGray }]}>
            <Text style={[styles.recentRides, { color: isDark ? appColors.whiteColor : appColors.primaryText, textAlign: textRTLStyle }]}>{translateData.homeRecentRides}</Text>
            <FlatList
                data={recentRideData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}
