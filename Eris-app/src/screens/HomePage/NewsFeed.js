import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  View,
  StatusBar,
  SafeAreaView,
} from "react-native";
import colors from "../../constant/colors";
import useFetchData from "../../hooks/useFetchData";
import ProfileReminderModal from "../../component/ProfileReminderModal";
import useCurrentUser from "../../hooks/useCurrentUser";
import useLocationTracking from "../../hooks/useLocationTracking";
import { submitEmergencyReport } from "../../hooks/useSubmitReport";
import useSendNotification from "../../hooks/useSendNotification";
import Hotlines from "./Hotlines";
import Announcement from "./Announcement";
import ImmediateEmergency from "./ImmediateEmergency";
import { OfflineContext } from "../../context/OfflineContext";
import Header from "./Header";

const NewsFeed = ({ dayTime, isVerified }) => {
  const { data: responderData } = useFetchData("responders");
  const { storedData } = useContext(OfflineContext);
  const { currentUser } = useCurrentUser();
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { location, latitude, longitude, geoCodeLocation, trackUserLocation } =
    useLocationTracking(currentUser, setRefreshing);
  const { sendNotification } = useSendNotification();
  const [loading, setLoading] = useState(false);
  const [isBellSwipe, setIsBellSwipe] = useState(false);
  const [emergencyType, setEmergencyType] = useState("");

  useEffect(() => {
    if (currentUser && currentUser?.activeRequest) {
      setHasActiveRequest(true);
    } else {
      setHasActiveRequest(false);
    }
  }, [currentUser, refreshing]);

  useEffect(() => {
    trackUserLocation();
  }, []);

  const handleConfirmReport = async () => {
    setLoading(true);

    const requestData = {
      currentUser: currentUser || storedData.currentUser,
      location: location || storedData.currentUser.location.geoCodeLocation,
      latitude: latitude || storedData.currentUser.location.latitude,
      longitude: longitude || storedData.currentUser.location.longitude,
      geoCodeLocation:
        geoCodeLocation || storedData.currentUser.location.geoCodeLocation,
      description: "",
      media: {
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
    try {
      await submitEmergencyReport({
        data: requestData,
        sendNotification,
      });
      Alert.alert("Emergency reported", "Help is on the way!");
      setLoading(false);
      setIsBellSwipe(false);
    } catch (error) {
      Alert.alert(
        "Error",
        `Could not submit emergency alert, please try again ${error}`
      );
      setLoading(false);
      setIsBellSwipe(false);
    }
  };

  if (loading)
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator
          size={"large"}
          color={colors.blue[800]}
          animating={true}
        />
        <Text className="text-xl">Please stay calm...</Text>
      </SafeAreaView>
    );

  return (
    <>
      {isBellSwipe && (
        <ImmediateEmergency
          isBellSwipe={isBellSwipe}
          setIsBellSwipe={setIsBellSwipe}
          handleConfirmReport={handleConfirmReport}
          emergencyType={emergencyType}
          setEmergencyType={setEmergencyType}
        />
      )}

      <ProfileReminderModal />

      <View className="flex-1 bg-gray-200">
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.blue[800]}
        />
        <Header
          isVerified={isVerified}
          dayTime={dayTime}
          setIsBellSwipe={setIsBellSwipe}
          content={
            <>
              {/** Main content hotlines and announcement */}
              <View className="flex-1 p-3 bg-white space-y-3">
                <Hotlines />
                <Announcement />
              </View>
            </>
          }
        />
        {/* Main ScrollView Content */}
      </View>
    </>
  );
};

export default NewsFeed;
