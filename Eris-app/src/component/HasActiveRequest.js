import { View, Text, TouchableOpacity } from "react-native";
import openLink from "../helper/openLink";

const HasActiveRequest = ({
  recommendedHotlines = [],
}) => {

  return (
    <View className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg shadow-md border border-blue-200">
      <View className="mb-4 border-b border-blue-200 pb-2">
        <Text className="text-blue-800 font-bold text-lg">
          Need to talk to someone?
        </Text>
        <Text className="text-gray-800 text-sm mt-1">
          These resources are available 24/7 to provide support
        </Text>
      </View>

      {recommendedHotlines.length > 0 ? (
        <View className="space-y-3">
          {recommendedHotlines.map((hotline, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => openLink(hotline.contact, "phone")}
              className="bg-white rounded-lg p-3 space-x-3 flex-row items-center shadow-sm border border-gray-100 active:bg-blue-50"
            >
              <View className="bg-blue-100 p-2 rounded-full">
                <Text className="text-blue-800 font-bold">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-semibold">
                  {hotline.organization}
                </Text>
                <Text className="text-blue-800 font-bold">
                  {hotline.contact}
                </Text>
              </View>

              <View className="bg-blue-600 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-medium">Call</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="bg-gray-50 p-4 rounded-md">
          <Text className="text-gray-500 text-center">
            No hotlines available.
          </Text>
        </View>
      )}

      <Text className="text-xs text-gray-500 mt-4 text-center">
        All calls are confidential and many services offer support in multiple
        languages
      </Text>
    </View>
  );
};

export default HasActiveRequest;
