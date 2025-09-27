// import React from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { useLanguage } from "../context/LanguageContext";

// export default function CheckEmail() {
//   const { t, dir } = useLanguage();
//   const { params } = useRoute();
//   const nav = useNavigation();
//   const email = params?.email;

//   return (
//     <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
//       <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: dir === "rtl" ? "right" : "left" }}>
//         {t("auth.confirm.pageTitle")}
//       </Text>
//       <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 14 }}>
//         <Text style={{ fontWeight: "600", marginBottom: 4, textAlign: dir === "rtl" ? "right" : "left" }}>
//           {t("auth.confirm.thanks")}
//         </Text>
//         <Text style={{ marginBottom: 8, textAlign: dir === "rtl" ? "right" : "left" }}>
//           {t("auth.confirm.checkEmail")}{email ? ` (${email})` : ""}.
//         </Text>
//         <Text style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
//           {t("auth.confirm.noEmailPrefix")} <Text style={{ textDecorationLine: "underline" }}>support@sandifund.com</Text>.
//         </Text>
//         <TouchableOpacity onPress={() => nav.replace("Auth")} style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
//           <Text style={{ fontWeight: "700" }}>{t("auth.backToLogin")}</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }


import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";
import { confirmEmail } from "../api/rest";

export default function CheckEmail() {
  const { t, dir } = useLanguage();
  const { params } = useRoute();
  const nav = useNavigation();
  const email = params?.email;

  const [code, setCode] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const onConfirm = async () => {
    setError("");
    const trimmed = code.trim();
    if (!trimmed) { setError(t("errors.unknown")); return; }
    setPhase("loading");
    try {
      await confirmEmail(trimmed);
      setPhase("success");
    } catch (e) {
      setError(e.message || t("errors.unknown"));
      setPhase("error");
    }
  };

  const isRTL = dir === "rtl";

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: isRTL ? "right" : "left" }}>
        {t("auth.confirm.pageTitle")}
      </Text>

      {/* Информационный блок */}
      <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <Text style={{ fontWeight: "600", marginBottom: 4, textAlign: isRTL ? "right" : "left" }}>
          {t("auth.confirm.thanks")}
        </Text>
        <Text style={{ textAlign: isRTL ? "right" : "left" }}>
          {t("auth.confirm.checkEmail")}{email ? ` (${email})` : ""}.
        </Text>
        <Text style={{ marginTop: 6, textAlign: isRTL ? "right" : "left" }}>
          {t("auth.confirm.noEmailPrefix")} <Text style={{ textDecorationLine: "underline" }}>support@sandifund.com</Text>.
        </Text>
      </View>

      {/* ВРЕМЕННО: ввод кода подтверждения прямо здесь */}
      {phase !== "success" ? (
        <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 14 }}>
          <Text style={{ fontWeight: "600", marginBottom: 8, textAlign: isRTL ? "right" : "left" }}>
            Enter the confirmation code here
          </Text>

          <Text style={{ fontSize: 12, color: "#374151", marginBottom: 4, textAlign: isRTL ? "right" : "left" }}>
            Confirmation code
          </Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            placeholder="Paste code from email"
            style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" }}
          />

          {error ? <Text style={{ color: "#b91c1c", marginTop: 8 }}>{error}</Text> : null}

          <TouchableOpacity
            onPress={onConfirm}
            disabled={phase === "loading"}
            style={{ marginTop: 12, backgroundColor: "#4f46e5", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
          >
            {phase === "loading" ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>{t("common.submit")}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nav.replace("Auth")}
            style={{ marginTop: 8, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700" }}>{t("auth.backToLogin")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 6, textAlign: isRTL ? "right" : "left" }}>
            {t("auth.confirm.successTitle")}
          </Text>
          <Text style={{ textAlign: isRTL ? "right" : "left" }}>{t("auth.confirm.successDesc")}</Text>
          <TouchableOpacity
            onPress={() => nav.replace("Auth")}
            style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "700" }}>{t("auth.backToLogin")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
