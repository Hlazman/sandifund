import React from "react";
import { View, Text, ScrollView, ActivityIndicator, Platform } from "react-native";
import { useQuery } from "@apollo/client/react";
import { GET_STICKERS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import CardSticker from "../components/cards/CardSticker";

export default function Sticers() {
  const { t, locale } = useLanguage();

  const { data, loading, error } = useQuery(GET_STICKERS, {
    variables: { locale },
    fetchPolicy: "cache-and-network",
  });

  const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");

  const resolveUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  };

  if (loading && !data) {
    return (
      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#6b7280" }}>
          {t("notifications.loading") || "Loading…"}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
          {t("header.items.sticers") || "Stickers"}
        </Text>
        <Text style={{ color: "#b91c1c" }}>
          {(t("errors.network") || "Network error.") + " "}
          {Platform.OS === "web" ? String(error) : ""}
        </Text>
      </View>
    );
  }

  const stickers = data?.stickers || [];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, paddingBottom: 80 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
        {t("header.items.sticers") || "Stickers"}
      </Text>

      {stickers.length === 0 ? (
        <Text style={{ color: "#6b7280" }}>{t("notifications.empty") || "No items"}</Text>
      ) : null}

      {stickers.map((s) => {
        const image = resolveUrl(s?.image?.url);
        const zipHref = resolveUrl(s?.zipFile?.url) || s?.zipFileUrl || null;

        return (
          <CardSticker
            key={s.documentId}
            title={s.title}
            description={s.description}
            image={image}
            zipHref={zipHref}
          />
        );
      })}
    </ScrollView>
  );
}
