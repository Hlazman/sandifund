import React from "react";
import { View, Text, ScrollView, ActivityIndicator, Platform } from "react-native";
import { useQuery } from "@apollo/client/react";
import { useNavigation } from "@react-navigation/native";
import { GET_FUNDS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import CardFund from "../components/cards/CardFund";

function slateToText(nodes) {
  // Простой plain-text из Slate JSON [{type:'paragraph', children:[{text:'...'}]}]
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

export default function Fonds() {
  const navigation = useNavigation();
  const { t, locale } = useLanguage();

  const { data, loading, error, refetch } = useQuery(GET_FUNDS, {
    variables: {
      locale,
      pagination: { limit: 100 },
    },
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
          {t("header.items.funds") || "Funds"}
        </Text>
        <Text style={{ color: "#b91c1c" }}>
          {(t("errors.network") || "Network error.") + " "}
          {Platform.OS === "web" ? String(error) : ""}
        </Text>
      </View>
    );
  }

  const funds = data?.funds || [];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, paddingBottom: 80 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
        {t("header.items.funds") || "Funds"}
      </Text>

      {funds.length === 0 ? (
        <Text style={{ color: "#6b7280" }}>{t("notifications.empty") || "No notifications"}</Text>
      ) : null}

      {funds.map((f) => {
        const logoUrl = f?.logo?.url
          ? (f.logo.url.startsWith("http") ? f.logo.url : `${API_BASE}${f.logo.url}`)
          : null;

        return (
          <CardFund
            key={f.documentId}
            title={f.title}
            logo={logoUrl}
            description={slateToText(f.description)}
            email={f.email}
            phone1={f.phone1}
            phone2={f.phone2}
            address={f.address}
            whatsapp={f.whatsapp}
            totalDonations={typeof f.totalDonations === "number" ? f.totalDonations : undefined}
            website={f.website}
            reports={{ label: t("card.fund.reports") || "Reports", screen: "Reports" }}
            onNavigate={(screen) =>
              navigation.navigate(screen, { fundId: f.documentId, fundTitle: f.title })
            }
          />
        );
      })}
    </ScrollView>
  );
}
