import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useMutation } from "@apollo/client/react";
import { UPDATE_PRODUCT } from "../api/mutations";
import { Button } from "../components/cards/_CardParts";
import { useLanguage } from "../context/LanguageContext";

export default function Booked() {
  const route = useRoute();
  const navigation = useNavigation();
  const { t } = useLanguage();
  const productId = route.params?.productId;

  const [mutate, { loading, error }] = useMutation(UPDATE_PRODUCT);

  const onOk = async () => {
    const userInfoId = globalThis.sf_userInfoId || null;
    if (!productId) return;

    // если userInfoId ещё не создан/известен — бронируем только state
    const data = userInfoId
      ? { state: "booked", user_info: userInfoId }
      : { state: "booked" };

    try {
      await mutate({ variables: { documentId: productId, data } });
      navigation.navigate("MyOrders");
    } catch (e) {
      // оставим сообщение простым
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        {t("pages.booked.title") || "Booking"}
      </Text>
      <Text style={{ color: "#6b7280", marginBottom: 16 }}>
        {t("pages.booked.note") || "Tap OK to confirm reservation."}
      </Text>

      {loading ? <ActivityIndicator /> : <Button title="OK" onPress={onOk} />}
      {error ? <Text style={{ color: "#b91c1c", marginTop: 12 }}>{String(error)}</Text> : null}
    </View>
  );
}
