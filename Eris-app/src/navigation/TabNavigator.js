import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Map from "../screens/Map";
import Request from "../screens/Request";
import Notification from "../screens/Notification";
import Profile from "../screens/Profile";
import { View, TouchableOpacity } from "react-native";
import { useFetchData } from "../hooks/useFetchData";
import { useNotificationData } from "../hooks/useNotificationData";

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();
  const { userData } = useFetchData();
  const { notificationsCount } = useNotificationData();
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (userData) {
      setIsProfileComplete(userData.profileComplete);
    }
  }, [userData]);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home-outline",
            Map: "map-marker-outline",
            Request: "plus",
            Notification: "bell-outline",
            Profile: "account-circle-outline",
          };

          const iconName = icons[route.name];
          const isMiddle = route.name === "Request";

          return (
            <View className="items-center">
              <View
                className={`items-center justify-center ${
                  isMiddle
                    ? "h-[55px] w-[55px] bottom-[25px] rounded-full border-white border bg-blue-400"
                    : "bg-transparent"
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
        },
        tabBarLabelStyle: {
          fontSize: 15,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen
        name="Map"
        component={Map}
        options={{ title: "Map", headerShown: false }}
      />
      <Tab.Screen
        name="Request"
        options={{
          headerRight: () => (
            <TouchableOpacity
              className="p-4"
              onPress={() => setShowHistory(!showHistory)}
            >
              <Icon name="history" size={25} />
            </TouchableOpacity>
          ),
        }}
      >
        {(props) => (
          <Request
            {...props}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
          />
        )}
      </Tab.Screen>
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
