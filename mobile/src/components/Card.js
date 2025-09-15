import React from "react";
// import { View, Text } from "react-native";
import { View, Text, Platform } from "react-native";

export default function Card({ title, children }) {
  return (
    <View style={{
      backgroundColor:"#fff",
      borderRadius:16,
      padding:16,
      borderWidth:1,
      borderColor:"#e5e7eb",
      // shadowOpacity:0.06,
      // shadowRadius:8
      ...(Platform.OS === "web"
        ? { boxShadow: "0px 8px 16px rgba(0,0,0,0.06)" }
        : { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }),
    }}>
      {title ? <Text style={{fontSize:18, fontWeight:"600", marginBottom:8}}>{title}</Text> : null}
      {children}
    </View>
  );
}
