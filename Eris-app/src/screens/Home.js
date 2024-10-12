import { useEffect, useState } from "react";
import { View, Image, Text, ScrollView, Alert, RefreshControl, TouchableOpacity, Modal } from "react-native";
import ProfileReminderModal from "../component/ProfileReminderModal";
import { ref, onValue } from "firebase/database";
import { database } from "../services/firebaseConfig";
import { formatDate } from "../helper/FormatDate";
import { getTimeDifference } from "../helper/getTimeDifference";
import ImageViewer from 'react-native-image-zoom-viewer'

const Home = ({ setShowTabBar }) => {
  const [announcement, setAnnouncement] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // To track refresh state
  const [isImageModalVisible, setIsImageModalVisible] = useState(false); // State to control modal visibility
  const [selectedImageUri, setSelectedImageUri] = useState(""); // State to hold the image URI to be shown in modal

  const handleScroll = (event) => {
    let currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > scrollOffset ? "down" : "up";
    setScrollOffset(currentOffset);
    setShowTabBar(direction === "up");
  };
      // Function to handle pulling down to refresh
      const handleRefresh = () => {
        setRefreshing(true); // Set refreshing to true
        fetchAnnouncements(); // Reload announcements
      };

      
  const fetchAnnouncements = () => {
    const announcementRef = ref(database, `announcement`);
    onValue(announcementRef, (snapshot) => {
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
          Alert.alert(`Error ${error}`)
        }
      } else {
        Alert.alert("Notice", "No announcement yet");
      }
      setRefreshing(false); // Set refreshing to false after data is loaded
    });
  };

  useEffect(() => {
    fetchAnnouncements(); // Load announcements when the component mounts
  }, []);

    const handleImageClick = (imageUri) => {
      setSelectedImageUri(imageUri);
      setIsImageModalVisible(true); // Show the image modal
    };

  return (
    <>
       {/* Image Viewer Modal */}
       {isImageModalVisible && (
        <Modal
          visible={isImageModalVisible}
          transparent={true}
          onRequestClose={() => setIsImageModalVisible(false)} // Close modal when back button is pressed
        >
             <ImageViewer
                imageUrls={[{ url: selectedImageUri }]} // Use selected image URL for viewing
                onSwipeDown={() => setIsImageModalVisible(false)} // Close modal on swipe down
                enableSwipeDown={true}
                renderIndicator={() => null} // Hide the pagination
                backgroundColor='rgba(0,0,0,0.8)'
              />
        </Modal>
      )}
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16} // Ensures smooth scrolling events
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh} // Trigger refresh when the user pulls down
          />
        }
      >
        <View className="flex-1 px-3 pb-3 bg-white space-y-3">
          <ProfileReminderModal />
  
          {announcement.length > 0 &&
            announcement.map((item, key) => (
              <View
                key={key}
                className="rounded-lg bg-white border-0.5 border-gray-800 shadow-2xl"
              >
               <TouchableOpacity onPress={() => handleImageClick(item.imageUrl)}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    className=" h-52 rounded-t-lg"
                    resizeMode="cover"
                  />
               </TouchableOpacity>
                <View className="p-4 space-y-2">
                  <Text className="font-bold text-blue-500">
                    {formatDate(item.startDate)}
                  </Text>
                  <Text className="font-bold text-lg">{item.title}</Text>
                  <Text className="text-gray-600 text-lg">
                    {item.description}
                  </Text>
                  <View className="pt-2 flex flex-row items-center space-x-3">
                    <Image
                      source={{
                        uri: "https://flowbite.com/docs/images/people/profile-picture-5.jpg",
                      }}
                      className="h-10 w-10 rounded-full"
                    />
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
    </>
  );
};

export default Home;
