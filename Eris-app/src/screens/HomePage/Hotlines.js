import React, { useContext } from "react";
import { View, Text, Pressable } from "react-native";
import useFetchData from "../../hooks/useFetchData";
import openLink from "../../helper/openLink";
import { OfflineContext } from "../../context/OfflineContext";

const Hotlines = () => {
  const { data: hotlines, loading } = useFetchData("hotlines");
  const { isOffline } = useContext(OfflineContext);

  return (
    <>
      <View className={`${isOffline ? "py-4" : ""}`}>
        {loading ? (
          <Text className="text-center text-gray-500 mt-3">🔃 Loading...</Text>
        ) : hotlines.length === 0 ? (
          <Text className="text-center text-gray-500 mt-3">
           🚫 No hotlines available.
          </Text>
        ) : (
          <>
            {isOffline && (
              <Text className="bg-gray-500 text-white font-bold p-4 rounded-md">
                ⚠️ Your network is unstable
              </Text>
            )}
            <View className="bg-blue-800 border-blue-900 mt-3 p-2 border-2 shadow-md rounded-md">
              <Text className="text-center text-xl text-white font-extrabold">
                📞 Hotline Numbers
              </Text>
            </View>
            <View className="flex flex-row flex-wrap">
              {hotlines.map((item, key) => (
                <View key={key} className="w-1/2 py-2">
                  <View className="border-2 border-blue-900 rounded-md">
                    <Text className="text-white text-center bg-blue-800 p-1 font-bold">
                      {item.organization.toUpperCase()}
                    </Text>
                    <Pressable
                      onPress={() =>
                        openLink(
                          item.contact, "phone"
                        )
                      }
                    >
                      <Text
                        className={`text-red-500 font-extrabold text-center underline`}
                      >
                        {item.contact}
                      </Text>
                    </Pressable>
                    {item.email && (
                      <Pressable onPress={() => openLink(item.email, "email")}>
                        <Text className="text-red-500 font-extrabold text-center underline">{item.email}</Text>
                      </Pressable>
                    )}
                    <Text className="text-center font-bold text-blue-900">
                      {item.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </>
  );
};

export default Hotlines;
