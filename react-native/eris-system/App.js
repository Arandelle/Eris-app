import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import LoginForm from './src/components/LoginForm';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>Login to your account</Text>
      <LoginForm />
      <StatusBar style="auto" />
    </View>
  );
}