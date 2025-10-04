import React from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, Linking } from "react-native";
import { useQuery } from "@apollo/client/react";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { GET_REPORTS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";

function parseDMY(str) {
  // ожидаем "dd.mm.yyyy", иначе используем Date.parse
  if (typeof str !== "string") return 0;
  const m = str.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return Date.parse(str) || 0;
  const [, dd, mm, yyyy] = m;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
}

export default function Reports() {
  const route = useRoute();
  const { fundId, fundTitle } = route.params || {};
  const { t, locale } = useLanguage();

  const { data, loading, error } = useQuery(GET_REPORTS, {
    variables: {
      locale,
      pagination: { limit: 100 },
      filters: fundId ? { fund: { documentId: { eqi: fundId } } } : undefined,
    },
    fetchPolicy: "cache-and-network",
    skip: !fundId,
  });

  const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");

  const openPdf = async (url) => {
    if (!url) return;
    const full = url.startsWith("http") ? url : `${API_BASE}${url}`;
    try { await Linking.openURL(full); } catch {}
  };

  // сортируем отчёты: новые сверху
  const rows = React.useMemo(() => {
    const arr = (data?.reports || []).slice();
    arr.sort((a, b) => parseDMY(b?.title) - parseDMY(a?.title));
    return arr;
  }, [data]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
        {(t("pages.reports.title") || "Reports") + (fundTitle ? ` — ${fundTitle}` : "")}
      </Text>

      {loading && !data ? (
        <View style={{ alignItems: "center", marginTop: 12 }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: "#6b7280" }}>
            {t("notifications.loading") || "Loading…"}
          </Text>
        </View>
      ) : null}

      {error ? (
        <Text style={{ color: "#b91c1c", marginBottom: 8 }}>
          {t("errors.network") || "Network error."}
        </Text>
      ) : null}

      {/* Таблица */}
      <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        {/* Заголовок */}
        <View style={{ flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 10, paddingHorizontal: 12 }}>
          <Text style={{ flex: 1, fontWeight: "700" }}>
            {t("pages.reports.columns.date") || "Date"}
          </Text>
          <Text style={{ flex: 1, textAlign: "right", fontWeight: "700" }}>
            {t("pages.reports.columns.sum") || "Sum"}
          </Text>
          <Text style={{ flex: 1, textAlign: "center", fontWeight: "700" }}>
            {t("pages.reports.columns.file") || "File"}
          </Text>
        </View>

        {/* Ряды */}
        {rows.map((r) => (
          <View
            key={r.documentId}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb" }}
          >
            <Text style={{ flex: 1 }}>{r.title}</Text>

            <Text style={{ flex: 1, textAlign: "right", fontWeight: "600" }}>
              {typeof r.sum === "number" ? `${r.sum} ₪` : ""}
            </Text>

            <View style={{ flex: 1, alignItems: "center" }}>
              {r?.pdf?.url ? (
                <Pressable
                  onPress={() => openPdf(r.pdf.url)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: pressed ? "#4338ca" : "#4f46e5",
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 10,
                  })}
                >
                  <Ionicons name="document-text-outline" size={16} color="#fff" />
                  <Text style={{ color: "#fff", marginLeft: 6, fontWeight: "600" }}>
                    {t("pages.reports.columns.file") || "File"}
                  </Text>
                </Pressable>
              ) : (
                <Text style={{ color: "#6b7280" }}>—</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {(!loading && rows.length === 0) ? (
        <Text style={{ marginTop: 10, color: "#6b7280" }}>
          {t("notifications.empty") || "No notifications"}
        </Text>
      ) : null}
    </ScrollView>
  );
}
