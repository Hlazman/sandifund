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
import { useQuery } from "@apollo/client/react";
import { GET_NOTIFICATIONS, GET_MY_READ_NOTIFICATIONS } from "../api/get";

// нормализуем роли (как на web)
function useRoleNames() {
  const { isAuthed, roles, user } = useAuth();
  const raw = roles ?? user?.roles ?? (user?.role ? [user.role] : []);
  const roleNames = (Array.isArray(raw) ? raw : [raw])
    .filter(Boolean)
    .map((r) => (typeof r === "string" ? r : r?.name || r?.type || ""))
    .map((s) => s.toLowerCase());
  if (isAuthed && !roleNames.length) roleNames.push("authenticated");
  return roleNames;
}

export default function Header({ navigation }) {
  const { isAuthed, logout } = useAuth();
  const { t, locale: ctxLocale } = useLanguage();
  const roleNames = useRoleNames();

  const canSeeMyGoods = roleNames.includes("free") || roleNames.includes("masters") || roleNames.includes("authenticated"); // временно
  const canSeeOrders  = roleNames.includes("free") || roleNames.includes("authenticated");

  const [open, setOpen] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;
  const openedAtRef = useRef(0);
  const [notifOpen, setNotifOpen] = useState(false);

  // 1) сначала user_info (язык + прочитанные)
  const { data: mineData, loading: mineLoading } = useQuery(GET_MY_READ_NOTIFICATIONS, {
    variables: { pagination: { limit: 250 } },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    skip: !isAuthed,
  });

  const userLang = mineData?.meFull?.user_info?.language || ctxLocale;

  // 2) затем уведомления с правильным locale
  const { data: allData, loading: allLoading } = useQuery(GET_NOTIFICATIONS, {
    variables: { pagination: { limit: 250 }, locale: userLang },
    fetchPolicy: "cache-and-network",
    skip: !isAuthed || mineLoading,
  });

  const readIds = useMemo(() => {
    const arr = mineData?.meFull?.user_info?.notifications || [];
    return new Set(arr.map((n) => n.documentId));
  }, [mineData]);

  const items = useMemo(() => allData?.notifications ?? [], [allData]);

  const unreadCount = useMemo(
    () => items.filter((n) => !readIds.has(n.documentId)).length,
    [items, readIds]
  );

  const showBadge = useMemo(
    () => isAuthed && !allLoading && !mineLoading && unreadCount > 0,
    [isAuthed, allLoading, mineLoading, unreadCount]
  );

  // Drawer animation (280 -> 0)
  useEffect(() => {
    Animated.timing(slide, {
      toValue: open ? 1 : 0,
      duration: open ? 380 : 260,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [open, slide]);
  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [280, 0] });

  const openDrawer = useCallback(() => {
    openedAtRef.current = Date.now();
    setOpen(true);
  }, []);
  const onOverlayPress = useCallback(() => {
    if (Date.now() - openedAtRef.current < 250) return;
    setOpen(false);
  }, []);

  // Меню: две группы и разделители
  const MAIN_ITEMS = [
    { name: "Sticers", key: "sticers", icon: "star-outline" },
    { name: "Funds",   key: "funds",   icon: "wallet-outline" },   // Fonds → Funds
    { name: "Goods",   key: "goods",   icon: "cube-outline" },
    { name: "Masters", key: "masters", icon: "ribbon-outline" },   // новый экран
    { name: "FAQ",     key: "faq",     icon: "help-circle-outline" },
    { name: "Terms",   key: "terms",   icon: "document-text-outline" },
    { name: "Privacy", key: "privacy", icon: "shield-checkmark-outline" },
  ];

  const SECONDARY_ITEMS = [
    { name: "Profile", key: "profile", icon: "person-outline", show: true },
    { name: "MyGoods", key: "myGoods", icon: "bag-outline",    show: canSeeMyGoods },
    { name: "Orders",  key: "orders",  icon: "reader-outline", show: canSeeOrders },
  ].filter((i) => i.show);

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

      <Modal transparent visible={open} animationType="none" onRequestClose={() => setOpen(false)}>
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
