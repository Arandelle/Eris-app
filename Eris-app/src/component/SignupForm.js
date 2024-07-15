import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { app, auth } from './firebaseConfig';

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User created:", user.uid);
      // Handle navigation or other logic after successful signup
    } catch (error) {
      setError(error.message);
      console.error("Error signing up:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput
        style={{ height: 40, width: 300, borderColor: "gray", borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
      />
      <TextInput
        style={{ height: 40, width: 300, borderColor: "gray", borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <TouchableOpacity
        style={{ backgroundColor: "blue", padding: 10, borderRadius: 5 }}
        onPress={handleSignup}
      >
        <Text style={{ color: "white", fontSize: 16 }}>Sign Up</Text>
      </TouchableOpacity>
      {error && <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>}
    </View>
  );
};

export default SignupForm;
