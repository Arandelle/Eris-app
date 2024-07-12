import React, {useState, useEffect} from 'react';
import { View, Text, Button, TextInput, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({ setAuth,badgeSize, setBadgeSize }) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isAuth');
      setAuth(false);
      navigation.navigate('LoginForm');
    } catch (e) {
      console.error(e);
    }
  };

  const handleBadgeSize =()=>{
    setBadgeSize(badgeSize + 1);
  }

  return (
    <View className="h-full flex items-center justify-center bg-gray-100">
      <View className="flex flex-row w-60 justify-between">
        <Button title='Logout' onPress={handleLogout} />
        <Button title='Signup' onPress={()=> navigation.navigate('Signup')}/>
        <Button title='Add Notification' onPress={handleBadgeSize}/>
      </View>
    </View>
  );
};

export default Home;
