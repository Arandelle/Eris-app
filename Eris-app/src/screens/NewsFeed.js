import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  TextInput,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import ImageViewer from "react-native-image-viewing";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../constant/colors";
import useFetchData from "../hooks/useFetchData";
import ProfileReminderModal from "../component/ProfileReminderModal";
import { formatDate } from "../helper/FormatDate";
import { getTimeDifference } from "../helper/getTimeDifference";
import useCurrentUser from "../hooks/useCurrentUser";
import useLocationTracking from "../hooks/useLocationTracking";
import { submitEmergencyReport } from "../hooks/useSubmitReport";
import useSendNotification from "../hooks/useSendNotification";
import { handleAccountLinking } from "../hooks/useLinkAnonymous";
import { auth } from "../services/firebaseConfig";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import useViewImage from "../hooks/useViewImage";
import {useNavigation} from '@react-navigation/native';

const HEADER_MAX_HEIGHT = 240;
const HEADER_MIN_HEIGHT = 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const NewsFeed = ({ dayTime, isVerified }) => {
  const navigation = useNavigation();
  const { data: announcement } = useFetchData("announcement");
  const { data: responderData } = useFetchData("responders");
  const { data: adminData } = useFetchData("admins");
  const { data: hotlines } = useFetchData("hotlines");
  const { isImageModalVisible, selectedImageUri, handleImageClick, closeImageModal } = useViewImage();
  const { currentUser } = useCurrentUser();
  const [refreshing, setRefreshing] = useState(false);
  const { location, latitude, longitude, geoCodeLocation, trackUserLocation } =
    useLocationTracking(currentUser, setRefreshing);
  const { sendNotification } = useSendNotification();
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLinkingAccount, setIsLinkingAccount] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const getAdminsDetails = (userId) => {
    return adminData.find((user) => user.id === userId);
  };

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
    setLoading(true);
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
      setLoading(false);
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
        alert(
          "Account successfully linked! Please check your email for verification."
        );
      }
    } catch (error) {
      // Show error message
      alert("Failed to link account. Please try again.");
    }
  };

  const translateX = useRef(new Animated.Value(0)).current;

  //Handle the gesture event to update the animate value
  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  // handle the end of the gesture
  const handleGestureEnd = (event) => {
    if (Math.abs(event.nativeEvent.translationX) > 50) {
      if (auth.currentUser.emailVerified) {
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
        );
      } else {
        setIsLinkingAccount(!isLinkingAccount);
      }
    }
    //Reset the position after the gesture ends

    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
  };

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Set up pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 20, // Move right by 20 pixels
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0, // Move back to start position
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [slideAnim]);

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
      <ImageViewer
        images={[{ uri: selectedImageUri }]} // Ensure it's an array, even for one image
        imageIndex={0}
        visible={isImageModalVisible}
        onRequestClose={closeImageModal} // Close viewer
      />

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
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Animated.View
              className="flex-1 items-center justify-center p-5 space-y-2"
              style={[{ opacity: headerContentOpacity }]}
            >
              <PanGestureHandler
                onGestureEvent={handleGestureEvent}
                onEnded={handleGestureEnd}
              >
                <Animated.View style={{ transform: [{ translateX }] }}>
                  <TouchableOpacity className="items-center space-y-1">
                    {!isVerified ? (
                      <>
                        <View className="flex flex-row items-center justify-center">
                          <Animated.View
                            className="flex flex-row  space-x-4 items-center"
                            style={{ transform: [{ translateX: slideAnim }] }}
                          >
                            <Icon
                              name="email-fast"
                              size={80}
                              color={colors.gray[400]}
                            />
                            <Icon
                              name="arrow-right-circle"
                              size={30}
                              color={colors.gray[300]}
                            />
                          </Animated.View>
                        </View>
                        <Text className="text-white text-lg">
                          Slide to link an email
                        </Text>
                      </>
                    ) : (
                      <>
                        <View className="flex flex-row items-center justify-center">
                          <Animated.View
                            className="flex flex-row  space-x-4 items-center"
                            style={{ transform: [{ translateX: slideAnim }] }}
                          >
                            <Icon
                              name="bell-ring"
                              size={80}
                              color={colors.yellow[400]}
                            />
                            <Icon
                              name="arrow-right-circle"
                              size={30}
                              color={colors.gray[300]}
                            />
                          </Animated.View>
                        </View>
                        <Text className="text-white text-lg">
                          Slide for quick emergency report
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </PanGestureHandler>
              <Text className="text-gray-50 font-thin text-md">
                Quick response bell
              </Text>
            </Animated.View>
          </GestureHandlerRootView>

          {/* Sticky Header Content */}
          <Animated.View
            className="absolute left-0 right-0 bottom-0"
            style={{ opacity: stickyHeaderOpacity, height: HEADER_MIN_HEIGHT }}
          >
            <View className="flex flex-row items-center py-0 h-full justify-between px-4">
              {!isSearching ? (
                <View className="flex flex-row space-x-2 items-center bg-blue-800">
                  <View className="rounded-full border border-green-500">
                    <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                      <Image
                        source={{ uri: currentUser?.img }}
                        className="h-12 w-12 rounded-full"
                      />
                    </TouchableOpacity>
                  </View>
                  <View className="space-y-0">
                    <Text className="text-gray-200 font-bold">{`${dayTime}`}</Text>
                    <Text className="text-lg text-white font-bold">
                      {`${fullname}` || "How can we assist you today?"}
                    </Text>
                  </View>
                </View>
              ) : (
                <TextInput
                  className="flex-1 text-white text-lg bg-blue-900 rounded-full py-2 px-4"
                  placeholder="Search"
                  placeholderTextColor="white"
                  autoFocus={true}
                />
              )}
              <TouchableOpacity
                className="px-2"
                onPress={() => setIsSearching(!isSearching)}
              >
                <Icon
                  name={isSearching ? "check" : "magnify"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
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
          <View className="flex-1 p-3 bg-white space-y-3">
            {/* <ProfileReminderModal /> */}
            <View className="bg-red-50 mt-3 p-4 rounded-md shadow-md">
              <Text className="text-center text-2xl text-red-500 font-extrabold">
                Barangay Bagtas Hotline Numbers
              </Text>
            </View>

            <View className="flex flex-row flex-wrap">
              {hotlines?.map((item, key) => (
                <View
                  key={key}
                  className="w-1/2 py-2" // 1/3 width to fit three items per row
                >
                  <View className="border-2 border-blue-900">
                    <Text className="text-white text-center bg-blue-800 p-1 font-bold">
                      {item.types.toUpperCase()}
                    </Text>
                    <Pressable
                      onPress={() =>
                        openDialerOrEmail(
                          item.contact || item.email,
                          item.contact ? "phone" : "email"
                        )
                      }
                    >
                      <Text
                        className={`text-red-500 font-extrabold text-center underline ${
                          item.email ? "p-1" : "text-xl"
                        }`}
                      >
                        {item.contact || item.email}
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
              announcement.map((item, key) => {
                const adminDetails = getAdminsDetails(item.userId);

                return (
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
                        <TouchableOpacity onPress={() => handleImageClick(adminDetails?.imageUrl)}>
                          <Image
                            source={{
                              uri: adminDetails?.imageUrl,
                            }}
                            className="h-10 w-10 rounded-full"
                          />
                        </TouchableOpacity>
                        <View>
                          <Text className="font-bold text-blue-500">
                            {adminDetails?.fullname}
                          </Text>
                          <Text>{getTimeDifference(item.timestamp)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        </ScrollView>
        <Animated.View
          style={{
            opacity: stickyHeaderOpacity,
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <TouchableOpacity
            className=" bg-blue-800 p-4 rounded-full shadow-lg"
            onPress={scrollToTop}
          >
            <Icon name="arrow-up" size={30} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Modal
        visible={isLinkingAccount}
        transparent={true}
        onRequestClose={() => setIsLinkingAccount(false)}
        animationType="slide"
      >
        <ScrollView>
          <TouchableWithoutFeedback onPress={() => setIsLinkingAccount(false)}>
            <View
              className="h-screen w-full flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <View className="w-full flex  justify-center p-4 rounded-lg space-y-6 bg-white shadow-xl">
                <View className="space-y-2">
                  <Text className="font-bold text-green-600 text-2xl">
                    Link your account
                  </Text>
                  <Text className="text-gray-500 text-md">
                    To make it easier to access your account in the future,
                    please link an email and password. This will let you log in
                    directly without using guest access
                  </Text>
                  {!isVerified && auth.currentUser?.email && (
                    <Text className="text-gray-500 text-lg">
                      Verify this email{" "}
                      <Text className="text-red-500">
                        {auth.currentUser.email}
                      </Text>
                    </Text>
                  )}
                </View>
                {!isVerified && !auth.currentUser?.email && (
                  <View className="space-y-6">
                    <View className="relative z-10">
                      <View className="flex items-center absolute top-4 left-3 z-50">
                        <Icon
                          name={"email"}
                          size={20}
                          color={colors.green[600]}
                        />
                      </View>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-green-800 focus:border-green-800 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-800 dark:focus:border-blue-800"
                        placeholder={"Email"}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onChangeText={setEmail}
                        value={email}
                      />
                    </View>

                    <View className="relative z-10">
                      <View className="flex items-center absolute top-4 left-3 z-50">
                        <Icon name="lock" size={20} color={colors.green[600]} />
                      </View>
                      <TextInput
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-green-800 focus:border-green-800 w-full ps-10 p-2.5 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-800 dark:focus:border-blue-800"
                        onChangeText={setPassword}
                        value={password}
                        placeholder="Password"
                        secureTextEntry
                      />
                      <TouchableOpacity className="absolute right-4 top-4 flex items-center">
                        <Icon name="eye" size={20} color={colors.green[600]} />
                      </TouchableOpacity>
                    </View>

                    <View>
                      <TouchableOpacity
                        className="w-full bg-green-600 p-3 rounded-lg shadow-lg"
                        onPress={handleSubmit}
                      >
                        <Text className="text-center text-lg text-white font-bold">
                          Save account details
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </Modal>
    </>
  );
};

export default NewsFeed;
