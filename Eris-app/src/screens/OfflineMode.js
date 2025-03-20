import { View, Text } from "react-native";
import Hotlines from "./HomePage/Hotlines";

const OfflineMode = () => {
  return (
    <View className="flex items-center justify-center p-4">
      <Hotlines />
    </View>
  );
};

export default OfflineMode;
