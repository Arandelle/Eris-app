import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth'; // Import Firebase Auth from React Native Firebase

export default function PhoneSignin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');

  const sendVerificationCode = async () => {
    try {
      console.log('Sending verification code to:', phoneNumber);
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setVerificationId(confirmation.verificationId);
      Alert.alert('Success', 'Verification code sent to your phone.');
    } catch (error) {
      console.error('Error during verification:', error.message);
      Alert.alert('Error', error.message);
    }
  };

  const verifyCode = async () => {
    try {
      console.log('Verifying code:', verificationCode);
      if (verificationId) {
        const credential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);
        await auth().signInWithCredential(credential);
        Alert.alert('Success', 'Phone authentication successful!');
      } else {
        Alert.alert('Error', 'No verification ID found.');
      }
    } catch (error) {
      console.error('Error during code verification:', error.message);
      Alert.alert('Error', 'Invalid verification code or user data not found.');
    }
  };

  return (
    <View style={styles.container}>
      {!verificationId ? (
        <>
          <Text style={styles.label}>Enter Phone Number:</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 650-555-3434"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            autoComplete="tel"
          />
          <Button title="Send Verification Code" onPress={sendVerificationCode} />
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter Verification Code:</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            keyboardType="number-pad"
            value={verificationCode}
            onChangeText={setVerificationCode}
            autoComplete="sms-otp"
          />
          <Button title="Verify Code" onPress={verifyCode} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
