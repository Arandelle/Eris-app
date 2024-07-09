import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import React from "react";
import SignupForm from "./SignupForm";
import Icon from "react-native-vector-icons/MaterialIcons";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ title: "Home Page", tabBarIcon:({ size, color })=>(
          <Icon name="home" size={size} color={color}/>
        )}}
      />
      <Tab.Screen name="Signup" component={SignupForm}
      options={{title: 'Signup Page',
      tabBarIcon: ({size, color})=>(
        <Icon name="home" size={size} color={color}/>
      )}} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
