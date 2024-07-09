import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from './Home';
import React from 'react'
import SignupForm from './SignupForm';

const Tab = createBottomTabNavigator();

const Footer = () => {
  return (
    <Tab.Navigator>
        <Tab.Screen name="Home" component={Home} options={{headerShown: false}} />
        <Tab.Screen name='Signup' component={SignupForm}/>
    </Tab.Navigator>
  )
}

export default Footer
