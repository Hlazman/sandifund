import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ правильный SafeAreaView
import { Ionicons } from "@expo/vector-icons";

const MENU_ITEMS = [
  { name: "Sticers", label: "Sticers", icon: "star-outline" },
  { name: "Fonds", label: "Fonds", icon: "wallet-outline" },
  { name: "Goods", label: "Goods", icon: "cube-outline" },
  { name: "Orders", label: "Orders", icon: "reader-outline" },
  { name: "FAQ", label: "FAQ", icon: "help-circle-outline" },
  { name: "Terms", label: "Terms of Use", icon: "document-text-outline" },
  { name: "Privacy", label: "Privacy Policy", icon: "shield-checkmark-outline" },
  { name: "Profile", label: "Profile", icon: "person-outline" },
  //   { name: "Payment", label: "Payment", icon: "card-outline" },
  // Auth не добавляем в меню
];

export default function Header({ navigation }) {
  const [open, setOpen] = useState(false);

  // Анимация выезда панели
  const slide = useRef(new Animated.Value(1)).current; // 1 = скрыто, 0 = показано
  useEffect(() => {
    Animated.timing(slide, {
      toValue: open ? 0 : 1,
      duration: open ? 280 : 240,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, slide]);

  const translateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Sticers")}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Image
            source={require("../../assets/icon.png")}
            style={{ width: 32, height: 32, marginRight: 8 }}
          />
          <Text style={{ fontWeight: "600" }}>Cherity Sandifund</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => {}} style={{ padding: 8 }} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setOpen(true)} style={{ padding: 8 }} accessibilityLabel="Open menu">
            <Ionicons name="menu-outline" size={32} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Меню */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Контейнер, не блокирующий события детям (панели) */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Оверлей ПОД панелью (zIndex:1). Нажатие по фону закрывает меню */}
          <Pressable style={[StyleSheet.absoluteFill, { zIndex: 1 }]} onPress={() => setOpen(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} />
          </Pressable>

          {/* Панель СВЕРХУ (zIndex:2) — клики по кресту и пунктам проходят корректно */}
          <Animated.View style={[styles.drawer, { transform: [{ translateX }], zIndex: 2 }]}>
            <SafeAreaView style={styles.drawerInner}>
              <View style={styles.drawerHeader}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>Меню</Text>
                <TouchableOpacity
                  onPress={() => setOpen(false)}
                  accessibilityLabel="Close menu"
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Ionicons name="close" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={{ paddingVertical: 6 }}
                alwaysBounceVertical={false}
                showsVerticalScrollIndicator={false}
              >
                {MENU_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => {
                      setOpen(false);
                      navigation.navigate(item.name);
                    }}
                    style={styles.menuItem}
                  >
                    <Ionicons name={item.icon} size={18} style={{ marginRight: 10 }} />
                    <Text style={{ fontSize: 15 }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 280,
    height: "100%",
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerInner: { flex: 1 },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
});


