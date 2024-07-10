import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import Icon from "react-native-vector-icons/MaterialIcons";
import Map from "./Map";
import Notification from "./Notification";
import More from "./More";
import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();

const TabNavigator = ({ setAuth }) => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
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

          const iconSize = focused ? size + 8 : size; // Adjust icon size based on focus
          const labelSize = focused ? 14 : 12; // Adjust label size based on focus

          return (
            <View className="items-center">
              <Icon name={iconName} size={iconSize} color={color} />
              <Text style={{ color, fontSize: labelSize, marginTop: 0 }}>
                {route.name}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor: "#2196f3",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 10,
          paddingTop: 10,
          height: 60,
        },
        tabBarLabel: () => null,
        tabBarAllowFontScaling: true,
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
        options={{ title: "Notification", tabBarBadge: 20 }}
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
