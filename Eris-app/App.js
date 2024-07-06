import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,SafeAreaView } from 'react-native';
import LoginForm from './src/component/LoginForm';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center ">
      <LoginForm/>
      <StatusBar style="auto" />
    </View>
  );
}

