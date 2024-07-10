import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import Icon from "react-native-vector-icons/MaterialIcons";
import Map from "./Map";
import Notification from "./Notification";
import More from "./More";
import { Text, View } from "react-native";

const Tab = createBottomTabNavigator();

const TabNavigator = ({ setAuth }) => {
  return (
    <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, size, color }) => {
        let iconName;
        
        switch(route.name){
          case 'Home':
            iconName = "home";
            break;
          case 'Map':
            iconName = "map";
            break;
          case 'Notification':
            iconName = "notifications";
            break;
          case 'More':
            iconName = "more-horiz";
            break;
          default:
            break;
        }
        const iconSize = focused ? size + 8 : size + 5;
        return <Icon name={iconName} size={iconSize} color={color} />;
      },
      tabBarActiveTintColor: "#2196f3",
      tabBarInactiveTintColor: "gray",
      tabBarStyle: {
          paddingBottom: 10,
          paddingTop: 10,
          height: 60,
        },
        tabBarAllowFontScaling: true,
        tabBarHideOnKeyboard: true,
      tabBarHideOnKeyboard: true,
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
        options={{ title: "Notification",  tabBarBadge: 20, }}
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
