import { useState } from "react";
import { Text, View, Image, ScrollView, RefreshControl } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import Logo from "../../assets/logo.png";
import responderMarker from "../../assets/ambulance.png";
import useLocationTracking from "../hooks/useLocationTracking";
import useRoute from "../hooks/useRoute";
import useCurrentUser from "../hooks/useCurrentUser";

const Map = () => {
  const { currentUser } = useCurrentUser();
  const [refreshing, setRefreshing] = useState(false);
  const { latitude, longitude, responderLocation, trackUserLocation } = useLocationTracking(currentUser, setRefreshing);
  const { route, distance } = useRoute(responderLocation, latitude, longitude);

  const handleRefresh = () => {
    setRefreshing(true);
    trackUserLocation();
  };

  if (!latitude || !longitude) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex w-full h-full items-center justify-center">
          <Image source={Logo} alt="Loading..." />
          <Text>Loading, please wait...</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        className="flex-1"
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* User Location Marker */}
        <Marker
          coordinate={{ latitude, longitude }}
          title={"Your Location"}
          pinColor="#42a5f5"
        />

        {/* Responder Location Marker */}
        {responderLocation && (
          <Marker
            coordinate={responderLocation}
            title="Responder"
            pinColor="red"
          >
            <Image source={responderMarker} className="h-12 w-12" />
          </Marker>
        )}

        {/* Route Polyline */}
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Distance Information */}
      {distance > 0 && (
        <View className="bg-gray-500 p-2">
          <Text className="text-white text-lg">
            Distance to responder: {distance.toFixed(2)} km
          </Text>
        </View>
      )}

      {/* Responder Location Information */}
      {responderLocation && (
        <View className="bg-gray-500 p-2">
          <Text className="text-white text-lg">
            Responder Location: {responderLocation.latitude}, {responderLocation.longitude}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Map;
