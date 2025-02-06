import React, { useContext, useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Map from "../screens/Map";
import Request from "../screens/Request";
import Notification from "../screens/Notification";
import Profile from "../screens/Profile";
import { View } from "react-native";
import { useNotificationData } from "../hooks/useNotificationData";
import colors from "../constant/colors";
import useCurrentUser from "../hooks/useCurrentUser";
import NewsFeed from "../screens/NewsFeed";
import { auth } from "../services/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import useFetchDocuments from "../hooks/useFetchDocuments";
import { OfflineContext } from "../context/OfflineContext";

const TabNavigator = () => {
  const {isOffline} = useContext(OfflineContext);
  const Tab = createBottomTabNavigator();
  const { currentUser } = useCurrentUser();
  const {documents} = useFetchDocuments();
  const { notificationsCount } = useNotificationData();
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [dayTime, setDayTime] = useState("");
  const [showTabBar, setShowTabBar] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isReadyForPickup, setIsReadyForPickup] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsProfileComplete(currentUser.profileComplete);
    }
    if(documents.length > 0){
      const readyDocs = documents.filter((doc) => doc.status === "ready for pickup");
      if(readyDocs.length > 0){
        setIsReadyForPickup(true);
      }else{
        setIsReadyForPickup(false);
      }
    }
  }, [currentUser, documents]);

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 3 && hour < 12) {
      setDayTime("Good morning! ☕");
    } else if (hour >= 12 && hour < 18) {
      setDayTime("Good afternoon! 👋");
    } else {
      setDayTime("Good evening! 🌙");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsVerified(currentUser.emailVerified);
        // Start polling for email verification status
        if (!currentUser.emailVerified) {
          const checkVerification = setInterval(async () => {
            await currentUser.reload(); // Reloads the user's data from Firebase
            if (currentUser.emailVerified) {
              setIsVerified(true);
              clearInterval(checkVerification); // Stop polling once verified
              Alert.alert("Email Verified", "Your email has been verified!");
            }
          }, 5000); // Check every 5 seconds

          // Clear the interval when the component unmounts
          return () => clearInterval(checkVerification);
        }
      } else {
        setIsVerified(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size, }) => {
          const icons = {
            Home: "home",
            Map: "map-marker",
            Report: "hospital-box",
            Notification: "bell",
            Profile: "account-circle",
          };

          const iconName = icons[route.name];
          const isMiddle = route.name === "Report";

          return (
            <View className="items-center">
              <View
                className={`items-center justify-center ${
                  isMiddle && "rounded-lg p-1 bg-red-500"
                }`}
              >
                <Icon
                  name={iconName}
                  size={isMiddle ? size : size + 4}
                  color={isMiddle ? "white" : color}
                />
              </View>
            </View>
          );
        },
        tabBarActiveTintColor: colors.blue[800],
        headerTintColor: "white",
        headerStyle: {
          backgroundColor:  colors.blue[800],
          shadowColor: "transparent"},
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
          // position: "absolute",
          // bottom: 16,
          // right: 16,
          // left: 16,
          // borderRadius: 10,
          display: showTabBar ? "block" : "none",
        },
        tabBarLabelStyle: {
          fontSize: 15,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      {/* <Tab.Screen
        name="Home"
        options={{
          headerShown: false,
          title: `${dayTime} ${currentUser?.firstname || ""} ${
            currentUser?.lastname || ""
          }!`,
          tabBarLabel: "Home",
        }}
      >
        {(props) => <Home {...props} setShowTabBar={setShowTabBar} />}
      </Tab.Screen> */}
      <Tab.Screen
        name="Home"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
        }}
      >
        {(props) => (
          <NewsFeed
            {...props}
            dayTime={dayTime}
            isVerified={isVerified}
          />
        )}
      </Tab.Screen>

      {!isOffline && (
        <Tab.Screen
        name="Map"
        component={Map}
        options={{ title: "Map", headerShown: false }}
      ></Tab.Screen>
      )}
     
      {isVerified && (
        <Tab.Screen
          name="Report"
          component={Request}
          options={{
            title: "Submit Emergency Assistance",
            tabBarLabel: "Report",
          }}
        />
      )}
      {!isOffline &&  (
        <Tab.Screen
        name="Notification"
        component={Notification}
        options={{
          title: "Notification",
          tabBarBadge: notificationsCount === 0 ? null : notificationsCount,
        }}
      />
      )}
      <Tab.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerShown: true,
          tabBarBadge: !isProfileComplete || isReadyForPickup ? true : null,
        }}
      >
        {(props) => (
          <Profile {...props} setIsProfileComplete={setIsProfileComplete} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default TabNavigator;
