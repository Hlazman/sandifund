import React from "react";
import { View, Text, ScrollView, ActivityIndicator, Linking, Pressable } from "react-native";
import { useQuery } from "@apollo/client/react";
import { GET_MY_USER_INFO, GET_PRODUCTS_BY_MASTER } from "../api/get";
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

export default function MyGoods() {
  const { t, locale } = useLanguage();

  const { data: uiData, loading: uiLoading } = useQuery(GET_MY_USER_INFO, { fetchPolicy: "cache-first" });
  const masterId = uiData?.meFull?.user_info?.master?.documentId || null;

  const { data, loading, error } = useQuery(GET_PRODUCTS_BY_MASTER, {
    skip: !masterId,
    variables: { masterId, locale },
    fetchPolicy: "cache-and-network",
  });

  const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");

  const [showBooked, setShowBooked]   = React.useState(true);
  const [showSold, setShowSold]       = React.useState(true);
  const [showInStock, setShowInStock] = React.useState(true);
  const [showNotValid, setShowNotValid] = React.useState(true);

  if (uiLoading) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#6b7280" }}>{t("common.loading") || "Loading…"}</Text>
      </View>
    );
  }

  if (!masterId) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
          {t("pages.myGoods.title")}
        </Text>
        <Text style={{ marginTop: 6, lineHeight: 20 }}>
          {t("pages.myGoods.notMaster")}{" "}
          {"\n"}
          <Text
            style={{ textDecorationLine: "underline" }}
            onPress={() => Linking.openURL("mailto:cooperation@sandifund.com")}
          >
            cooperation@sandifund.com
          </Text>
        </Text>
      </View>
    );
  }

  const isAbort =
    error?.name === "AbortError" ||
    error?.networkError?.name === "AbortError" ||
    /aborted/i.test(error?.message || "");

  let items = (data?.products || []).slice().sort((a, b) => {
    const rank = (s) => (s === "booked" ? 0 : s === "sold" ? 1 : s === "notValid" ? 2 : s === "inStock" ? 3 : 4);
    return rank(a.state) - rank(b.state);
  });
  items = items.filter((p) => {
    if (p.state === "booked")   return showBooked;
    if (p.state === "sold")     return showSold;
    if (p.state === "inStock")  return showInStock;
    if (p.state === "notValid") return showNotValid;
    return true;
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, paddingBottom: 80 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
        {t("pages.myGoods.title")}
      </Text>

      <View style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe", borderWidth: 1, borderRadius: 12, padding: 10 }}>
        <Text style={{ color: "#1e3a8a" }}>
          {t("pages.myGoods.topNote") || "If you want to temporarily hide a product from sale, choose 'notValid' in the list."}
        </Text>
      </View>

      <View style={{ flexDirection: "row", marginTop: 8, flexWrap: "wrap" }}>
        <Checkbox label={t("filters.booked")   || "booked"}   checked={showBooked}   onChange={setShowBooked} />
        <Checkbox label={t("filters.sold")     || "sold"}     checked={showSold}     onChange={setShowSold} />
        <Checkbox label={t("filters.inStock")  || "inStock"}  checked={showInStock}  onChange={setShowInStock} />
        <Checkbox label={t("filters.notValid") || "notValid"} checked={showNotValid} onChange={setShowNotValid} />
      </View>

      {loading && !data ? (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator />
        </View>
      ) : null}

      {!loading && !isAbort && items.length === 0 ? (
        <Text style={{ color: "#6b7280" }}>{t("notifications.empty") || "Empty"}</Text>
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
            documentId={p.documentId}
            title={p.title}
            image={imgUrl}
            description={slateToText(p.description)}
            price={typeof p.price === "number" ? p.price : undefined}
            donationPercent={typeof p.donationPercent === "number" ? p.donationPercent : undefined}
            status={p.state}
            master={{ documentId: p?.master?.documentId, name: p?.master?.name, image: masterImage }}
            // для владельца в CardProduct появится select; для остальных — кнопка Reserve (если передана)
          />
        );
      })}
    </ScrollView>
  );
}
