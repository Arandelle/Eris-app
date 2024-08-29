import { View,Button} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import ProfileReminderModal from "../component/ProfileReminderModal";

const Home = ({  badgeSize, setBadgeSize }) => {
  const navigation = useNavigation();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (e) {
      console.error(e);
    }
  };

  const handleBadgeSize = () => {
    setBadgeSize(badgeSize + 1);
  };


  return (
    <View>
      <ProfileReminderModal />
      <View className="h-full flex items-center justify-center bg-gray-100">
        <View className="flex flex-row w-full justify-around">
          <Button title="Logout" onPress={handleLogout} />
          <Button title="Add Notification" onPress={handleBadgeSize} />
        </View>
      </View>
    </View>
  );
};

export default Home;
