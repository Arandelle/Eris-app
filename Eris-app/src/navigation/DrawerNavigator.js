import React from 'react'
import {createDrawerNavigator} from '@react-navigation/drawer'
import TabNavigator from './TabNavigator';
import Home from '../screens/Home';
import SignupForm from '../screens/SignupForm';

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({setAuth}) => {
  return (
    <Drawer.Navigator>
        <Drawer.Screen name=" ">
        {props => <TabNavigator {...props} setAuth={setAuth} />}
        </Drawer.Screen>
        <Drawer.Screen name="Signup" component={SignupForm} />
    </Drawer.Navigator>
  )
}

export default DrawerNavigator
