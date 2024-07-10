import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignupForm from './SignupForm';

const Home = ({ setAuth }) => {
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

  return (
    <View className="h-full flex items-center justify-center">
      <Text>This is the home</Text>
      <Button title='Logout' onPress={handleLogout} />
      <Button title='Signup' onPress={()=> navigation.navigate('Signup')}/>
    </View>
  );
};

export default Home;
