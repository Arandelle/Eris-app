import { View, Text, ScrollView} from "react-native";
import useFetchRecords from "../hooks/useFetchRecords";

const Records = ({status}) => {

  const {emergencyHistory} = useFetchRecords({status});
  emergencyHistory.sort((a,b) => new Date(b.date) - new Date(a.date))

  const emergencyStatus = {
    "awaiting response": "bg-yellow-300",
    "on-going": "bg-orange-300",
    resolved: "bg-green-300",
    expired: "bg-red-300"
  }

  return (
      <View className="bg-white h-full w-full rounded-lg shadow-lg">
        <ScrollView>
          {emergencyHistory.length > 0 ? (
            emergencyHistory.map((emergency) => (
              <View
                key={emergency.id}
                className="p-2 pb-0"
              >
                <View className={`flex flex-row justify-between p-1 border border-gray-500 ${emergencyStatus[emergency.status]}`}>
                  <Text className="text-lg font-bold">Emergency ID:</Text>
                  <Text className="text-lg">{emergency.customId}</Text>
                </View>
              <View className="space-y-2 p-2 border border-t-0 border-gray-300">
                  <Text className="text-lg font-bold">
                    Type: {emergency.type}
                  </Text>
                  <Text className="text-lg">
                    Description: {emergency.description}
                  </Text>
                  <Text className="text-lg">
                    Location: {emergency.location.address}
                  </Text>
                  <Text className="text-lg">
                    Status: {emergency.status.toUpperCase()}
                  </Text>
                  <Text className="text-lg">
                    Submitted:{" "}
                    {new Date(emergency.timestamp).toLocaleString()}
                  </Text>
                  {emergency.acceptedBy && (
                    <Text className="text-lg">Responder: {emergency.acceptedBy}</Text>
                  )}
              </View>
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-500">
              No records found on {status}
            </Text>
          )}
        </ScrollView>
      </View>
  )
}

export default Records
