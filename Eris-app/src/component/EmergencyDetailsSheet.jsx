import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { formatDateWithTime } from '../helper/FormatDate';
import { getTimeDifference } from '../helper/getTimeDifference';

const EmergencyDetailsSheet = ({ reportDetails, onCancel }) => {
  if (!reportDetails) return null;

  const StatusBadge = () => (
    <View className="bg-blue-100 px-3 py-1 rounded-full self-start">
      <Text className="text-blue-800 font-semibold text-sm">
        {reportDetails.status}
      </Text>
    </View>
  );

  return (
    <View className="flex p-6">
      {/* Header with Emergency Type, Status, and Cancel Button */}
      <View className="border-b border-gray-200 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-bold text-2xl text-gray-800 capitalize">
              ⚠️ {reportDetails.emergencyType}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              ID: {reportDetails.emergencyId}
            </Text>
          </View>
          <View className="flex-row items-center space-x-2">
          {reportDetails.status === "awaiting response" && (
            <TouchableOpacity 
              onPress={onCancel}
              className="bg-red-100 px-3 py-1 rounded-full"
            >
              <Text className="text-red-600 font-semibold text-sm">
                Cancel
              </Text>
            </TouchableOpacity>
          )}
            <View><StatusBadge /></View>
          </View>
        </View>
      </View>
      {/* Time and Date Section */}
      <View className="py-4 space-y-4">
        <View className="space-y-1">
          <Text className="text-blue-800 font-semibold flex-row items-center">
            🕒 {getTimeDifference(reportDetails.timestamp)}
          </Text>
          <Text className="text-gray-600 text-sm">
            {formatDateWithTime(reportDetails.date)}
          </Text>
        </View>
        {/* Location Section */}
        <View className="space-y-1">
          <Text className="text-gray-700 font-semibold">
            📍 Location
          </Text>
          <Text className="text-gray-700">
            {reportDetails.location?.address}
          </Text>
        </View>
        {/* Description Section */}
        {reportDetails.description && (
          <View className="space-y-1">
            <Text className="text-gray-700 font-semibold">
              📝 Description
            </Text>
            <Text className="text-gray-700">
              {reportDetails.description}
            </Text>
          </View>
        )}
      </View>
      {/* Image Section */}
      {reportDetails.imageUrl && (
        <View className="mt-2">
          <Text className="text-gray-700 font-semibold mb-2">
            📷 Emergency Photo
          </Text>
          <View className="rounded-lg overflow-hidden">
            <Image
              source={{ uri: reportDetails.imageUrl }}
              className="h-64 w-full"
              resizeMode="cover"
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default EmergencyDetailsSheet;