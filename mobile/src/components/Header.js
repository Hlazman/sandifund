// import React, { useEffect, useRef, useState } from "react";
// import {
//   View, Text, Image, TouchableOpacity, Modal, Pressable, ScrollView, StyleSheet,
//   Animated, Easing, Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useAuth } from "../context/AuthContext";

// const MENU_ITEMS = [
//   { name: "Sticers", label: "Sticers", icon: "star-outline" },
//   { name: "Fonds", label: "Fonds", icon: "wallet-outline" },
//   { name: "Goods", label: "Goods", icon: "cube-outline" },
//   { name: "Orders", label: "Orders", icon: "reader-outline" },
//   { name: "FAQ", label: "FAQ", icon: "help-circle-outline" },
//   { name: "Terms", label: "Terms of Use", icon: "document-text-outline" },
//   { name: "Privacy", label: "Privacy Policy", icon: "shield-checkmark-outline" },
//   { name: "Profile", label: "Profile", icon: "person-outline" },
// ];

// export default function Header({ navigation }) {
//   const [open, setOpen] = useState(false);
//   const { isAuthed, logout } = useAuth();

//   // анимация
//   const slide = useRef(new Animated.Value(1)).current;
//   useEffect(() => {
//     Animated.timing(slide, {
//       toValue: open ? 0 : 1,
//       duration: open ? 280 : 240,
//       easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
//       useNativeDriver: Platform.OS !== "web",
//     }).start();
//   }, [open, slide]);
//   const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 280] });

//   return (
//     <>
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.navigate(isAuthed ? "Sticers" : "Auth")}
//           style={{ flexDirection: "row", alignItems: "center" }}
//         >
//           <Image source={require("../../assets/icon.png")} style={{ width: 32, height: 32, marginRight: 8 }} />
//           <Text style={{ fontWeight: "600" }}>Cherity Sandifund</Text>
//         </TouchableOpacity>

//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity
//             onPress={() => {}}
//             style={{ padding: 8, opacity: isAuthed ? 1 : 0.4 }}
//             accessibilityLabel="Notifications"
//             disabled={!isAuthed}
//           >
//             <Ionicons name="notifications-outline" size={20} />
//           </TouchableOpacity>

//           {isAuthed ? (
//             <TouchableOpacity onPress={() => setOpen(true)} style={{ padding: 8 }} accessibilityLabel="Open menu">
//               <Ionicons name="menu-outline" size={32} />
//             </TouchableOpacity>
//           ) : (
//             <View style={{ padding: 8, opacity: 0.4 }}>
//               <Ionicons name="menu-outline" size={32} />
//             </View>
//           )}
//         </View>
//       </View>

//       {/* Меню */}
//       <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
//         <View style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]}>
//           <Pressable style={[StyleSheet.absoluteFill, { zIndex: 1 }]} onPress={() => setOpen(false)}>
//             <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} />
//           </Pressable>

//           <Animated.View style={[styles.drawer, { transform: [{ translateX }], zIndex: 2 }]}>
//             <SafeAreaView style={styles.drawerInner}>
//               <View style={styles.drawerHeader}>
//                 <Text style={{ fontSize: 16, fontWeight: "700" }}>Меню</Text>
//                 <TouchableOpacity
//                   onPress={() => setOpen(false)}
//                   accessibilityLabel="Close menu"
//                   hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
//                 >
//                   <Ionicons name="close" size={24} />
//                 </TouchableOpacity>
//               </View>

//               <ScrollView contentContainerStyle={{ paddingVertical: 6 }} showsVerticalScrollIndicator={false}>
//                 {MENU_ITEMS.map((item) => (
//                   <TouchableOpacity
//                     key={item.name}
//                     onPress={() => {
//                       setOpen(false);
//                       navigation.navigate(item.name);
//                     }}
//                     style={styles.menuItem}
//                   >
//                     <Ionicons name={item.icon} size={18} style={{ marginRight: 10 }} />
//                     <Text style={{ fontSize: 15 }}>{item.label}</Text>
//                   </TouchableOpacity>
//                 ))}

//                 {/* Logout */}
//                 <TouchableOpacity
//                   // onPress={() => { setOpen(false); logout(); navigation.reset({ index: 0, routes: [{ name: "Auth" }] }); }}
//                    onPress={() => {
//                     setOpen(false);
//                     logout();
//                   }}
//                   style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: "#f0f0f0", marginTop: 8 }]}
//                 >
//                   <Ionicons name="log-out-outline" size={18} style={{ marginRight: 10 }} />
//                   <Text style={{ fontSize: 15 }}>Logout</Text>
//                 </TouchableOpacity>
//               </ScrollView>
//             </SafeAreaView>
//           </Animated.View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     height: 60, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingHorizontal: 16,
//   },
//   drawer: {
//     position: "absolute", right: 0, top: 0, width: 280, height: "100%", backgroundColor: "#fff",
//     borderLeftWidth: 1, borderLeftColor: "#e5e7eb",
//     ...(Platform.OS === "web"
//       ? { boxShadow: "0px 12px 24px rgba(0,0,0,0.15)" }
//       : { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }),
//   },
//   drawerInner: { flex: 1 },
//   drawerHeader: {
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
//   },
//   menuItem: { paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
// });


import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, Image, TouchableOpacity, Modal, Pressable, ScrollView, StyleSheet,
  Animated, Easing, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const ITEMS = [
  { name: "Sticers", icon: "star-outline", key: "sticers" },
  { name: "Fonds",   icon: "wallet-outline", key: "fonds" },
  { name: "Goods",   icon: "cube-outline",   key: "goods" },
  { name: "Orders",  icon: "reader-outline", key: "orders" },
  { name: "FAQ",     icon: "help-circle-outline", key: "faq" },
  { name: "Terms",   icon: "document-text-outline", key: "terms" },
  { name: "Privacy", icon: "shield-checkmark-outline", key: "privacy" },
  { name: "Profile", icon: "person-outline", key: "profile" },
];

export default function Header({ navigation }) {
  const [open, setOpen] = useState(false);
  const { isAuthed, logout } = useAuth();
  const { t, dir } = useLanguage();

  // анимация
  const slide = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(slide, {
      toValue: open ? 0 : 1,
      duration: open ? 280 : 240,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [open, slide]);
  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 280] });

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate(isAuthed ? "Sticers" : "Auth")}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Image source={require("../../assets/icon.png")} style={{ width: 32, height: 32, marginRight: 8 }} />
          <Text style={{ fontWeight: "600" }}>{t("header.title")}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => {}}
            style={{ padding: 8, opacity: isAuthed ? 1 : 0.4 }}
            accessibilityLabel={t("header.notifications")}
            disabled={!isAuthed}
          >
            <Ionicons name="notifications-outline" size={20} />
          </TouchableOpacity>

          {isAuthed ? (
            <TouchableOpacity onPress={() => setOpen(true)} style={{ padding: 8 }} accessibilityLabel={t("header.menu")}>
              <Ionicons name="menu-outline" size={32} />
            </TouchableOpacity>
          ) : (
            <View style={{ padding: 8, opacity: 0.4 }}>
              <Ionicons name="menu-outline" size={32} />
            </View>
          )}
        </View>
      </View>

      {/* Меню */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={[StyleSheet.absoluteFill, { pointerEvents: "box-none" }]}>
          <Pressable style={[StyleSheet.absoluteFill, { zIndex: 1 }]} onPress={() => setOpen(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} />
          </Pressable>

          <Animated.View style={[styles.drawer, { transform: [{ translateX }], zIndex: 2 }]}>
            <SafeAreaView style={styles.drawerInner}>
              <View style={styles.drawerHeader}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{t("header.menu")}</Text>
                <TouchableOpacity
                  onPress={() => setOpen(false)}
                  accessibilityLabel={t("common.close")}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Ionicons name="close" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ paddingVertical: 6 }} showsVerticalScrollIndicator={false}>
                {ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => {
                      setOpen(false);
                      navigation.navigate(item.name);
                    }}
                    style={[styles.menuItem, dir === "rtl" && { flexDirection: "row-reverse" }]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      style={[
                        { marginRight: 10 },
                        dir === "rtl" && { marginRight: 0, marginLeft: 10 },
                      ]}
                    />
                    <Text style={{ fontSize: 15 }}>{t(`header.items.${item.key}`)}</Text>
                  </TouchableOpacity>
                ))}

                {/* Logout */}
                <TouchableOpacity
                  onPress={() => { setOpen(false); logout(); }}
                  style={[
                    styles.menuItem,
                    { borderTopWidth: 1, borderTopColor: "#f0f0f0", marginTop: 8 },
                    dir === "rtl" && { flexDirection: "row-reverse" },
                  ]}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    style={[{ marginRight: 10 }, dir === "rtl" && { marginRight: 0, marginLeft: 10 }]}
                  />
                  <Text style={{ fontSize: 15 }}>{t("header.items.logout")}</Text>
                </TouchableOpacity>
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
    height: 60, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingHorizontal: 16,
  },
  drawer: {
    position: "absolute", right: 0, top: 0, width: 280, height: "100%", backgroundColor: "#fff",
    borderLeftWidth: 1, borderLeftColor: "#e5e7eb",
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 12px 24px rgba(0,0,0,0.15)" }
      : { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }),
  },
  drawerInner: { flex: 1 },
  drawerHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
});
