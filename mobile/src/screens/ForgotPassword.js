// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { useLanguage } from "../context/LanguageContext";
// import { forgotPassword } from "../api/rest";

// export default function ForgotPassword() {
//   const { t, dir } = useLanguage();
//   const nav = useNavigation();
//   const [email, setEmail] = useState("");
//   const [sent, setSent] = useState(false);
//   const [error, setError] = useState("");

//   const submit = async () => {
//     setError("");
//     try {
//       await forgotPassword(email.trim());
//       setSent(true);
//     } catch (e) {
//       setError(e.message || t("errors.unknown"));
//     }
//   };

//   if (sent) {
//     return (
//       <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
//         <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 6, textAlign: dir === "rtl" ? "right" : "left" }}>
//           {t("auth.forgot.sentTitle")}
//         </Text>
//         <Text style={{ textAlign: dir === "rtl" ? "right" : "left" }}>{t("auth.forgot.sentDesc")}</Text>
//         <TouchableOpacity onPress={() => nav.replace("Auth")} style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
//           <Text style={{ fontWeight: "700" }}>{t("auth.backToLogin")}</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 8 }}>
//       <Text style={{ fontSize: 20, fontWeight: "700", textAlign: dir === "rtl" ? "right" : "left" }}>{t("auth.forgot.title")}</Text>
//       <Text style={{ marginBottom: 8, textAlign: dir === "rtl" ? "right" : "left" }}>{t("auth.forgot.intro")}</Text>

//       <Text style={{ fontSize: 12, color: "#374151", marginBottom: 4, textAlign: dir === "rtl" ? "right" : "left" }}>
//         {t("auth.email")}
//       </Text>
//       <TextInput
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//         keyboardType="email-address"
//         placeholder={t("auth.placeholders.email")}
//         style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" }}
//       />

//       {error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}

//       <TouchableOpacity onPress={submit} style={{ backgroundColor: "#4f46e5", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
//         <Text style={{ color: "#fff", fontWeight: "700" }}>{t("auth.forgot.send")}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";
import { forgotPassword } from "../api/rest";

export default function ForgotPassword() {
  const { t, dir } = useLanguage();
  const nav = useNavigation();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // ВРЕМЕННО: ввод reset-кода прямо тут
  const [code, setCode] = useState("");

  const submit = async () => {
    setError("");
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError(e.message || t("errors.unknown"));
    }
  };

  const goWithCode = () => {
    setError("");
    const trimmed = code.trim();
    if (!trimmed) { setError(t("errors.unknown")); return; }
    nav.navigate("ResetPassword", { code: trimmed });
  };

  const isRTL = dir === "rtl";

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", textAlign: isRTL ? "right" : "left" }}>
        {t("auth.forgot.title")}
      </Text>
      <Text style={{ marginBottom: 8, textAlign: isRTL ? "right" : "left" }}>
        {t("auth.forgot.intro")}
      </Text>

      <Text style={{ fontSize: 12, color: "#374151", marginBottom: 4, textAlign: isRTL ? "right" : "left" }}>
        {t("auth.email")}
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t("auth.placeholders.email")}
        style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" }}
      />

      {error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}

      <TouchableOpacity onPress={submit} style={{ backgroundColor: "#4f46e5", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>{t("auth.forgot.send")}</Text>
      </TouchableOpacity>

      {/* ВРЕМЕННО: блок ввода reset-кода */}
      <View style={{ marginTop: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 14 }}>
        <Text style={{ fontWeight: "600", marginBottom: 8, textAlign: isRTL ? "right" : "left" }}>
          Enter the reset code here
        </Text>

        <Text style={{ fontSize: 12, color: "#374151", marginBottom: 4, textAlign: isRTL ? "right" : "left" }}>
          Reset code
        </Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          placeholder="Paste reset code"
          style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" }}
        />

        <TouchableOpacity
          onPress={goWithCode}
          style={{ marginTop: 10, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
        >
          <Text style={{ fontWeight: "700" }}>Continue</Text>
        </TouchableOpacity>
      </View>

      {sent && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ textAlign: isRTL ? "right" : "left" }}>{t("auth.forgot.sentTitle")}</Text>
          <Text style={{ textAlign: isRTL ? "right" : "left" }}>{t("auth.forgot.sentDesc")}</Text>
        </View>
      )}
    </View>
  );
}
