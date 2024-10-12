import React, { useEffect } from "react";
import { Text, View, Image } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import Logo from "../../assets/logo.png";
import responderMarker from "../../assets/ambulance.png";
import useLocationTracking from "../hooks/useLocationTracking";

const Map = ({ userData }) => {
  const { location, latitude, longitude, geoCodeLocation, responderLocation } = useLocationTracking(userData);

  if (!latitude || !longitude) {
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
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
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
      </MapView>
      {responderLocation && (
        <View className="bg-gray-500 p-2">
          <Text className="text-white text-lg">Responder Location: {responderLocation.latitude}, {responderLocation.longitude}</Text>
        </View>
      )}
    </View>
  );
};

export default Map;
