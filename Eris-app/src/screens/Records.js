import { View, Text, ScrollView, Image } from "react-native";
import useFetchRecords from "../hooks/useFetchRecords";
import useFetchData from "../hooks/useFetchData";
import { formatDateWithTime } from "../helper/FormatDate";

const Records = ({ status }) => {
  const { emergencyHistory } = useFetchRecords({ status });
  emergencyHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View className="p-2 bg-white">
      <ScrollView>
        <View className="space-y-2">
          {emergencyHistory.length > 0 ? (
            emergencyHistory.map((emergency) => (
              <View className="space-y-2">
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
  const { data: responderData } = useFetchData("responders");

  const responder = responderData.find(
    (responder) => responder.id === emergency.responderId
  );

  const emergencyStatus = {
    "awaiting response": "bg-orange-100 text-orange-600",
    "on-going": "bg-blue-100 text-blue-600",
    resolved: "bg-green-100 text-green-600",
    expired: "bg-red-300",
  };

  return (
    <View className="border border-gray-300 rounded-lg">
      <View className="flex flex-row space-x-2 p-4">
        {emergency.status !== "awaiting response" && (
          <>
            <Image
              source={{ uri: responder?.img }}
              className="h-12 w-12 rounded-full"
            />
            <View>
              <Text className="text-lg font-bold">
                {`${responder?.firstname} ${responder?.lastname}` ||
                  "Loading..."}
              </Text>
              <Text className="text-sm text-gray-400">
                {responder?.customId}
              </Text>
            </View>
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
          <View className="flex flex-row">
            <Text className="w-1/3 font-bold text-gray-500">
              Emergency type:
            </Text>
            <Text className="flex-1 font-bold">
              {emergency.type.toUpperCase()}
            </Text>
          </View>

          <View className="flex flex-row">
            <Text className="w-1/3 font-bold text-gray-500">Description:</Text>
            <Text className="flex-1 font-bold">{emergency.description}</Text>
          </View>

          <View className="flex flex-row">
            <Text className="w-1/3 font-bold text-gray-500">Location:</Text>
            <Text className="flex-1 font-bold">
              {emergency.location.address}
            </Text>
          </View>

          <View className="flex flex-row">
            <Text className="w-1/3 font-bold text-gray-500">Reported At:</Text>
            <Text className="flex-1 font-bold">
              {formatDateWithTime(emergency.date)}
            </Text>
          </View>
          {emergency.responseTime && (
            <View className="flex flex-row">
            <Text className="w-1/3 font-bold text-gray-500">
              Response Time:
            </Text>
            <Text className="flex-1 font-bold">
              {formatDateWithTime(emergency.responseTime)}
            </Text>
          </View>
          )}
          {emergency.dateResolved && (
            <View className="flex flex-row">
            <Text className="w-1/3 font-bold text-gray-500">
              Date Resolved:
            </Text>
            <Text className="flex-1 font-bold">
              {formatDateWithTime(emergency.dateResolved)}
            </Text>
          </View>
          )}

          <View className="flex flex-row">
            <Text className="w-1/3 font-bold text-gray-500">Emergency Id:</Text>
            <Text className="flex-1 font-bold">{emergency?.emergencyId}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Records;
