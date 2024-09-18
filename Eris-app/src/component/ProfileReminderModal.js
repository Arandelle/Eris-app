import { useEffect } from 'react';
import {Alert} from "react-native"
import { useNavigation } from "@react-navigation/native";
import { useFetchData } from '../hooks/useFetchData';

const ProfileReminderModal = () => {
 
  const {userData} = useFetchData();
  const navigation = useNavigation();

  useEffect(()=>{
    if(userData && !userData.profileComplete){
      Alert.alert("Complete your profile", "We recommend updating your profile to ensure accuracy and enhance security!", [
        {
          text: "Remind me later",
          style: "cancel"
        },
        {
          text: "Update profile",
          onPress: ()=>{
            navigation.navigate("UpdateProfile")
          }
        }
      ])

    }
  }, [userData]);
  
  return (
    <></>
  );
};

export default ProfileReminderModal;
