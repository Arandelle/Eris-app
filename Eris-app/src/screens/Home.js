import { useEffect, useState } from "react";
import { View, Image, Text, ScrollView, Alert } from "react-native";
import ProfileReminderModal from "../component/ProfileReminderModal";
import { ref, onValue } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { formatDate } from "../helper/FormatDate";
import {getTimeDifference} from "../helper/getTimeDifference"
import logo from "../../assets/logo.png";

const Home = () => {
  const [announcement, setAnnouncement] = useState([]);

  useEffect(() => {
    const announcementRef = ref(database, `announcement`);
    const unsubscribe = onValue(announcementRef, (snapshot) => {
      if (snapshot.exists()) {
        try {
          const announcementData = snapshot.val();
          const announcementList = Object.keys(announcementData).map((key) => ({
            id: key,
            ...announcementData[key],
          }));
          setAnnouncement(announcementList);
        } catch (error) {
          console.error("Error: ", error);
        }
      } else {
        Alert.alert("Notice", "No announcement yet");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 px-3 pb-3 bg-white space-y-3">
        <ProfileReminderModal />

        {announcement.length > 0 &&
          announcement.map((item, key) => (
            <View
              key={key}
              className="rounded-lg bg-white border-0.5 border-gray-800 shadow-2xl"
            >
              <Image
                source={{ uri: item.imageUrl }}
                className=" h-52 rounded-t-lg"
                resizeMode="cover"
              />
              <View className="p-4 space-y-2">
                <Text className="font-bold text-blue-500">
                  {formatDate(item.startDate)}
                </Text>
                <Text className="font-bold text-lg">{item.title}</Text>
                <Text className="text-gray-600 text-lg">{item.description}</Text>
                <View className="pt-2 flex flex-row items-center space-x-3">
                  <Image source={{uri : "https://flowbite.com/docs/images/people/profile-picture-5.jpg"}} 
                  className="h-10 w-10 rounded-full" />
                 <View>
                    <Text className="font-bold text-blue-500">Admin</Text>
                    <Text>{getTimeDifference(item.timestamp)}</Text>
                 </View>
                </View>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  );
};

export default Home;
