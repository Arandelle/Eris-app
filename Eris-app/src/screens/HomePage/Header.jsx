import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
  TextInput
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../constant/colors";
import useCurrentUser from "../../hooks/useCurrentUser";
import checkActiveReport from "../Report/checkActiveReport";
import { auth } from "../../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import LinkEmailModal from "../LinkEmailModal";

const HEADER_MAX_HEIGHT = 240;
const HEADER_MIN_HEIGHT = 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const Header = ({ content, isVerified, dayTime, setIsBellSwipe }) => {
  const navigation = useNavigation();
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { currentUser } = useCurrentUser();
  const [isLinkingAccount, setIsLinkingAccount] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { reportStatus } = checkActiveReport();

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

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  //Handle the gesture event to update the animate value
  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  // handle the end of the gesture
  const handleGestureEnd = (event) => {
    if (Math.abs(event.nativeEvent.translationX) > 50) {
      if (auth.currentUser.emailVerified) {
        setIsBellSwipe(true);
      } else {
        setIsLinkingAccount(!isLinkingAccount);
      }
    }
    //Reset the position after the gesture ends

    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
  };

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

  return (
    <>
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
                            color={colors.green[400]}
                          />
                          <Icon
                            name="arrow-right-circle"
                            size={30}
                            color={colors.green[300]}
                          />
                        </Animated.View>
                      </View>
                      <Text className="text-white text-lg">
                        Slide to link an email
                      </Text>
                      <Text className="text-gray-50 font-thin text-md">
                        📩 Please link your email to save your account
                      </Text>
                    </>
                  ) : (
                    <>
                      <View className="flex flex-row items-center justify-center">
                        <Animated.View
                          className="flex flex-row  space-x-4 items-center"
                          style={{ transform: [{ translateX: slideAnim }] }}
                        >
                          {reportStatus ? (
                            <Icon
                              name={`${
                                reportStatus === "pending"
                                  ? "progress-clock"
                                  : "car-emergency"
                              }`}
                              size={80}
                              color={colors.yellow[400]}
                            />
                          ) : (
                            <>
                              <Icon
                                name="bell-ring"
                                size={80}
                                color={colors.yellow[300]}
                              />
                              <Icon
                                name="arrow-right-circle"
                                size={30}
                                color={colors.gray[300]}
                              />
                            </>
                          )}
                        </Animated.View>
                      </View>
                      <View className="flex items-center justify-center pt-4">
                        {reportStatus === "on-going" ? (
                          <>
                            <Text className="text-white text-lg">
                              Responder is on your way.
                            </Text>
                            <Text className="text-gray-50 font-thin text-md">
                              ✅ Stay calm and wait for their assistance.
                            </Text>
                          </>
                        ) : reportStatus === "pending" ? (
                          <>
                            <Text className="text-white text-lg">
                              Your report has been sent
                            </Text>
                            <Text className="text-gray-50 font-thin text-md">
                              ✅ Please wait for the responder.
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text className="text-white text-lg">
                              Slide for quick emergency report
                            </Text>
                            <Text className="text-gray-50 font-thin text-md">
                              🔴 Fire, crime, and emergencies need quick
                              response.
                            </Text>
                          </>
                        )}
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </PanGestureHandler>
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
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Profile")}
                  >
                    <Image
                      source={{ uri: currentUser?.img }}
                      className="h-12 w-12 rounded-full"
                    />
                  </TouchableOpacity>
                </View>
                <View className="space-y-0">
                  <Text className="text-gray-200 font-bold">{`${dayTime}`}</Text>
                  <Text className="text-lg text-white font-bold">
                    {"How can we assist you today?"}
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
      <ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT,
        }}
      >
        {content}
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

      <LinkEmailModal
        isLinkingAccount={isLinkingAccount}
        setIsLinkingAccount={setIsLinkingAccount}
        isVerified={isVerified}
        auth={auth}
      />
    </>
  );
};

export default Header;
