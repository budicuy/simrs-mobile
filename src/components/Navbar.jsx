
import React from 'react';
import { View, Text } from 'react-native';
export default function Navbar() {
  return (
    <View className="flex flex-row items-center justify-between p-4 bg-blue-500">
      <Text className="text-lg font-bold text-white">SIMRS</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Text className="text-white">Home</Text>
        <Text className="text-white">About</Text>
        <Text className="text-white">Contact</Text>
      </View>
    </View>
  )
}
