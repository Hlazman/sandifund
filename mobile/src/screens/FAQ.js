import React from "react";
import { View, Text, Pressable, LayoutAnimation, ScrollView } from "react-native";
import { useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { GET_FAQS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";

function renderSlate(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) return null;

  return nodes.map((n, idx) => {
    if (n?.type === "paragraph") {
      const parts = Array.isArray(n.children) ? n.children : [];
      return (
        <Text key={idx} style={{ color: "#374151", lineHeight: 20, marginBottom: 8 }}>
          {parts.map((leaf, i) => {
            const style = {
              fontWeight: leaf?.bold ? "700" : "400",
              fontStyle: leaf?.italic ? "italic" : "normal",
              textDecorationLine: leaf?.underline ? "underline" : "none",
            };
            return (
              <Text key={i} style={style}>
                {typeof leaf?.text === "string" ? leaf.text : ""}
              </Text>
            );
          })}
        </Text>
      );
    }
    // fallback — просто собрать текст из children
    const text =
      Array.isArray(n?.children)
        ? n.children.map((c) => (typeof c?.text === "string" ? c.text : "")).join("")
        : "";
    return (
      <Text key={idx} style={{ color: "#374151", lineHeight: 20, marginBottom: 8 }}>
        {text}
      </Text>
    );
  });
}

export default function FAQ() {
  const { t, locale } = useLanguage();

  const { data, loading, error } = useQuery(GET_FAQS, {
    variables: { locale, pagination: { limit: 100 } },
    fetchPolicy: "cache-and-network",
  });

  const [openId, setOpenId] = React.useState(null);
  const faqs = data?.faqs || [];

  const toggle = (id) => {
    // анимация сворачивания/разворачивания (в новой архитектуре может быть no-op, но безопасно)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 80 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 6 }}>FAQ</Text>

      {loading && !data ? (
        <Text style={{ color: "#6b7280" }}>{t("notifications.loading") || "Loading…"}</Text>
      ) : null}

      {error ? (
        <Text style={{ color: "#b91c1c" }}>{t("errors.network") || "Network error."}</Text>
      ) : null}

      {faqs.length === 0 && !loading ? (
        <Text style={{ color: "#6b7280" }}>{t("notifications.empty") || "No items"}</Text>
      ) : null}

      {faqs.map((item) => {
        const opened = openId === item.documentId;
        return (
          <View
            key={item.documentId}
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              backgroundColor: "#fff",
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <Pressable
              onPress={() => toggle(item.documentId)}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                paddingVertical: 12,
                backgroundColor: pressed ? "#f9fafb" : "#fff",
              })}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 16, fontWeight: "600", flex: 1 }} numberOfLines={2}>
                  {item.question || "—"}
                </Text>
                <Ionicons
                  name={opened ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#6b7280"
                />
              </View>
            </Pressable>

            {opened ? (
              <View style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
                {Array.isArray(item?.answerFofmated) && item.answerFofmated.length > 0
                  ? renderSlate(item.answerFofmated)
                  : <Text style={{ color: "#6b7280" }}>{t("faq.noAnswer") || "Answer coming soon."}</Text>}
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}
