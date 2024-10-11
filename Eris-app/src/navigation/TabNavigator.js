import React, { useEffect, useState } from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Map from "../screens/Map";
import Request from "../screens/Request";
import Notification from "../screens/Notification";
import Profile from "../screens/Profile";
import { View, TouchableOpacity } from "react-native";
import { useFetchData } from "../hooks/useFetchData";
import { useNotificationData } from "../hooks/useNotificationData";
import { useNavigation } from "@react-navigation/native";
import colors from "../constant/colors";

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();
  const navigation = useNavigation();
  const { userData } = useFetchData();
  const { notificationsCount } = useNotificationData();
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [dayTime, setDayTime] = useState("");
  const [showTabBar, setShowTabBar] = useState(true);

  useEffect(() => {
    if (userData) {
      setIsProfileComplete(userData.profileComplete);
    }
  }, [userData]);

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setDayTime("Good morning");
    } else if (hour >= 12 && hour < 18) {
      setDayTime("Good afternoon");
    } else {
      setDayTime("Good evening");
    }
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home-outline",
            Map: "map-marker-outline",
            Request: "hospital-box",
            Notification: "bell-outline",
            Profile: "account-circle-outline",
          };

          const iconName = icons[route.name];
          const isMiddle = route.name === "Request";

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
        tabBarActiveTintColor: "#42a5f5",
        tabBarInactiveTintColor: "gray",
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
      <Tab.Screen
        name="Home"
        options={{
          title: `${dayTime} ${userData?.firstname || ""} ${
            userData?.lastname || ""
          }!`,
          tabBarLabel: "Home",
        }}
      >
        {(props) => <Home {...props} setShowTabBar={setShowTabBar} />}
      </Tab.Screen>

      <Tab.Screen
        name="Map"
        component={Map}
        options={{ title: "Map", headerShown: false }}
      ></Tab.Screen>
      <Tab.Screen
        name="Request"
        component={Request}
        options={{
          title: "Request Emergency Assistance",
          tabBarLabel: "Request",
          headerRight: () => (
            <TouchableOpacity
              className="p-4"
              onPress={() => navigation.navigate("Emergency Records")}
            >
              <Icon name="history" size={25} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={Notification}
        options={{
          title: "Notification",
          tabBarBadge: notificationsCount === 0 ? null : notificationsCount,
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerShown: true,
          tabBarBadge: !isProfileComplete ? true : null,
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
