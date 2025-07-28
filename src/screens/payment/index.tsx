import { View } from "react-native";
import React, { useState, useEffect } from "react";
import { Map } from "@src/commonComponent";
import styles from "./styles";
import { useValues } from "../../../App";
import { DriverData } from "./component/driverData/index";
import { TotalFare } from "./component/totalFare/index";
import { useRoute } from "@react-navigation/native";
import { CustomBackHandler } from "@src/components";
import { useAppNavigation } from "@src/utils/navigation";
import { external } from "@src/styles/externalStyle";
import firestore from '@react-native-firebase/firestore';

export function Payment() {
  const { linearColorStyle, bgFullStyle } = useValues();
  const { navigate } = useAppNavigation();
  const route = useRoute();
  const [duration, setDuration] = useState(null);
  const { rideId } = route.params;
  const [rideDatas, setRideData] = useState(null);


  useEffect(() => {
    if (!rideId) return;
    const unsubscribe = firestore()
      .collection('rides')
      .doc(rideId.toString())
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setRideData(data);
        } else {
        }
      });
    return () => unsubscribe();
  }, [rideId]);
  ;

  const handlePress = () => {
    navigate("PaymentMethod", { rideData: rideDatas });
  };

  const handleDurationChange = (newDuration: any) => {
    setDuration(newDuration);
  };

  return (
    <View style={external.main}>
      <CustomBackHandler />
      <View style={{ flex: 1 }}>
        <Map
          userLocation={rideDatas?.location_coordinates?.[1] || {}}
          onDurationChange={handleDurationChange}
          driverId={rideDatas?.driver?.id || ""}
        />
      </View>
      <View style={{ flex: 0.3, backgroundColor: linearColorStyle }} />
      <View style={styles.mainView}>
        <DriverData driverDetails={rideDatas} duration={duration} />
        <View style={[styles.card2, { backgroundColor: bgFullStyle }]}>
          <TotalFare
            handlePress={handlePress}
            fareAmount={rideDatas?.ride_fare || 0}
            rideStatus={rideDatas?.ride_status?.slug || ""}
          />
        </View>
      </View>
    </View>
  );
}
