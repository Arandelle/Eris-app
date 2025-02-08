import React, { useContext } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { View, TouchableOpacity, Image, Text, Pressable } from "react-native";
import useFetchData from "../hooks/useFetchData";
import { OfflineContext } from "../context/OfflineContext";
import { formatDate } from "../helper/FormatDate";
import { getTimeDifference } from "../helper/getTimeDifference";
import colors from "../constant/colors";
import openLink from "../helper/openLink";
import useViewImage from "../hooks/useViewImage";
import ImageViewer from "react-native-image-viewing";

const Announcement = () => {
  const { data: adminData } = useFetchData("admins");
  const { data: announcement, loading } = useFetchData("announcement");
  const {
    isImageModalVisible,
    selectedImageUri,
    handleImageClick,
    closeImageModal,
  } = useViewImage();
  const { isOffline } = useContext(OfflineContext);

  const getAdminsDetails = (userId) => {
    return adminData.find((user) => user.id === userId);
  };

  return (
    <>
      <ImageViewer
        images={[{ uri: selectedImageUri }]} // Ensure it's an array, even for one image
        imageIndex={0}
        visible={isImageModalVisible}
        onRequestClose={closeImageModal} // Close viewer
      />
      <View className="space-y-3">
      {loading ? (
         <Text className="text-center text-gray-500 mt-3">Loading...</Text>
      ) : announcement.length === 0 ? (
          <Text className="text-center text-gray-500 mt-3">
            No announcement available
        </Text>
      ) : (
        announcement.length > 0 &&
          announcement.map((item, key) => {
            const adminDetails = getAdminsDetails(item.userId);

            return (
              <View
                key={key}
                className="rounded-lg bg-white border-0.5 border-gray-800 shadow-2xl"
              >
                <TouchableOpacity
                  onPress={() => handleImageClick(item.imageUrl)}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    className=" h-52 rounded-t-lg"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <View className="p-4 space-y-2">
                  <Text className="font-bold text-blue-500">
                    {formatDate(item.date)}
                  </Text>
                  <Pressable onPress={() => openLink(item.links, "links")}>
                    <View className="flex-row items-center">
                      <Text
                        className={`font-bold text-lg ${
                          item.links ? "underline" : ""
                        }`}
                      >
                        {item.title.toUpperCase()}
                      </Text>
                      {item.links && (
                        <Icon
                          name="eye"
                          size={20}
                          style={{ marginLeft: 5 }}
                          color={colors.gray[600]}
                        />
                      )}
                    </View>
                  </Pressable>

                  <Text className="text-gray-600 text-lg">
                    {item.description}
                  </Text>
                  <View className="pt-2 flex flex-row items-center space-x-3">
                    <TouchableOpacity
                      onPress={() => handleImageClick(adminDetails?.imageUrl)}
                    >
                      <Image
                        source={{
                          uri: adminDetails?.imageUrl,
                        }}
                        className="h-10 w-10 rounded-full"
                      />
                    </TouchableOpacity>
                    <View>
                      <Text className="font-bold text-blue-500">
                        {adminDetails?.fullname}
                      </Text>
                      <Text>{getTimeDifference(item.timestamp)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
      )}
      </View>
    </>
  );
};

export default Announcement;
