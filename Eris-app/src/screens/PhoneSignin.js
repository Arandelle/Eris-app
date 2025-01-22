import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { app } from '../services/firebaseConfig';

export default function PhoneSignin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const recaptchaVerifier = React.useRef(null);
  const auth = getAuth(app);

  const sendVerificationCode = async () => {
    try {
      console.log("Sending verification code to:", phoneNumber);
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      Alert.alert('Success', 'Verification code sent to your phone.');
    } catch (error) {
      console.error("Error during verification:", error.message);
      Alert.alert('Error', error.message);
    }
  };

  const verifyCode = async () => {
    try {
      console.log("Verifying code:", verificationCode);
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await signInWithCredential(auth, credential);
      Alert.alert('Success', 'Phone authentication successful!');
    } catch (error) {
      console.error("Error during code verification:", error.message);
      Alert.alert('Error', 'Invalid verification code.');
    }
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
      />
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
