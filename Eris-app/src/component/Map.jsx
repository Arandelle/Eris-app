import React, { useState, useEffect } from "react";
import {Text, View, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import MapView, { Polyline, Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';
import { OPENROUTE_API_KEY } from '@env'

const openRouteKey = OPENROUTE_API_KEY;

const Map = () => {
  const [responderPosition, setResponderPosition] = useState({
    latitude: 14.334,
    longitude: 120.85,
  });
  const [targetPosition, setTargetPosition] = useState({
    latitude: 14.3349,
    longitude: 120.851,
  });
  const [targetDetails, setTargetDetails] = useState({
    name: "Arandelle Paguinto",
    address: "Blk16 Lot 09 Sec24 Ph2 Pabahay 2000",
    message: "fire here",
  });

  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);

  useEffect(()=>{
    (async () =>{
      let {status} = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setResponderPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    })();
  }, []);
  
  useEffect(()=>{
    fetchRoute();
  }, [responderPosition]);

  const fetchRoute = async () => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${openRouteKey}&start=${responderPosition.longitude},${responderPosition.latitude}&end=${targetPosition.longitude},${targetPosition.latitude}`
      );
      const data = await  response.json();

      if (data.features && data.features.length > 0){
        const coordinates = data.features[0].geometry.coordinates;
        const formattedRoute = coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        setRoute(formattedRoute);
        setDistance(data.features[0].properties.summary.distance / 1000); //convert meters to kilometer
        setCurrentRouteIndex(0);
      }
    } catch (error){
      console.error('Error fetching route:', error)
    }
  };  

  const simulateMovement = () =>{
    if(currentRouteIndex < route.length -1 ){
      setResponderPosition(route[currentRouteIndex + 1]);
      setCurrentRouteIndex(currentRouteIndex + 1);
    }
  };

  return (
    <View className="flex-1">
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
          title="You are here"
          pinColor="#42a5f5"
        />
        <Marker coordinate={targetPosition}>
          <Callout className="flex flex-col w-60 p-3">
            <Text className="font-bold text-lg text-center">Emergency Details</Text>
            <Text className="text-lg">Name: <Text className="font-bold text-gray-400">{targetDetails.name}</Text></Text>
            <Text className="text-lg">Address: <Text className="font-bold text-gray-400">{targetDetails.address}</Text></Text>
            <Text className="text-lg">Message: <Text className="font-bold text-gray-400">{targetDetails.message}</Text></Text>
          </Callout>
        </Marker>
        <Polyline coordinates={route} strokeColor="red" strokeWidth={2} />
      </MapView>
      <View className="p-2 bg-white items-center">
      <Text>Distance to target: {distance.toFixed(2)} km</Text>
        <TouchableOpacity className="mt-2 p-3 bg-[#007AFF] rounded-lg" onPress={simulateMovement}>
          <Text className="text-white font-bold">Simulate Movement</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8
  }
});

export default Map;
