import React, { useState } from 'react'
import { View, Text} from 'react-native'
import {ref, set} from "firebase/database";
import {database} from "../services/firebaseConfig"

const Notification = () => {
  const [notificationType, setNotificationType] = useState("");
  const [message, setMessage] = useState("");

  function writeData(userId, name, type, description) {
    set(ref(database, 'users/' + userId), {
      name: name,
      type: type,
      description: description,
      timestamp: Date.now(),
    });
  }
  
  // Usage
  writeData("user123", "John Doe", "Medical", "Heart Attack");

  return (
    <View className="h-full flex items-center justify-center">
        <Text>This is the Notification</Text>
    </View>
  )
}

export default Notification
