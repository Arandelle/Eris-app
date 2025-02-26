import React, { useRef, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { View, TouchableOpacity, Image, Text, Pressable } from "react-native";
import useFetchData from "../hooks/useFetchData";
import { formatDate } from "../helper/FormatDate";
import { getTimeDifference } from "../helper/getTimeDifference";
import colors from "../constant/colors";
import openLink from "../helper/openLink";
import useViewImage from "../hooks/useViewImage";
import ImageViewer from "react-native-image-viewing";
import { Video } from "expo-av";

const Announcement = () => {
  const videoRef = useRef(null);
  const { data: adminData } = useFetchData("admins");
  const { data: announcement, loading } = useFetchData("announcement");
  const [visibleCount, setVisibleCount] = useState(3);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const slicedAnnouncement = announcement.slice(0, visibleCount);

  const {
    isImageModalVisible,
    selectedImageUri,
    handleImageClick,
    closeImageModal,
  } = useViewImage();

  const [expanded, setExpanded] = useState({});
  const [showSeeMore, setShowSeeMore] = useState({});
  const [videoLoading, setVideoLoading] = useState(false);

  const getAdminsDetails = (userId) => {
    return adminData.find((user) => user.id === userId);
  };

  const handleTextLayout = (e, key) => {
    const { lines } = e.nativeEvent;
    if (lines.length > 2) {
      setShowSeeMore((prev) => ({ ...prev, [key]: true }));
    }
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
        ) : slicedAnnouncement.length === 0 ? (
          <Text className="text-center text-gray-500 mt-3">
            No announcement available
          </Text>
        ) : (
          slicedAnnouncement.length > 0 &&
          slicedAnnouncement.map((item, key) => {
            const adminDetails = getAdminsDetails(item.userId);

            return (
              <View
                key={key}
                className="rounded-lg bg-white border-0.5 border-gray-800 shadow-2xl"
              >
                <TouchableOpacity
                  onPress={() => handleImageClick(item.fileUrl)}
                >
                  {item.fileType === "image" && (
                    <Image
                      source={{ uri: item.fileUrl }}
                      className=" h-52 rounded-t-lg"
                      resizeMode="cover"
                    />
                  )}
                </TouchableOpacity>
                {item.fileType === "video" && (
                  <View className="h-52 w-full relative">
                    {videoLoading && (
                      <View className="absolute inset-0 bg-black/50 flex items-center justify-center h-full w-full">
                        <Text className="text-white text-center">
                          Loading Video...
                        </Text>
                      </View>
                    )}
                    <Video
                      ref={videoRef}
                      source={{ uri: item.fileUrl }}
                      style={{
                        width: "100%",
                        height: 208,
                        alignSelf: "center",
                      }}
                      useNativeControls
                      resizeMode="contain"
                      onLoadStart={() => setVideoLoading(true)}
                      onLoad={() => setVideoLoading(false)}
                      onError={() => setVideoLoading(false)}
                    />
                  </View>
                )}
                <View className="p-4 space-y-2">
                  <Text className="font-bold text-xs text-gray-500">
                    {formatDate(item.date)}
                  </Text>
                  <Pressable
                    onPress={
                      item.links ? () => openLink(item.links, "links") : null
                    }
                  >
                    <View className="flex-row items-center">
                      <Text
                        className={`font-bold ${item.links ? "underline" : ""}`}
                      >
                        {item.title.toUpperCase()}
                      </Text>
                      {item.links && (
                        <Icon
                          name="link-variant"
                          size={20}
                          style={{ marginLeft: 5 }}
                          color={colors.gray[600]}
                        />
                      )}
                    </View>
                  </Pressable>

                  <Text
                    className="text-gray-600 text-justify"
                    numberOfLines={expanded[key] ? undefined : 2}
                    onTextLayout={(e) => handleTextLayout(e, key)}
                  >
                    {item.description}
                  </Text>
                  {!expanded[key] && showSeeMore[key] && (
                    <TouchableOpacity
                      onPress={() =>
                        setExpanded((prev) => ({ ...prev, [key]: true }))
                      }
                    >
                      <Text className="text-blue-800 font-semibold">
                        Show full article...
                      </Text>
                    </TouchableOpacity>
                  )}
                  {expanded[key] && (
                    <TouchableOpacity
                      onPress={() =>
                        setExpanded((prev) => ({ ...prev, [key]: false }))
                      }
                    >
                      <Text className="text-gray-500 font-semibold">
                        See less
                      </Text>
                    </TouchableOpacity>
                  )}

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
                      <Text className="font-bold text-blue-800">
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
        {visibleCount < announcement.length && (
          <TouchableOpacity
            onPress={loadMore}
            className="flex items-center justify-center p-2 rounded-lg"
          >
            <Text className="text-blue-800 text-lg">View More</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default Announcement;
