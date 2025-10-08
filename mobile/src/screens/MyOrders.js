import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useQuery } from "@apollo/client/react";
import { GET_MY_PRODUCTS } from "../api/get";
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

function Checkbox({ label, checked, onChange }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}
    >
      <View
        style={{
          width: 18, height: 18, borderRadius: 4,
          borderWidth: 1, borderColor: "#9ca3af",
          backgroundColor: checked ? "#4f46e5" : "transparent",
          marginRight: 8, justifyContent: "center", alignItems: "center",
        }}
      >
        {checked ? <Text style={{ color: "#fff", fontWeight: "700" }}>✓</Text> : null}
      </View>
      <Text>{label}</Text>
    </Pressable>
  );
}

export default function MyOrders() {
  const { t, locale } = useLanguage();
  const userInfoId = globalThis.sf_userInfoId || null;

  const { data } = useQuery(GET_MY_PRODUCTS, {
    variables: { userInfoId, locale },
    skip: !userInfoId,
    fetchPolicy: "cache-and-network",
  });

  const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");

  const [showBooked, setShowBooked] = React.useState(true);
  const [showSold, setShowSold] = React.useState(true);

  let items = data?.products || [];
  // сортируем так, чтобы booked были первее
  items = [...items].sort((a, b) => {
    const A = a.state === "booked" ? 0 : 1;
    const B = b.state === "booked" ? 0 : 1;
    return A - B;
  });
  // фильтры
  items = items.filter((p) => {
    if (p.state === "booked") return showBooked;
    if (p.state === "sold") return showSold;
    return false;
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, paddingBottom: 80 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
        {t("header.items.orders")}
      </Text>

      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <Checkbox label={t("filters.booked") || "booked"} checked={showBooked} onChange={setShowBooked} />
        <Checkbox label={t("filters.bought") || "sold"} checked={showSold} onChange={setShowSold} />
      </View>

      {items.length === 0 ? (
        <Text style={{ color: "#6b7280" }}>
          {t("pages.myOrders.empty") || "У вас нету забронированых или купленных продуктов"}
        </Text>
      ) : null}

      {items.map((p) => {
        const imgUrl = p?.image?.url
          ? (p.image.url.startsWith("http") ? p.image.url : `${API_BASE}${p.image.url}`)
          : null;
        const masterImage = p?.master?.photo?.url
          ? (p.master.photo.url.startsWith("http") ? p.master.photo.url : `${API_BASE}${p.master.photo.url}`)
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
            master={{ name: p?.master?.name, image: masterImage }}
            // без onReserve — это мои заказы
          />
        );
      })}
    </ScrollView>
  );
}
