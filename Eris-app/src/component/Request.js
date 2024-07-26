import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Request = () => {
  const [emergencyType, setEmergencyType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    // For now, we'll just show an alert
    Alert.alert('Emergency Request Submitted', 'Help is on the way!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Emergency Request</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Emergency Type:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={emergencyType}
            onValueChange={(itemValue) => setEmergencyType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select type" value="" />
            <Picker.Item label="Medical" value="medical" />
            <Picker.Item label="Fire" value="fire" />
            <Picker.Item label="Police" value="police" />
            <Picker.Item label="Natural Disaster" value="disaster" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          onChangeText={setDescription}
          value={description}
          placeholder="Briefly describe the emergency"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location:</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={setLocation}
          value={location}
          placeholder="Your current location"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Emergency Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Request;