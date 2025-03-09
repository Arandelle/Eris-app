import { useMemo, useRef, useState } from "react";
import { Text, View, Image, ScrollView, RefreshControl } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import Logo from "../../assets/logo.png";
import responderMarker from "../../assets/ambulance.png";
import useLocationTracking from "../hooks/useLocationTracking";
import useRoute from "../hooks/useRoute";
import useCurrentUser from "../hooks/useCurrentUser";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import useFetchData from "../hooks/useFetchData";
import colors from "../constant/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Map = () => {
  const { currentUser } = useCurrentUser();
  const { data: responderData } = useFetchData("responders");
  const [refreshing, setRefreshing] = useState(false);
  const { latitude, longitude, responderLocation, trackUserLocation } =
    useLocationTracking(currentUser, setRefreshing);
  const { route, distance } = useRoute(responderLocation, latitude, longitude);
  const [initialIndex, setInitialIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const responderDetails = responderData?.find(
    (user) => user.id === currentUser?.activeRequest?.responderId
  );

  const { img, fullname, customId } = responderDetails || {};

  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["30%", "50%"], []);

  const handleRefresh = () => {
    setRefreshing(true);
    trackUserLocation();
  };

  const placeLocation = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
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
          onPress={placeLocation}
        >
          {/* User Location Marker */}
          <Marker
            coordinate={{ latitude, longitude }}
            title={"Your Location"}
            pinColor={colors.blue[800]}
          />

          {/* Responder Location Marker */}
          {responderLocation && (
            <Marker
              coordinate={responderLocation}
              title="Responder"
              pinColor={colors.red[800]}
              onPress={openBottomSheet} // Open bottom sheet when marker is pressed
            >
              <Image source={responderMarker} className="h-10 w-10" />
            </Marker>
          )}

          {selectedLocation && (
            <Marker coordinate={selectedLocation} title="Your selected location" pinColor={colors.green[800]}/>
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
            <View className="">
              <View className="flex flex-row py-2 px-6 space-x-4 items-center border-b border-b-gray-300">
                <View className="bg-gray-100 rounded-lg p-3">
                  <Icon name="map-marker" size={30} color={colors.red[400]} />
                </View>
                <View className="">
                  <Text className="text-xl text-red-500 font-bold">
                    {distance.toFixed(2)} km Distance
                  </Text>
                  <Text className="text-gray-400 font-bold">
                    Bagtas, Tanza Cavite
                  </Text>
                </View>
              </View>

              <View className="flex flex-row h-28 items-center px-6 space-x-4 bg-white rounded-lg shadow-md">
                <View className="rounded-full border-2 border-green-300 p-1">
                  <Image
                    source={{ uri: img }}
                    className="h-14 w-14 rounded-full"
                  />
                </View>

                <View className="flex-1 space-y-2">
                  <View>
                    <Text className="text-xl font-semibold text-gray-800">
                      {`${fullname}`}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      ID: {customId}
                    </Text>
                  </View>
                  <Text className="w-64 text-sm text-gray-600 leading-5">
                    I’m on my way to your location. Please remain calm; I’ll be
                    there to assist you shortly.
                  </Text>
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
