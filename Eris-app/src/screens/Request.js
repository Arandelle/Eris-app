import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import useLocationTracking from "../hooks/useLocationTracking";
import useFetchData from "../hooks/useFetchData";
import useCurrentUser from "../hooks/useCurrentUser";
import useSendNotification from "../hooks/useSendNotification";
import { submitEmergencyReport } from "../hooks/useSubmitReport";

const Request = () => {
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [description, setDescription] = useState("");
  const { sendNotification } = useSendNotification(description);
  const [refreshing, setRefreshing] = useState(false); // To track refresh state

  const { currentUser } = useCurrentUser();
  const { data: responderData } = useFetchData("responders");
  const { location, latitude, longitude, geoCodeLocation, trackUserLocation } =
    useLocationTracking(currentUser, setRefreshing);

  useEffect(() => {
    if (currentUser?.activeRequest) {
      setHasActiveRequest(true);
    }
    setHasActiveRequest(false);
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true); // Set refreshing to true
    trackUserLocation();
  };

  const handleSubmit = async () => {
    try {
      await submitEmergencyReport({
        currentUser,
        location,
        latitude,
        longitude,
        geoCodeLocation,
        description,
        sendNotification,
        hasActiveRequest,
        responderData
      });
      
      Alert.alert("Emergency reported", "Help is on the way!");
      setDescription("");
      setHasActiveRequest(true);
    } catch (error) {
      Alert.alert("Error", "Could not submit emergency report, please try again");
    }
  };
  
  return (
    <ScrollView
      className="flex-1 p-5 bg-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text className="font-bold text-xl text-center text-red-600 mb-5">
       Submit Detailed Report
      </Text>

      {hasActiveRequest && (
        <Text className="text-lg bg-green-100 p-4 text-gray-900 mb-5 rounded-md">
          You have an active emergency report. Please wait for it to be
          resolved.
        </Text>
      )}

      <View className="space-y-5">
        <View>
          <Text className="text-lg mb-1 text-gray-500">Description (Optional)</Text>
          <TextInput
            className="border p-2.5 rounded-md border-gray-300 bg-white text-sm"
            multiline
            numberOfLines={4}
            onChangeText={setDescription}
            value={description}
            placeholder="Briefly describe the emergency"
          />
        </View>

        <TouchableOpacity className="p-2 bg-blue-800 w-1/3 rounded">
          <Text className="text-lg text-center text-white font-bold">Add Photo</Text>
        </TouchableOpacity>

        <View>
          <Text className="text-lg mb-1 text-gray-600">Location:</Text>
          <TextInput
            className="border p-2.5 rounded-md border-gray-300 bg-gray-300 text-lg text-gray-900"
            onChangeText={geoCodeLocation}
            value={location}
            placeholder="Your current location"
            editable={false} // Read-only
          />
        </View>
        <TouchableOpacity
          className="bg-red-600 p-3.5 rounded-md items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white text-lg font-bold">Submit Emergency</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Request;
