import { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
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
import { OfflineContext } from "../context/OfflineContext";
import useViewImage from "../hooks/useViewImage";
import ImageViewer from "react-native-image-viewing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import MyBottomSheet from "../helper/MyBottomSheet";

const Request = () => {
  const bottomSheetRef = useRef(null);
  const navigation = useNavigation();
  const { isOffline, saveStoredData, storedData } = useContext(OfflineContext);
  const { photo, choosePhoto } = useUploadImage();
  const {
    isImageModalVisible,
    selectedImageUri,
    handleImageClick,
    closeImageModal,
  } = useViewImage();
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
    const checkActiveRequest = async () => {
      try {
        const checkIfHasRequest = await AsyncStorage.getItem(
          "hasActiveRequest"
        );

        if (currentUser?.activeRequest) {
          setHasActiveRequest(true);
          await AsyncStorage.setItem("hasActiveRequest", JSON.stringify(true));
        } else if (isOffline && checkIfHasRequest) {
          setHasActiveRequest(true);
        } else {
          setHasActiveRequest(false);
          await AsyncStorage.removeItem("hasActiveRequest");
        }
      } catch (error) {
        Alert.alert("Error", `${error}`);
      }
    };

    checkActiveRequest();
  }, [currentUser, refreshing]);

  useEffect(() => {
    if (photo) {
      setImageFile(photo);
    }
  }, [photo]);

  const handleRefresh = async () => {
    setRefreshing(true); // Start refresh animation

    if (isOffline) {
      setLoading(true);
    } else {
      await trackUserLocation();
    }

    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
      if (isOffline) {
        Alert.alert("Network unstable", "Try checking your internet!");
      }
    }, 2000); // Stop refreshing after 1 sec
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Create emergency request data
    const requestData = {
      currentUser: currentUser || storedData.currentUser,
      location: location || storedData.currentUser.location.address,
      latitude: latitude || storedData.currentUser.location.latitude,
      longitude: longitude || storedData.currentUser.location.latitude,
      geoCodeLocation:
        geoCodeLocation || storedData.currentUser.location.address,
      description,
      imageFile,
      emergencyType,
      timestamp: Date.now(), // Store timestamp for expiration check
      sendNotification,
      hasActiveRequest: hasActiveRequest || false,
      responderData: responderData || storedData.responders,
    };

    if (isOffline) {
      await saveStoredData("offlineRequest", requestData);

      Alert.alert(
        "Offline Mode",
        "You are offline. Your request has been saved and will be sent once you are back online. (Valid for 30 mins)"
      );
      setLoading(false);
      return;
    }

    try {
      await submitEmergencyReport({
        ...requestData,
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
        `Could not submit emergency report, please try again ${error}`
      );
      setLoading(false); // Ensure loading is set to false on error
    }
  };

  if (loading) {
    return (
      <View className="flex items-center justify-center h-full">
        <Text>Loading please wait...</Text>
      </View>
    );
  }

  return (
    <>
      <ImageViewer
        images={[{ uri: selectedImageUri }]}
        imageIndex={0}
        visible={isImageModalVisible}
        onRequestClose={closeImageModal}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 bg-gray-100"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View className="p-5">
            <Text className="font-bold text-xl text-center text-red-600 mb-5">
              Submit Detailed Report
            </Text>
            <View className="space-y-2 my-2">
              {isOffline && (
                <Text className="bg-gray-500 text-white font-bold p-4 rounded-md">
                  ⚠️ Your network is unstable
                </Text>
              )}
              {hasActiveRequest && (
                <View className="bg-red-100 p-4 shadow-md rounded-md">
                  <Text className="text-red-500 text-justify font-extrabold">
                    ⚠️ You have an active emergency report. Please wait for it
                    to be resolved
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Emergency Records")}
                    >
                      <Text className="underline"> See details</Text>
                    </TouchableOpacity>
                  </Text>
                </View>
              )}
            </View>

            <View className="space-y-5">
              <View>
                <PickerField
                  label="Emergency Type"
                  value={emergencyType}
                  onValueChange={(emergencyType) =>
                    setEmergencyType(emergencyType)
                  }
                  items={[
                    { label: "Medical 🚑", value: "medical" },
                    { label: "Fire 🚒", value: "fire" },
                    { label: "Crime 🕵️‍♂️", value: "crime" },
                    { label: "Natural Disaster 🌪️", value: "natural disaster" },
                    { label: "Other ⚠️", value: "other" },
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
              <View>
                <TextInputStyle
                  label={"Description (Optional)"}
                  placeholder="Briefly describe the emergency"
                  multiline
                  numberOfLines={4}
                  onChangeText={setDescription}
                  value={description}
                />
              </View>
              {photo && imageFile ? (
                <View className="flex flex-row justify-center space-x-4">
                <View className="w-60 h-60">
                    <TouchableOpacity onPress={() => handleImageClick(photo)}>
                      <Image source={{ uri: photo }} className="w-full h-full" />
                    </TouchableOpacity>
                </View>
                  <View className="flex flex-col space-y-2">
                  <TouchableOpacity className="p-2 bg-green-500 border border-green-600" onPress={choosePhoto}>
                    <Text className="text-white font-bold">Edit 📝</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="p-2 border border-red-500" onPress={() => setImageFile(null)}>
                    <Text>Delete❌</Text>
                  </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  className="p-4 bg-blue-800 rounded-md flex "
                  onPress={choosePhoto}
                >
                  <Text className="text-center w-full flex text-white font-bold">
                    Add Photo 📷
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity onPress={() => bottomSheetRef.current?.openBottomSheet()}><Text>Click to show bottom modal</Text></TouchableOpacity>
        <View className="px-5 py-4">
          <TouchableOpacity
            className={`${
              hasActiveRequest ? "bg-red-200" : "bg-red-600"
            } p-3.5 rounded-md items-center`}
            onPress={handleSubmit}
            disabled={loading || hasActiveRequest}
          >
            <Text className="text-white text-lg font-bold">
              Submit Emergency
            </Text>
          </TouchableOpacity>
        </View>
          
          
        <MyBottomSheet children={
          <View>
            <Text>Hello guys</Text>
          </View>
        } 
          index={true}
          ref={bottomSheetRef}
        />
      </SafeAreaView>
    </>
  );
};

export default Request;
