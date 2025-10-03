import React from "react";
import { View, Text, Linking } from "react-native";
import { useQuery } from "@apollo/client/react";
import { GET_ME } from "../api/get";
import { useLanguage } from "../context/LanguageContext";

export default function MyGoods() {
  const { t } = useLanguage();
  const { data, loading } = useQuery(GET_ME, { fetchPolicy: "cache-first" });

  const roleKey = (data?.me?.role?.type || data?.me?.role?.name || "").toLowerCase();
  const isMaster = roleKey === "master";

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
        {t("pages.myGoods.title")}
      </Text>

      {!loading && !isMaster && (
        <Text style={{ marginTop: 6, lineHeight: 20 }}>
          {t("pages.myGoods.notMaster")}{" "}
          <Text
            style={{ textDecorationLine: "underline" }}
            onPress={() => Linking.openURL("mailto:support@sandifund.com")}
          >
            support@sandifund.com
          </Text>
        </Text>
      )}
    </View>
  );
}
