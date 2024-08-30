import { View, Image, Text, ScrollView } from "react-native";
import ProfileReminderModal from "../component/ProfileReminderModal";
import Logo from "../../assets/logo.png";

const Home = () => {
  return (
    <ScrollView>
      <View className="h-screen flex items-center justify-center bg-gray-100">
      <ProfileReminderModal />
        <Text className="text-xl font-bold">Welcome to Homepage</Text>
        <Image source={Logo} className="h-30 w-30" />
      </View>
    </ScrollView>
  );
};

export default Home;
