import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { confirmEmail } from "../api/rest";
import { useLanguage } from "../context/LanguageContext";

export default function EmailConfirmation() {
  const { t, dir } = useLanguage();
  const { params } = useRoute();
  const nav = useNavigation();
  const [code, setCode] = useState(params?.confirmation || "");
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setState("loading");
    try {
      await confirmEmail(code.trim());
      setState("success");
    } catch (e) {
      setError(e.message || t("errors.unknown"));
      setState("error");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", textAlign: dir === "rtl" ? "right" : "left" }}>
        {t("auth.confirm.title")}
      </Text>

      {(state === "idle" || state === "error") && (
        <>
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            placeholder="paste confirmation code"
            style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" }}
          />
          {error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}
          <TouchableOpacity onPress={submit} style={{ backgroundColor: "#4f46e5", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{t("common.submit")}</Text>
          </TouchableOpacity>
        </>
      )}

      {state === "loading" && <Text>{t("auth.confirm.loading")}</Text>}

      {state === "success" && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 6, textAlign: dir === "rtl" ? "right" : "left" }}>
            {t("auth.confirm.successTitle")}
          </Text>
          <Text style={{ textAlign: dir === "rtl" ? "right" : "left" }}>{t("auth.confirm.successDesc")}</Text>
          <TouchableOpacity onPress={() => nav.replace("Auth")} style={{ marginTop: 12, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>{t("auth.backToLogin")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
