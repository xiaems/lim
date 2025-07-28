import { Image, Text, TouchableOpacity, View, BackHandler, FlatList, Pressable, ScrollView, Alert, Keyboard } from "react-native";
import React, { useState, useEffect, useRef, useContext } from "react";
import { external } from "../../../../../../styles/externalStyle";
import { styles } from "./styles";
import { Button, LineContainer, SolidLine, CommonModal, RadioButton, notificationHelper, } from "@src/commonComponent";
import { KmDetails } from "../packageContainer/index";
import { LocationTime } from "../locationTime/index";
import { commonStyles } from "../../../../../../styles/commonStyle";
import { appColors } from "@src/themes";
import * as turf from "@turf/turf";
import { UserFill, Close, Back, User, Card, NewContact, Forword, } from "@utils/icons";
import LinearGradient from "react-native-linear-gradient";
import { ModalContainer } from "../../../../../../components/modalContainer/index";
import { feesPolicies, modelData, } from "../../../../../../data/modelData/index";
import Images from "@utils/images";
import { useValues } from "../../../../../../../App";
import { BookRideItem } from "../../../../../bookRide/bookRideItem/index";
import { fontSizes, windowHeight } from "@src/themes";
import { ModalContainers } from "../../../../../bookRide/modalContainer/index";
import { useDispatch, useSelector } from "react-redux";
import { vehicleTypeDataGet } from "../../../../../../api/store/actions/vehicleTypeAction";
import MapView, { Circle, Marker, Polygon } from "react-native-maps";
import darkMapStyle from "@src/screens/darkMapStyle";
import { WebView } from "react-native-webview";
import { CustomMarker } from "@src/components";
import { allDriver } from "@src/api/store/actions";
import { CancelRender } from "@src/screens/cancelFare/cancelRenderItem/index";
import { bidDataGet } from "@src/api/store/actions/bidAction";
import { clearValue, getValue } from "@src/utils/localstorage";
import { useAppNavigation, useAppRoute } from "@src/utils/navigation";
import { URL } from "@src/api/config";
import { LocationContext } from "@src/utils/locationContext";
import { useNavigation } from "@react-navigation/native";
import firestore from '@react-native-firebase/firestore';
import useSmartLocation from "@src/components/helper/locationHelper";

export function DetailContainer() {
  const navigation = useNavigation();
  const route = useAppRoute();
  const context = useContext(LocationContext);
  const { textColorStyle, bgContainer, textRTLStyle, viewRTLStyle, isDark, bgFullLayout, Google_Map_Key } = useValues();
  const { pickupLocation, service_ID, zoneValue, service_category_ID } = route.params;
  const dispatch = useDispatch();
  const [visible, setModelVisible] = useState(false);
  const { navigate, goBack } = useAppNavigation();
  const [height, setHeight] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { driverData } = useSelector((state) => state.allDriver);
  const { vehicleTypedata } = useSelector((state) => state?.vehicleType || {});
  const selectedVehicleData = Array.isArray(vehicleTypedata) ? vehicleTypedata.find((item) => item?.id === selectedItem) : null;
  const [pickupCoords, setPickupCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const ZoneArea = zoneValue?.locations
  const [subZone, setSubZone] = useState([]);
  const [mapType, setMapType] = useState("googleMap");
  const [RideBooked, setRideBooked] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [rideID, setRideId] = useState(null);
  const [selectedPackageDetails, setSelectedPackageDetails] = useState({ hour: null, distance: null, id: null, distanceType: null });
  const [packageVehicle, setPackageVehicle] = useState();
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [radiusPerVertex, setRadiusPerVertex] = useState(null);
  const [incrementDistance, setIncrementDistance] = useState(0.5);
  const [perimeter, setPerimeter] = useState(0);
  const [driverMessages, setDriverMessages] = useState([]);
  const intervalRef = useRef(null);
  const [startDriverRequest, setStartDriverRequest] = useState(false);
  const allLocations = [pickupLocation];
  const allLocationCoords = [pickupCoords];
  const { bidValue } = useSelector((state) => state.bid);
  const [activeRideRequest, setActivateRideRequest] = useState(false);
  const { translateData, taxidoSettingData } = useSelector((state) => state.setting);
  const filteredVehicle = packageVehicle?.find((vehicle) => vehicle?.id === selectedItem);
  const packageTotalMinutes = selectedPackageDetails?.hour * 60;
  const packageTotalDistance = selectedPackageDetails.distanceType == 'mile' ? selectedPackageDetails.distance * 1.60934 : selectedPackageDetails.distance;
  const minPerMinCharge = Number(filteredVehicle?.min_per_min_charge) || 0;
  const minPerUnitCharge = Number(filteredVehicle?.min_per_unit_charge) || 0;
  const maxPerMinCharge = Number(filteredVehicle?.max_per_min_charge) || 0;
  const maxPerUnitCharge = Number(filteredVehicle?.max_per_unit_charge) || 0;
  const totalMinutes = Number(packageTotalMinutes) || 0;
  const totalDistance = Number(packageTotalDistance) || 0;
  const minPackageCharge = minPerMinCharge * totalMinutes + minPerUnitCharge * totalDistance;
  const maxPackageCharge = maxPerMinCharge * totalMinutes + maxPerUnitCharge * totalDistance;
  const recommendedPackageCharge = minPackageCharge;
  const [riderequestId, setRideRequestId] = useState();
  const [bookLoading, setBookLoading] = useState(false);
  const [driverId, setDriverId] = useState([]);
  const { self } = useSelector((state: any) => state.account);
  const pulseCount = 6;
  const pulseDelay = 20;
  const durations = 120;
  const [pulses, setPulses] = useState(Array(pulseCount).fill({ radius: 1000, opacity: 0 }),);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const mapRef = useRef(null);
  const { currentLatitude, currentLongitude } = useSmartLocation();


  useEffect(() => {
    if (packageVehicle?.length > 0) {
      setSelectedItem(packageVehicle[0].id);
    }
  }, [packageVehicle]);


  const renderItemRequest = ({ item }) => (
    <CancelRender item={item} pickupLocation={pickupLocation} />
  );

  useEffect(() => {
    const showRequest = () => {
      if (
        Array.isArray(bidValue?.data) &&
        bidValue.data.length > 0 &&
        activeRideRequest
      ) {
        setRideBooked(true);
      }
    };
    showRequest();
  }, [bidValue]);

  const handlePackageSelection = (details) => {

    setSelectedPackageDetails(details);
  };

  const handlepackagevehicle = (vehicleDetails) => {
    setPackageVehicle(vehicleDetails);
  };

  const calculatePerimeter = (points) => {
    if (points.length < 2) return 0;
    const line = turf.lineString(points?.map((p) => [p.lng, p.lat]));
    return turf.length(line, { units: "kilometers" });
  };

  useEffect(() => {
    getVehicleTypes();
  }, []);

  useEffect(() => {
    const geocodeAddress = async (address: string) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${Google_Map_Key}`
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
        console.error("Error geocoding address:", error);
      }
      return null;
    };

    const fetchCoordinates = async () => {
      try {
        const pickup = await geocodeAddress(pickupLocation);
        setPickupCoords(pickup);
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      } finally {
      }
    };

    fetchCoordinates();
  }, [pickupLocation]);

  const driverLocations = driverData?.data
    ?.map((driver) => {
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
    ?.filter((driver) => driver !== null);

  const filteredDrivers = selectedVehicleData
    ? driverLocations?.filter(
      (driver) => driver?.vehicleId === selectedVehicleData?.id
    )
    : [];


  const getVehicleTypes = () => {
    const payload = {
      locations: [
        {
          lat: currentLatitude,
          lng: currentLongitude,
        },
      ],
      service_id: service_ID,
      service_category_id: service_category_ID,
    };

    dispatch(vehicleTypeDataGet(payload)).then((res: any) => { });
  };


  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNavigate = () => {
    navigate("ChooseRider");
  };

  const radioPress = () => {
    setIsChecked(!isChecked);
  };

  const chooseRider = () => {
    navigate("ChooseRider");
  };

  const handleSkip = () => {
  };

  const [selectedItem1, setSelectedItem1] = useState<number | null>(null);

  const paymentData = (index: number) => {
    setSelectedItem1(index === selectedItem1 ? null : index);
  };

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
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [selectedOption]);

  const mapCustomStyle = isDark ? darkMapStyle : undefined;

  const handleBookRide = () => {
    Keyboard.dismiss();
    setBookLoading(true);
    if (Math.round(recommendedPackageCharge) < Math.round(minPackageCharge * zoneValue?.exchange_rate)) {
      setBookLoading(false);
      return
    } else if (Math.round(recommendedPackageCharge) > Math.round(maxPackageCharge * zoneValue?.exchange_rate)) {
      setBookLoading(false);
      return
    } else {
      setIsExpanding(!isExpanding);
      if (!isExpanding) {
        BookRideRequest(forms);
        startPulseAnimation();
        setIsPulsing(!isPulsing);
        focusOnPickup();

      }
    }
  };

  const handleCancelRide = async () => {
    setBookLoading(true)
    stopPulseAnimation();
    try {
      if (taxidoSettingData?.taxido_values?.activation?.bidding == 0) {
        if (!riderequestId) {
          console.warn('rideRequestId is missing');
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
          console.warn('instantRide ride document does not exist');
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
        setIsExpanding(false);
        setBookLoading(false)
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
            const driverDocRef = firestore().collection('driver_ride_requests').doc(driverId);
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
          setIsExpanding(false);
          setBookLoading(false);
        } catch (error) {
          console.error('Failed to remove ride request from Firebase:', error);
          Alert.alert('Error', 'Could not cancel ride properly.');
          setIsExpanding(false);
          setBookLoading(false);
        }
      } else {
      }
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      setBookLoading(false)
    }
    setIsExpanding(false);
  };

  useEffect(() => {
    if (ZoneArea && ZoneArea?.length > 1) {
      setRadiusPerVertex(new Array(ZoneArea?.length - 1).fill(0.5));
    }
  }, [ZoneArea]);

  useEffect(() => {
    if (isExpanding) {
      intervalRef.current = setInterval(() => {
        setRadiusPerVertex((prevRadii) =>
          prevRadii?.map((radius, index) => {
            const currentSubZoneVertex = subZone[index] || pickupCoords;
            const distanceToMainZone = turf.distance(
              turf.point([
                currentSubZoneVertex?.lng,
                currentSubZoneVertex?.lat,
              ]),
              turf.point([ZoneArea[index]?.lng, ZoneArea[index]?.lat]),
              { units: "kilometers" }
            );
            return distanceToMainZone <= incrementDistance
              ? radius
              : radius + incrementDistance;
          })
        );
        expandSubZone();
      }, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isExpanding, subZone, incrementDistance, pickupCoords]);

  const expandSubZone = () => {
    if (!Array.isArray(ZoneArea) || !pickupCoords?.lat || !pickupCoords?.lng) return;

    const expandedPoints = [];
    const newRadiusPerVertex = [];

    for (let i = 0; i < ZoneArea.length - 1; i++) {
      const mainZonePoint = ZoneArea[i];
      if (!mainZonePoint?.lat || !mainZonePoint?.lng) continue;

      const angle = turf.bearing(
        turf.point([pickupCoords.lng, pickupCoords.lat]),
        turf.point([mainZonePoint.lng, mainZonePoint.lat])
      );

      const currentSubZoneVertex = subZone[i] || {
        lat: pickupCoords.lat,
        lng: pickupCoords.lng,
      };

      const distanceToMainZone = turf.distance(
        turf.point([currentSubZoneVertex.lng, currentSubZoneVertex.lat]),
        turf.point([mainZonePoint.lng, mainZonePoint.lat]),
        { units: "kilometers" }
      );

      const newRadius = radiusPerVertex[i] ?? 0;

      if (distanceToMainZone <= incrementDistance) {
        expandedPoints.push({
          lat: mainZonePoint.lat,
          lng: mainZonePoint.lng,
        });
        newRadiusPerVertex.push(distanceToMainZone);
      } else {
        const expandedPoint = turf.destination(
          turf.point([pickupCoords.lng, pickupCoords.lat]),
          newRadius + incrementDistance,
          angle,
          { units: "kilometers" }
        );

        const [lng, lat] = expandedPoint.geometry.coordinates;

        if (!isNaN(lat) && !isNaN(lng)) {
          expandedPoints.push({ lat, lng });
          newRadiusPerVertex.push(newRadius + incrementDistance);
        }
      }
    }

    if (expandedPoints.length === 0) return;

    expandedPoints.push(expandedPoints[0]);
    setSubZone(expandedPoints);

    const perimeterLength = calculatePerimeter(expandedPoints);
    setPerimeter(perimeterLength);

    const validPoints = expandedPoints.filter(
      (point) => typeof point?.lat === 'number' && typeof point?.lng === 'number'
    );

    if (validPoints.length < 3) return;

    const polygon = turf.polygon([validPoints.map(({ lng, lat }) => [lng, lat])]);

    const messages = filteredDrivers
      ?.map((driver) => {
        if (!driver?.lat || !driver?.lng) return null;
        const point = turf.point([driver.lng, driver.lat]);
        return turf.booleanPointInPolygon(point, polygon) ? driver.id : null;
      })
      .filter(Boolean);

    setDriverMessages(messages);

  };

  useEffect(() => {
    dispatch(
      allDriver({
        zones: zoneValue?.data?.[0]?.id,
        is_online: 1,
        is_on_ride: 0,
      })
    );
  }, []);

  const formattedData =
    allLocationCoords && allLocationCoords.length > 0
      ? `[${allLocationCoords
        ?.map((coord) =>
          coord?.lat !== undefined && coord?.lng !== undefined
            ? `{"lat": ${coord.lat}, "lng": ${coord.lng}}`
            : null
        )
        .filter(Boolean)
        .join(", ")}]`
      : "[]";

  if (formattedData !== "[]") {
    try {
      const parsedData = JSON.parse(formattedData);
    } catch (error) {
      console.error("Failed to parse formattedData:", error);
    }
  } else {
  }

  const finalFare = Math.round(recommendedPackageCharge);

  const forms = {
    location_coordinates: JSON.parse(formattedData),
    locations: allLocations,
    ride_fare: finalFare,
    service_id: service_ID,
    service_category_id: service_category_ID,
    vehicle_type_id: filteredVehicle?.id,
    distance: selectedPackageDetails?.distance,
    distance_unit: "km",
    payment_method: "cash",
    currency_code: zoneValue?.currency_code,
    wallet_balance: null,
    coupon: null,
    description: null,
    selectedImage: {
      uri: null,
      type: null,
      fileName: null,
    },
    hourly_package_id: selectedPackageDetails?.id,
  };

  const BookRideRequest = async (forme) => {
    const token = await getValue("token");
    try {
      const formData = new FormData();
      forme.location_coordinates.forEach((coord, index) => {
        formData.append(`location_coordinates[${index}][lat]`, coord.lat);
        formData.append(`location_coordinates[${index}][lng]`, coord.lng);
      });
      forme.locations.forEach((loc, index) => {
        formData.append(`locations[${index}]`, loc);
      });
      formData.append("ride_fare", forme.ride_fare);
      formData.append("service_id", forme.service_id);
      formData.append("service_category_id", forme.service_category_id);
      formData.append("vehicle_type_id", forme.vehicle_type_id);
      formData.append("distance", forme.distance);
      formData.append("distance_unit", forme.distance_unit);
      formData.append("payment_method", forme.payment_method);
      formData.append("wallet_balance", forme.wallet_balance || "");
      formData.append("currency_code", forme.currency_code || "");
      formData.append("coupon", forme.coupon || "");
      formData.append("description", forme.description);
      formData.append("hourly_package_id", forme.hourly_package_id);

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
                .doc(driver_Ids)
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
            setBookLoading(false)
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
            service_category_id: forms.service_category_id,
            service_id: forms.service_id,
            vehicle_type_id: forms.vehicle_type_id,
            wallet_balance: forms.wallet_balance,
            rider: responseData?.data?.rider,
            service: responseData?.data?.service,
            service_category: responseData?.data?.service_category,
            vehicle_type: responseData?.data?.vehicle_type,
            hourly_packages: responseData?.data?.hourly_packages
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
                setBookLoading(false)
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
                .doc(rideId)
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
                .doc(rideId)
                .collection('instantRide')
                .doc(rideId)
                .set(instantRideData);
            } catch (err) {
              console.error('❌ Failed to save instantRide metadata:', err);
            }
            // ✅ Local UI update
            setRideRequestId(rideId);
            setStartDriverRequest(true);
          }
        } catch (error) {
          notificationHelper('', 'error || error', 'error');
          setBookLoading(false);
        }
      } else {
        notificationHelper('', responseData.message, 'error');
      }
    } catch (error) {
      console.error("Error in BookRideRequest:", error);
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
              navigate('RideActive', { activeRideOTP: rideData });
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
        navigate('RideActive', { activeRideOTP: rideData });
      } else {
      }
    });

    return () => {
      unsubscribe();
    };
  }, [riderequestId]);

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

  useEffect(() => {
    if (startDriverRequest && rideID && isExpanding) {
      const ride_request_id = rideID;

      const fetchBidData = async () => {
        await dispatch(bidDataGet({ ride_request_id }));
        setActivateRideRequest(true);
      };

      fetchBidData();
      const intervalId = setInterval(fetchBidData, 5000);
      return () => clearInterval(intervalId);
    }
  }, [startDriverRequest, rideID, isExpanding, dispatch]);

  useEffect(() => {
    const showRequest = () => {
      if (
        Array.isArray(bidValue?.data) &&
        bidValue.data.length > 0 &&
        activeRideRequest
      ) {
        setRideBooked(true);
      }
    };
    showRequest();
  }, [bidValue]);

  const startPulseAnimation = () => {
    setBookLoading(false);

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

  const hasValidPackageDetails = selectedPackageDetails &&
    Object.values(selectedPackageDetails).some(value => value !== null);

  const renderItem = ({ item }) => (
    <BookRideItem
      item={item}
      onPress={() => setSelectedItem(item.id)}
      isSelected={selectedItem === item.id}
      onPressAlternate={() => setModelVisible(true)}
    />
  );
  const activePaymentMethods = zoneValue?.payment_method

  const renderItem1 = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => paymentData(index)} activeOpacity={0.7}
      >
        <View
          style={[
            styles.modalPaymentView,
            { backgroundColor: bgContainer, flexDirection: viewRTLStyle },
          ]}
        >
          <View style={{ flexDirection: viewRTLStyle, flex: 1 }}>
            <View style={styles.imageBg}>
              <Image source={item.image} style={styles.paymentImage} />
            </View>
            <View style={styles.mailInfo}>
              <Text
                style={[
                  styles.mail,
                  { color: textColorStyle, textAlign: textRTLStyle },
                ]}
              >
                {item.name}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.payBtn} activeOpacity={0.7}
          >
            <RadioButton
              checked={index === selectedItem1}
              color={appColors.primary}
            />
          </TouchableOpacity>
        </View>
        {index !== 3 ? <View style={styles.borderPayment} /> : null}
      </TouchableOpacity>
    )
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
      <>
        <View style={[commonStyles.flexContainer, { flex: 0.8 }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: bgContainer }]}
            onPress={goBack}
            activeOpacity={0.7}

          >
            <Back />
          </TouchableOpacity>
          {mapType === "googleMap" ? (
            <MapView
              ref={mapRef}
              style={[commonStyles.flexContainer]}
              region={{
                latitude: pickupCoords?.lat || 37.78825,
                longitude: pickupCoords?.lng || -122.4324,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
              showsUserLocation={true}
              customMapStyle={mapCustomStyle}
            >
              <Polygon
                coordinates={ZoneArea?.filter(item => item?.lat && item?.lng).map(({ lng, lat }) => ({
                  latitude: lat,
                  longitude: lng,
                }))}
                strokeColor="rgba(0,0,0,0)"
                fillColor="rgba(0,0,0,0)"
                strokeWidth={2}
              />

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
                  coordinate={{ latitude: driver.lat, longitude: driver.lng }}
                  title={`${translateData.driver} ${index + 1}`}
                >
                  <CustomMarker
                    imageUrl={selectedVehicleData.vehicle_map_icon.original_url}
                  />
                </Marker>
              ))}

              {pickupCoords && (
                <>
                  <Marker
                    coordinate={{
                      latitude: pickupCoords.lat,
                      longitude: pickupCoords.lng,
                    }}
                    title={translateData.pickupLocation}
                    pinColor={appColors.primary}
                  />
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
            </MapView>
          ) : (
            <WebView
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}
        </View>
        {RideBooked ? (
          <View style={[external.mt_10, external.mh_15, styles.listView]}>
            <FlatList
              renderItem={renderItemRequest}
              data={bidValue?.data?.length > 0 ? [bidValue?.data[0]] : []}
            />
          </View>
        ) : null}
        <View style={styles.linearGradientView}>
          <View>
            <LinearGradient
              style={[
                styles.mainContainer,
                height ? { height: windowHeight(330) } : null,
              ]}
              start={{ x: 0.0, y: 1.0 }}
              end={{ x: 0.0, y: 1.0 }}
              colors={["rgba(52, 52, 52, 0.8)", appColors.lightGray]}
            ></LinearGradient>
            <View style={[external.fx_1, external.js_end, external.mh_20]}>
              <LocationTime pickupLocation={pickupLocation} />
              <LineContainer />
              <View
                activeOpacity={0.7}
                style={[
                  styles.popupContainer,
                  {
                    backgroundColor: bgContainer,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.choosePackage,
                    { color: textColorStyle, textAlign: textRTLStyle },
                  ]}
                >
                  {translateData.chooseaPackage}
                </Text>
                <KmDetails
                  onPackageSelect={handlePackageSelection}
                  onpackageVehicle={handlepackagevehicle}
                />
                <View>
                  {hasValidPackageDetails && <Text
                    style={[
                      styles.carType,
                      { color: textColorStyle, textAlign: textRTLStyle },
                    ]}
                  >
                    {translateData.vehicletype}
                  </Text>}
                  <FlatList
                    horizontal
                    data={packageVehicle}
                    renderItem={renderItem}
                    contentContainerStyle={{ backgroundColor: bgContainer }}
                    showsHorizontalScrollIndicator={false}
                  />
                  <View
                    style={[
                      styles.recommended,
                      {
                        backgroundColor: isDark
                          ? bgFullLayout
                          : appColors.lightGray,
                      },
                      {
                        borderColor: isDark
                          ? bgFullLayout
                          : appColors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.RideRecommendPrice,
                        {
                          color: isDark
                            ? textColorStyle
                            : appColors.primaryText,
                        },
                      ]}
                    >
                      {zoneValue.currency_symbol} {Math.round(recommendedPackageCharge) * zoneValue.exchange_rate}
                      <Text
                        style={[
                          styles.priceTitle,
                          {
                            color: isDark
                              ? textColorStyle
                              : appColors.primaryText,
                          },
                        ]}
                      >
                        {" "}
                        - {translateData.recommendedPrice}
                      </Text>
                    </Text>
                  </View>
                  {selectedOption === "selectPayment" ? (
                    <>
                      <Text
                        style={[
                          styles.payment,
                          { color: textColorStyle, textAlign: textRTLStyle },
                        ]}
                      >
                        {translateData.paymentMethodSelect}
                      </Text>
                      <View style={styles.paymentContainer}>
                        <ScrollView>
                          <FlatList
                            data={activePaymentMethods}
                            renderItem={renderItem1}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                          />
                        </ScrollView>
                      </View>
                    </>
                  ) : null}

                  {selectedOption === "switchRider" ? (
                    <>
                      <View style={styles.switchRiderView}>
                        <TouchableOpacity onPress={handleNavigate} activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              commonStyles.mediumText23,
                              {
                                color: textColorStyle,
                                textAlign: textRTLStyle,
                              },
                            ]}
                          >
                            {translateData.talkingRide}
                          </Text>
                          <Text
                            style={[
                              commonStyles.regularText,
                              external.mt_3,
                              {
                                fontSize: fontSizes.FONT16,
                                lineHeight: windowHeight(14),
                                textAlign: textRTLStyle,
                              },
                            ]}
                          >
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
                            ]}
                          >
                            <View
                              style={[
                                external.fd_row,
                                { flexDirection: viewRTLStyle },
                              ]}
                            >
                              <UserFill />
                              <Text
                                style={[
                                  commonStyles.mediumTextBlack12,
                                  external.mh_2,
                                  { fontSize: fontSizes.FONT19 },
                                  { color: textColorStyle },
                                ]}
                              >
                                {translateData.myself}
                              </Text>
                            </View>
                            <Pressable
                              style={{
                                backgroundColor: appColors.selectPrimary,
                                borderRadius: windowHeight(48),
                              }}
                            >
                              <RadioButton
                                onPress={radioPress}
                                checked={isChecked}
                                color={appColors.primary}
                              />
                            </Pressable>
                          </View>
                          <SolidLine marginVertical={14} />
                          <View
                            style={[
                              external.fd_row,
                              external.js_space,
                              { flexDirection: viewRTLStyle },
                            ]}
                          >
                            <TouchableOpacity
                              activeOpacity={0.7}

                              style={[
                                external.fd_row,
                                external.ai_center,
                                { flexDirection: viewRTLStyle },
                              ]}
                              onPress={chooseRider}
                            >
                              <NewContact />
                              <Text style={[styles.chooseAnotherAccount]}>
                                {translateData.contact}
                              </Text>
                            </TouchableOpacity>
                            <Forword />
                          </View>
                        </View>
                        <View
                          style={[
                            external.js_space,
                            external.mt_25,
                            { flexDirection: viewRTLStyle },
                          ]}
                        >
                          <Button
                            width={"47%"}
                            backgroundColor={appColors.lightGray}
                            title={translateData.cancel}
                            textColor={appColors.primaryText}
                            onPress={handleSkip}
                          />
                          <Button
                            width={"47%"}
                            title={translateData.continue}
                            onPress={chooseRider}
                          />
                        </View>
                      </View>
                    </>
                  ) : null}

                  <View
                    style={[
                      styles.cardMainView,
                      {
                        backgroundColor: isDark
                          ? bgFullLayout
                          : appColors.lightGray,
                        flexDirection: viewRTLStyle,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOptionSelect("selectPayment")}
                      style={[
                        styles.userView,
                        {
                          flexDirection: viewRTLStyle,
                          backgroundColor: isDark
                            ? bgContainer
                            : appColors.lightGray,
                        },
                      ]}
                    >
                      <View style={styles.cardView}>
                        <Card />
                      </View>
                      <Text
                        style={[
                          styles.selectText,
                          { color: textColorStyle },
                          selectedOption === "selectPayment" &&
                          styles.selectedText,
                        ]}
                      >
                        {translateData.selectPayment}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOptionSelect("switchRider")}
                      style={[
                        styles.userView,
                        {
                          flexDirection: viewRTLStyle,
                          backgroundColor: isDark
                            ? bgContainer
                            : appColors.lightGray,
                        },
                      ]}
                    >
                      <User />
                      <Text
                        style={[
                          styles.selectText,
                          { color: textColorStyle },
                          selectedOption === "switchRider" &&
                          styles.selectedText,
                        ]}
                      >
                        {translateData.switchRider}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <CommonModal
                    isVisible={visible}
                    value={
                      <ModalContainers onPress={() => setModelVisible(false)} />
                    }
                    onPress={() => setModelVisible(false)}
                  />
                </View>
              </View>
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
              <CommonModal
                isVisible={visible}
                value={
                  <ModalContainers
                    selectedItemData={selectedItemData}
                    onPress={() => setModelVisible(false)}
                  />
                }
                onPress={() => setModelVisible(false)}
              />
            </View>
            <View style={styles.modalContain}>
              <CommonModal
                isVisible={visible}
                onPress={() => setModelVisible(false)}
                value={
                  <View
                    opacity={1}
                    style={{
                      backgroundColor: isDark
                        ? appColors.darkPrimary
                        : appColors.whiteColor,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.close}
                      onPress={() => setModelVisible(false)}
                    >
                      <Close />
                    </TouchableOpacity>
                    <Text
                      style={[
                        commonStyles.extraBold,
                        external.ti_center,
                        {
                          color: isDark
                            ? appColors.whiteColor
                            : appColors.primaryText,
                          marginTop: windowHeight(10),
                        },
                      ]}
                    >
                      {translateData.rentalRide}
                    </Text>
                    <Image style={styles.carTwo} source={Images.carTwo} />
                    <View>
                      <View
                        style={{
                          flexDirection: viewRTLStyle,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={[
                            commonStyles.extraBold,
                            external.pv_10,
                            {
                              color: isDark
                                ? appColors.whiteColor
                                : appColors.primaryText,
                            },
                          ]}
                        >
                          {translateData.incorporated}
                        </Text>
                        <View
                          style={{
                            flexDirection: viewRTLStyle,
                            marginVertical: windowHeight(4.8),
                          }}
                        >
                          <UserFill />
                          <Text style={styles.total}>5</Text>
                        </View>
                      </View>
                      <SolidLine />
                      <View style={[external.mt_5]}>
                        <ModalContainer data={modelData} />
                      </View>
                      <SolidLine />
                      <Text
                        style={[
                          commonStyles.extraBold,
                          external.mt_10,
                          {
                            color: isDark
                              ? appColors.whiteColor
                              : appColors.primaryText,
                          },
                        ]}
                      >
                        {translateData.policiesFees}
                      </Text>
                      <View style={[external.mt_5]}>
                        <ModalContainer data={feesPolicies} />
                      </View>
                    </View>
                  </View>
                }
              />
            </View>
          </View>
        </View>
      </>
    </View >
  );
}