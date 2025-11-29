import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import CardProduct from "../components/cards/CardProduct";

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

export default function Goods() {
  const navigation = useNavigation();
  const { t, locale } = useLanguage();

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: {
      locale,
      pagination: { limit: 250 },
      filters: { state: { in: ["inStock", "booked"] } }, // исключаем sold/notValid
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
          {t("header.items.goods") || "Goods"}
        </Text>
        <Text style={{ color: "#b91c1c" }}>{String(error)}</Text>
      </View>
    );
  }

  const products = data?.products || [];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, paddingBottom: 80 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
        {t("header.items.goods") || "Goods"}
      </Text>

      {products.length === 0 ? (
        <Text style={{ color: "#6b7280" }}>{t("notifications.empty") || "Empty"}</Text>
      ) : null}

      {products.map((p) => {
        const imgUrl = p?.image?.url
          ? (p.image.url.startsWith("http") ? p.image.url : `${API_BASE}${p.image.url}`)
          : null;
        const masterImage = p?.master?.photo?.url
          ? (p.master.photo.url.startsWith("http") ? p.master.photo.url : `${API_BASE}${p.master.photo.url}`)
          : null;

        return (
        <CardProduct
          key={p.documentId}
          documentId={p.documentId}
          title={p.title}
          image={imgUrl}
          description={slateToText(p.description)}
          price={typeof p.price === "number" ? p.price : undefined}
          donationPercent={typeof p.donationPercent === "number" ? p.donationPercent : undefined}
          status={p.state}
          master={{
            documentId: p?.master?.documentId,
            name: p?.master?.name,
            image: masterImage,
            email: p?.master?.email,
            whatsapp: p?.master?.whatsapp,
            onPress: p?.master?.documentId
              ? () => navigation.navigate("Master", { masterId: p.master.documentId, masterName: p.master.name })
              : undefined,
          }}
        />
      );
      })}
    </ScrollView>
  );
}
