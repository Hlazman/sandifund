import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { resetPassword } from "../api/rest";
import { useLanguage } from "../context/LanguageContext";

export default function ResetPassword() {
  const { t, dir } = useLanguage();
  const nav = useNavigation();
  const { params } = useRoute();
  const initialCode = params?.code || ""; // для web/deep link

  const [code, setCode] = useState(initialCode);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (p1 !== p2) { setError(t("auth.errors.passwordsMismatch")); return; }
    try {
      await resetPassword({ code: code.trim(), password: p1, passwordConfirmation: p2 });
      setDone(true);
    } catch (e) {
      setError(e.message || t("errors.unknown"));
    }
  };

  if (done) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 6, textAlign: dir === "rtl" ? "right" : "left" }}>
          {t("auth.reset.successTitle")}
        </Text>
        <Text style={{ textAlign: dir === "rtl" ? "right" : "left" }}>{t("auth.reset.successDesc")}</Text>
        <TouchableOpacity onPress={() => nav.replace("Auth")} style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ fontWeight: "700" }}>{t("auth.backToLogin")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 8, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "700", textAlign: dir === "rtl" ? "right" : "left" }}>{t("auth.reset.title")}</Text>

      <Text style={{ fontSize: 12, color: "#374151", marginBottom: 4, textAlign: dir === "rtl" ? "right" : "left" }}>
        CODE
      </Text>
      <TextInput
        value={code} onChangeText={setCode} autoCapitalize="none"
        placeholder="paste code from the link"
        style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" }}
      />

      <Text style={{ fontSize: 12, color: "#374151", marginTop: 8, textAlign: dir === "rtl" ? "right" : "left" }}>
        {t("auth.reset.newPassword")}
      </Text>
      <TextInput
        value={p1} onChangeText={setP1} secureTextEntry
        placeholder={t("auth.placeholders.password")}
        style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" }}
      />

      <Text style={{ fontSize: 12, color: "#374151", marginTop: 8, textAlign: dir === "rtl" ? "right" : "left" }}>
        {t("auth.reset.repeatPassword")}
      </Text>
      <TextInput
        value={p2} onChangeText={setP2} secureTextEntry
        placeholder={t("auth.placeholders.confirmPassword")}
        style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" }}
      />

      {error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}

      <TouchableOpacity onPress={submit} style={{ backgroundColor: "#4f46e5", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>{t("auth.reset.submit")}</Text>
      </TouchableOpacity>
    </View>
  );
}
