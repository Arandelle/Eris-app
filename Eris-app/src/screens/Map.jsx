import React, { useState, useEffect } from "react";
import { Text, View, Alert, Image } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { OPENROUTE_API_KEY } from "@env";
import { auth, database } from "../services/firebaseConfig";
import { ref, onValue, set, get, update } from "firebase/database";
import Logo from "../../assets/logo.png";
import responderMarker from "../../assets/ambulance.png";
import { useFetchData } from "../hooks/useFetchData";

const openRouteKey = OPENROUTE_API_KEY;

const Map = () => {
  const { userData } = useFetchData();
  const [userLocation, setUserLocation] = useState(null);
  const [responderLocation, setResponderLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    const requestLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.error("Permission to access location was denied");
          Alert.alert(
            "Eris says: ",
            "Permission to access location was denied"
          );
          const fallbackLocation = {latitude: 14.33289, longitude: 120.85065 };

         
        const userLocationRef = ref(database, `users/${user.uid}/location`);
        const userActiveRequest = ref(database, `users/${user.uid}/activeRequest/locationCoords`);
        const userEmergencyRequest = ref(database, `emergencyRequest/${userData?.activeRequest.requestId}/locationCoords`)
        const responderLocation = ref(database, `responders/${userData?.activeRequest.responderId}/pendingEmergency/locationCoords`);
        try {
          await update(userLocationRef, fallbackLocation);
          if (userData?.activeRequest) {
            await update(userActiveRequest, fallbackLocation);
            await update(userEmergencyRequest, fallbackLocation);
            await update(responderLocation, fallbackLocation);
          }
        } catch (error) {
          console.error("Failed to update location in Firebase: ", error);
        }

          setUserLocation(fallbackLocation); // fallback position
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        Location.watchPositionAsync({ distanceInterval: 1 }, async (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setUserLocation({ latitude, longitude });

          const userLocationRef = ref(database, `users/${user.uid}/location`);
          const userActiveRequest = ref(database, `users/${user.uid}/activeRequest/locationCoords`);
          const userEmergencyRequest = ref(database, `emergencyRequest/${userData?.activeRequest.requestId}/locationCoords`);
          const responderLocation = ref(database, `responders/${userData?.activeRequest.responderId}/pendingEmergency/locationCoords`);
          try {
            await update(userLocationRef, { latitude, longitude });
            if (userData?.activeRequest) {
              await update(userActiveRequest, { latitude, longitude });
              await update(userEmergencyRequest, { latitude, longitude });
              await update(responderLocation, {latitude, longitude});
            }
          } catch (error) {
            console.error("Failed to update location in Firebase: ", error);
          }
        });
        setLoading(false);
      } catch (error) {
        console.error("Location request failed: ", error);
        Alert.alert(
          "Location permission was denied",
          "The app is using a default fallback location. Please enable location permissions in your device settings for accurate location tracking."
        );
        const fallbackLocation = { latitude: 14.33289, longitude: 120.85065 };

        const userLocationRef = ref(database, `users/${user.uid}/location`);
        const userActiveRequest = ref(database, `users/${user.uid}/activeRequest/locationCoords`);
        const userEmergencyRequest = ref(database, `emergencyRequest/${userData?.activeRequest.requestId}/locationCoords`)
        const responderLocation = ref(database, `responders/${userData?.activeRequest.responderId}/pendingEmergency/locationCoords`);
        try {
          await update(userLocationRef, fallbackLocation);
          if (userData?.activeRequest) {
            await update(userActiveRequest, fallbackLocation);
            await update(userEmergencyRequest, fallbackLocation);
            await update(responderLocation, fallbackLocation);
          }
        } catch (error) {
          console.error("Failed to update location in Firebase: ", error);
        }

        setUserLocation(fallbackLocation); // Fallback position
        setLoading(false);
      }
    };
    requestLocation();
  }, [userData]);

  useEffect(() => {
    const user = auth.currentUser;
    const respondeRef = ref(database, `users/${user.uid}`);
    const unsubscribe = onValue(respondeRef, (snapshot) => {
      const responderData = snapshot.val();

      if (responderData && responderData.locationCoords) {
        setUserLocation({
          latitude: responderData.locationCoords.latitude,
          longitude: responderData.locationCoords.longitude,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    const respondeRef = ref(database, `users/${user.uid}/activeRequest`);
    const unsubscribe = onValue(respondeRef, (snapshot) => {
      const responderData = snapshot.val();

      if (responderData && responderData.locationOfResponder) {
        setResponderLocation({
          latitude: responderData.locationOfResponder.latitude,
          longitude: responderData.locationOfResponder.longitude,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userLocation && responderLocation) {
      fetchRoute();
    }
  }, [userLocation, responderLocation]);

  const fetchRoute = async () => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${openRouteKey}&start=${responderLocation.longitude},${responderLocation.latitude}&end=${userLocation.longitude},${userLocation.latitude}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates;
        const formattedRoute = coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        setRoute(formattedRoute);
        setDistance(data.features[0].properties.summary.distance / 1000);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  if (!userLocation) {
    return (
      <View className="flex w-full h-full items-center justify-center">
        <Image source={Logo} alt="Loading..." />
        <Text>Loading please wait...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        className="flex-1"
        initialRegion={{
          ...userLocation,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker
          coordinate={userLocation}
          title={"Your Location"}
          pinColor="#42a5f5"
        />
        {responderLocation && (
          <Marker
            coordinate={responderLocation}
            title="Responder"
            pinColor="red"
          >
            <Image source={responderMarker} className="h-12 w-12" />
          </Marker>
        )}
        {route.length > 0 && (
          <Polyline coordinates={route} strokeColor="red" strokeWidth={2} />
        )}
      </MapView>
     
        {responderLocation && (
          <View className="bg-gray-500 p-2">
          <Text className="text-white text-lg">Distance to responder: {distance.toFixed(2)} km</Text>
          </View>
        )}
      
    </View>
  );
};

export default Map;
