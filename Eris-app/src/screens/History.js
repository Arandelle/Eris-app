import { View, Text, ScrollView,TouchableOpacity, Modal } from "react-native";

const History = ({showHistory, setShowHistory, emergencyHistory}) => {

  emergencyHistory.sort((a,b) => new Date(b.date) - new Date(a.date))

  const emergencyStatus = {
    pending: "bg-yellow-300",
    accepted: "bg-orange-300",
    done: "bg-green-300",
    expired: "bg-red-300"
  }

  return (
    <Modal
    transparent={true}
    animationType="slide"
    visible={showHistory}
    onRequestClose={() => {
      setShowHistory(!showHistory);
    }}
  >
    <View
      className="flex w-full h-full py-10 px-4 items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <View className="bg-white h-full p-1 w-full rounded-lg shadow-lg">
        <Text className="text-xl text-center py-2 text-gray-600 font-bold">
          Emergency Records
        </Text>
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
                    Location: {emergency.location}
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
              No records found
            </Text>
          )}
        </ScrollView>
        <TouchableOpacity
          className="bg-gray-500 p-3 rounded-md items-center mt-5"
          onPress={() => setShowHistory(false)}
        >
          <Text className="text-white text-lg font-bold">
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
  )
}

export default History
