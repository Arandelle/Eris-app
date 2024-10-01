import { useEffect, useState } from "react";
import { View, Image, Text, ScrollView, Alert } from "react-native";
import ProfileReminderModal from "../component/ProfileReminderModal";
import Logo from "../../assets/logo.png";
import { useFetchData } from "../hooks/useFetchData";
import {ref, onValue} from "firebase/database"
import { database } from "../services/firebaseConfig";

const Home = () => {
  const {userData} = useFetchData();
  const [announcement, setAnnouncement] = useState([]);

  useEffect(() => {
    const announcementRef = ref(database, `announcement`);
    const unsubscribe = onValue(announcementRef, (snapshot) => {
      if(snapshot.exists()){
        try{
          const announcementData = snapshot.val()
          const announcementList = Object.keys(announcementData).map((key) => ({
            id: key,
            ...announcementData[key]
          }));
          setAnnouncement(announcementList)
        }catch(error){
          console.error("Error: ", error)
        }
      } else{
        Alert.alert("Notice","No announcement yet")
      }
      }
     );

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <View className="flex-1 p-2 bg-gray-100">
      <ProfileReminderModal />
       {announcement.length > 0 && (
        announcement.map((item) => (
          <View key={item.key}>
          <Text>{item.title}</Text>
          <Text>{item.description}</Text>
          <Text>{item.startDate}</Text>
          <Text>{item.startTime}</Text>
          <Text>{item.endTime}</Text>
          </View>
        ))
       )}
      </View>
    </ScrollView>
  );
};

export default Home;
