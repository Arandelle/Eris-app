import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBrkkfs5GIMi1U4UwjLVtR8B9AJ4xZz8Uw",
  authDomain: "eris-app-cc463.firebaseapp.com",
  projectId: "eris-app-cc463",
  storageBucket: "eris-app-cc463.appspot.com",
  messagingSenderId: "495460903256",
  appId: "1:495460903256:android:45f3216f01278a6d4ddd2d"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };