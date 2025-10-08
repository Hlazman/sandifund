import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@apollo/client/react";
import { GET_MASTERS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import CardMaster from "../components/cards/CardMaster";

function slateToText(nodes) {
  if (!Array.isArray(nodes)) return "";
  return nodes
    .map((n) =>
      Array.isArray(n?.children)
        ? n.children.map((c) => (typeof c?.text === "string" ? c.text : "")).join("")
        : ""
    )
    .filter(Boolean)
    .join("\n\n");
}

export default function Masters() {
  const navigation = useNavigation();
  const { t, locale } = useLanguage();

  const { data, loading, error } = useQuery(GET_MASTERS, {
    variables: { locale, pagination: { limit: 250 } },
    fetchPolicy: "cache-and-network",
  });

  const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");

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
          {t("header.items.masters") || "Masters"}
        </Text>
        <Text style={{ color: "#b91c1c" }}>{String(error)}</Text>
      </View>
    );
  }

  const masters = data?.masters || [];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, paddingBottom: 80 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
        {t("header.items.masters") || "Masters"}
      </Text>

      {masters.length === 0 ? (
        <Text style={{ color: "#6b7280" }}>{t("notifications.empty") || "Empty"}</Text>
      ) : null}

      {masters.map((m) => {
        const photoUrl = m?.photo?.url
          ? (m.photo.url.startsWith("http") ? m.photo.url : `${API_BASE}${m.photo.url}`)
          : null;

        const productsCount = Array.isArray(m.products) ? m.products.length : 0;

        return (
          <CardMaster
            key={m.documentId}
            name={m.name}
            photo={photoUrl}
            email={m.email}
            whatsapp={m.whatsapp}
            description={slateToText(m.description)}
            productsCount={productsCount}
            onMore={() => navigation.navigate("Master", { masterId: m.documentId, masterName: m.name })}
          />
        );
      })}
    </ScrollView>
  );
}
