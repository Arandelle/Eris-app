import { useMemo, useRef, useState } from "react";
import {
  Text,
  View,
  Image,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import Logo from "../../assets/logo.png";
import responderMarker from "../../assets/ambulance.png";
import useLocationTracking from "../hooks/useLocationTracking";
import useRoute from "../hooks/useRoute";
import useCurrentUser from "../hooks/useCurrentUser";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import useFetchData from "../hooks/useFetchData";

const Map = () => {
  const { currentUser } = useCurrentUser();
  const { data: responderData } = useFetchData("responders");
  const [refreshing, setRefreshing] = useState(false);
  const { latitude, longitude, responderLocation, trackUserLocation } =
    useLocationTracking(currentUser, setRefreshing);
  const { route, distance } = useRoute(responderLocation, latitude, longitude);
  const [initialIndex, setInitialIndex] = useState(0);

  const responderDetails = responderData?.find(
    (user) => user.id === currentUser?.activeRequest?.responderId
  );
  const { img, firstname, lastname, customId } = responderDetails || {};

  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["30%"], []);

  const handleRefresh = () => {
    setRefreshing(true);
    trackUserLocation();
  };

  const openBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(initialIndex); // Open the bottom sheet to the first snap point
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
          <Text>Map loading...</Text>
          <Text className="font-bold">
            Try turning on your device's location
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <>
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
              onPress={openBottomSheet} // Open bottom sheet when marker is pressed
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
        <BottomSheet
          ref={bottomSheetRef}
          index={responderLocation ? initialIndex : -1} // Start hidden
          snapPoints={snapPoints}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={{ flex: 1 }}>
            <View className="px-6 py-4 my-4 bg-white shadow-lg border border-gray-200">
              <View className="flex flex-row items-center space-x-4">
                <View className="rounded-full overflow-hidden border-4 border-green-500">
                  <Image
                    source={{ uri: img }}
                    className="h-20 w-20 rounded-full"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xl font-semibold text-gray-800">
                    {`${firstname} ${lastname}`}
                  </Text>
                  <Text className="text-sm text-gray-500">ID: {customId}</Text>

                  <View className="mt-2">
                    <Text className="text-base font-medium text-green-600">
                      Distance: {distance.toFixed(2)} km
                    </Text>
                  </View>

                  <View className="mt-3">
                    <Text className="text-sm font-medium text-gray-800">
                      Responder Location:
                    </Text>
                    <View className="flex flex-row items-center mt-1">
                      <Text className="text-sm text-gray-500 w-1/3">
                        Latitude:
                      </Text>
                      <Text className="text-sm text-gray-700">
                        {responderLocation.latitude}
                      </Text>
                    </View>
                    <View className="flex flex-row items-center mt-1">
                      <Text className="text-sm text-gray-500 w-1/3">
                        Longitude:
                      </Text>
                      <Text className="text-sm text-gray-700">
                        {responderLocation.longitude}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </>
  );
};

export default Map;
