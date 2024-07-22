import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { OPENROUTE_API_KEY } from '@env'

const openRouteKey = OPENROUTE_API_KEY;

const ResponderMap = () => {
  const [responderPosition, setResponderPosition] = useState({
    latitude: 14.334,
    longitude: 120.85,
  });
  const targetPosition = { latitude: 14.3349, longitude: 120.851 };
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setResponderPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    fetchRoute();
  }, [responderPosition]);

  const fetchRoute = async () => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${openRouteKey}&start=${responderPosition.longitude},${responderPosition.latitude}&end=${targetPosition.longitude},${targetPosition.latitude}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates;
        const formattedRoute = coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        setRoute(formattedRoute);
        setDistance(data.features[0].properties.summary.distance / 1000); // Convert meters to kilometers
        setCurrentRouteIndex(0);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const simulateMovement = () => {
    if (currentRouteIndex < route.length - 1) {
      setResponderPosition(route[currentRouteIndex + 1]);
      setCurrentRouteIndex(currentRouteIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: responderPosition.latitude,
          longitude: responderPosition.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker coordinate={responderPosition} title="You (Responder)" pinColor="blue" />
        <Marker coordinate={targetPosition} title="Target Location" pinColor="red" />
        <Polyline coordinates={route} strokeColor="#FF0000" strokeWidth={2} />
      </MapView>
      <View style={styles.infoPanel}>
        <Text>Distance to target: {distance.toFixed(2)} km</Text>
        <TouchableOpacity style={styles.button} onPress={simulateMovement}>
          <Text style={styles.buttonText}>Simulate Movement</Text>
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  infoPanel: {
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ResponderMap;