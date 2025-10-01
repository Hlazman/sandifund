import React from "react";
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, Linking, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../context/LanguageContext";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import { GET_NOTIFICATIONS, GET_MY_READ_NOTIFICATIONS } from "../api/get";
import { SET_USERINFO_NOTIFICATIONS } from "../api/mutations";

function formatPublished(iso, locale) {
  try {
    const dt = new Date(iso);
    return new Intl.DateTimeFormat(locale || "en", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(dt);
  } catch { return iso; }
}

function RichText({ nodes, color = "#111827" }) {
  if (!Array.isArray(nodes)) return null;
  return (
    <View style={{ gap: 4 }}>
      {nodes.map((p, i) => {
        if (p?.type !== "paragraph" || !Array.isArray(p.children)) return null;
        return (
          <Text key={i} style={{ lineHeight: 20, color }}>
            {p.children.map((ch, j) => {
              if (!ch || typeof ch.text !== "string") return null;
              if (ch.bold) return <Text key={j} style={{ fontWeight: Platform.OS === "android" ? "bold" : "700" }}>{ch.text}</Text>;
              return <Text key={j}>{ch.text}</Text>;
            })}
          </Text>
        );
      })}
    </View>
  );
}

export default function NotificationsModal({ visible, onClose, isAuthed }) {
  if (!visible) return null;

  const apollo = useApolloClient();
  const { locale: ctxLocale, t } = useLanguage();
  const [expanded, setExpanded] = React.useState(() => new Set());
  const [locallyRead, setLocallyRead] = React.useState(() => new Set());
  const pendingRef = React.useRef(new Set());
  const flushTimerRef = React.useRef(null);

  // 1) user_info: язык + прочитанные
  const { data: mineData, loading: mineLoading } = useQuery(GET_MY_READ_NOTIFICATIONS, {
    variables: { pagination: { limit: 250 } },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    skip: !visible || !isAuthed,
  });
  const userLang = mineData?.meFull?.user_info?.language || ctxLocale;

  // 2) уведомления — только с userLang (не дёргаем en по умолчанию)
  const { data: allData, loading: allLoading } = useQuery(GET_NOTIFICATIONS, {
    variables: { pagination: { limit: 250 }, locale: userLang },
    fetchPolicy: "cache-and-network",
    skip: !visible || !isAuthed || mineLoading,
  });

  const userInfoId = mineData?.meFull?.user_info?.documentId || null;

  const readIdsFromServer = React.useMemo(() => {
    const arr = mineData?.meFull?.user_info?.notifications || [];
    return new Set(arr.map((n) => n.documentId));
  }, [mineData]);

  const effectiveReadIds = React.useMemo(() => {
    const s = new Set(readIdsFromServer);
    for (const id of locallyRead) s.add(id);
    return s;
  }, [readIdsFromServer, locallyRead]);

  // const items = React.useMemo(() => allData?.notifications ?? [], [allData]);
  const items = React.useMemo(() => {
    const list = allData?.notifications ?? [];
    return [...list].sort((a, b) => {
      const at = a?.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bt = b?.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bt - at; // DESC: новые сверху
    });
  }, [allData]);

  const [setUserInfoNotifications] = useMutation(SET_USERINFO_NOTIFICATIONS, {
    onError: (e) => console.warn("Failed to persist read notifications:", e?.message || e),
  });

  // Локальный патч кеша, чтобы бэйдж в Header обновился без refetch и без мерцаний
  const patchCacheAddRead = React.useCallback((id) => {
    try {
      apollo.cache.updateQuery(
        { query: GET_MY_READ_NOTIFICATIONS, variables: { pagination: { limit: 250 } } },
        (prev) => {
          const ui = prev?.meFull?.user_info;
          if (!ui) return prev;
          const list = ui.notifications || [];
          if (list.some((x) => x.documentId === id)) return prev;
          return {
            ...prev,
            meFull: {
              ...prev.meFull,
              user_info: {
                ...ui,
                notifications: [...list, { documentId: id }], // __typename не обязателен
              },
            },
          };
        }
      );
    } catch {}
  }, [apollo]);

  // батч-отправка: (серверные ∪ pending) → одна мутация
  const scheduleFlush = React.useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      if (!userInfoId) return;
      const union = new Set(readIdsFromServer);
      for (const id of pendingRef.current) union.add(id);
      if (union.size === readIdsFromServer.size) return;
      const nextIds = Array.from(union);
      setUserInfoNotifications({ variables: { userInfoId, notifications: nextIds } });
      pendingRef.current.clear();
    }, 250);
  }, [userInfoId, readIdsFromServer, setUserInfoNotifications]);

  const onToggle = (n) => {
    const next = new Set(expanded);
    if (next.has(n.documentId)) {
      next.delete(n.documentId);
      setExpanded(next);
      return;
    }
    next.add(n.documentId);
    setExpanded(next);

    if (!effectiveReadIds.has(n.documentId) && userInfoId) {
      setLocallyRead((prev) => {
        const s = new Set(prev);
        s.add(n.documentId);
        return s;
      });
      pendingRef.current.add(n.documentId);
      patchCacheAddRead(n.documentId); // ⬅️ обновили кеш — бэйдж и список без мерцаний
      scheduleFlush();
    }
  };

  React.useEffect(() => () => { if (flushTimerRef.current) clearTimeout(flushTimerRef.current); }, []);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t("notifications.title") || "Notifications"}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>

          {allLoading || mineLoading ? (
            <View style={styles.stateBox}><Text style={styles.stateText}>{t("notifications.loading") || "Loading…"}</Text></View>
          ) : items.length === 0 ? (
            <View style={styles.stateBox}><Text style={styles.stateText}>{t("notifications.empty") || "No notifications"}</Text></View>
          ) : (
            <FlatList
              contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 12 }}
              data={items}
              keyExtractor={(n) => n.documentId}
              renderItem={({ item: n }) => {
                const isRead = effectiveReadIds.has(n.documentId);
                const isOpen = expanded.has(n.documentId);
                return (
                  <TouchableOpacity
                    onPress={() => onToggle(n)} activeOpacity={0.8}
                    style={[styles.card, isRead ? styles.cardRead : styles.cardUnread]}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={[styles.title, !isRead && { color: "#1e3a8a" }]}>{n.title}</Text>
                        <Text style={styles.date}>{formatPublished(n.publishedAt, userLang)}</Text>
                      </View>
                      <View
                        accessible accessibilityLabel={isRead ? "Read" : "Unread"}
                        style={[
                          { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
                          isRead ? { borderWidth: 1, borderColor: "#d1d5db" } : { backgroundColor: "#3b82f6" },
                        ]}
                      />
                    </View>

                    {isOpen && (
                      <View style={{ marginTop: 8 }}>
                        <RichText nodes={n.text} />
                        {!!n.link && (
                          <TouchableOpacity onPress={() => Linking.openURL(n.link)} style={{ marginTop: 6, flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ color: "#2563eb", textDecorationLine: "underline", marginRight: 6 }}>
                              {t("notifications.openLink") || "Open link"}
                            </Text>
                            <Ionicons name="open-outline" size={16} color="#2563eb" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { position: "absolute", right: 0, left: 0, bottom: 0, top: 0, backgroundColor: "#fff" },
  sheetHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb",
  },
  sheetTitle: { fontSize: 16, fontWeight: "700" },
  stateBox: { padding: 20, alignItems: "center" },
  stateText: { color: "#6b7280" },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  cardUnread: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  cardRead: { backgroundColor: "#fff", borderColor: "#e5e7eb" },
  title: { fontSize: 15, fontWeight: "600" },
  date: { fontSize: 12, color: "#6b7280", marginTop: 2 },
});
