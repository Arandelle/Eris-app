import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert,
  Image
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { OPENROUTE_API_KEY } from "@env";
import { auth, database } from "../services/firebaseConfig";
import { ref, onValue, set, get } from "firebase/database";
import Logo from "../../assets/logo.png"
import responderMarker from "../../assets/ambulance.png"

const openRouteKey = OPENROUTE_API_KEY;

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [responderLocation, setResponderLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);
  const [emergencyRequest, setEmergencyRequest] = useState(null);
  const [requestAccepted, setRequestAccepted] = useState(false);

  useEffect(() => {

    const fetchUserData = async () => {
      const user = auth.currentUser;
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      if (userData && userData.activeRequest) {
        setEmergencyRequest(userData.activeRequest);
        setUserLocation({
          latitude: userData.activeRequest.location.latitude,
          longitude: userData.activeRequest.location.longitude,
        });
      } else {
        // Fallback to current location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to access location was denied");
          Alert.alert("Permission denied", "Unable to access your location");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Listen for responder's location updates
    if (!emergencyRequest || !requestAccepted) return;

    const responderRef = ref(database, `responders/${emergencyRequest.responderId}`);
    const unsubscribe = onValue(responderRef, (snapshot) => {
      const location = snapshot.val();
      if (location) {
        setResponderLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    });

    return () => unsubscribe();
  }, [emergencyRequest, requestAccepted]);

  useEffect(() => {
    if (userLocation && responderLocation &&  requestAccepted) {
      fetchRoute();
    }
  }, [userLocation, responderLocation, requestAccepted]);

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
          title={emergencyRequest ? "Emergency Location" : "Your Location"}
          pinColor="#42a5f5"
        />
        {responderLocation && requestAccepted && (
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
      {/* <View className="scroll-py-2.5 bg-white items-center absolute top-0 right-0">
        {emergencyRequest && <Text>Emergency Request Active</Text>}
        {responderLocation && (
          <Text>Distance to responder: {distance.toFixed(2)} km</Text>
        )}
        <TouchableOpacity className="m-2.5 p-2.5 bg-blue-500 rounded-md" onPress={fetchRoute}>
          <Text className="font-bold text-white">Refresh Route</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default Map;
