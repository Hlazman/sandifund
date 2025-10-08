import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useQuery } from "@apollo/client/react";
import { GET_MASTER } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import CardMaster from "../components/cards/CardMaster";
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

export default function Master() {
  const route = useRoute();
  const navigation = useNavigation();
  const { t, locale } = useLanguage();
  const masterId = route.params?.masterId;

  const { data, loading, error } = useQuery(GET_MASTER, {
    variables: { documentId: masterId, locale },
    skip: !masterId,
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

  const m = data?.master;
  const photoUrl = m?.photo?.url
    ? (m.photo.url.startsWith("http") ? m.photo.url : `${API_BASE}${m.photo.url}`)
    : null;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, paddingBottom: 80 }}
    >
      {m ? (
        <>
          {/* Блок 1: сам мастер */}
          <CardMaster
            name={m.name}
            photo={photoUrl}
            email={m.email}
            whatsapp={m.whatsapp}
            description={slateToText(m.description)}
            productsCount={Array.isArray(m.products) ? m.products.length : 0}
            // onMore={() => {}}
          />

          {/* Блок 2: его товары */}
          <Text style={{ fontSize: 20, fontWeight: "700" }}>
            {t("header.items.goods") || "Goods"}
          </Text>

          <View style={{ gap: 12 }}>
            {(m.products || []).map((p) => {
              const imgUrl = p?.image?.url
                ? (p.image.url.startsWith("http") ? p.image.url : `${API_BASE}${p.image.url}`)
                : null;

              const masterImage = m?.photo?.url
                ? (m.photo.url.startsWith("http") ? m.photo.url : `${API_BASE}${m.photo.url}`)
                : null;

              return (
                <CardProduct
                  key={p.documentId}
                  title={p.title}
                  image={imgUrl}
                  description={slateToText(p.description)}
                  price={typeof p.price === "number" ? p.price : undefined}
                  donationPercent={typeof p.donationPercent === "number" ? p.donationPercent : undefined}
                  status={p.state}
                  master={{
                    name: m.name,
                    image: masterImage,
                    onPress: () => {}, // уже на странице мастера
                  }}
                  reserveLabel={t("card.product.reserve") || "Reserve"}
                  onReserve={
                    p.state === "booked" ? undefined : () => navigation.navigate("Booked", { productId: p.documentId })
                  }
                />
              );
            })}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
