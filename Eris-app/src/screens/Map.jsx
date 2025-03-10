import { useMemo, useRef, useState, useEffect } from "react";
import { Text, View, Image, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import Logo from "../../assets/logo.png";
import responderMarker from "../../assets/ambulance.png";
import useLocationTracking from "../hooks/useLocationTracking";
import useRouteMap from "../hooks/useRoute";
import useCurrentUser from "../hooks/useCurrentUser";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import useFetchData from "../hooks/useFetchData";
import colors from "../constant/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useRoute } from "@react-navigation/native";
import * as Location from "expo-location";

const Map = () => {
  const navigation = useNavigation();
  const routeParams = useRoute();
  const label = routeParams.params?.label;
  const { currentUser } = useCurrentUser();
  const { data: responderData } = useFetchData("responders");
  const [refreshing, setRefreshing] = useState(false);
  const { latitude, longitude, responderLocation, trackUserLocation } =
    useLocationTracking(currentUser, setRefreshing);

  const [activeEmergencyCoords, setActiveEmergencyCoords] = useState({});

  useEffect(() => {

    if(currentUser?.activeRequest){
      setActiveEmergencyCoords({
        latitude: currentUser.activeRequest?.latitude,
        longitude: currentUser.activeRequest?.longitude
      })
    }
    
  },[currentUser]);

  const { route, distance } = useRouteMap(responderLocation, activeEmergencyCoords.latitude, activeEmergencyCoords.longitude);
  const [initialIndex, setInitialIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSetLocationButton, setShowSetLocationButton] = useState(false);
  const [geoCodedAddress, setGeoCodedAddress] = useState("");

  const responderDetails = responderData?.find(
    (user) => user.id === currentUser?.activeRequest?.responderId
  );

  const { img, fullname, customId } = responderDetails || {};

  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);

  const snapPoints = useMemo(() => ["30%", "50%"], []);

  useEffect(() => {
    if (selectedLocation) {
      reverseGeocode(selectedLocation);
    }
  }, [selectedLocation]);

  const reverseGeocode = async (location) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      if (result && result.length > 0) {
        const {name, city, region, country} = result[0];
        const locString = `${name ? name : ""} - ${city}, ${region}, ${country}`;
        setGeoCodedAddress(locString.trim());
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setGeoCodedAddress("Location address not available");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    trackUserLocation();
  };

  const placeLocation = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
    setShowSetLocationButton(true);
  };

  const openBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(initialIndex);
  };

  const handleSetLocation = () => {
    if (selectedLocation) {
      navigation.navigate("Request", {
        selectedLocation: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          geoCodedAddress: geoCodedAddress
        }
      });
    }
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
  };

  return (
    <>
      <View className="flex-1">
        {label && (
          <View className="absolute top-0 p-4 bg-blue-800 shadow-md w-full z-10">
            <Text className="text-center text-white font-bold">{label}</Text>
          </View>
        )}
        <MapView
          ref={mapRef}
          className="flex-1"
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={label ? placeLocation : null}
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
              onPress={openBottomSheet}
            >
              <Image source={responderMarker} className="h-10 w-10" />
            </Marker>
          )}

          {/* Draggable Selected Location Marker */}
          {(selectedLocation || activeEmergencyCoords) &&(
            <Marker
              coordinate={selectedLocation || activeEmergencyCoords}
              title="Your selected location"
              description={geoCodedAddress}
              pinColor={colors.green[800]}
              draggable={true}
              onDragEnd={placeLocation}
            />
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

        {/* Set Location Button */}
        {showSetLocationButton && selectedLocation && (
          <View className="absolute bottom-6 w-full items-center">
            <TouchableOpacity
              onPress={handleSetLocation}
              className="bg-blue-800 py-3 px-6 rounded-lg shadow-lg"
            >
              <Text className="text-white font-bold text-lg">Set Location</Text>
            </TouchableOpacity>
          </View>
        )}

        <BottomSheet
          ref={bottomSheetRef}
          index={responderLocation ? initialIndex : -1}
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
                    I'm on my way to your location. Please remain calm; I'll be
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