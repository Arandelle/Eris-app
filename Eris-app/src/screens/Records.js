import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import useFetchRecords from "../hooks/useFetchRecords";
import useFetchData from "../hooks/useFetchData";
import { formatDateWithTime } from "../helper/FormatDate";
import ImageViewer from "react-native-image-viewing";
import { useMemo } from "react";
import useViewImage from "../hooks/useViewImage";
import { useState } from "react";
import handleDeleteData from "../hooks/useDeleteData";
import useCurrentUser from "../hooks/useCurrentUser";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../constant/colors";

const Records = ({ route }) => {
  const { status } = route.params;
  const { emergencyHistory } = useFetchRecords({ status });

  const sortedData = useMemo(() => {
    return [...emergencyHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [emergencyHistory]);

  return (
    <View className="p-2 bg-white">
      <ScrollView>
        <View className="space-y-2">
          {sortedData.length > 0 ? (
            sortedData.map((emergency) => (
              <View key={emergency.emergencyId} className="space-y-2">
                <RecordItem emergency={emergency} />
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-500">
              No records found on {status}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const RecordItem = ({ emergency }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const {currentUser} = useCurrentUser();
  const { data: responderData } = useFetchData("responders");

  const responderDetails = responderData?.find(
    (responder) => responder.id === emergency.responderId
  );

  const {
    handleImageClick,
    selectedImageUri,
    isImageModalVisible,
    closeImageModal,
  } = useViewImage();

  const emergencyStatus = {
    pending: "bg-orange-100 text-orange-600",
    "on-going": "bg-blue-100 text-blue-600",
    resolved: "bg-green-100 text-green-600",
    expired: "bg-red-300",
  };

  const handleDeleteRecord = async (id) => {
    if(isDeleting) return;
    setIsDeleting(true);

    try{
      await handleDeleteData(id, `users/${currentUser?.id}/emergencyHistory`);
    }catch{
      console.error(error);
      Alert.alert("Error deleting: " `${error}`)
    }finally{
      setIsDeleting(false);
    }
  }

  return (
    <>
      <ImageViewer
        images={[{ uri: selectedImageUri }]}
        imageIndex={0}
        visible={isImageModalVisible}
        onRequestClose={closeImageModal}
      />
      <View className="border border-gray-300 rounded-lg">
        <View className="flex flex-row p-4 justify-between">
          {emergency.status !== "pending" && (
            <>
              <View className="flex flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => handleImageClick(responderDetails?.img)}
                >
                  <Image
                    source={{ uri: responderDetails?.img }}
                    className="h-12 w-12 rounded-full"
                  />
                </TouchableOpacity>
                <View>
                  <Text className="text-lg font-bold">
                    {isDeleting ? "Deleting..." : responderDetails?.fullname || "responderDetails name"}
                  </Text>
                  <Text className="text-sm text-gray-400">
                    {responderDetails?.customId}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteRecord(emergency.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.red[400]} />
                ) : (
                  <Icon
                    name="delete-forever"
                    size={20}
                    color={colors.red[400]}
                  />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View className="mx-2 mb-2 rounded-md p-4 space-y-2 bg-gray-100">
          <Text
            className={`font-bold ${
              emergencyStatus[emergency.status]
            } py-1 px-3 rounded-lg self-start`}
          >
            {emergency.status.toUpperCase()}
          </Text>

          <View className="space-y-2 p-1">
            <View>
              <RowStyle label={"Emergency Id"} value={emergency.emergencyId} />
            </View>
            <View>
              <RowStyle label={"Description"} value={emergency.description} />
            </View>
            <View>
              <RowStyle
                label={"Location"}
                value={emergency.location?.geoCodeLocation}
              />
            </View>
            <View>
              <RowStyle
                label={"Date Reported"}
                value={formatDateWithTime(emergency.date)}
              />
            </View>

            {emergency.responseTime && (
              <View>
                <RowStyle
                  label={"Response Time"}
                  value={formatDateWithTime(emergency.responseTime)}
                />
              </View>
            )}
            {emergency.dateResolved && (
              <View>
                <RowStyle
                  label={"Date Resolved"}
                  value={formatDateWithTime(emergency.dateResolved)}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const RowStyle = ({ label, value }) => {
  return (
    <View className="flex flex-row">
      <Text className="w-1/3 font-bold text-gray-500">{label}</Text>
      <Text className="flex-1 font-bold">{value || "N/A"}</Text>
    </View>
  );
};

export default Records;
