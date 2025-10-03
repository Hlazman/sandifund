// import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
// import {
//   View, Text, Image, TouchableOpacity, Modal, Pressable, ScrollView,
//   StyleSheet, Animated, Easing, Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useAuth } from "../context/AuthContext";
// import { useLanguage } from "../context/LanguageContext";
// import NotificationsModal from "../components/NotificationsModal";
// import useUserNotifications from "../hooks/useUserNotifications";

// export default function Header({ navigation }) {
//   const { isAuthed, logout } = useAuth();
//   const { t, locale: ctxLocale } = useLanguage();

//   const [open, setOpen] = useState(false);
//   const slide = useRef(new Animated.Value(0)).current;
//   const openedAtRef = useRef(0);
//   const [notifOpen, setNotifOpen] = useState(false);
//   const { isLoading, items, userLang, readIdsFromServer } = useUserNotifications({
//     isAuthed,
//     visible: true,
//     ctxLocale,
//   });

//   // СНАЧАЛА считаем число непрочитанных…
//   const unreadCount = useMemo(() => {
//     if (!isAuthed || isLoading) return 0;
//     return items.filter((n) => !readIdsFromServer.has(n.documentId)).length;
//   }, [isAuthed, isLoading, items, readIdsFromServer]);

//   // …и только затем решаем, показывать ли бейдж
//   const showBadge = unreadCount > 0;

//   // Drawer animation (280 -> 0)
//   useEffect(() => {
//     Animated.timing(slide, {
//       toValue: open ? 1 : 0,
//       duration: open ? 380 : 260,
//       easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
//       useNativeDriver: Platform.OS !== "web",
//     }).start();
//   }, [open, slide]);
//   const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [280, 0] });

//   const openDrawer = useCallback(() => {
//     openedAtRef.current = Date.now();
//     setOpen(true);
//   }, []);
//   const onOverlayPress = useCallback(() => {
//     if (Date.now() - openedAtRef.current < 250) return;
//     setOpen(false);
//   }, []);

//   // Меню: две группы и разделители
//   const MAIN_ITEMS = [
//     { name: "Sticers", key: "sticers", icon: "star-outline" },
//     { name: "Funds",   key: "funds",   icon: "wallet-outline" },
//     { name: "Goods",   key: "goods",   icon: "cube-outline" },
//     { name: "Masters", key: "masters", icon: "ribbon-outline" },
//     { name: "FAQ",     key: "faq",     icon: "help-circle-outline" },
//     { name: "Terms",   key: "terms",   icon: "document-text-outline" },
//     { name: "Privacy", key: "privacy", icon: "shield-checkmark-outline" },
//   ];

//   const SECONDARY_ITEMS = [
//     { name: "Profile", key: "profile", icon: "person-outline" },
//     { name: "MyGoods", key: "myGoods", icon: "bag-outline" },
//     { name: "Orders",  key: "orders",  icon: "reader-outline" },
//   ];

//   return (
//     <>
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.navigate(isAuthed ? "Sticers" : "Auth")}
//           style={{ flexDirection: "row", alignItems: "center" }}
//         >
//           <Image source={require("../../assets/icon.png")} style={{ width: 32, height: 32, marginRight: 8 }} />
//           <Text style={{ fontWeight: "600" }}>{t("header.title") || "Sandifund"}</Text>
//         </TouchableOpacity>

//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <View style={{ padding: 8, opacity: isAuthed ? 1 : 0.4 }}>
//             <TouchableOpacity
//               onPress={() => isAuthed && setNotifOpen(true)}
//               accessibilityLabel={t("header.notifications") || "Notifications"}
//               disabled={!isAuthed}
//             >
//               <Ionicons name="notifications-outline" size={22} />
//               {showBadge && (
//                 <View style={{
//                   position: "absolute", right: -2, top: -2,
//                   minWidth: 16, height: 16, borderRadius: 8,
//                   backgroundColor: "#dc2626", alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
//                 }}>
//                   <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
//                     {unreadCount > 99 ? "99+" : String(unreadCount)}
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           </View>

//           {isAuthed ? (
//             <TouchableOpacity onPress={openDrawer} style={{ padding: 8 }} accessibilityLabel={t("header.menu") || "Menu"}>
//               <Ionicons name="menu-outline" size={32} />
//             </TouchableOpacity>
//           ) : (
//             <View style={{ padding: 8, opacity: 0.4 }}>
//               <Ionicons name="menu-outline" size={32} />
//             </View>
//           )}
//         </View>
//       </View>

//       <Modal transparent visible={open} animationType="none" onRequestClose={() => setOpen(false)}>
//         <View style={styles.overlay}>
//           <Pressable style={{ flex: 1 }} onPress={onOverlayPress} />
//           <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
//             <SafeAreaView style={styles.drawerInner}>
//               <View style={styles.drawerHeader}>
//                 <Text style={{ fontSize: 16, fontWeight: "700" }}>{t("header.menu") || "Menu"}</Text>
//                 <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//                   <Ionicons name="close" size={22} />
//                 </TouchableOpacity>
//               </View>

//               {/* тонкая полоса сразу под "Menu" */}
//               <View style={styles.hairline} />

//               <ScrollView contentContainerStyle={{ paddingVertical: 6 }}>
//                 {/* верхняя группа */}
//                 {MAIN_ITEMS.map((it) => {
//                   const label = t(`header.items.${it.key}`) || it.name;
//                   return (
//                     <TouchableOpacity
//                       key={it.name}
//                       onPress={() => { setOpen(false); navigation.navigate(it.name); }}
//                       style={styles.menuItem}
//                     >
//                       <Ionicons name={it.icon} size={18} color="#4b5563" style={{ marginRight: 10 }} />
//                       <Text style={{ fontSize: 14 }}>{label}</Text>
//                     </TouchableOpacity>
//                   );
//                 })}

//                 {/* разделительная полоса */}
//                 <View style={[styles.hairline, { marginVertical: 6 }]} />

//                 {/* нижняя группа */}
//                 {SECONDARY_ITEMS.map((it) => {
//                   const label = t(`header.items.${it.key}`) || it.name;
//                   return (
//                     <TouchableOpacity
//                       key={it.name}
//                       onPress={() => { setOpen(false); navigation.navigate(it.name); }}
//                       style={styles.menuItem}
//                     >
//                       <Ionicons name={it.icon} size={18} color="#4b5563" style={{ marginRight: 10 }} />
//                       <Text style={{ fontSize: 14 }}>{label}</Text>
//                     </TouchableOpacity>
//                   );
//                 })}

//                 {/* Logout */}
//                 <TouchableOpacity
//                   onPress={async () => {
//                     setOpen(false);
//                     await logout(); // RootNav сам переключит стек на Auth
//                   }}
//                   style={[styles.menuItem, { marginTop: 6 }]}
//                 >
//                   <Ionicons name="log-out-outline" size={18} color="#4b5563" style={{ marginRight: 10 }} />
//                   <Text style={{ fontSize: 14 }}>{t("header.items.logout") || "Logout"}</Text>
//                 </TouchableOpacity>
//               </ScrollView>
//             </SafeAreaView>
//           </Animated.View>
//         </View>
//       </Modal>

//       {/* Монтируем модалку только когда она открыта */}
//       {notifOpen && (
//         <NotificationsModal
//           visible
//           isAuthed={isAuthed}
//           onClose={() => setNotifOpen(false)}
//         />
//       )}
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     height: 56, paddingHorizontal: 12, backgroundColor: "#fff",
//     borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//   },
//   overlay: {
//     flex: 1, backgroundColor: "rgba(0,0,0,0.35)",
//     flexDirection: "row", justifyContent: "flex-end",
//   },
//   drawer: {
//     position: "absolute", right: 0, top: 0, width: 280, height: "100%",
//     backgroundColor: "#fff", borderLeftWidth: 1, borderLeftColor: "#e5e7eb",
//     ...(Platform.OS === "web"
//       ? { boxShadow: "0px 12px 24px rgba(0,0,0,0.15)" }
//       : { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }),
//   },
//   drawerInner: { flex: 1 },
//   drawerHeader: {
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
//   },
//   hairline: { height: 1, backgroundColor: "#e5e7eb" },
//   menuItem: { paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
// });

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  View, Text, Image, TouchableOpacity, Modal, Pressable, ScrollView,
  StyleSheet, Animated, Easing, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import NotificationsModal from "../components/NotificationsModal";
import useUserNotifications from "../hooks/useUserNotifications";

export default function Header({ navigation }) {
  const { isAuthed, logout } = useAuth();
  const { t, locale: ctxLocale } = useLanguage();

  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // ← добавлено
  const slide = useRef(new Animated.Value(0)).current;
  const openedAtRef = useRef(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const { isLoading, items, userLang, readIdsFromServer } = useUserNotifications({
    isAuthed,
    visible: true,
    ctxLocale,
  });

  // СНАЧАЛА считаем число непрочитанных…
  const unreadCount = useMemo(() => {
    if (!isAuthed || isLoading) return 0;
    return items.filter((n) => !readIdsFromServer.has(n.documentId)).length;
  }, [isAuthed, isLoading, items, readIdsFromServer]);

  // …и только затем решаем, показывать ли бейдж
  const showBadge = unreadCount > 0;

  // Drawer animation (280 -> 0) c отложенным скрытием Modal
  useEffect(() => {
    if (open) {
      // гарантируем корректный старт анимации открытия
      if (!visible) setVisible(true);
      slide.stopAnimation();
      slide.setValue(0);
      Animated.timing(slide, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== "web",
      }).start();
    } else if (visible) {
      // проигрываем закрытие и только потом скрываем Modal
      slide.stopAnimation();
      Animated.timing(slide, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: Platform.OS !== "web",
      }).start(({ finished }) => {
        if (finished) setVisible(false);
      });
    }
  }, [open, visible, slide]);

  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [280, 0] });

  const openDrawer = useCallback(() => {
    openedAtRef.current = Date.now();
    setVisible(true); // ← добавлено: монтируем Modal до анимации
    setOpen(true);
  }, []);
  const onOverlayPress = useCallback(() => {
    if (Date.now() - openedAtRef.current < 250) return;
    setOpen(false);
  }, []);

  // Меню: две группы и разделители
  const MAIN_ITEMS = [
    { name: "Sticers", key: "sticers", icon: "star-outline" },
    { name: "Funds",   key: "funds",   icon: "wallet-outline" },
    { name: "Goods",   key: "goods",   icon: "cube-outline" },
    { name: "Masters", key: "masters", icon: "ribbon-outline" },
    { name: "FAQ",     key: "faq",     icon: "help-circle-outline" },
    { name: "Terms",   key: "terms",   icon: "document-text-outline" },
    { name: "Privacy", key: "privacy", icon: "shield-checkmark-outline" },
  ];

  const SECONDARY_ITEMS = [
    { name: "Profile", key: "profile", icon: "person-outline" },
    { name: "MyGoods", key: "myGoods", icon: "bag-outline" },
    { name: "Orders",  key: "orders",  icon: "reader-outline" },
  ];

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate(isAuthed ? "Sticers" : "Auth")}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Image source={require("../../assets/icon.png")} style={{ width: 32, height: 32, marginRight: 8 }} />
          <Text style={{ fontWeight: "600" }}>{t("header.title") || "Sandifund"}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ padding: 8, opacity: isAuthed ? 1 : 0.4 }}>
            <TouchableOpacity
              onPress={() => isAuthed && setNotifOpen(true)}
              accessibilityLabel={t("header.notifications") || "Notifications"}
              disabled={!isAuthed}
            >
              <Ionicons name="notifications-outline" size={22} />
              {showBadge && (
                <View style={{
                  position: "absolute", right: -2, top: -2,
                  minWidth: 16, height: 16, borderRadius: 8,
                  backgroundColor: "#dc2626", alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
                }}>
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                    {unreadCount > 99 ? "99+" : String(unreadCount)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {isAuthed ? (
            <TouchableOpacity onPress={openDrawer} style={{ padding: 8 }} accessibilityLabel={t("header.menu") || "Menu"}>
              <Ionicons name="menu-outline" size={32} />
            </TouchableOpacity>
          ) : (
            <View style={{ padding: 8, opacity: 0.4 }}>
              <Ionicons name="menu-outline" size={32} />
            </View>
          )}
        </View>
      </View>

      <Modal transparent visible={visible} animationType="none" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={{ flex: 1 }} onPress={onOverlayPress} />
          <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
            <SafeAreaView style={styles.drawerInner}>
              <View style={styles.drawerHeader}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{t("header.menu") || "Menu"}</Text>
                <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} />
                </TouchableOpacity>
              </View>

              {/* тонкая полоса сразу под "Menu" */}
              <View style={styles.hairline} />

              <ScrollView contentContainerStyle={{ paddingVertical: 6 }}>
                {/* верхняя группа */}
                {MAIN_ITEMS.map((it) => {
                  const label = t(`header.items.${it.key}`) || it.name;
                  return (
                    <TouchableOpacity
                      key={it.name}
                      onPress={() => { setOpen(false); navigation.navigate(it.name); }}
                      style={styles.menuItem}
                    >
                      <Ionicons name={it.icon} size={18} color="#4b5563" style={{ marginRight: 10 }} />
                      <Text style={{ fontSize: 14 }}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}

                {/* разделительная полоса */}
                <View style={[styles.hairline, { marginVertical: 6 }]} />

                {/* нижняя группа */}
                {SECONDARY_ITEMS.map((it) => {
                  const label = t(`header.items.${it.key}`) || it.name;
                  return (
                    <TouchableOpacity
                      key={it.name}
                      onPress={() => { setOpen(false); navigation.navigate(it.name); }}
                      style={styles.menuItem}
                    >
                      <Ionicons name={it.icon} size={18} color="#4b5563" style={{ marginRight: 10 }} />
                      <Text style={{ fontSize: 14 }}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Logout */}
                <TouchableOpacity
                  onPress={async () => {
                    setOpen(false);
                    await logout(); // RootNav сам переключит стек на Auth
                  }}
                  style={[styles.menuItem, { marginTop: 6 }]}
                >
                  <Ionicons name="log-out-outline" size={18} color="#4b5563" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 14 }}>{t("header.items.logout") || "Logout"}</Text>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>

      {/* Монтируем модалку только когда она открыта */}
      {notifOpen && (
        <NotificationsModal
          visible
          isAuthed={isAuthed}
          onClose={() => setNotifOpen(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56, paddingHorizontal: 12, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.35)",
    flexDirection: "row", justifyContent: "flex-end",
  },
  drawer: {
    position: "absolute", right: 0, top: 0, width: 280, height: "100%",
    backgroundColor: "#fff", borderLeftWidth: 1, borderLeftColor: "#e5e7eb",
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 12px 24px rgba(0,0,0,0.15)" }
      : { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }),
  },
  drawerInner: { flex: 1 },
  drawerHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  hairline: { height: 1, backgroundColor: "#e5e7eb" },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" },
});
