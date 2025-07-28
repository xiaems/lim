import { ScrollView, View, TouchableOpacity, Image, Text, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import React, { useCallback, useState } from 'react';
import { Button, Header, notificationHelper } from '@src/commonComponent';
import { external } from '../../../../styles/externalStyle';
import { PendingDetails } from './pendingDetails/index';
import { appColors, appFonts, fontSizes, windowHeight, windowWidth, } from '@src/themes';
import { useValues } from '../../../../../App';
import { useFocusEffect, useNavigation, useRoute, } from '@react-navigation/native';
import { CalenderSmall, ClockSmall, Close, Gps, PickLocation, RatingEmptyStart, RatingHalfStar, RatingStar, StarEmpty, StarFill } from '@src/utils/icons';
import { styles } from '../rideContainer/style';
import Images from '@src/utils/images';
import { useDispatch, useSelector } from 'react-redux';
import RNFS from 'react-native-fs';
import { clearValue, getValue } from '@src/utils/localstorage';
import { allRide, paymentsData, driverReviewPost, allRides } from '@src/api/store/actions';
import { URL } from '@src/api/config';
import { UserRegistrationPayload } from '@src/api/interface/authInterface';
import styless from './styles';
import { commonStyles } from '@src/styles/commonStyle';
import firestore from '@react-native-firebase/firestore';
import { apiformatDates } from '@src/utils/functions';

export function PendingRideScreen() {
  const { bgFullStyle, textColorStyle, viewRTLStyle, textRTLStyle, isDark, isRTL } = useValues();
  const route = useRoute();
  const { item, vehicleDetail, rideStatus } = route?.params;
  const dispatch = useDispatch();
  const orderNumber = item?.ride_number;
  const { navigate } = useNavigation();
  const { rideData } = useSelector((state: any) => state.allRide);
  const [rating, setRating] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState<string>('');
  const { translateData } = useSelector(state => state.setting);
  const navigation = useNavigation();
  const { zoneValue } = useSelector((state: any) => state.zone);
  const { self } = useSelector((state: any) => state.account);
  const [loader, setLoader] = useState(false)
  const [paymentLoading, setpaymentLoading] = useState(false);


  const viewInvoice = async () => {
    setLoader(true)
    const token = await getValue('token');
    const filePath = `${RNFS.DownloadDirectoryPath}/invoice/${orderNumber}.pdf`;
    const response = await fetch(
      `${URL}/api/ride/invoice/${rideData.ride_number}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status == 200) {
      setLoader(false)
      navigate('PdfViewer', {
        pdfUrl: response?.url,
        token: token,
        rideNumber: rideData?.ride_number
      });
    }
  };


  const gotoTrack = () => {
    setLoader(true)
    if (item?.service_category.service_category_type === "package") {
      navigate("PaymentRental", { rideId: item?.id });
      setLoader(false)
    } else {
      navigate("Payment", { rideId: item?.id });
      setLoader(false)
    }
  };

  const payNow = () => {
    setpaymentLoading(true);
    const rideData = item;
    navigate('PaymentMethod', { rideData });
    setpaymentLoading(false)
  };

  const review = () => {
    setModalVisible(true);
  };

  const reviewSubmit = async () => {
    let payload: UserRegistrationPayload = {
      ride_id: item?.id,
      driver_id: item?.driver_id,
      rating: rating,
      message: reviewText,
    };
    dispatch(driverReviewPost(payload))
      .unwrap()
      .then((res: any) => {
        if (res?.success === false) {
          notificationHelper('', res.message, 'error');
          setModalVisible(false);
        } else {
          dispatch(allRides())
          setModalVisible(false);
          notificationHelper('', translateData.reviewSubmited, 'success');
          navigation.goBack();
        }
      })
      .catch(err => {
        notificationHelper('', err, 'error');
      });
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(paymentsData())
        .unwrap()
        .then((res: any) => {
          if (res?.status === 403) {
            notificationHelper(
              '',
              'Please log in again.',
              'error',
            );
            clearValue('token').then(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
              });
            });
          }
        })
        .catch(error => {
          console.error('Error in paymentsData:', error);
        });

      dispatch(allRide({ ride_id: item.id }))
        .unwrap()
        .then((res: any) => {
          if (res?.status === 403) {
            notificationHelper(
              '',
              'Please log in again.',
              'error',
            );
            clearValue('token').then(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
              });
            });
          }
        })
        .catch(error => {
          console.error('Error in allRide:', error);
        });
    }, [item.id]),
  );

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const gotoOtpRide = async () => {
    setLoader(true)
    try {
      const rideId = item?.id;
      if (!rideId) {
        console.warn('Ride ID is missing.');
        setLoader(true)
        return;
      }

      const rideDoc = await firestore()
        .collection('rides')
        .doc(rideId.toString())
        .get();

      if (rideDoc.exists) {
        const rideData = rideDoc.data();
        setLoader(false)
        navigation.navigate('RideActive', { activeRideOTP: rideData });
      } else {
        console.warn('No ride found with the provided ID.');
        notificationHelper('', "No ride history found for this user.", 'error');
        setLoader(false)
      }
    } catch (error) {
      console.error('Error fetching ride data:', error);
      setLoader(false)
    }
  };

  const formattedDate = apiformatDates(item.created_at);
  const hasProfileImage = !!item?.driver?.driver_profile_image_url;

  return (
    <Header
      value={`${rideStatus} ${translateData.ride}`}
      container={
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: windowHeight(150) }}>
          <View style={[styles.container]}>
            <View
              style={[
                styles.rideInfoContainer,
                { backgroundColor: bgFullStyle },
              ]}>
              <View style={[{ flexDirection: viewRTLStyle }]}>
                {hasProfileImage ? (
                  <Image
                    style={styles.profileImage}
                    source={{ uri: item.driver.driver_profile_image_url }}
                  />
                ) : (
                  <View
                    style={{
                      width: windowHeight(33),
                      height: windowHeight(33),
                      borderRadius: windowHeight(21),
                      backgroundColor: appColors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: fontSizes.FONT19,
                        fontFamily: appFonts.bold,
                        color: appColors.whiteColor,
                      }}>
                      {item?.driver?.name?.charAt(0)?.toUpperCase() || 'D'}
                    </Text>
                  </View>
                )}
                <View style={styles.profileTextContainer}>
                  <Text
                    style={[
                      styles.profileName,
                      { color: textColorStyle },
                      { textAlign: textRTLStyle },
                    ]}>
                    {item?.driver?.name}
                  </Text>
                  <View
                    style={[
                      styles.carInfoContainer,
                      { flexDirection: viewRTLStyle },
                    ]}>
                    <Text
                      style={[styles.carInfoText, { textAlign: textRTLStyle }]}>
                      {item?.vehicle_model}
                    </Text>
                  </View>
                </View>

                <View style={styles.PendingRideContainer}>
                  <View style={{ flexDirection: viewRTLStyle }}>
                    <View
                      style={{
                        flexDirection: viewRTLStyle,
                        marginHorizontal: windowHeight(4),
                      }}>
                      {Array.from({ length: 5 }).map((_, index) => {
                        const fullStarThreshold = index + 1;
                        const halfStarThreshold = index + 0.5;
                        if (item?.driver?.rating_count >= fullStarThreshold) {
                          return <RatingStar key={index} />;
                        } else if (
                          item?.driver?.rating_count >= halfStarThreshold
                        ) {
                          return <RatingHalfStar key={index} />;
                        } else {
                          return <RatingEmptyStart key={index} />;
                        }
                      })}
                    </View>
                    <View style={{ flexDirection: viewRTLStyle }}>
                      <Text
                        style={[
                          commonStyles.mediumTextBlack12,
                          ,
                          {
                            color: isDark
                              ? appColors.whiteColor
                              : appColors.blackColor,
                            marginHorizontal: windowWidth(4),
                          },
                        ]}>
                        {Number(item?.driver?.rating_count).toFixed(1)}
                      </Text>
                      <Text
                        style={[
                          commonStyles.regularText,
                          { color: appColors.regularText },
                        ]}>
                        ({item?.driver?.review_count})
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.dashedLine,
                  {
                    borderColor: isDark
                      ? appColors.darkBorder
                      : appColors.border,
                  },
                ]}
              />
              <View style={{ flexDirection: viewRTLStyle }}>
                <Image
                  style={styles.tripImage}
                  source={{ uri: item?.vehicle_type?.vehicle_image_url }}
                />
                <View style={styles.tripTextContainer}>
                  <Text
                    style={[
                      styles.tripIDText,
                      { color: textColorStyle, textAlign: textRTLStyle },
                    ]}>
                    #{item.ride_number}
                  </Text>
                  <Text
                    style={[styles.tripCostText, { textAlign: textRTLStyle }]}>
                    {zoneValue.currency_symbol}
                    {item.total}
                  </Text>
                </View>
                <View style={styless.iconView}>
                  <View
                    style={[
                      styless.calenderSmallView,
                      {
                        flexDirection: viewRTLStyle,
                      },
                    ]}>
                    <CalenderSmall />
                    <Text style={styles.tripDateText}>
                      {formattedDate.date}
                    </Text>
                  </View>
                  <View
                    style={[
                      styless.calenderSmallView,
                      {
                        flexDirection: viewRTLStyle,
                      },
                    ]}>
                    <ClockSmall />
                    <Text style={styles.tripDateText}>
                      {formattedDate.time}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styless.pickLine,
                  {
                    borderColor: isDark
                      ? appColors.darkBorder
                      : appColors.border,
                  },
                ]}
              />
              <View style={{ flexDirection: viewRTLStyle }}>
                <View style={[external.mh_5]}>
                  <View
                    style={[
                      styless.calenderSmallView,
                      {
                        flexDirection: viewRTLStyle,
                      },
                    ]}>
                    <PickLocation
                      height={12}
                      width={12}
                      colors={
                        isDark ? appColors.whiteColor : appColors.primaryText
                      }
                    />
                    <Text
                      style={[
                        styles.itemStyle,
                        { color: textColorStyle },
                        {
                          textAlign: textRTLStyle,
                          marginHorizontal: windowWidth(10),
                        },
                      ]}>
                      {item.locations[0]}
                    </Text>
                  </View>
                  {item?.service?.slug !== 'ambulance' &&
                    item.locations.length > 1 && (
                      <View>
                        <View
                          style={[
                            styles.dashedLine,
                            {
                              borderColor: isDark
                                ? appColors.darkBorder
                                : appColors.border,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styless.calenderSmallView,
                            {
                              flexDirection: viewRTLStyle,
                            },
                          ]}>
                          <Gps
                            height={12}
                            width={12}
                            colors={
                              isDark
                                ? appColors.whiteColor
                                : appColors.primaryText
                            }
                          />
                          <Text
                            style={[
                              styles.pickUpLocationStyles,
                              {
                                color: textColorStyle,
                                marginHorizontal: windowWidth(10),
                              },
                            ]}>
                            {item.locations[1]}
                          </Text>
                        </View>
                      </View>
                    )}
                </View>
              </View>
            </View>
          </View>

          {item?.service_category?.slug === 'rental' && (
            <View style={styless.rentalMainView}>
              <View
                style={[
                  styless.rentalView,
                  {
                    flexDirection: viewRTLStyle,
                    backgroundColor: bgFullStyle,
                  },
                ]}>
                <View style={styless.viewRental}>
                  <Text
                    style={[
                      styless.startDateText,
                      {
                        color: isDark
                          ? appColors.whiteColor
                          : appColors.primaryText,
                      },
                    ]}>
                    {translateData.startDate}
                  </Text>
                  <View
                    style={[
                      styless.vieww,
                      {
                        flexDirection: viewRTLStyle,
                      },
                    ]}>
                    <CalenderSmall />
                    <Text style={styless.timeText}> {formattedDate.date}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styless.linee,
                    {
                      borderColor: isDark
                        ? appColors.darkBorder
                        : appColors.border,
                    },
                  ]}
                />
                <View style={styless.viewRental}>
                  <Text
                    style={[
                      styless.startDateText,
                      {
                        color: isDark
                          ? appColors.whiteColor
                          : appColors.primaryText,
                      },
                    ]}>
                    {translateData.startTime}
                  </Text>
                  <View
                    style={[
                      styless.vieww,
                      {
                        flexDirection: viewRTLStyle,
                      },
                    ]}>
                    <ClockSmall />
                    <Text style={styless.timeText}> {formattedDate.time}</Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styless.rentalView,
                  {
                    flexDirection: viewRTLStyle,
                    backgroundColor: bgFullStyle,
                  },
                ]}>
                <View style={styless.viewRental}>
                  <Text
                    style={[
                      styless.startDateText,
                      {
                        color: isDark
                          ? appColors.whiteColor
                          : appColors.primaryText,
                      },
                    ]}>
                    {translateData.endDate}
                  </Text>
                  <View
                    style={[
                      styless.vieww,
                      {
                        flexDirection: viewRTLStyle,
                      },
                    ]}>
                    <CalenderSmall />
                    <Text
                      style={{
                        color: appColors.regularText,
                        fontFamily: appFonts.regular,
                      }}>
                      {' '}
                      {formattedDate.date}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styless.rentalLine,
                    {
                      borderColor: isDark
                        ? appColors.darkBorder
                        : appColors.border,
                    },
                  ]}
                />
                <View style={styless.viewRental}>
                  <Text
                    style={{
                      color: isDark
                        ? appColors.whiteColor
                        : appColors.primaryText,
                      fontFamily: appFonts.medium,
                    }}>
                    {translateData.endTime}
                  </Text>
                  <View
                    style={[
                      styless.vieww,
                      {
                        flexDirection: viewRTLStyle,
                      },
                    ]}>
                    <ClockSmall />
                    <Text style={styless.timeText}> {formattedDate.time}</Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styless.rentalView,
                  {
                    flexDirection: viewRTLStyle,
                    backgroundColor: bgFullStyle,
                  },
                ]}>
                <View style={styless.totalDaysView}>
                  <Text style={styless.timeText}>
                    {translateData.totalDays}
                  </Text>
                  <View
                    style={[
                      styless.vieww,
                      {
                        flexDirection: viewRTLStyle,
                      },
                    ]}>
                    <CalenderSmall />
                    <Text style={styless.timeText}> 5 Days</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          {item?.service_category?.slug === 'schedule' && (
            <View
              style={[
                styless.scheduleView,
                {
                  flexDirection: viewRTLStyle,
                },
              ]}>
              <View style={styless.viewRental}>
                <Text style={styless.startDateText}>
                  {translateData.startDate}
                </Text>
                <View
                  style={[
                    styless.clockSmall,
                    {
                      flexDirection: viewRTLStyle,
                    },
                  ]}>
                  <CalenderSmall />
                  <Text style={styless.timeText}>{formattedDate.date}</Text>
                </View>
              </View>
              <View style={styless.rentalLine} />
              <View style={[styless.viewRental, { alignItems: "flex-end" }]}>
                <Text style={styless.startDateText}>
                  {translateData.startTime}
                </Text>
                <View
                  style={[
                    styless.clockSmall,
                    {
                      flexDirection: viewRTLStyle,
                    },
                  ]}>
                  <ClockSmall />
                  <Text style={styless.timeText}>{formattedDate.time}</Text>
                </View>
              </View>
            </View>
          )}

          {item?.service_category?.service_category_type !== 'schedule' &&
            item?.service_category?.service_category_type !== 'package' &&
            item?.service_category?.service_category_type !== 'ride' && (
              <View
                style={[
                  styless.scheduleView,
                  {
                    flexDirection: viewRTLStyle,
                    top: windowHeight(4.5),
                  },
                ]}>
                <View style={styless.viewRental}>
                  <Text style={styless.startDateText}>
                    {translateData.startDate}
                  </Text>
                  <View
                    style={[
                      styless.clockSmall,
                      {
                        flexDirection: viewRTLStyle,
                      },
                    ]}>
                    <CalenderSmall />
                    <Text style={styless.timeText}>{formattedDate.date}</Text>
                  </View>
                </View>
                <View style={styless.rentalLine} />
                <View style={[styless.viewRental, { alignItems: "flex-end" }]}>
                  <Text style={[styless.startDateText, { marginHorizontal: windowWidth(4.5) }]}>
                    {translateData.startTime}
                  </Text>
                  <View
                    style={[
                      styless.clockSmall,
                      {
                        flexDirection: viewRTLStyle,
                      },
                    ]}>
                    <View style={{ right: windowWidth(5) }}>
                      <ClockSmall />
                    </View>
                    <Text style={styless.timeText}>{formattedDate.time}</Text>
                  </View>
                </View>
              </View>
            )}

          {item?.service_category?.service_category_type === 'schedule' && (
            <View
              style={[
                styless.scheduleView,
                {
                  flexDirection: viewRTLStyle,
                },
              ]}>
              <View style={styless.viewRental}>
                <Text style={styless.startDateText}>
                  {translateData.startDate}
                </Text>
                <View
                  style={[
                    styless.clockSmall,
                    {
                      flexDirection: viewRTLStyle,
                    },
                  ]}>
                  <CalenderSmall />
                  <Text style={styless.timeText}>{formattedDate.date}</Text>
                </View>
              </View>
              <View style={styless.rentalLine} />
              <View style={[styless.viewRental, { alignItems: "flex-end" }]}>
                <Text style={styless.startDateText}>
                  {translateData.startTime}
                </Text>
                <View
                  style={[
                    styless.clockSmall,
                    {
                      flexDirection: viewRTLStyle,
                    },
                  ]}>
                  <ClockSmall />
                  <Text style={styless.timeText}>{formattedDate.time}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={[external.mt_10]}>
            {item.ride_status.slug === 'cancelled' ? (
              <View style={styless.cancelledView}>
                <Text style={styless.cancellation_reasonText}>
                  {translateData.reason}
                </Text>

                <View style={styless.cancellation_reasonView}>
                  <Text style={styless.cancellation_reasonText}>
                    {rideData?.cancellation_reason}
                  </Text>
                </View>
              </View>
            ) : (
              <PendingDetails rideDetails={item} vehicleData={vehicleDetail} />
            )}
          </View>

          {item.ride_status.slug != 'cancelled' && (
            <View
              style={[styless.ride_statusView, { backgroundColor: bgFullStyle }]}>
              <View style={styless.paymentMethodView} />

              <View
                style={[
                  styless.paymentMethodLine,
                  {
                    borderColor: isDark
                      ? appColors.darkBorder
                      : appColors.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: isDark
                        ? appColors.whiteColor
                        : appColors.primaryText,
                      textAlign: textRTLStyle,
                    },
                  ]}>
                  {translateData.paymentMethod}
                </Text>
                <View
                  style={[
                    styles.border,
                    {
                      borderColor: isDark
                        ? appColors.darkBorder
                        : appColors.border,
                    },
                  ]}
                />
                <View style={[styles.contain, { flexDirection: viewRTLStyle }]}>
                  <Text style={[styles.type, { color: appColors.regularText }]}>
                    {translateData.paymentMethod}
                  </Text>
                  <Text
                    style={[
                      styles.type,
                      {
                        color: isDark
                          ? appColors.whiteColor
                          : appColors.primaryText,
                      },
                    ]}>
                    {item?.payment_method}
                  </Text>
                </View>
                <View style={[styles.contain, { flexDirection: viewRTLStyle }]}>
                  <Text style={[styles.type, { color: appColors.regularText }]}>
                    {translateData.status}
                  </Text>
                  <Text
                    style={[
                      external.mh_2,
                      styles.type,
                      {
                        color: isDark
                          ? appColors.whiteColor
                          : appColors.primaryText,
                      },
                    ]}>
                    {item?.payment_status}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.leftRadius,
                  { backgroundColor: appColors.lightGray },
                ]}
              />
              <View
                style={[
                  styles.rightRadius,
                  { backgroundColor: appColors.lightGray },
                ]}
              />
            </View>
          )}

          <TouchableOpacity activeOpacity={0.7} onPress={() => navigate('ChatScreen', { from: "help", riderId: self && self?.id })} style={styless.needHelpView}>
            <Text
              style={[
                styless.needHelpText,
                {
                  textAlign: isRTL ? 'left' : 'right',
                },
              ]}>
              {translateData.needHelp}
            </Text>
          </TouchableOpacity>
          {item?.ride_status?.slug == 'accepted' && (
            <View style={{ marginHorizontal: windowWidth(20) }}>
              <Button
                backgroundColor={appColors.primary}
                textColor={appColors.whiteColor}
                title={'Start Ride'}
                onPress={gotoOtpRide}
                loading={loader}
              />
            </View>
          )

          }

          <View style={styless.ride_status}>
            {item?.ride_status?.slug == 'completed' &&
              item?.payment_status == 'PENDING' && (
                <Button title="Pay Now" onPress={payNow} loading={paymentLoading} />
              )}
            {item?.ride_status?.slug == 'completed' &&
              item?.payment_status == 'COMPLETED' && (
                <Button title="Review" onPress={review} />
              )}
            {item?.ride_status?.slug == 'started' && (
              <Button title="Track Ride" onPress={gotoTrack} loading={loader} />
            )}
            {item?.ride_status?.slug == 'completed' &&
              item?.payment_status == 'COMPLETED' && (
                <Button title="View Invoice" onPress={viewInvoice} loading={loader} />
              )}
          </View>
          <Modal transparent={true} visible={modalVisible} animationType="fade">
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.bgmodal}>
                <TouchableWithoutFeedback onPress={() => { }}>
                  <View
                    style={[styles.background, { backgroundColor: bgFullStyle }]}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setModalVisible(false);
                      }}
                      style={styless.closeStyle}>
                      <Close />
                    </TouchableOpacity>

                    <Text style={[styles.title, { color: textColorStyle }]}>
                      {translateData.modalTitle}
                    </Text>

                    <View style={styles.userAlign}>
                      <Image
                        style={styles.modalImage}
                        source={
                          item?.driver?.driver_profile_image_url
                            ? { uri: item.driver.driver_profile_image_url }
                            : Images.defultImage
                        }
                      />
                      <Text style={[styles.modalName, { color: textColorStyle }]}>
                        {item?.driver?.name}
                      </Text>
                      <Text style={[styles.modalMail, { color: textColorStyle }]}>
                        {item?.driver?.email}
                      </Text>
                    </View>

                    <Image
                      source={Images.lineBottom}
                      style={styles.lineImage}
                    />
                    <Text
                      style={[
                        styles.rate,
                        { color: textColorStyle, textAlign: textRTLStyle },
                      ]}>
                      {translateData.driverRating}
                    </Text>

                    <View
                      style={[
                        styles.containerReview,
                        { flexDirection: viewRTLStyle },
                      ]}>
                      {[1, 2, 3, 4, 5].map(index => (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          key={index}
                          onPress={() => handleStarPress(index)}
                          style={styles.starIcon}>
                          {index <= rating ? <StarFill /> : <StarEmpty />}
                        </TouchableOpacity>
                      ))}
                      <View
                        style={[
                          styles.ratingView,
                          { flexDirection: viewRTLStyle },
                        ]}>
                        <View style={styles.borderVertical} />
                        <Text style={[styles.rating, { color: textColorStyle }]}>
                          {rating}/5
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.comment,
                        { color: textColorStyle, textAlign: textRTLStyle },
                      ]}>
                      {translateData.addComments}
                    </Text>

                    <View style={styless.textinput}>
                      <TextInput
                        style={[
                          styles.textinput,
                          { color: textColorStyle, textAlign: textRTLStyle },
                        ]}
                        multiline={true}
                        textAlignVertical="top"
                        value={reviewText}
                        onChangeText={text => setReviewText(text)}
                      />
                    </View>

                    <View style={styles.border2} />
                    <View style={styless.reviewSubmit}>
                      <Button
                        width={windowWidth(378)}
                        backgroundColor={appColors.primary}
                        textColor={appColors.whiteColor}
                        title={translateData.submit}
                        onPress={reviewSubmit}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </ScrollView>
      }
    />
  );
}
