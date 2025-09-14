import React from "react";
import { View, Text } from "react-native";
import Card from "../components/Card";

export default function Sticers() {
  return (
    <View style={{ flex:1, paddingHorizontal:16, paddingVertical:12 }}>
      <Card title="Sticers (Главная)">
        <Text style={{ opacity: 0.7 }}>
          Здесь будет логика стикеров и подписок.
        </Text>
      </Card>
    </View>
  );
}
