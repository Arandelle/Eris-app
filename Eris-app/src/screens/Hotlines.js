import React, { useContext } from "react";
import { View, Text, Pressable } from "react-native";
import useFetchData from "../hooks/useFetchData";
import openLink from "../helper/openLink";
import { OfflineContext } from "../context/OfflineContext";

const Hotlines = () => {
    const { data: hotlines, loading } = useFetchData("hotlines");
    const { isOffline } = useContext(OfflineContext);

  return (
    <>
      <View className="bg-red-50 mt-3 p-4 rounded-md shadow-md">
        <Text className="text-center text-2xl text-red-500 font-extrabold">
          Barangay Bagtas Hotline Numbers
        </Text>
      </View>

      {loading ? (
        <Text className="text-center text-gray-500 mt-3">Loading...</Text>
      ) : hotlines.length === 0 ? (
        <Text className="text-center text-gray-500 mt-3">
          No hotlines available.
        </Text>
      ) : (
        <>
          {isOffline && (
            <Text className="text-center text-red-400 font-bold my-2">
              ⚠️ You're offline. Showing last saved hotlines.
            </Text>
          )}
          <View className="flex flex-row flex-wrap">
            {hotlines.map((item, key) => (
              <View key={key} className="w-1/2 py-2">
                <View className="border-2 border-blue-900">
                  <Text className="text-white text-center bg-blue-800 p-1 font-bold">
                    {item.types.toUpperCase()}
                  </Text>
                  <Pressable
                    onPress={() =>
                      openLink(
                        item.contact || item.email,
                        item.contact ? "phone" : "email"
                      )
                    }
                  >
                    <Text
                      className={`text-red-500 font-extrabold text-center underline ${
                        item.email ? "p-1" : "text-xl"
                      }`}
                    >
                      {item.contact || item.email}
                    </Text>
                  </Pressable>
                  <Text className="text-center font-bold text-blue-900">
                    {item.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );
};

export default Hotlines;
