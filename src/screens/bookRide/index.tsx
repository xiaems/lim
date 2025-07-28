import { Text, View, FlatList, TouchableOpacity, TextInput, Image, Pressable, BackHandler, Modal, ActivityIndicator, PermissionsAndroid, ScrollView, Alert, Keyboard, AppState } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { commonStyles } from '../../styles/commonStyle';
import { external } from '../../styles/externalStyle';
import MapView, { Marker, Polygon, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Button, CommonModal, notificationHelper, RadioButton, SolidLine } from '@src/commonComponent';
import { styles } from './styles';
import { BookRideItem } from './bookRideItem/index';
import { ModalContainers } from './modalContainer/index';
import { useValues } from '../../../App';
import darkMapStyle from '../darkMapStyle';
import { appColors, windowWidth } from '@src/themes';
import { fontSizes, windowHeight } from '@src/themes';
import { Back, NewContact, UserFill, Forword, Card, User, Close, CloseCircle } from '@utils/icons';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { CancelRender } from '../cancelFare/cancelRenderItem/index';
import { useDispatch, useSelector } from 'react-redux';
import { allDriver, allRides } from '../../api/store/actions/index';
import { WebView } from 'react-native-webview';
import { AppDispatch } from '../../api/store/index';
import * as turf from '@turf/turf';
import { updateRideRequest } from '../../api/store/actions/index';
import { bidDataGet } from '../../api/store/actions/bidAction';
import { paymentsData } from '../../api/store/actions/paymentAction';
import { CustomMarker } from '@src/components';
import { clearValue, getValue } from '@src/utils/localstorage';
import { appFonts } from '@src/themes';
import Images from '@src/utils/images';
import { useAppNavigation } from '@src/utils/navigation';
import FastImage from 'react-native-fast-image';
import MapViewDirections from 'react-native-maps-directions';
import firestore from '@react-native-firebase/firestore';
import { URL } from '@src/api/config';
import { noserviceData } from '@src/data/unavailableVehicleData';
import NotificationHelper from '@src/components/helper/localNotificationHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function BookRide() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { pickupLocation, stops, destination, service_ID, zoneValue, service_name, service_category_ID, receiverName, countryCode, phoneNumber, scheduleDate } = route.params;
  const { textColorStyle, bgContainer, textRTLStyle, isDark, viewRTLStyle, Google_Map_Key } = useValues();
  const { selectedImage, parcelWeight } = route.params;
  const [mapType, setMapType] = useState('googleMap');
  const { translateData, taxidoSettingData } = useSelector(state => state.setting,);
  const dispatch = useDispatch<AppDispatch>();
  const { navigate, goBack } = useAppNavigation();
  const [seletedPayment, setSeletedPayment] = useState(null);
  const [visible, setModelVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [isChecked, setIsChecked] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [pickupCoords, setPickupCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [stopsCoords, setStopsCoords] = useState<Array<{ lat: number; lng: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceVisible, setServiceVisible] = useState(false);
  const [vehicleSelectModal, setVehicleSelectModal] = useState(false);
  const ZoneArea = zoneValue?.locations || null;
  const { driverData } = useSelector(state => state.allDriver);
  const { vehicleTypedata } = useSelector(state => state?.vehicleType || {});
  const [startDriverRequest, setStartDriverRequest] = useState(false);
  const activePaymentMethods = zoneValue?.payment_method;
  const [fareValue, setFareValue] = useState(0);
  const [Warning, setWarning] = useState(false);
  const [distance, setDistance] = useState(false);
  const [expectedTime, setTravelTime] = useState(0);
  const [subZone, setSubZone] = useState([]);
  const [driverMessages, setDriverMessages] = useState([]);
  const [incrementDistance] = useState(0.5);
  const intervalRef = useRef(null);
  const [radiusPerVertex, setRadiusPerVertex] = useState(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [warningMessage, setWarningMessage] = useState();
  const [rideID, setRideId] = useState(null);
  const [driverId, setDriverId] = useState([]);
  const [riderequestId, setRideRequestId] = useState();
  const mapRef = useRef(null);
  const { self } = useSelector((state: any) => state.account);
  const [bookLoading, setBookLoading] = useState(false);
  const pulseCount = 6;
  const pulseDelay = 20;
  const durations = 120;
  const [pulses, setPulses] = useState(Array(pulseCount).fill({ radius: 1000, opacity: 0 }),);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const TIMER_DURATION = 3 * 60 * 1000; // 3 minutes
  const [remainingTime, setRemainingTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const appState = useRef(AppState.currentState);
  const intervalTimeRef = useRef<NodeJS.Timeout | null>(null); // <-- 👈 this is your interval reference
  const [currentNearestDriver, setCurrentNearestDriver] = useState([]);

  useEffect(() => {
    const toRad = (value) => (value * Math.PI) / 180;

    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    let isCurrent = true; // to track latest fetch

    const fetchDrivers = async () => {
      try {
        setCurrentNearestDriver([]);
        const snapshot = await firestore().collection('driverTrack').get();

        const filteredDrivers = [];

        snapshot.forEach(doc => {
          const data = doc.data();

          if (
            data.is_online === "1" &&
            data.vehicle_type_id === selectedItem &&
            data.lat &&
            data.lng
          ) {
            const driverLat = parseFloat(data.lat);
            const driverLng = parseFloat(data.lng);

            const distanceInKm = getDistanceFromLatLonInKm(
              pickupCoords?.lat,
              pickupCoords?.lng,
              driverLat,
              driverLng
            );

            if (distanceInKm <= 3) {
              filteredDrivers.push({ id: doc.id, ...data });
            }
          }
        });

        setCurrentNearestDriver(filteredDrivers);
      } catch (error) {
      }
    };

    if (pickupCoords?.lat && pickupCoords?.lng) {
      fetchDrivers();
    }
    return () => {
      isCurrent = false; // prevent outdated fetch from updating state
    };
  }, [selectedItem, pickupCoords?.lat, pickupCoords?.lng]);



  const startTimer = async () => {
    await AsyncStorage.setItem('ride_timer_start', Date.now().toString());
    setIsTimerRunning(true);
    checkTimer(); // call immediately
    intervalTimeRef.current = setInterval(checkTimer, 1000); // ⏱️ store interval
  };

  const cancelTimer = async () => {
    setIsPulsing(false);

    if (intervalTimeRef.current) {
      clearInterval(intervalTimeRef.current); // ✅ clear interval
      intervalTimeRef.current = null;
    }
    await AsyncStorage.removeItem('ride_timer_start');
    setIsTimerRunning(false);
    setRemainingTime(0);
    setIsExpanding(false)
  };

  const handleTimerComplete = async () => {
    await cancelTimer();
  };

  const checkTimer = async () => {
    const storedStart = await AsyncStorage.getItem('ride_timer_start');
    if (storedStart) {
      const elapsed = Date.now() - parseInt(storedStart, 10);
      const remaining = TIMER_DURATION - elapsed;

      if (remaining <= 0) {
        setRemainingTime(0);
        handleTimerComplete();
      } else {
        setRemainingTime(remaining);
      }
    }
  };

  useEffect(() => {
    const listener = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        checkTimer(); // update when returning to app
      }
    });

    return () => {
      listener.remove();
      if (intervalTimeRef.current) {
        clearInterval(intervalTimeRef.current); // cleanup on unmount
      }
    };
  }, []);

  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);




  const renderItemRequest = ({ item }) => (
    <CancelRender item={item} pickupLocation={pickupLocation} />
  );

  const formatScheduleDate = ({ DateValue, TimeValue }) => {
    if (!DateValue || !TimeValue) return '';
    const [day, month, year] = DateValue.split(' ');
    const monthMap = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
    };
    const monthIndex = monthMap[month];
    if (!monthIndex) {
      return translateData.bookRideInvalidDate;
    }

    const timeParts = TimeValue.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/);
    if (!timeParts) {
      return translateData.bookRideInvalidTime;
    }

    let [_, hours, minutes, period] = timeParts;
    hours =
      period === 'PM' && hours !== '12'
        ? +hours + 12
        : hours === '12' && period === 'AM'
          ? '00'
          : hours;
    const formattedDate = `${year}-${String(monthIndex).padStart(
      2,
      '0',
    )}-${String(day).padStart(2, '0')} ${String(hours).padStart(
      2,
      '0',
    )}:${minutes}`;
    return formattedDate;
  };

  const scheduleDates = {
    DateValue: scheduleDate?.DateValue,
    TimeValue: scheduleDate?.TimeValue,
  };

  useEffect(() => {
    dispatch(paymentsData());
  }, []);

  useEffect(() => {
    if (vehicleTypedata?.length > 0) {
      setSelectedItem(vehicleTypedata[0].id);
    }
  }, [vehicleTypedata]);

  const allLocations = [pickupLocation, ...(stops || []), destination];
  const allLocationCoords = [pickupCoords, ...stopsCoords, destinationCoords];
  const selectedVehicleData = Array.isArray(vehicleTypedata)
    ? vehicleTypedata.find(item => item?.id === selectedItem)
    : null;
  const minimumCharge = selectedVehicleData?.min_per_unit_charge || null;
  const maximumCharge = selectedVehicleData?.max_per_unit_charge || null;
  const minChargeRide = minimumCharge * distance;
  const maxChargeRide = maximumCharge * distance;
  const minWeightCharge = selectedVehicleData?.min_per_weight_charge * distance || null;
  const maxWeightCharge = selectedVehicleData?.max_per_weight_charge * distance || null;
  const ParcelMinCharge = Number((minChargeRide + minWeightCharge).toFixed(2));
  const ParcelMaxCharge = Number((maxChargeRide + maxWeightCharge).toFixed(2));
  const ParcelRecommendCharge = ((parseFloat(ParcelMinCharge) + parseFloat(ParcelMaxCharge)) / 2).toFixed(2);

  useEffect(() => {
    updateZone();
  }, [ZoneArea]);

  const updateZone = () => {
    if (ZoneArea && ZoneArea?.length > 1) {
      setRadiusPerVertex(new Array(ZoneArea?.length - 1).fill(0.5));
    } else {
      setServiceVisible(true);
    }
  };

  const driverLocations = driverData?.data
    ?.map(driver => {
      const driverLocation = driver.location?.[0];
      if (driverLocation) {
        return {
          lat: parseFloat(driverLocation.lat),
          lng: parseFloat(driverLocation.lng),
          id: driver.id,
          name: driver.name,
          vehicleId: driver?.vehicle_info?.vehicle_type_id,
        };
      }
      return null;
    })
    ?.filter(driver => driver !== null);

  const filteredDrivers = selectedVehicleData
    ? driverLocations?.filter(
      driver => driver?.vehicleId === selectedVehicleData?.id,
    )
    : [];

  const expandSubZone = () => {
    const expandedPoints = [];
    const newRadiusPerVertex = [];

    for (let i = 0; i < ZoneArea?.length - 1; i++) {
      const mainZonePoint = ZoneArea[i];
      const angle = turf.bearing(
        turf.point([pickupCoords?.lng, pickupCoords?.lat]),
        turf.point([mainZonePoint?.lng, mainZonePoint?.lat]),
      );

      const currentSubZoneVertex = subZone[i] || {
        lat: pickupCoords?.lat,
        lng: pickupCoords?.lng,
      };
      const distanceToMainZone = turf.distance(
        turf.point([currentSubZoneVertex?.lng, currentSubZoneVertex?.lat]),
        turf.point([mainZonePoint?.lng, mainZonePoint?.lat]),
        { units: 'kilometers' },
      );

      let newRadius = radiusPerVertex[i];

      if (distanceToMainZone <= incrementDistance) {
        expandedPoints.push({
          lat: mainZonePoint?.lat,
          lng: mainZonePoint?.lng,
        });
        newRadiusPerVertex.push(distanceToMainZone);
      } else {
        const expandedPoint = turf.destination(
          turf.point([pickupCoords?.lng, pickupCoords?.lat]),
          newRadius + incrementDistance,
          angle,
          { units: 'kilometers' },
        );

        const [lng, lat] = expandedPoint.geometry.coordinates;
        if (!isNaN(lat) && !isNaN(lng)) {
          expandedPoints.push({ lat, lng });
          newRadiusPerVertex.push(newRadius + incrementDistance);
        }
      }
    }

    expandedPoints.push(expandedPoints[0]);
    setSubZone(expandedPoints);

    const polygon = turf.polygon([
      expandedPoints.map(({ lng, lat }) => [lng, lat]),
    ]);

    const messages = (filteredDrivers ?? [])
      .map((driver) => {
        const point = turf.point([driver?.lng, driver?.lat]);
        if (turf?.booleanPointInPolygon(point, polygon)) {
          return driver.id;
        }
        return null;
      })
      .filter((message) => message !== null);
    setDriverMessages(messages);
  };

  useEffect(() => {
    if (isExpanding) {
      intervalRef.current = setInterval(() => {
        setRadiusPerVertex((prevRadii) =>
          prevRadii.map((radius, index) => {
            const currentSubZoneVertex = subZone[index] || pickupCoords;
            const distanceToMainZone = turf.distance(
              turf.point([
                currentSubZoneVertex?.lng,
                currentSubZoneVertex?.lat,
              ]),
              turf.point([ZoneArea[index]?.lng, ZoneArea[index]?.lat]),
              { units: 'kilometers' },
            );
            return distanceToMainZone <= incrementDistance
              ? radius
              : radius + incrementDistance;
          }),
        );
        expandSubZone();
        handleUpdateRide();
      }, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isExpanding, subZone, incrementDistance, pickupCoords]);

  useEffect(() => {
    dispatch(
      allDriver({
        zones: zoneValue?.data?.[0]?.id,
        is_online: 1,
        is_on_ride: 0,
      }),
    );
  }, []);

  const mapHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>OpenStreetMap with Routing</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; }
      #map { width: 100vw; height: 100vh; }
    </style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
    <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        var map = L.map('map').setView([${pickupCoords?.lat}, ${pickupCoords?.lng}], 13);
        
        L.tileLayer('http://a.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);
        
        var startPoint = [${pickupCoords?.lat}, ${pickupCoords?.lng}];
        var stopPoints = [
          [${stopsCoords[0]?.lat}, ${stopsCoords[0]?.lng}],
          [${stopsCoords[1]?.lat}, ${stopsCoords[1]?.lng}], 
          [${stopsCoords[2]?.lat}, ${stopsCoords[2]?.lng}], 
        ]; 
        var endPoint = [${destinationCoords?.lat}, ${destinationCoords?.lng}];
        
        L.marker(startPoint, { draggable: false }).addTo(map).bindPopup('Start Point');
        L.marker(endPoint, { draggable: false }).addTo(map).bindPopup('End Point');
        
        stopPoints.forEach(function(point, index) {
          if (point[0] && point[1]) {
            L.marker(point, { draggable: false }).addTo(map).bindPopup('Stop Point ' + (index + 1));
          }
        });
        
        var waypoints = [L.latLng(startPoint)];
        stopPoints.forEach(function(point) {
          if (point[0] && point[1]) {
            waypoints.push(L.latLng(point));
          }
        });
        waypoints.push(L.latLng(endPoint));
        
        L.Routing.control({
          waypoints: waypoints,
          routeWhileDragging: true,
          createMarker: function() { return null; }
        }).addTo(map);

        map.fitBounds([startPoint, ...stopPoints.filter(p => p[0] && p[1]), endPoint]);
      });
    </script>
  </body>
</html>
`;

  const requestContactsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      );

      if (granted) {
        navigate('ChooseRiderScreen', {
          destination,
          stops,
          pickupLocation,
          service_ID,
          zoneValue,
          scheduleDate,
          service_category_ID,
        });
      } else {
        const permissionResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'This app needs access to your contacts to display them.',
            buttonPositive: 'OK',
          },
        );

        if (permissionResult === PermissionsAndroid.RESULTS.GRANTED) {
          navigate('ChooseRiderScreen');
        } else {
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    const geocodeAddress = async (address: string) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address,
          )}&key=${Google_Map_Key}`,
        );
        const dataMap = await response.json();
        if (dataMap.results.length > 0) {
          const location = dataMap.results[0].geometry.location;
          return {
            lat: location.lat,
            lng: location.lng,
          };
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
      return null;
    };

    const fetchCoordinates = async () => {
      try {
        const pickup = await geocodeAddress(pickupLocation);
        const destinationLoc = await geocodeAddress(destination);
        const stopsCoordsPromises = stops.map(geocodeAddress);
        const stopsResults = await Promise.all(stopsCoordsPromises);
        setPickupCoords(pickup);
        setDestinationCoords(destinationLoc);
        setStopsCoords(
          stopsResults.filter(coords => coords !== null) as Array<{
            lat: number;
            lng: number;
          }>,
        );
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [pickupLocation, stops, destination]);

  useEffect(() => {
    const backAction = () => {
      if (selectedOption !== null) {
        setSelectedOption(null);
        return true;
      } else {
        goBack();
        return true;
      }
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [selectedOption]);

  const handleOptionSelect = option => {
    setSelectedOption(prevOption => (prevOption === option ? null : option));
  };

  const radioPress = () => {
    setIsChecked(!isChecked);
  };

  const handleNavigate = () => {
    navigate('ChooseRider');
  };



  const chooseRider = () => {
    requestContactsPermission();
  };

  const renderItem = ({ item }) => {
    return (
      <BookRideItem
        item={item}
        isDisabled={isExpanding}
        onPress={() => {

          if (taxidoSettingData?.taxido_values?.activation?.bidding == 0) {
            setFareValue(`${item?.min_per_unit_charge * distance}`);
          }
          if (!isExpanding) {
            setSelectedItem(item.id);
          }
        }}
        isSelected={selectedItem === item.id}
        onPressAlternate={() => {
          if (!isExpanding) {
            setSelectedItemData(item);
            setModelVisible(true);
          }
        }}
      />
    );
  };

  const mapCustomStyle = isDark ? darkMapStyle : undefined;
  const [selectedItem1, setSelectedItem1] = useState<number | null>(null);

  const paymentData = index => {
    setSelectedOption(null);
    setSelectedItem1(index);
    setSeletedPayment(activePaymentMethods[index].name);
  };

  const formattedData =
    allLocationCoords && allLocationCoords.length > 0
      ? `[${allLocationCoords
        .map(coord =>
          coord?.lat !== undefined && coord?.lng !== undefined
            ? `{"lat": ${coord.lat}, "lng": ${coord.lng}}`
            : null,
        )
        .filter(Boolean)
        .join(', ')}]`
      : '[]';

  if (formattedData !== '[]') {
    try {
      const parsedData = JSON.parse(formattedData);
    } catch (error) {
      console.error('Failed to parse formattedData:', error);
    }
  } else {
  }
  const forms = {
    location_coordinates: JSON.parse(formattedData),
    locations: allLocations,
    ride_fare: fareValue,
    service_id: service_ID,
    service_category_id: service_category_ID,
    vehicle_type_id: selectedVehicleData?.id,
    distance: distance,
    distance_unit: 'km',
    payment_method: 'cash',
    wallet_balance: null,
    coupon: null,
    description: null,
    weight: parcelWeight,
    name: receiverName,
    currency_code: zoneValue?.currency_code,
    country_code: countryCode,
    phone: phoneNumber,
    schedule_time: formatScheduleDate(scheduleDates),
    ...(selectedImage &&
      selectedImage[0] && {
      selectedImage: {
        uri: selectedImage[0]?.uri || null,
        type: selectedImage[0]?.type || null,
        fileName: selectedImage[0]?.fileName || null,
      },
    }),
  };



  const BookRideRequest = async forms => {
    const token = await getValue('token');
    try {
      const formData = new FormData();
      forms.location_coordinates.forEach((coord, index) => {
        formData.append(`location_coordinates[${index}][lat]`, coord.lat);
        formData.append(`location_coordinates[${index}][lng]`, coord.lng);
      });
      forms.locations.forEach((loc, index) => {
        formData.append(`locations[${index}]`, loc);
      });
      formData.append('ride_fare', forms.ride_fare);
      formData.append('service_id', forms.service_id);
      formData.append('service_category_id', forms.service_category_id);
      formData.append('vehicle_type_id', forms.vehicle_type_id);
      formData.append('distance', forms.distance);
      formData.append('distance_unit', forms.distance_unit);
      formData.append('payment_method', forms.payment_method);
      formData.append('wallet_balance', forms.wallet_balance || '');
      formData.append('coupon', forms.coupon || '');
      formData.append('description', forms.description);
      formData.append('weight', forms.weight || '');
      formData.append('parcel_receiver[name]', forms.name || '');
      formData.append('parcel_receiver[phone]', forms.phone || '');
      formData.append('parcel_receiver[country_code]', forms.country_code || '');
      formData.append('currency_code', forms.currency_code || '');
      formData.append('schedule_time', forms.schedule_time || '');
      if (forms.selectedImage) {
        formData.append('cargo_image', {
          uri: forms.selectedImage.uri || {},
          type: forms.selectedImage.type || {},
          name: forms.selectedImage.fileName || {},
        });
      }


      const response = await fetch(`${URL}/api/rideRequest`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();


      if (response.status === 403) {
        notificationHelper('', 'Please log in again.', 'error');
        await clearValue('token');
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignIn' }],
        });
        return;
      }
      if (response.ok) {
        setStartDriverRequest(true);
        setRideId(responseData?.id);
        setDriverId(responseData?.drivers);

        // firebase collection

        if (taxidoSettingData?.taxido_values?.activation?.bidding == 1) {
          try {
            const rideId = responseData?.id.toString();
            const storePromises = responseData?.drivers.map(async driverId => {
              const driver_Ids = driverId.toString();
              firestore()
                .collection('driver_ride_requests')
                .doc(driver_Ids.toString())
                .set(
                  {
                    ride_requests: firestore.FieldValue.arrayUnion({
                      id: rideId,
                      driver_id: responseData?.drivers,
                    }),
                  },
                  { merge: true },
                );
            });

            await Promise.all(storePromises);
          } catch (error) {
            console.error('Failed to store driver ride request:', error);
          }
        } else if (taxidoSettingData?.taxido_values?.activation?.bidding == 0) {
        }

        //ride request data
        try {
          const rideData = {
            coupon: forms.coupon,
            created_at: firestore.Timestamp.now(),
            currency_symbol: zoneValue?.currency_code,
            description: forms.description,
            distance: forms.distance,
            distance_unit: forms.distance_unit,
            hourly_package_id: '',
            id: responseData?.id,
            locations: forms.locations,
            location_coordinates: forms.location_coordinates.map(coord => ({
              lat: coord.lat,
              lng: coord.lng,
            })),
            payment_method: forms.payment_method,
            ride_fare: forms.ride_fare,
            rider_id: self?.id,
            schedule_time: forms.schedule_time,
            service_category_id: forms.service_category_id,
            service_id: forms.service_id,
            vehicle_type_id: forms.vehicle_type_id,
            wallet_balance: forms.wallet_balance,
            rider: responseData?.data?.rider,
            service: responseData?.data?.service,
            service_category: responseData?.data?.service_category,
            vehicle_type: responseData?.data?.vehicle_type,
            parcel_receiver: responseData?.data?.parcel_receiver
          };

          if (taxidoSettingData?.taxido_values?.activation?.bidding == 1) {
            const docRef = await firestore()
              .collection('ride_requests')
              .doc(responseData?.id.toString())
              .set(rideData);
            setRideRequestId(docRef?.id);
            setStartDriverRequest(true);
          } else if (
            taxidoSettingData?.taxido_values?.activation?.bidding == 0
          ) {
            const rideId = responseData?.id?.toString();
            const allDrivers = responseData?.drivers || [];

            if (!rideId || allDrivers.length === 0) {
              console.warn('❌ Invalid rideId or no drivers found');
              return;
            }

            let currentDriverId = null;
            let eligibleDrivers = [];
            let queueDrivers = [];

            for (const driverId of allDrivers) {
              try {
                const driverDocSnap = await firestore()
                  .collection('driver_ride_requests')
                  .doc(driverId.toString())
                  .get();

                const driverData = driverDocSnap.exists
                  ? driverDocSnap.data()
                  : null;
                const rideRequests = Array.isArray(driverData?.ride_requests)
                  ? driverData.ride_requests
                  : [];

                if (rideRequests.length === 0) {
                  // Free driver
                  if (!currentDriverId) {
                    currentDriverId = driverId;
                  } else {
                    eligibleDrivers.push(driverId);
                  }
                } else {
                  // Busy driver
                  queueDrivers.push(driverId);
                }
              } catch (err) {
                console.error(`⚠️ Error checking driver ${driverId}`, err);
                queueDrivers.push(driverId); // treat as busy
              }
            }

            // ⚠️ If no free drivers at all, all go to queue
            if (!currentDriverId) {
              queueDrivers = [...allDrivers];
              eligibleDrivers = [];
              console.warn(
                '🚫 All drivers are busy — assigning no one initially',
              );
            }

            // ✅ Assign driver (if found)
            rideData.driver_id = currentDriverId || null;

            // ✅ Save ride data
            try {
              await firestore()
                .collection('ride_requests')
                .doc(rideId.toString())
                .set(rideData);
            } catch (err) {
              console.error('❌ Failed to save ride_requests:', err);
            }

            // ✅ Save instantRide metadata
            const instantRideData = {
              id: rideId,
              status: 'pending',
              queue_driver_id: queueDrivers,
              eligible_driver_ids: eligibleDrivers,
              rejected_driver_ids: [],
              current_driver_id: currentDriverId || null,
              ride_id: '',
            };

            try {
              await firestore()
                .collection('ride_requests')
                .doc(rideId.toString())
                .collection('instantRide')
                .doc(rideId.toString())
                .set(instantRideData);
            } catch (err) {
              console.error('❌ Failed to save instantRide metadata:', err);
            }
            // ✅ Local UI update
            setRideRequestId(rideId);
            setStartDriverRequest(true);
          }
        } catch (error) {
          notificationHelper('', error, 'error');
          setBookLoading(false);
        }
      } else if (responseData) {
        notificationHelper('', responseData.message, 'error');
        setBookLoading(false);
      }
    } catch (error) {
      notificationHelper('', error, 'error');
    }
  };

  useEffect(() => {
    const instantRideRef = firestore()
      .collection('ride_requests')
      .doc(riderequestId)
      .collection('instantRide')
      .doc(riderequestId); // ensure correct path

    const unsubscribe = instantRideRef.onSnapshot(async snapshot => {
      if (!snapshot.exists) {
        return;
      }

      const data = snapshot.data();
      const { status, ride_id } = data || {};

      if (status === 'accepted') {
        const rideConfirmId = data?.ride_id;

        if (rideConfirmId) {
          try {
            const rideDoc = await firestore()
              .collection('rides')
              .doc(rideConfirmId.toString())
              .get();

            if (rideDoc.exists) {
              const rideData = rideDoc.data();
              if (rideData?.service_category?.service_category_type == 'schedule') {
                navigate('MyTabs');
                notificationHelper('', 'Ride Scheduled', 'success');
                dispatch(allRides());
                NotificationHelper.showNotification({
                  title: '📅 Ride Scheduled',
                  message: 'Your ride is scheduled. View details in the app and be ready on time! ⏰',
                });
              } else {
                navigation.navigate('RideActive', { activeRideOTP: rideData });
                dispatch(allRides());
                NotificationHelper.showNotification({
                  title: '🚖 Ride Booked',
                  message: 'Your ride has been booked successfully! 🎉',
                });
              }
            } else {
              console.warn('⚠️ No ride found for ID:', rideConfirmId);
            }
          } catch (err) {
            console.error('❌ Error fetching ride:', err);
          }
        }
      }
      const rideRef = firestore().collection('rides').doc(ride_id.toString());
      const rideSnap = await rideRef.get();

      if (rideSnap.exists) {
        const rideData = rideSnap.data();
        if (rideData?.service_category?.service_category_type === 'schedule') {
          navigate('MyTabs');
          notificationHelper('', 'Ride Scheduled', 'success');
          dispatch(allRides());
          NotificationHelper.showNotification({
            title: '📅 Ride Scheduled',
            message: 'Your ride is scheduled. View details in the app and be ready on time! ⏰',
          });
        } else {
          navigation.navigate('RideActive', { activeRideOTP: rideData });
          dispatch(allRides());
          NotificationHelper.showNotification({
            title: '🚖 Ride Booked',
            message: 'Your ride has been booked successfully! 🎉',
          });
        }
      } else {
      }
    });
    return () => {
      unsubscribe();
    };
  }, [riderequestId,]);


  useEffect(() => {
    if (!riderequestId) return;
    const unsubscribe = firestore()
      .collection('ride_requests')
      .doc(riderequestId.toString())
      .collection('instantRide')
      .doc(riderequestId.toString())
      .onSnapshot(
        async docSnapshot => {
          if (!docSnapshot.exists) return;

          const data = docSnapshot.data();
          const currentDriverId = data?.current_driver_id;

          if (currentDriverId) {
            const driverDocRef = firestore()
              .collection('driver_ride_requests')
              .doc(currentDriverId.toString());

            try {
              await driverDocRef.set(
                {
                  ride_requests: firestore.FieldValue.arrayUnion({
                    id: riderequestId,
                    driver_id: currentDriverId,
                  }),
                },
                { merge: true },
              );
            } catch (error) {
              console.error('❌ Failed to update driver_ride_requests:', error);
            }
          }
        },
        error => {
          console.error('❌ Real-time listener error:', error);
        },
      );

    return () => unsubscribe(); // Clean up on unmount
  }, [riderequestId]);

  const handleUpdateRide = () => {
    const ride_id = rideID;
    let payload = {
      drivers: driverMessages,
    };

    dispatch(updateRideRequest({ payload, ride_id }))
      .unwrap()
      .then((res: any) => { })
      .catch((error: any) => {
        console.error('Bid update error:', error);
      });
  };

  const handleBookRide = async () => {
    Keyboard.dismiss();
    setBookLoading(true);
    if (taxidoSettingData?.taxido_values?.activation?.bidding == 1) {
      if (service_name === 'parcel') {
        if (fareValue < ParcelMinCharge * zoneValue?.exchange_rate) {
          setWarning(true);
          setWarningMessage(
            `Minimum fare should be ${parseFloat(
              ParcelMinCharge * zoneValue?.exchange_rate,
            ).toFixed(2)}`,
          );
          setBookLoading(false);
          return
        } else if (fareValue > ParcelMaxCharge * zoneValue?.exchange_rate) {
          setWarning(true);
          setWarningMessage(
            `Maximum fare should be ${parseFloat(
              ParcelMaxCharge * zoneValue?.exchange_rate,
            ).toFixed(2)}`,
          );
          setBookLoading(false);
          return
        } else {
          setWarning(false);
          setIsExpanding(!isExpanding);
          if (!isExpanding) {
            await BookRideRequest(forms);
            startPulseAnimation();
            setIsPulsing(!isPulsing);
            focusOnPickup();
          }
        }
      } else if (service_name === 'freight') {
        if (fareValue < minChargeRide * zoneValue?.exchange_rate) {
          setWarning(true);
          setWarningMessage(
            `Minimum fare should be ${parseFloat(minChargeRide * zoneValue?.exchange_rate
            ).toFixed(2)}`,
          );
          setBookLoading(false);
          return
        } else if (fareValue > maxChargeRide * zoneValue?.exchange_rate) {
          setWarning(true);
          setWarningMessage(
            `Maximum fare should be ${parseFloat(maxChargeRide * zoneValue?.exchange_rate
            ).toFixed(2)}`,
          );
          setBookLoading(false);
          return
        } else {
          setWarning(false);
          setIsExpanding(!isExpanding);
          if (!isExpanding) {
            BookRideRequest(forms);
            startPulseAnimation();
            setIsPulsing(!isPulsing);
            focusOnPickup();
          }
        }
      } else {
        if (fareValue < minChargeRide * zoneValue?.exchange_rate) {
          setWarning(true);
          setWarningMessage(
            `Minimum fare should be ${parseFloat(minChargeRide * zoneValue?.exchange_rate
            ).toFixed(2)}`,
          );
          setBookLoading(false);
          return
        } else if (fareValue > maxChargeRide * zoneValue?.exchange_rate) {
          setWarning(true);
          setWarningMessage(
            `Maximum fare should be ${maxChargeRide.toFixed(2) * zoneValue?.exchange_rate
            }`,
          );
          setBookLoading(false);
          return
        } else {
          setWarning(false);
          setIsExpanding(!isExpanding);
          if (!isExpanding) {
            BookRideRequest(forms);
            startPulseAnimation();
            setIsPulsing(!isPulsing);
            focusOnPickup();
          }
        }
      }
    } else {
      setWarningMessage('Enter Fare Value');

      if (!isExpanding) {
        await BookRideRequest(forms);
        startPulseAnimation();
        setIsPulsing(!isPulsing);
        focusOnPickup();
        setIsExpanding(!isExpanding);
      }
    }
  };
  const [bids, setBids] = useState([]);
  const [driverbidValue, setDriverbidvalue] = useState();

  const prevBidsRef = useRef([]);

  const listenToBids = (rideRequestId, callback) => {
    return firestore()
      .collection('ride_requests')
      .doc(rideRequestId.toString())
      .collection('bids')
      .orderBy('created_at', 'desc')
      .onSnapshot(
        snapshot => {
          const bidsValue = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          const prevBids = JSON.stringify(prevBidsRef.current);
          const currentBids = JSON.stringify(bidsValue);

          if (prevBids !== currentBids) {
            setDriverbidvalue(bidsValue);
            prevBidsRef.current = bidsValue;
          }

          callback(bidsValue);
        },
        error => {
          console.error('❌ Listener error:', error);
        },
      );
  };

  useEffect(() => {
    if (!rideID) return;
    const unsubscribe = listenToBids(rideID, setBids);
    return () => unsubscribe();
  }, [rideID]);


  useEffect(() => {
    if (mapRef.current && pickupCoords && destinationCoords) {
      const coordinates = [
        { latitude: pickupCoords?.lat, longitude: pickupCoords?.lng },
        ...stopsCoords.map(stop => ({
          latitude: stop.lat,
          longitude: stop.lng,
        })),
        { latitude: destinationCoords?.lat, longitude: destinationCoords?.lng },
      ];

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  }, [pickupCoords, destinationCoords, stopsCoords]);


  const handleCancelRide = async () => {
    stopPulseAnimation();
    setIsExpanding(false);
    try {
      if (taxidoSettingData?.taxido_values?.activation?.bidding == 0) {
        if (!riderequestId) {
          return;
        }
        // References
        const topLevelDocRef = firestore()
          .collection('ride_requests')
          .doc(riderequestId); // top-level ride request doc (430)

        const instantRideDocRef = topLevelDocRef
          .collection('instantRide')
          .doc(riderequestId); // nested instantRide doc inside 430 (430)

        // Get instantRide data
        const instantRideSnap = await instantRideDocRef.get();

        if (!instantRideSnap.exists) {
          setBookLoading(false)
          return;
        }

        const instantRideData = instantRideSnap.data();
        const currentDriverId = instantRideData?.current_driver_id;
        const eligibleDriverIds = instantRideData?.eligible_driver_ids || [];
        const queueDriverIds = instantRideData?.queue_driver_id || [];
        const rejectedDriverIds = instantRideData?.rejected_driver_ids || [];

        // Combine all driver IDs into rejected array
        const allRejected = [
          ...rejectedDriverIds,
          ...(currentDriverId ? [currentDriverId] : []),
          ...eligibleDriverIds,
          ...queueDriverIds,
        ];

        // Update nested instantRide document status and driver ID arrays
        await instantRideDocRef.update({
          status: 'cancel',
          rejected_driver_ids: allRejected,
          eligible_driver_ids: [],
          queue_driver_id: [],
          current_driver_id: null,
        });

        // Remove ride request from current driver's driver_ride_requests doc
        if (currentDriverId) {
          const driverRideRequestsRef = firestore()
            .collection('driver_ride_requests')
            .doc(currentDriverId.toString());

          const driverDocSnap = await driverRideRequestsRef.get();

          if (driverDocSnap.exists) {
            await driverRideRequestsRef.update({
              ride_requests: firestore.FieldValue.delete(),
              current_ride_request: firestore.FieldValue.delete(),
              eligible_driver_ids: firestore.FieldValue.delete(),
            });
          }
        }

        // Now delete all fields inside the top-level ride_requests document (keep doc)
        const topLevelSnap = await topLevelDocRef.get();
        if (topLevelSnap.exists) {
          const topLevelData = topLevelSnap.data();
          if (topLevelData) {
            const deleteFieldsUpdate = {};
            Object.keys(topLevelData).forEach(field => {
              deleteFieldsUpdate[field] = firestore.FieldValue.delete();
            });
            await topLevelDocRef.update(deleteFieldsUpdate);
          }
        } else {
          console.warn('Top-level ride_requests doc does not exist');
        }


      } else if (taxidoSettingData?.taxido_values?.activation?.bidding == 1) {
        try {
          if (!rideID || !driverId || !Array.isArray(driverId)) {
            console.warn("rideID or driverId missing or invalid");

            return;
          }

          const rideDocId = rideID.toString(); // e.g., "478"
          const driverIds = driverId.map((id) => id.toString()); // e.g., ["22", "25"]

          // Step 1: Delete the ride_requests document
          await firestore()
            .collection('ride_requests')
            .doc(rideDocId)
            .delete();
          // Step 2: Remove ride reference from driver_ride_requests for each driver
          const removePromises = driverIds.map(async (driverId) => {
            const driverDocRef = firestore().collection('driver_ride_requests').doc(driverId.toString());
            const driverDocSnap = await driverDocRef.get();

            if (driverDocSnap.exists) {
              const existingData = driverDocSnap.data();

              // If `ride_requests` is an array, filter out the ride
              if (Array.isArray(existingData?.ride_requests)) {
                const updatedRequests = existingData.ride_requests.filter((req) => req.id?.toString() !== rideDocId);

                await driverDocRef.update({
                  ride_requests: updatedRequests,
                });
              } else {
                // If you just want to remove the whole field (alternative)
                await driverDocRef.update({
                  ride_requests: firestore.FieldValue.delete(),
                });
              }
            }
          });
          await Promise.all(removePromises);
        } catch (error) {
          console.error('Failed to remove ride request from Firebase:', error);
          Alert.alert('Error', 'Could not cancel ride properly.');

        }
      } else {
      }
    } catch (error) {
      console.error('Failed to cancel ride:', error);
    }
  };

  const handleConfirmCancel = () => {
    navigate('MyTabs');
    setModalVisible(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setVehicleSelectModal(false);
  };

  const handleGoBack = () => {
    goBack();
    setServiceVisible(false);
  };

  useEffect(() => {
    if (startDriverRequest && rideID && isExpanding) {
      const ride_request_id = rideID;

      const fetchBidData = async () => {
        await dispatch(bidDataGet({ ride_request_id }));
      };

      fetchBidData();
      const intervalId = setInterval(fetchBidData, 5000);

      return () => clearInterval(intervalId);
    }
  }, [startDriverRequest, rideID, isExpanding, dispatch]);

  const closeModal = () => {
    setSelectedOption(null);
  };

  const backScreen = () => {
    goBack();
  };

  const startPulseAnimation = () => {

    setBookLoading(false);
    startTimer();
    if (animationRef.current) return;

    let tick = 0;

    animationRef.current = setInterval(() => {
      setPulses(() =>
        Array(pulseCount)
          .fill(null)
          .map((_, index) => {
            const offset = index * pulseDelay;
            const progress = (tick - offset + durations) % durations;
            if (progress < durations / 2) {
              const radius = 1000 + (progress / (durations / 2)) * 1000;
              const opacity = 0.5 * (1 - progress / (durations / 2));
              return { radius, opacity };
            } else {
              return { radius: 1000, opacity: 0 };
            }
          }),
      );
      tick++;
    }, 50);
    setIsPulsing(true);
  };
  const stopPulseAnimation = async () => {
    cancelTimer();
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setIsPulsing(false);
    setPulses(Array(pulseCount).fill({ radius: 1000, opacity: 0 }));
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const renderItem1 = ({ item, index }) => {
    return (
      <>
        <TouchableOpacity
          onPress={() => paymentData(index)}
          activeOpacity={0.7}
          style={[
            styles.modalPaymentView,
            { backgroundColor: bgContainer, flexDirection: viewRTLStyle },
          ]}>
          <View style={[styles.paymentView, { flexDirection: viewRTLStyle }]}>
            <View style={[styles.imageBg, { borderColor: colors.border }]}>
              <Image source={{ uri: item?.image }} style={styles.paymentImage} />
            </View>
            <View style={styles.mailInfo}>
              <Text
                style={[
                  styles.mail,
                  { color: textColorStyle, textAlign: textRTLStyle },
                ]}>
                {item?.name}
              </Text>
            </View>
          </View>
          <View style={styles.payBtn}>
            <RadioButton
              onPress={() => paymentData(index)}
              checked={index === selectedItem1}
              color={appColors.primary}
            />
          </View>
        </TouchableOpacity>
        {index !== activePaymentMethods.length - 1 && (
          <View style={[styles.borderPayment, { borderColor: colors.border }]} />
        )}
      </>
    );
  };

  if (!pickupCoords || !destinationCoords) {
    return null;
  }

  const focusOnPickup = () => {
    if (pickupCoords?.lat && pickupCoords?.lng && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: pickupCoords.lat,
          longitude: pickupCoords.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000,
      );
    }
  };




  return (
    <View style={[external.fx_1, { backgroundColor: bgContainer }]}>
      <Modal
        transparent={true}
        visible={serviceVisible}
        animationType="slide"
        onRequestClose={handleGoBack}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FastImage
              source={isDark ? Images.noServiceDark : Images.noService}
              style={styles.serviceImg}
            />
            <Text
              style={[
                styles.modalText,
                { color: isDark ? appColors.whiteColor : appColors.primaryText },
              ]}>
              {translateData.noService}
            </Text>
            <Text
              style={[
                styles.modalDetail,
                { color: isDark ? appColors.whiteColor : appColors.primaryText },
              ]}>
              {translateData.noServiceDes}
            </Text>
            <View
              style={[styles.buttonContainer, { flexDirection: viewRTLStyle }]}>
              <Button title={translateData.goBack} onPress={backScreen} />
            </View>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.blue} />
        </View>
      ) : (
        <>
          <View style={[commonStyles.flexContainer]}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.backBtn,
                { backgroundColor: bgContainer },
                {
                  borderColor: isDark ? appColors.darkBorder : appColors.border,
                },
              ]}
              onPress={goBack}>
              <Back />
            </TouchableOpacity>
            <View style={styles.ridekm}>
              <View style={{ height: '100%', width: windowWidth(40), backgroundColor: appColors.primary, alignItems: "center", justifyContent: 'center', overflow: 'hidden' }}>
                {distance && (
                  <>
                    <Text style={{ color: appColors.whiteColor, fontFamily: appFonts.regular }}>{distance?.toFixed(1)}</Text>
                    <Text style={{ color: appColors.whiteColor, fontFamily: appFonts.regular }}>KM</Text>
                  </>
                )}
              </View>
              <View style={{ height: '100%', width: windowWidth(80), backgroundColor: appColors.whiteColor, alignItems: "center", justifyContent: 'center', overflow: 'hidden' }}>
                <Text>{
                  expectedTime >= 60 ? (
                    <Text style={{ color: appColors.primary, fontFamily: appFonts.medium }}>
                      {Math.floor(expectedTime / 60)}h {Math.round(expectedTime % 60)}m
                    </Text>
                  ) : (
                    <Text style={{ color: appColors.primary, fontFamily: appFonts.medium }}>{Math.round(expectedTime)} min</Text>
                  )
                }
                </Text>
              </View>

            </View>
            {mapType === 'googleMap' ? (
              <MapView
                provider={PROVIDER_GOOGLE}
                ref={mapRef}
                style={[commonStyles.flexContainer]}
                region={{
                  latitude:
                    (pickupCoords?.lat + destinationCoords?.lat) / 2 ||
                    37.78825,
                  longitude:
                    (pickupCoords?.lng + destinationCoords?.lng) / 2 ||
                    -122.4324,
                  latitudeDelta:
                    Math.abs(
                      (pickupCoords?.lat || 37.78825) -
                      (destinationCoords?.lat || 37.78825),
                    ) * 1.5 || 0.015,
                  longitudeDelta:
                    Math.abs(
                      (pickupCoords?.lng || -122.4324) -
                      (destinationCoords?.lng || -122.4324),
                    ) * 1.5 || 0.0121,
                }}
                showsUserLocation={true}
                customMapStyle={mapCustomStyle}>
                {ZoneArea ? (
                  <Polygon
                    coordinates={ZoneArea?.map(({ lng, lat }) => ({
                      latitude: lat,
                      longitude: lng,
                    }))}
                    strokeColor="rgba(0,0,0,0)"
                    fillColor="rgba(0,0,0,0)"
                    strokeWidth={2}
                  />
                ) : null}
                {subZone.length > 0 && (
                  <Polygon
                    coordinates={subZone.map(({ lat, lng }) => ({
                      latitude: lat,
                      longitude: lng,
                    }))}
                    strokeColor="rgba(0, 0, 0, 0)"
                    fillColor="rgba(0, 0, 0, 0)"
                    strokeWidth={2}
                  />
                )}
                {filteredDrivers?.map((driver, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: driver?.lat,
                      longitude: driver?.lng,
                    }}
                    title={`${translateData.driver} ${index + 1}`}>
                    <CustomMarker
                      imageUrl={selectedVehicleData?.vehicle_map_icon_url}
                    />
                  </Marker>
                ))}


                {!isPulsing && currentNearestDriver?.map((driver, index) => {
                  const lat = parseFloat(driver?.lat);
                  const lng = parseFloat(driver?.lng);

                  if (isNaN(lat) || isNaN(lng)) return null;

                  const imageUrl = `${driver?.vehicle_map_icon_url}?v=${driver?.id}`;

                  return (
                    <Marker
                      key={`marker-${driver?.id}`}
                      coordinate={{ latitude: lat, longitude: lng }}
                      title={`ID: ${driver?.id}`}>
                      <View>
                        <Image
                          source={{ uri: imageUrl }}
                          style={{
                            resizeMode: 'contain',
                            height: windowHeight(30),
                            width: windowHeight(25),
                          }}
                        />
                      </View>
                    </Marker>
                  );
                })}

                {pickupCoords && (
                  <>
                    <Marker
                      coordinate={{
                        latitude: pickupCoords?.lat,
                        longitude: pickupCoords?.lng,
                      }}
                      title={translateData.pickupLocation}></Marker>
                    {pickupCoords &&
                      isPulsing &&
                      pulses.map((pulse, index) => (
                        <Circle
                          key={index}
                          center={{
                            latitude: pickupCoords.lat,
                            longitude: pickupCoords.lng,
                          }}
                          radius={pulse.radius}
                          strokeColor="rgba(0,0,0,0)"
                          fillColor={`rgba(25, 150, 117,${pulse.opacity})`}
                        />
                      ))}
                  </>
                )}
                {pickupCoords && (
                  <Marker
                    coordinate={{
                      latitude: pickupCoords.lat,
                      longitude: pickupCoords.lng,
                    }}
                    title={translateData.pickupLocation}
                    pinColor={appColors.primary}
                  />
                )}

                {stopsCoords.map((stop, index) => (
                  <Marker
                    key={`stop-${index}`}
                    coordinate={{
                      latitude: stop.lat,
                      longitude: stop.lng,
                    }}
                    title={`Stop ${index + 1}`}
                    pinColor="orange" // Or any color for stops
                  />
                ))}

                {/* Destination Marker */}
                {destinationCoords && !isPulsing && (
                  <Marker
                    coordinate={{
                      latitude: destinationCoords.lat,
                      longitude: destinationCoords.lng,
                    }}
                    title={translateData.destinationLocation || "Destination"}
                    pinColor={appColors.primary} // Or your preferred color
                  />
                )}

                {pickupCoords && destinationCoords && !isPulsing && (
                  <MapViewDirections
                    origin={{
                      latitude: pickupCoords.lat,
                      longitude: pickupCoords.lng,
                    }}
                    destination={{
                      latitude: destinationCoords.lat,
                      longitude: destinationCoords.lng,
                    }}
                    waypoints={stopsCoords.map(stop => ({
                      latitude: stop.lat,
                      longitude: stop.lng,
                    }))}
                    apikey={Google_Map_Key}
                    strokeColor={appColors.primary}
                    strokeWidth={3}
                    onReady={result => {
                      setDistance(result.distance);
                      if (result.legs && result.legs.length > 0) {
                        const totalSeconds = result.legs.reduce(
                          (sum, leg) => sum + (leg.duration?.value || 0),
                          0
                        );
                        const totalMinutes = totalSeconds / 60;
                        setTravelTime(totalMinutes);
                      } else {
                        // fallback to result.duration
                        setTravelTime(result.duration);
                      }
                    }}
                  />
                )}
              </MapView>
            ) : (
              <WebView
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            )}
          </View>
          <View
            style={[
              styles.mainContainer,
              {
                backgroundColor: bgContainer,

                borderColor: isDark
                  ? appColors.darkBorder
                  : appColors.primaryGray,
              },
            ]}>
            {selectedOption === null ? (
              <>
                <View
                  style={[
                    styles.selectedOptionView,
                    {
                      flexDirection: viewRTLStyle,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.carType,
                      { color: textColorStyle, textAlign: textRTLStyle },
                    ]}>
                    {translateData.vehicletype}
                  </Text>
                  {isExpanding && (
                    <View
                      style={{
                        flexDirection: viewRTLStyle,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <View style={{ backgroundColor: appColors.lightGreen, paddingVertical: windowHeight(6), paddingHorizontal: windowWidth(16), borderRadius: windowHeight(25) }}>
                        {isTimerRunning && (
                          <Text style={{ fontSize: fontSizes.FONT20, fontFamily: appFonts.regular, color: appColors.primary }}>
                            {minutes}:{seconds.toString().padStart(2, '0')}s
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>

                <FlatList
                  horizontal
                  data={
                    vehicleTypedata && vehicleTypedata.length > 0
                      ? vehicleTypedata
                      : noserviceData
                  }
                  renderItem={renderItem}
                  contentContainerStyle={{ backgroundColor: bgContainer }}
                  keyExtractor={item => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                />
                {taxidoSettingData?.taxido_values?.activation?.bidding == 1 && (
                  <View style={[external.mh_10]}>
                    <Text
                      style={[
                        styles.title,
                        {
                          color: isDark
                            ? appColors.whiteColor
                            : appColors.primaryText,
                        },
                        { textAlign: textRTLStyle },
                      ]}>
                      {translateData.offerYourFare}
                    </Text>
                    <View
                      style={[
                        styles.inputcontainer,
                        {
                          borderColor: isDark
                            ? appColors.darkBorder
                            : appColors.primaryGray,
                        },
                        { flexDirection: viewRTLStyle },
                      ]}>
                      <View style={styles.coin}>
                        <Text>{zoneValue.currency_symbol}</Text>
                      </View>
                      <TextInput
                        style={[styles.textInput, { color: textColorStyle }]}
                        value={fareValue}
                        onChangeText={text => {
                          if (!selectedVehicleData) {
                            setVehicleSelectModal(true);
                            setFareValue('');
                          } else {
                            setFareValue(text);
                          }
                        }}
                        placeholder={translateData.enterFareAmount}
                        backgroundColor={bgContainer}
                        keyboardType="number-pad"
                        placeholderTextColor={appColors.regularText}
                      />
                    </View>
                    {Warning ? (
                      <Text style={styles.warningText}>{warningMessage}</Text>
                    ) : null}
                  </View>
                )}
                <View
                  style={[
                    styles.recommended,
                    {
                      backgroundColor: isDark
                        ? appColors.darkHeader
                        : appColors.lightGray,
                    },
                    {
                      borderColor: isDark
                        ? appColors.darkHeader
                        : appColors.lightGray,
                    },
                  ]}>
                  {parcelWeight ? (
                    <Text
                      style={[
                        styles.RideRecommendPrice,
                        {
                          color: isDark
                            ? appColors.whiteColor
                            : appColors.primaryText,
                        },
                      ]}>
                      {zoneValue?.currency_symbol}
                      {ParcelRecommendCharge * zoneValue?.exchange_rate}
                      <Text
                        style={[styles.priceTitle, { color: textColorStyle }]}>
                        {' '}
                        - {translateData.recommendedPrice}
                      </Text>
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.RideRecommendPrice,
                        {
                          color: isDark
                            ? appColors.whiteColor
                            : appColors.primaryText,
                        },
                      ]}>
                      {taxidoSettingData?.taxido_values?.activation?.bidding ==
                        1
                        ? `${zoneValue?.currency_symbol}${Math.round(
                          minChargeRide * zoneValue?.exchange_rate,
                        )} - ${zoneValue?.currency_symbol}${Math.round(
                          maxChargeRide * zoneValue?.exchange_rate,
                        )}`
                        : `${zoneValue?.currency_symbol}${(
                          minChargeRide * zoneValue?.exchange_rate
                        ).toFixed(2)}`}
                      <Text
                        style={[styles.priceTitle, { color: textColorStyle }]}>
                        {taxidoSettingData?.taxido_values?.activation
                          ?.bidding == 1
                          ? ` - ${translateData.recommendedPrice}`
                          : ` - Fare Price`}
                      </Text>
                    </Text>
                  )}
                </View>
              </>
            ) : null}

            {selectedOption === 'selectPayment' ? (
              <>
                <View style={styles.selectPaymentView}>
                  <TouchableOpacity
                    style={{
                      alignSelf: 'flex-end',
                      marginHorizontal: windowWidth(15),
                    }}
                    onPress={() => setSelectedOption(null)}>
                    <CloseCircle />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.payment,
                      { color: textColorStyle, textAlign: textRTLStyle },
                    ]}>
                    {translateData.paymentMethodSelect}
                  </Text>
                </View>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.scrollViewStyle}>
                  <View style={styles.paymentContainer}>
                    <FlatList
                      data={activePaymentMethods}
                      renderItem={renderItem1}
                      keyExtractor={(item, index) => index.toString()}
                      contentContainerStyle={styles.listContent}
                    />
                  </View>
                </ScrollView>
              </>
            ) : null}

            {selectedOption === 'switchRider' ? (
              <>
                <View style={styles.switchContainer}>
                  <TouchableOpacity
                    onPress={handleNavigate}
                    activeOpacity={0.7}>
                    <View
                      style={[
                        styles.switchRiderView,
                        {
                          flexDirection: viewRTLStyle,
                        },
                      ]}>
                      <Text
                        style={[
                          commonStyles.mediumText23,
                          { color: textColorStyle, textAlign: textRTLStyle },
                        ]}>
                        {translateData.talkingRide}
                      </Text>
                      <TouchableOpacity
                        onPress={closeModal}
                        activeOpacity={0.7}
                        style={{ bottom: windowHeight(1.7) }}>
                        <Close />
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={[
                        commonStyles.regularText,
                        external.mt_3,
                        {
                          fontSize: fontSizes.FONT16,
                          lineHeight: windowHeight(14),
                          textAlign: textRTLStyle,
                        },
                      ]}>
                      {translateData.notice}
                    </Text>
                  </TouchableOpacity>
                  <View style={[external.mt_20]}>
                    <View
                      style={[
                        external.fd_row,
                        external.ai_center,
                        external.js_space,
                        { flexDirection: viewRTLStyle },
                      ]}>
                      <View
                        style={[
                          { flexDirection: viewRTLStyle, right: windowWidth(3) },
                        ]}>
                        <UserFill />
                        <Text
                          style={[
                            commonStyles.mediumTextBlack12,
                            {
                              fontSize: fontSizes.FONT19,
                              marginHorizontal: windowWidth(8),
                            },
                            {
                              color: isDark
                                ? appColors.whiteColor
                                : appColors.primaryText,
                            },
                          ]}>
                          {translateData.myself}
                        </Text>
                      </View>
                      <Pressable style={styles.pressable}>
                        <RadioButton
                          onPress={radioPress}
                          checked={isChecked}
                          color={appColors.primary}
                        />
                      </Pressable>
                    </View>
                    <SolidLine marginVertical={14} />

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[
                        external.fd_row,
                        external.js_space,
                        {
                          flexDirection: viewRTLStyle,
                          marginTop: windowHeight(1),
                        },
                      ]}
                      onPress={chooseRider}>
                      <View style={[external.fd_row, external.ai_center]}>
                        <NewContact />
                        <Text
                          style={[
                            styles.chooseAnotherAccount,
                            { marginLeft: windowWidth(10) },
                          ]}>
                          {translateData.contact}
                        </Text>
                      </View>
                      <Forword />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      external.js_space,
                      external.mt_25,
                      { flexDirection: viewRTLStyle },
                    ]}></View>
                </View>
              </>
            ) : null}

            <View
              style={[
                styles.cardView,
                {
                  flexDirection: viewRTLStyle,
                },
              ]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleOptionSelect('selectPayment')}
                style={[
                  styles.switchUser,
                  {
                    flexDirection: viewRTLStyle,
                    backgroundColor:
                      selectedOption === 'selectPayment'
                        ? appColors.selectPrimary
                        : isDark
                          ? appColors.darkHeader
                          : appColors.lightGray,

                    ...(selectedOption ? { top: windowHeight(4) } : {}),
                  },
                ]}>
                <View style={styles.userIcon}>
                  <Card />
                </View>
                {!selectedOption && (
                  <Text
                    style={[
                      styles.selectText,
                      { color: textColorStyle },
                      selectedOption === 'selectPayment' && styles.selectedText,
                    ]}>
                    {seletedPayment ? seletedPayment : translateData.payment}
                  </Text>
                )}

                {selectedOption && (
                  <Text
                    style={[
                      styles.selectText,
                      { color: textColorStyle },
                      selectedOption === 'selectPayment' && styles.selectedText,
                    ]}>
                    {seletedPayment ? seletedPayment : translateData.payment}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleOptionSelect('switchRider')}
                style={[
                  styles.switchUser,
                  {
                    flexDirection: viewRTLStyle,

                    backgroundColor:
                      selectedOption === 'switchRider'
                        ? appColors.selectPrimary
                        : isDark
                          ? appColors.darkHeader
                          : appColors.lightGray,

                    ...(selectedOption ? { top: windowHeight(4) } : {}),
                  },
                ]}>
                <View style={styles.userIcon}>
                  <User />
                </View>
                <Text
                  style={[
                    styles.selectText,
                    { color: textColorStyle },
                    selectedOption === 'switchRider' && styles.selectedText,
                  ]}>
                  {translateData.myself}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[external.mh_10]}>
              <View style={[external.mv_13]}>
                {!isExpanding ? (
                  <Button
                    title={translateData.bookRide}
                    onPress={handleBookRide}
                    loading={bookLoading}
                    disabled={bookLoading}
                  />
                ) : (
                  <Button
                    title={translateData.cancelRide}
                    backgroundColor={appColors.textRed}
                    onPress={handleCancelRide}
                    loading={bookLoading}
                    disabled={bookLoading}
                  />
                )}
              </View>
            </View>

            <CommonModal
              isVisible={visible}
              value={
                <ModalContainers
                  distance={distance}
                  selectedItemData={selectedItemData}
                  onPress={() => setModelVisible(false)}
                />
              }
              onPress={() => setModelVisible(false)}
            />
          </View>

          {driverbidValue ? (
            <View
              style={[
                external.mt_10,
                external.mh_15,
                { position: 'absolute', top: 40 },
              ]}>
              <FlatList
                renderItem={renderItemRequest}
                data={driverbidValue?.length > 0 ? [driverbidValue[0]] : []}
              />
            </View>
          ) : null}
          <Modal
            transparent={true}
            visible={modalVisible}
            animationType="slide"
            onRequestClose={handleCloseModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                  {translateData.cancelTheride}
                </Text>
                <View
                  style={[
                    styles.buttonContainer,
                    { flexDirection: viewRTLStyle },
                  ]}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCloseModal}>
                    <Text style={styles.buttonText}>
                      {translateData.Cancel}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleConfirmCancel}>
                    <Text style={styles.buttonText}>
                      {translateData.yesCancel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            transparent={true}
            visible={vehicleSelectModal}
            animationType="slide"
            onRequestClose={handleCloseModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                  {translateData.selectVehicleType}
                </Text>
                <View
                  style={[
                    styles.buttonContainer,
                    { justifyContent: 'center' },
                    { flexDirection: viewRTLStyle },
                  ]}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCloseModal}>
                    <Text style={styles.buttonText}>
                      {translateData.modelCloseBtn}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}
