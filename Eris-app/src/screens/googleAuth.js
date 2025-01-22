import { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

export default function GoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // Get these from Google Cloud Console
    clientId: '495460903256-tseehf9r5lpa7uacqaaabeh6nukvkq4n.apps.googleusercontent.com',
    // Optional: If you want to use native Google Sign-In on iOS
    iosClientId: 'your-ios-client-id.apps.googleusercontent.com',
    // Optional: If you want to use native Google Sign-In on Android
    androidClientId: '495460903256-47v2gv3ldulmh6c8b17kehh944ac5ae3.apps.googleusercontent.com',
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prompt user to select Google account
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        // Create Firebase credential
        const credential = GoogleAuthProvider.credential(
          result.params.id_token
        );
        
        // Sign in to Firebase with credential
        const userCredential = await signInWithCredential(auth, credential);
        console.log('Signed in with user:', userCredential.user);
        
        // You can now use userCredential.user to access user data
        // userCredential.user.displayName
        // userCredential.user.email
        // userCredential.user.photoURL
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handleGoogleSignIn}
      disabled={loading}
      className="flex items-center justify-center h-screen bg-blue-500 rounded-md p-4"
    >
      <Text style={styles.buttonText}>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  }
});