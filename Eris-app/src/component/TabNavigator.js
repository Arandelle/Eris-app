import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Map from "./Map";
import Notification from "./Notification";
import Profile from "./Profile";
import SignupForm from "./SignupForm";
import { View, Text } from "react-native";
import { styled } from "nativewind";

const Tab = createBottomTabNavigator();

const TabNavigator = ({ setAuth }) => {
  const [badgeSize, setBadgeSize] = useState(0);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = "home-outline";
              break;
            case 'signup':
              iconName = "map-marker-outline";
              break;
            case 'Map':
              iconName = "plus";
              break;
            case 'Notification':
              iconName = "bell-outline";
              break;
            case 'Profile':
              iconName = "account-circle-outline";
              break;
            default:
              break;
          }

          const isMiddle = route.name === 'Map';

           return (
            <View className="items-center">
              <View className={`items-center justify-center`}
               style={{ 
                width: isMiddle ? 55 : null,
                height: isMiddle ? 55 : null, 
                bottom: isMiddle ? 25 : 0,
                borderRadius: isMiddle ? 50 : 25, 
                borderColor: isMiddle ? "white" : null,
                borderWidth: isMiddle ? 3 : null,
                backgroundColor: isMiddle ? '#42a5f5' : 'transparent', 
                
              }}>
                <Icon name={iconName} size={isMiddle ? size : size + 4} color={isMiddle ? 'white' : color}
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
          position: "absolute",
          bottom: 16,
          right: 16,
          left: 16,
          borderRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 15,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Home"
      >
        {props => <Home {...props} setAuth={setAuth} badgeSize={badgeSize} setBadgeSize={setBadgeSize} />}
      </Tab.Screen>
      <Tab.Screen
        name="signup"
        component={SignupForm}
        options={{ title: "Signup"
       }}  
      />
      <Tab.Screen name="Map" component={Map} />
      <Tab.Screen
        name="Notification"
        component={Notification}
        options={{ title: "Notification", tabBarBadge: badgeSize === 0 ? null : badgeSize }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
