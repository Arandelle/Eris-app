import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const ResponderMap = () => {
  const [responderPosition, setResponderPosition] = useState({
    latitude: 14.33289,
    longitude: 120.85065,
  });
  const targetPosition = { latitude: 14.3349, longitude: 120.851 };
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);

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
    // Simple straight-line route
    setRoute([responderPosition, targetPosition]);
    
    // Calculate distance
    const dist = calculateDistance(responderPosition, targetPosition);
    setDistance(dist);
  }, [responderPosition]);

  const calculateDistance = (start, end) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(end.latitude - start.latitude);
    const dLon = deg2rad(end.longitude - start.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(start.latitude)) * Math.cos(deg2rad(end.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const simulateMovement = () => {
    // Simulate movement towards the target
    const newLat = responderPosition.latitude + (targetPosition.latitude - responderPosition.latitude) / 10;
    const newLon = responderPosition.longitude + (targetPosition.longitude - responderPosition.longitude) / 10;
    setResponderPosition({ latitude: newLat, longitude: newLon });
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
        <Marker 
          coordinate={responderPosition}
          title="You (Responder)"
          pinColor="blue"
        />
        <Marker
          coordinate={targetPosition}
          title="Target Location"
          pinColor="red"
        />
        <Polyline
          coordinates={route}
          strokeColor="#FF0000"
          strokeWidth={2}
        />
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