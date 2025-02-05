import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginForm = () => {
  const [input, setInput] = useState('');
  const [storedData, setStoredData] = useState('');

  useEffect(() => {
    // Load saved data on app start
    loadData();
  }, []);

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('offlineMessage', input);
      Alert.alert('Success', 'Data saved offline!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save data.');
    }
  };

  const loadData = async () => {
    try {
      const value = await AsyncStorage.getItem('offlineMessage');
      if (value !== null) {
        setStoredData(value);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter message to store offline:</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          width: '100%',
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        }}
        placeholder="Type here..."
        value={input}
        onChangeText={setInput}
      />
      <Button title="Save Offline" onPress={saveData} />
      <Text style={{ fontSize: 16, marginTop: 20 }}>Stored Data: {storedData}</Text>
    </View>
  );
};

export default LoginForm;
