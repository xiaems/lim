import React, { useEffect, useRef, useState } from 'react';
import { View, PermissionsAndroid, Image } from 'react-native';
import MapView, { Marker, AnimatedRegion, Polyline } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import { appColors } from '@src/themes';
import darkMapStyle from '@src/screens/darkMapStyle';
import { useValues } from '@App';

export function Map({ userLocation, driverId }) {

  const [driverLocation, setDriverLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [rotation, setRotation] = useState(0);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const lastPosition = useRef(null);
  const { isDark, Google_Map_Key } = useValues();

  const animatedCoordinate = useRef(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  ).current;

  const parseCoordinate = (coordinate) => ({
    latitude: parseFloat(coordinate.lat),
    longitude: parseFloat(coordinate.lng),
  });

  useEffect(() => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  }, []);

  useEffect(() => {
    if (!driverId) return;

    const unsubscribe = firestore()
      .collection('driverTrack')
      .doc(driverId.toString())
      .onSnapshot((doc) => {
        if (doc.exists) {
          const { lat, lng } = doc.data();
          const newLocation = { latitude: parseFloat(lat), longitude: parseFloat(lng) };

          if (lastPosition.current) {
            const distance = getDistance(lastPosition.current, newLocation);

            // Ignore very small movements (likely GPS noise)
            if (distance < 3) return;

            const angle = getBearing(lastPosition.current, newLocation);
            if (!isNaN(angle)) {
              setRotation(angle);
            }
          }

          lastPosition.current = newLocation;
          setDriverLocation(newLocation);

          animatedCoordinate.timing({
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            duration: 1000,
            useNativeDriver: false,
          }).start();
          if (mapRef.current) {
            mapRef.current.animateCamera({
              center: {
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
              },
              pitch: 0,
              heading: 0,
              zoom: 16,
            }, { duration: 1000 });
          }
        }
      });
    return () => unsubscribe();
  }, [driverId]);


  const lastRouteUpdate = useRef(Date.now());

  useEffect(() => {
    if (!driverLocation || !userLocation) return;

    const now = Date.now();
    if (now - lastRouteUpdate.current < 10000) return; // Update route every 10s
    lastRouteUpdate.current = now;

    const origin = driverLocation;
    const destination = parseCoordinate(userLocation);
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${Google_Map_Key}`;

    fetch(directionsUrl)
      .then(res => res.json())
      .then(json => {
        if (json.routes.length) {
          const points = decodePolyline(json.routes[0].overview_polyline.points);
          setRouteCoordinates(points);
        }
      });
  }, [driverLocation]);



  const decodePolyline = (t) => {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < t.length) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  const getBearing = (start, end) => {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;

    const lat1 = toRad(start.latitude);
    const lon1 = toRad(start.longitude);
    const lat2 = toRad(end.latitude);
    const lon2 = toRad(end.longitude);

    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  const getDistance = (from, to) => {
    const R = 6371000; // meters
    const dLat = (to.latitude - from.latitude) * Math.PI / 180;
    const dLon = (to.longitude - from.longitude) * Math.PI / 180;
    const lat1 = from.latitude * Math.PI / 180;
    const lat2 = to.latitude * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const initialRegion = {
    latitude: driverLocation?.latitude ? parseFloat(driverLocation.latitude) : 37.78825,
    longitude: driverLocation?.longitude ? parseFloat(driverLocation.longitude) : -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };


  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        customMapStyle={isDark ? darkMapStyle : []}
        initialRegion={initialRegion}
        showsUserLocation={false}
        followsUserLocation={false}
        loadingEnabled
      >
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={appColors.primary}
          />
        )}

        {driverLocation && (
          <Marker.Animated
            ref={markerRef}
            coordinate={animatedCoordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={rotation}
          >
            <Image
              source={{ uri: 'https://res.cloudinary.com/dpticetwa/image/upload/v1748781323/top-cargovan_qr3dsi.png' }}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker.Animated>
        )}

        {userLocation && (
          <Marker
            coordinate={parseCoordinate(userLocation)}
            title="Pickup"
            description="Pickup Location"
          />
        )}
      </MapView>
    </View>
  );
}
