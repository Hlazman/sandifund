import React from "react";
import {
  View,
  Text,
  Platform,
  Image,
  Pressable,
  Linking,
} from "react-native";

export const CardWrap = ({ children }) => (
  <View
    style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      ...(Platform.OS === "web"
        ? { boxShadow: "0px 8px 16px rgba(0,0,0,0.06)" }
        : { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }),
    }}
  >
    {children}
  </View>
);

export const Placeholder = ({ aspectRatio = 4 / 3, text = "no image", style }) => (
  <View
    style={[
      {
        width: "100%",
        aspectRatio,
        backgroundColor: "#f3f4f6",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
      },
      style,
    ]}
  >
    <Text style={{ color: "#6b7280" }}>{text}</Text>
  </View>
);

export const MiniAvatar = ({ src, size = 24 }) =>
  src ? (
    <Image
      source={{ uri: src }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: "#e5e7eb",
      }}
    />
  ) : null;

export const Badge = ({ color = "#e5e7eb", textColor = "#374151", children }) => (
  <View
    style={{
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: color,
      alignSelf: "flex-start",
    }}
  >
    <Text style={{ color: textColor, fontSize: 12, fontWeight: "600" }}>{children}</Text>
  </View>
);

export const Field = ({ label, value, onPress, href }) => {
  if (!value) return null;
  const tappable = !!onPress || !!href;
  const open = async () => {
    if (onPress) return onPress();
    if (href) {
      try {
        await Linking.openURL(href);
      } catch {}
    }
  };
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 12 }}>
      <Text style={{ color: "#6b7280", marginRight: 12 }}>{label}:</Text>
      {tappable ? (
        <Pressable onPress={open}>
          <Text style={{ color: "#4f46e5" }}>{value}</Text>
        </Pressable>
      ) : (
        <Text style={{ color: "#111827", flex: 1 }}>{value}</Text>
      )}
    </View>
  );
};

export const Button = ({ title, onPress, fullWidth }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      backgroundColor: pressed ? "#4338ca" : "#4f46e5",
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      alignSelf: fullWidth ? "stretch" : "flex-start",
      justifyContent: "center",
    })}
  >
    <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>{title}</Text>
  </Pressable>
);

export const openLink = async (url) => {
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch {}
};

export const statusKeyFrom = (s) => {
  const v = (s || "").toString().toLowerCase();
  if (!v) return null;
  if (v.includes("booked") || v.includes("брон")) return "booked";
  if (v.includes("stock") || v.includes("налич")) return "inStock";
  if (v.includes("reserv") || v.includes("заброн")) return "reserved";
  if (v.includes("sold") || v.includes("куплен") || v.includes("bought") || v.includes("purchas")) return "sold";
  if (v.includes("notvalid") || v.includes("not valid") || v.includes("невали")) return "notValid";
  return null;
};
