import { useContext, useEffect, useMemo, useRef, useState } from "react";
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
import useLocationTracking from "../../hooks/useLocationTracking";
import useFetchData from "../../hooks/useFetchData";
import useCurrentUser from "../../hooks/useCurrentUser";
import useSendNotification from "../../hooks/useSendNotification";
import { submitEmergencyReport } from "../../hooks/useSubmitReport";
import useUploadImage from "../../helper/UploadImage";
import TextInputStyle from "../../component/TextInputStyle"; // Ensure this import is correct
import PickerField from "../../component/PickerField";
import { OfflineContext } from "../../context/OfflineContext";
import useViewImage from "../../hooks/useViewImage";
import ImageViewer from "react-native-image-viewing";
import MyBottomSheet from "../../component/MyBottomSheet";
import useFetchRecords from "../../hooks/useFetchRecords";
import EmergencyDetailsSheet from "../../component/EmergencyDetailsSheet";
import { get, ref, remove } from "firebase/database";
import { database, storage } from "../../services/firebaseConfig";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { Video } from "expo-av";
import HasActiveRequest from "../../component/HasActiveRequest";
import { useNavigation } from "@react-navigation/native";

const Request = () => {
  const navigation = useNavigation()
  const bottomSheetRef = useRef(null);
  const videoRef = useRef(null);
  const { currentUser, userInfo } = useCurrentUser();
  const { data: responderData } = useFetchData("responders");
  const { data: hotlines } = useFetchData("hotlines");
  const { file, setFile, chooseFile } = useUploadImage();
  const statuses = useMemo(() => ["pending", "on-going"], []);

  const { emergencyHistory } = useFetchRecords({ status: statuses });

  const { location, latitude, longitude, geoCodeLocation, trackUserLocation } =
    useLocationTracking(currentUser, setRefreshing);
  const { isOffline, saveStoredData, removeStoredData, storedData } =
    useContext(OfflineContext);
  const { sendNotification } = useSendNotification();
  const {
    isImageModalVisible,
    selectedImageUri,
    handleImageClick,
    closeImageModal,
  } = useViewImage();

  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState("");
  const [description, setDescription] = useState("");
  const [emergencyType, setEmergencyType] = useState("medical");
  const [refreshing, setRefreshing] = useState(false); // To track refresh state
  const [loading, setLoading] = useState(false); // Initialize loading state
  const [recommendedHotlines, setRecommendedHotlines] = useState([]);

  const reportDetails =
    emergencyHistory.length > 0
      ? emergencyHistory.find((report) => report.id === activeRequestId)
      : null;

  const getFormattedReportDetails = () => {
    if (reportDetails) {
      // Already in the correct format
      return reportDetails;
    } else if (
      isOffline &&
      (storedData.offlineRequest || storedData.activeRequestData)
    ) {
      const activeRequestData =
        storedData.offlineRequest || storedData.activeRequestData;
      // Convert offlineRequest to match reportDetails structure
      return {
        emergencyId: activeRequestData.tempRequestId || `offline_${Date.now()}`,
        emergencyType: activeRequestData.emergencyType,
        status: activeRequestData.status,
        timestamp: activeRequestData.timestamp,
        date: new Date(activeRequestData.timestamp),
        location: {
          geoCodeLocation:
            activeRequestData.geoCodeLocation || activeRequestData.location,
        },
        description: activeRequestData.description,
        media: {
          mediaType: activeRequestData.media?.type || "",
          mediaUrl: activeRequestData.media?.uri || "",
        },
      };
    }
    return null;
  };

  const formattedReportDetails = getFormattedReportDetails();

  // recommended hotlines
  useEffect(() => {
    let recommended = [];

    if (currentUser?.activeRequest && reportDetails) {
      recommended = hotlines.filter(
        (hotline) => hotline.category === reportDetails.emergencyType
      );
      console.log("recommended hotlines (online):", recommended);
    }

    if (
      isOffline &&
      (storedData.offlineRequest || storedData.activeRequestData)
    ) {
      const emergencyType =
        storedData.offlineRequest?.emergencyType ||
        storedData.activeRequestData?.emergencyType;
      recommended = storedData.hotlines.filter(
        (hotline) => hotline.category === emergencyType
      );
    }

    setRecommendedHotlines(recommended);
    console.log("Updated recommended hotlines:", recommended);
  }, [
    currentUser,
    reportDetails,
    refreshing,
    isOffline,
    storedData.hotlines,
    storedData.offlineRequest,
    storedData.activeRequestData,
  ]);

  // check emergency status
  useEffect(() => {
    const checkActiveRequest = async () => {
      try {
        if (currentUser?.activeRequest) {
          setHasActiveRequest(true);
          setActiveRequestId(currentUser?.activeRequest?.requestId);
        } else if (isOffline) {
          if (storedData.offlineRequest || storedData.activeRequestData) {
            const activeRequestData =
              storedData.offlineRequest || storedData.activeRequestData;
            setHasActiveRequest(true);
            setHasActiveRequest(activeRequestData.tempRequestId || "");
          }
        } else {
          setHasActiveRequest(false);
          setActiveRequestId("");
        }
      } catch (error) {
        Alert.alert("Error", `${error}`);
      }
    };
    console.log("active request id:", activeRequestId);
    checkActiveRequest();
  }, [currentUser, isOffline, storedData, refreshing]);

  const handleRefresh = async () => {
    setRefreshing(true); // Start refresh animation

    if (isOffline) {
      setLoading(true);
      setRefreshing(false);
      Alert.alert("Network unstable", "Try checking your internet!");
    } else {
      try {
        await trackUserLocation();
      } catch (error) {
        Alert.alert("Location tracking failed", "Please try again.");
      } finally {
        setRefreshing(false);
      }
    }

    setLoading(false); // Ensure this is set correctly
  };

  const handleSubmit = async () => {
    setLoading(true);
    console.log("loading...");
    // Create emergency request data
    const requestData = {
      currentUser: currentUser || storedData.currentUser,
      location: location || storedData.currentUser.location.geoCodeLocation,
      latitude: latitude || storedData.currentUser.location.latitude,
      longitude: longitude || storedData.currentUser.location.longitude,
      geoCodeLocation:
        geoCodeLocation || storedData.currentUser.location.geoCodeLocation,
      description,
      media: file?.uri
        ? {
            uri: file.uri || storedData.media.uri || "",
            type: file.type || storedData.media.type || "",
          }
        : {
            uri: "",
            type: "",
          },
      emergencyType,
      status: "pending",
      timestamp: Date.now(), // Store timestamp for expiration check
      hasActiveRequest: hasActiveRequest || false,
      responderData: responderData || storedData.responders,
      tempRequestId: `offline_${Date.now()}`,
    };

    if (isOffline) {
      await saveStoredData("offlineRequest", requestData);
      await saveStoredData("activeRequestData", requestData);

      Alert.alert(
        "Offline Mode",
        "You are offline. Your request has been saved and will be sent once you are back online. (Valid for 30 mins)"
      );
      setLoading(false);
      return;
    }

    try {
      await submitEmergencyReport({
        data: requestData,
        sendNotification,
      });
      await saveStoredData("activeRequestData", requestData);
      Alert.alert("Emergency reported!", "Help is on the way!");
      setDescription("");
      setLoading(false);
      setFile({});
      setHasActiveRequest(true);
    } catch (error) {
      Alert.alert(
        "Error",
        `Could not submit emergency report, please try again ${error}`
      );
      console.error("Error submitting emergency report: ", error);
      setLoading(false); // Ensure loading is set to false on error
    }
  };

  const handleDeleteClick = () => {
    Alert.alert(
      "Cancel Report?",
      "Are you sure you want to cancel your emergency report?",
      [
        {
          text: "Confirm",
          onPress: () => handleDeleteReport(activeRequestId),
        },
        {
          text: "Cancel",
        },
      ]
    );
  };

  const handleDeleteReport = async (id) => {
    const activeRequestRef = ref(
      database,
      `users/${userInfo?.uid}/activeRequest`
    );
    const reportRef = ref(
      database,
      `users/${userInfo?.uid}/emergencyHistory/${id}`
    );
    const mainReportRef = ref(database, `emergencyRequest/${id}`);
    setLoading(true);
    try {
      if (id) {
        const snapshot = await get(reportRef);

        if (snapshot.exists()) {
          const reportData = snapshot.val();
          const imagePath = reportData.imageUrl;

          await remove(reportRef);
          await remove(activeRequestRef);
          await remove(mainReportRef);

          if (imagePath) {
            const imageRef = storageRef(storage, imagePath);
            await deleteObject(imageRef);
          }

          Alert.alert("Deleted", "You have successfully deleted your request");
          await removeStoredData("offlineRequest");
          await removeStoredData("activeRequestData");
          setLoading(false);
        }
        setLoading(false);
      }
    } catch (error) {
      Alert.alert("Error", error);
      setLoading(false);
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
            <View className="space-y-2 my-2">
              {isOffline && (
                <Text className="bg-gray-500 text-white font-bold p-4 rounded-md">
                  ⚠️ Your network is unstable
                </Text>
              )}
              {hasActiveRequest && (
                <View className="space-y-2">
                  <View className="bg-red-100 p-4 shadow-md rounded-md">
                    <Text className="text-red-500 text-justify font-extrabold">
                      ⚠️ You have an active emergency report. Please wait for it
                      to be resolved
                      <TouchableOpacity
                        onPress={() =>
                          bottomSheetRef.current?.openBottomSheet()
                        }
                      >
                        <Text className="underline"> See details</Text>
                      </TouchableOpacity>
                    </Text>
                  </View>
                  <View>
                    <HasActiveRequest
                      recommendedHotlines={recommendedHotlines}
                    />
                  </View>
                </View>
              )}
              {!hasActiveRequest && (
                <View className="space-y-5">
                  <Text className="font-bold text-xl text-center text-red-600 mb-5">
                    Submit Detailed Report
                  </Text>
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
                        {
                          label: "Natural Disaster 🌪️",
                          value: "natural disaster",
                        },
                        { label: "Other ⚠️", value: "other" },
                      ]}
                    />
                  </View>
                  <View className="flex flex-row space-x-2">
                      <View className="flex-1 basis-3/4">
                        <TextInputStyle
                          label="Location"
                          value={geoCodeLocation}
                          placeholder="Enter location"
                          editable={false}
                        />
                      </View>
                       <View className="space-y-2">
                        <Text>Find on map</Text>
                         <TouchableOpacity
                          className="p-4 flex-1 basis-1/4 rounded-md border border-gray-300 bg-white"
                          onPress={() => navigation.navigate("Map", {label: "Select location with emergency!"})}
                        >
                          <Text className="text-center whitespace-nowrap">
                            Select 📍
                          </Text>
                        </TouchableOpacity>
                       </View>
                      
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
                  {file.uri ? (
                    <View className="flex flex-row justify-center space-x-4">
                      {file.type === "image" ? (
                        <View className="w-60 h-60">
                          <TouchableOpacity
                            onPress={() => handleImageClick(file.uri)}
                          >
                            <Image
                              source={{ uri: file.uri }}
                              className="w-full h-full"
                            />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        file.type === "video" && (
                          <View className="relative place-self-center">
                            <Video
                              ref={videoRef}
                              source={{ uri: file.uri }}
                              style={{ width: 300, height: 200 }}
                              useNativeControls
                              resizeMode="contain"
                            />
                          </View>
                        )
                      )}

                      <View className="flex flex-col space-y-2">
                        <TouchableOpacity
                          className="p-2 bg-green-500 border border-green-600"
                          onPress={chooseFile}
                        >
                          <Text className="text-white font-bold">Edit 📝</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="p-2 border border-red-500"
                          onPress={() => setFile({})}
                        >
                          <Text>Delete❌</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      className={`p-4 bg-blue-800 rounded-md ${
                        hasActiveRequest ? "bg-blue-800/50" : "bg-blue-800"
                      }`}
                      onPress={chooseFile}
                      disabled={loading || hasActiveRequest}
                    >
                      <Text className="text-center text-white font-bold">
                        Add File 📷
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/** submit button */}
        {!hasActiveRequest && (
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
        )}
        {/** detatils of emergency report */}
        <MyBottomSheet
          children={
            <EmergencyDetailsSheet
              reportDetails={formattedReportDetails}
              onCancel={handleDeleteClick}
            />
          }
          ref={bottomSheetRef}
        />
      </SafeAreaView>
    </>
  );
};

export default Request;
