import { useEffect } from 'react';
import {Alert} from "react-native"
import { useNavigation } from "@react-navigation/native";
import useCurrentUser from '../hooks/useCurrentUser';
import { auth } from '../services/firebaseConfig';

const ProfileReminderModal = () => {
  
  const {currentUser} = useCurrentUser()
  const navigation = useNavigation();

  useEffect(()=>{
    if(currentUser && !currentUser.profileComplete){
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
  }, [currentUser]);
  
  return (
    <></>
  );
};

export default ProfileReminderModal;
