import React from "react";
import { View, Text } from "react-native";
import Card from "../components/Card";

export default function Payment() {
  return (
    <View style={{ flex:1, paddingHorizontal:16, paddingVertical:12 }}>
      <Card title="Payment">
        <Text style={{ opacity: 0.7 }}>
          Здесь будет оплата/подписка.
        </Text>
      </Card>
    </View>
  );
}
