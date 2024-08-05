import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { OPENROUTE_API_KEY } from "@env";
import { database } from "../services/firebaseConfig";
import { ref, onValue, set, get } from "firebase/database";
import { getAuth } from "firebase/auth";

const openRouteKey = OPENROUTE_API_KEY;

const Map = ({ isAdmin }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [responderLocation, setResponderLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);
  const [emergencyRequest, setEmergencyRequest] = useState(null);

  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      if (userData && userData.activeRequest) {
        setEmergencyRequest(userData.activeRequest);
        setUserLocation({
          latitude: userData.activeRequest.location.latitude,
          longitude: userData.activeRequest.location.longitude
        });
      } else {
        // Fallback to current location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error("Permission to access location was denied");
          Alert.alert("Permission denied", "Unable to access your location");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (!isAdmin) return;

    // Admin can see all active emergency requests
    const emergencyRequestsRef = ref(database, "emergencyRequests");
    const unsubscribe = onValue(emergencyRequestsRef, (snapshot) => {
      const requests = snapshot.val();
      if (requests) {
        // For simplicity, we're just showing the first active request
        // You might want to implement a way to switch between different requests
        const firstRequestId = Object.keys(requests)[0];
        setEmergencyRequest({
          id: firstRequestId,
          ...requests[firstRequestId]
        });
        setUserLocation(requests[firstRequestId].location);
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    // Listen for responder's location updates
    const responderRef = ref(database, "admins/responder1");
    const unsubscribe = onValue(responderRef, (snapshot) => {
      const location = snapshot.val();
      if (location) {
        setResponderLocation({
          latitude: location.latitude,
          longitude: location.longitude
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
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
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
        {responderLocation && (
          <Marker
            coordinate={responderLocation}
            title="Responder"
            pinColor="red"
          />
        )}
        {route.length > 0 && (
          <Polyline coordinates={route} strokeColor="red" strokeWidth={2} />
        )}
      </MapView>

      <View style={styles.footer}>
        {emergencyRequest && (
          <Text>Emergency Request Active</Text>
        )}
        {responderLocation && (
          <Text>Distance to responder: {distance.toFixed(2)} km</Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={fetchRoute}
        >
          <Text style={styles.buttonText}>Refresh Route</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.8,
  },
  footer: {
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Map;