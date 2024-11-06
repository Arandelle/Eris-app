import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Pressable,
  Image,
  Linking,
  Modal,
  Button,
  TextInput
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../constant/colors";
import useFetchData from "../hooks/useFetchData";
import ProfileReminderModal from "../component/ProfileReminderModal";
import { hotlineNumbers } from "../data/hotlines";
import { formatDate } from "../helper/FormatDate";
import { getTimeDifference } from "../helper/getTimeDifference";
import useCurrentUser from "../hooks/useCurrentUser";
import useLocationTracking from "../hooks/useLocationTracking";
import { submitEmergencyReport } from "../hooks/useSubmitReport";
import useSendNotification from "../hooks/useSendNotification";
import { handleAccountLinking } from "../hooks/useLinkAnonymous";
import { auth } from "../services/firebaseConfig";

const HEADER_MAX_HEIGHT = 240;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const ScrollViewScreen = ({ dayTime }) => {
  const { data: announcement } = useFetchData("announcement");
  const { data: responderData } = useFetchData("responders");
  const { currentUser } = useCurrentUser();
  const { location, latitude, longitude, geoCodeLocation, trackUserLocation } =
    useLocationTracking(currentUser);
  const { sendNotification } = useSendNotification();
  const [isImageModalVisible, setIsImageModalVisible] = useState(false); // State to control modal visibility
  const [selectedImageUri, setSelectedImageUri] = useState(""); // State to hold the image URI to be shown in modal
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    trackUserLocation();
  }, []);

  const fullname = [currentUser?.firstname, currentUser?.lastname]
    .filter(Boolean)
    .join(" ");

  // Animate the main header
  const headerHeight = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  // Animate the header content opacity
  const headerContentOpacity = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Animate the sticky header opacity
  const stickyHeaderOpacity = scrollOffsetY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
    { useNativeDriver: false }
  );

  const handleImageClick = (imageUri) => {
    setSelectedImageUri(imageUri);
    setIsImageModalVisible(true); // Show the image modal
  };

  const openDialerOrEmail = (value, type) => {
    if (type === "phone") {
      Linking.openURL(`tel:${value}`);
    } else if (type === "email") {
      Linking.openURL(`mailto:${value}`);
    } else if (type === "links") {
      Linking.openURL(value);
    }
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleConfirmReport = async () => {
    try {
      await submitEmergencyReport({
        currentUser,
        location,
        latitude,
        longitude,
        geoCodeLocation,
        sendNotification,
        responderData,
      });
      Alert.alert("Emergency reported", "Help is on the way!");
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not submit emergency alert, please try again"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await handleAccountLinking(auth, email, password);
      
      if (result) {
        // Show success message
        alert("Account successfully linked! Please check your email for verification.");
      }
    } catch (error) {
      // Show error message
      alert("Failed to link account. Please try again.");
    }
  };

  return (
    <>
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        onRequestClose={() => setIsImageModalVisible(false)} // Close modal when back button is pressed
      >
        <ImageViewer
          imageUrls={[{ url: selectedImageUri }]} // Use selected image URL for viewing
          onSwipeDown={() => setIsImageModalVisible(false)} // Close modal on swipe down
          enableSwipeDown={true}
          renderIndicator={() => null} // Hide the pagination
          backgroundColor="rgba(0,0,0,0.8)"
        />
      </Modal>
      <View className="flex-1 bg-gray-200">
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.blue[800]}
        />

        {/* Main Animated Header */}
        <Animated.View
          className="absolute top-0 right-0 left-0 bg-blue-800 z-50"
          style={[
            {
              height: headerHeight,
            },
          ]}
        >
          {/* Collapsible Content */}
          <Animated.View
            className="flex-1 items-center justify-center p-5 space-y-2"
            style={[{ opacity: headerContentOpacity }]}
          >
            <TouchableOpacity
              disabled={currentUser?.isAnonymous ? true : false}
              className="items-center space-y-1"
              onPress={() =>
                Alert.alert(
                  "Send Emergency Alert?",
                  "This will immediately:\n• Share your location\n• Alert emergency responders\n• Dispatch help to your location",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Send Alert",
                      style: "destructive",
                      onPress: handleConfirmReport,
                    },
                  ]
                )
              }
            >
                        {currentUser?.isAnonymous ? (
                <>
                  <Icon name="bell-off" size={80} color={colors.gray[400]} />
                  <TouchableOpacity>
                    <Text className="text-2xl text-center text-white font-bold">
                      Verify your account now!
                    </Text>
                  </TouchableOpacity>
                  <View style={{ padding: 20 }}>
                    <Button
                      title="Link Account with Email & Password"
                      onPress={handleSubmit}
                    />
                    <Text style={{ marginVertical: 20 }}>
                      Check Verification Status
                    </Text>
    
                    <TextInput
                      placeholder="Email"
                      value={email}
                      onChangeText={setEmail}
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                    <TextInput
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      style={{ borderBottomWidth: 1, marginBottom: 10 }}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Icon name="bell-ring" size={80} color={colors.yellow[400]} />
                  <Text className="text-2xl text-center text-white font-bold">
                    Report Now!
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <Text className="text-gray-50 font-thin text-md">
              tap the bell for immediate emergency
            </Text>
          </Animated.View>

          {/* Sticky Header Content */}
          <Animated.View
            className={`absolute left-0 right-0 bottom-0`}
            style={{ opacity: stickyHeaderOpacity, height: HEADER_MIN_HEIGHT }}
          >
            <View className="flex flex-row p-2 items-center h-full bg-blue-800">
              <Text className="text-lg text-white font-bold">{`${dayTime} ${fullname}`}</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Main ScrollView Content */}
        <ScrollView
          ref={scrollViewRef}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          contentContainerStyle={{
            paddingTop: HEADER_MAX_HEIGHT,
          }}
        >
          <View className="flex-1 px-3 pb-3 bg-white space-y-3">
            <ProfileReminderModal />
            <Text className="text-center text-3xl text-blue-900 font-extrabold space-y-0">
              Barangay Bagtas Hotline Numbers
            </Text>
            <View className="flex flex-row flex-wrap">
              {hotlineNumbers?.map((item, key) => (
                <View
                  key={key}
                  className="w-1/2 py-2" // 1/3 width to fit three items per row
                >
                  <View className="border-2 border-blue-900">
                    <Text className="text-white text-center bg-blue-800 p-1 font-bold">
                      {item.title.toUpperCase()}
                    </Text>
                    <Pressable
                      onPress={() =>
                        openDialerOrEmail(
                          item.number || item.email,
                          item.number ? "phone" : "email"
                        )
                      }
                    >
                      <Text
                        className={`text-red-500 font-extrabold text-center underline ${
                          item.email ? "p-1" : "text-xl"
                        }`}
                      >
                        {item.number || item.email}
                      </Text>
                    </Pressable>
                    <Text className="text-center font-bold text-blue-900">
                      {item.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            {announcement.length > 0 &&
              announcement.map((item, key) => (
                <View
                  key={key}
                  className="rounded-lg bg-white border-0.5 border-gray-800 shadow-2xl"
                >
                  <TouchableOpacity
                    onPress={() => handleImageClick(item.imageUrl)}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      className=" h-52 rounded-t-lg"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <View className="p-4 space-y-2">
                    <Text className="font-bold text-blue-500">
                      {formatDate(item.date)}
                    </Text>
                    <Pressable
                      onPress={() => openDialerOrEmail(item.links, "links")}
                    >
                      <View className="flex-row items-center">
                        <Text
                          className={`font-bold text-lg ${
                            item.links ? "underline" : ""
                          }`}
                        >
                          {item.title.toUpperCase()}
                        </Text>
                        {item.links && (
                          <Icon
                            name="eye"
                            size={20}
                            style={{ marginLeft: 5 }}
                            color={colors.gray[600]}
                          />
                        )}
                      </View>
                    </Pressable>

                    <Text className="text-gray-600 text-lg">
                      {item.description}
                    </Text>
                    <View className="pt-2 flex flex-row items-center space-x-3">
                      <Image
                        source={{
                          uri: "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
                        }}
                        className="h-10 w-10 rounded-full"
                      />
                      <View>
                        <Text className="font-bold text-blue-500">Admin</Text>
                        <Text>{getTimeDifference(item.timestamp)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        </ScrollView>
        <Animated.View style={{ opacity: stickyHeaderOpacity }}>
          <TouchableOpacity
            onPress={scrollToTop}
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              backgroundColor: colors.blue[800],
              padding: 15,
              borderRadius: 50,
              elevation: 5,
            }}
          >
            <Icon name="arrow-up" size={30} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
};

export default ScrollViewScreen;
