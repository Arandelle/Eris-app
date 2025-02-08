import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Image,
  SafeAreaView,
} from "react-native";
import useLocationTracking from "../hooks/useLocationTracking";
import useFetchData from "../hooks/useFetchData";
import useCurrentUser from "../hooks/useCurrentUser";
import useSendNotification from "../hooks/useSendNotification";
import { submitEmergencyReport } from "../hooks/useSubmitReport";
import useUploadImage from "../helper/UploadImage";
import TextInputStyle from "../component/TextInputStyle"; // Ensure this import is correct
import PickerField from "../component/PickerField";
import { set } from "firebase/database";
import { OfflineContext } from "../context/OfflineContext";

const Request = () => {
  const { isOffline, saveStoredData } = useContext(OfflineContext);
  const { photo, choosePhoto } = useUploadImage();
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [emergencyType, setEmergencyType] = useState("");
  const { sendNotification } = useSendNotification(description);
  const [refreshing, setRefreshing] = useState(false); // To track refresh state
  const [loading, setLoading] = useState(false); // Initialize loading state

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

  useEffect(() => {
    if (photo) {
      setImageFile(photo);
    }
  }, [photo]);

  const handleRefresh = () => {
    setRefreshing(true); // Set refreshing to true
    trackUserLocation();
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Create emergency request data
    const requestData = {
      currentUser,
      location,
      latitude,
      longitude,
      geoCodeLocation,
      description,
      imageFile,
      emergencyType,
      timestamp: Date.now(), // Store timestamp for expiration check
    };

    if (isOffline) {
      await saveStoredData("offlineRequest", requestData);

      Alert.alert("Offline Mode", "You are offline. Your request has been saved and will be sent once you are back online. (Valid for 30 mins)");
      setLoading(false);
      return;
    }

    try {
      await submitEmergencyReport({
        ...requestData,
        sendNotification,
        hasActiveRequest,
        responderData,
      });
      console.log(imageFile);
      Alert.alert("Emergency reported", "Help is on the way!");
      setDescription("");
      setLoading(false);
      setImageFile(null);
      setHasActiveRequest(true);
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not submit emergency report, please try again"
      );
      setLoading(false); // Ensure loading is set to false on error
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
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
            <View className="space-y-4">
              <Text>Description (Optional)</Text>
              <TextInput
                className="border p-2.5 rounded-md border-gray-300 bg-white text-sm"
                multiline
                numberOfLines={4}
                onChangeText={setDescription}
                value={description}
                placeholder="Briefly describe the emergency"
              />
            </View>

            <View>
              <PickerField
                label="Emergency Type"
                value={emergencyType}
                onValueChange={(emergencyType) =>
                  setEmergencyType(emergencyType)
                }
                items={[
                  { label: "Fire", value: "fire" },
                  { label: "Medical", value: "medical" },
                  { label: "Crime", value: "crime" },
                  { label: "Natural Disaster", value: "natural disaster" },
                  { label: "Other", value: "other" },
                ]}
              />
            </View>
            <View>
              <TextInputStyle
                label="Location"
                value={geoCodeLocation}
                placeholder="Enter location"
                editable={false}
              />
            </View>

            <TouchableOpacity
              className="p-2 bg-blue-800 w-1/3 rounded"
              onPress={choosePhoto}
            >
              <Text className="text-lg text-center text-white font-bold">
                Add Photo
              </Text>
            </TouchableOpacity>

            {photo && imageFile && (
              <View className="w-40 h-40 bg-gray-500">
                <Image source={{ uri: photo }} className="w-full h-full" />
              </View>
            )}
          </View>
        </ScrollView>
        <View className="p-5">
          <TouchableOpacity
            className="bg-red-600 p-3.5 rounded-md items-center"
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text className="text-white text-lg font-bold">
              Submit Emergency
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Request;
