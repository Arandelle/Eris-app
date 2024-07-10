import React from 'react'
import {createDrawerNavigator} from '@react-navigation/drawer'
import TabNavigator from './TabNavigator';
import Home from './Home';
import SignupForm from './SignupForm';

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({setAuth}) => {
  return (
    <Drawer.Navigator>
        <Drawer.Screen name="Home Screen">
        {props => <TabNavigator {...props} setAuth={setAuth} />}
        </Drawer.Screen>
        <Drawer.Screen name="Signup" component={SignupForm} />
    </Drawer.Navigator>
  )
}

export default DrawerNavigator
