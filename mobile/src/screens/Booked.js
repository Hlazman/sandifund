// import React from "react";
// import { View, Text, ActivityIndicator } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { useMutation } from "@apollo/client/react";
// import { UPDATE_PRODUCT } from "../api/mutations";
// import { Button } from "../components/cards/_CardParts";
// import { useLanguage } from "../context/LanguageContext";

// export default function Booked() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { t } = useLanguage();
//   const productId = route.params?.productId;

//   const [mutate, { loading, error }] = useMutation(UPDATE_PRODUCT);

//   const onOk = async () => {
//     const userInfoId = globalThis.sf_userInfoId || null;
//     if (!productId) return;

//     // если userInfoId ещё не создан/известен — бронируем только state
//     const data = userInfoId
//       ? { state: "booked", user_info: userInfoId }
//       : { state: "booked" };

//     try {
//       await mutate({ variables: { documentId: productId, data } });
//       navigation.navigate("MyOrders");
//     } catch (e) {
//       // оставим сообщение простым
//     }
//   };

//   return (
//     <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12, justifyContent: "center" }}>
//       <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
//         {t("pages.booked.title") || "Booking"}
//       </Text>
//       <Text style={{ color: "#6b7280", marginBottom: 16 }}>
//         {t("pages.booked.note") || "Tap OK to confirm reservation."}
//       </Text>

//       {loading ? <ActivityIndicator /> : <Button title="OK" onPress={onOk} />}
//       {error ? <Text style={{ color: "#b91c1c", marginTop: 12 }}>{String(error)}</Text> : null}
//     </View>
//   );
// }

import React from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useMutation } from "@apollo/client/react";
import { UPDATE_PRODUCT } from "../api/mutations";
import { Button } from "../components/cards/_CardParts";
import { useLanguage } from "../context/LanguageContext";

function Checkbox({ label, checked, onChange }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: "#9ca3af",
          backgroundColor: checked ? "#4f46e5" : "transparent",
          marginRight: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {checked ? (
          <Text style={{ color: "#fff", fontWeight: "700", lineHeight: 18 }}>
            ✓
          </Text>
        ) : null}
      </View>
      <Text>{label}</Text>
    </Pressable>
  );
}

export default function Booked() {
  const route = useRoute();
  const { t } = useLanguage();
  const productId = route.params?.productId;

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [byWhatsapp, setByWhatsapp] = React.useState(true);
  const [byPhone, setByPhone] = React.useState(true);
  const [success, setSuccess] = React.useState(false);

  const [mutate, { loading, error }] = useMutation(UPDATE_PRODUCT);

  const onSubmit = async () => {
    const userInfoId = globalThis.sf_userInfoId || null;
    if (!productId) return;

    const data = userInfoId
      ? { state: "booked", user_info: userInfoId }
      : { state: "booked" };

    try {
      await mutate({ variables: { documentId: productId, data } });

      // TODO: отправить данные формы (name, phone, byWhatsapp, byPhone)
      // Пример (псевдокод):
      // await mutate(SEND_BOOKING_FORM, {
      //   variables: {
      //     productId,
      //     name,
      //     phone,
      //     contact: { whatsapp: byWhatsapp, phone: byPhone },
      //   },
      // });

      setSuccess(true);
    } catch (e) {
      // оставим обработку ошибок минимальной — сообщение ниже
    }
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        {t("pages.booked.title") || "Reserve product"}
      </Text>

      {/* Имя */}
      <Text style={{ color: "#374151", marginBottom: 6, fontWeight: "600" }}>
        {t("pages.booked.form.name") || "Name"}
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t("pages.booked.form.name") || "Name"}
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 12,
          marginBottom: 12,
          backgroundColor: "#fff",
        }}
      />

      {/* Телефон */}
      <Text style={{ color: "#374151", marginBottom: 6, fontWeight: "600" }}>
        {t("pages.booked.form.phone") || "Phone"}
      </Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder={t("pages.booked.form.phone") || "Phone"}
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 12,
          marginBottom: 12,
          backgroundColor: "#fff",
        }}
      />

      {/* Контакты */}
      <Text style={{ color: "#374151", marginBottom: 8, fontWeight: "600" }}>
        {t("pages.booked.form.contacts") || "Contact me via"}
      </Text>
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <Checkbox
          label={t("card.fund.whatsapp") || "WhatsApp"}
          checked={byWhatsapp}
          onChange={setByWhatsapp}
        />
        <Checkbox
          label={t("pages.booked.form.byPhone") || "Phone call"}
          checked={byPhone}
          onChange={setByPhone}
        />
      </View>

      {/* Кнопка бронирования */}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button
          title={t("pages.booked.form.submit") || "Reserve"}
          onPress={onSubmit}
          fullWidth
        />
      )}

      {/* Сообщения */}
      {success ? (
        <Text style={{ color: "#166534", marginTop: 12, fontWeight: "600" }}>
          {t("pages.booked.success") || "The product has been reserved."}
        </Text>
      ) : (
        <Text style={{ color: "#6b7280", marginTop: 12 }}>
          {t("pages.booked.note") || "Press OK to reserve this product."}
        </Text>
      )}

      {error ? (
        <Text style={{ color: "#b91c1c", marginTop: 12 }}>
          {String(error)}
        </Text>
      ) : null}

      {/* Примечание под формой */}
      <View
        style={{
          backgroundColor: "#eff6ff",
          borderColor: "#bfdbfe",
          borderWidth: 1,
          borderRadius: 12,
          padding: 10,
          marginTop: 16,
        }}
      >
        <Text style={{ color: "#1e3a8a" }}>
          {t("pages.booked.cancelNote") ||
            "If you decide to cancel the reservation, please notify the Master via any contact listed on their profile. Or write to us at support@sandifund.com."}
        </Text>
      </View>
    </View>
  );
}
