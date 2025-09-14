import React from "react";
import { View, Text } from "react-native";

export default function Auth() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Auth (Авторизация)</Text>
      {/* позже добавим табы: Регистрация / Логин */}
    </View>
  );
}
