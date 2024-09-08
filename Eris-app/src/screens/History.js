import { View, Text, ScrollView,TouchableOpacity, Modal } from "react-native";

const History = ({showHistory, setShowHistory, emergencyHistory}) => {

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
      className="flex w-full h-full py-14 px-5 items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <View className="bg-white h-full p-2 w-full rounded-lg shadow-lg">
        <Text className="text-2xl text-center py-3 text-gray-600 font-bold">
          History
        </Text>
        <ScrollView>
          {emergencyHistory.length > 0 ? (
            emergencyHistory.map((emergency) => (
              <View
                key={emergency.id}
                className="mb-4 p-2 border-b border-gray-200"
              >
                <Text className="text-lg text-gray-800">
                  Type: {emergency.type}
                </Text>
                <Text className="text-sm text-gray-600">
                  Description: {emergency.description}
                </Text>
                <Text className="text-sm text-gray-600">
                  Location: {emergency.location}
                </Text>
                <Text className="text-sm text-gray-600">
                  Status: {emergency.status}
                </Text>
                <Text className="text-sm text-gray-600">
                  Submitted:{" "}
                  {new Date(emergency.timestamp).toLocaleString()}
                </Text>
                {emergency.status === "accepted" && (
                  <Text>accepted by: {emergency.acceptedBy}</Text>
                )}
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-500">
              No history found
            </Text>
          )}
        </ScrollView>
        <TouchableOpacity
          className="bg-gray-500 p-3.5 rounded-md items-center mt-5"
          onPress={() => setShowHistory(false)}
        >
          <Text className="text-white text-lg font-bold">
            Close History
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
  )
}

export default History
