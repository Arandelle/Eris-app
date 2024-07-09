import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import SignupForm from "./SignupForm";
import Icon from "react-native-vector-icons/MaterialIcons";
import Map from "./Map";
import Notification from "./Notification";
import More from "./More";

const Tab = createBottomTabNavigator();

const TabNavigator = ({ setAuth }) => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ size, color }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Map") {
            iconName = "map";
          } else if (route.name === "Notification") {
            iconName = "notifications";
          } else if (route.name === "More") {
            iconName = "more-horiz";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2196f3",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 10,
          paddingTop: 10,
          height: 60,
        },
        tabBarLabelStyle: {
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        options={{ title: "Home Page" }}
      >
        {props => <Home {...props} setAuth={setAuth} />}
      </Tab.Screen>
      <Tab.Screen name="Map" component={Map} />
      <Tab.Screen
        name="Notification"
        component={Notification}
        options={{ title: "Notification" }}
      />
      <Tab.Screen
        name="More"
        component={More}
        options={{ title: "More" }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
