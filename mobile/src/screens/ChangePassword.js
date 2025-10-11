import React from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, Pressable
} from "react-native";
import { useMutation } from "@apollo/client/react";
import { useLanguage } from "../context/LanguageContext";
import { CHANGE_PASSWORD } from "../api/mutations";

function PasswordRow({ label, value, onChange, placeholder, visible, onToggle }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>{label}</Text>
      <View style={{ position: "relative" }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry={!visible}
          autoCapitalize="none"
          placeholder={placeholder}
          style={{
            borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff"
          }}
        />
        <Pressable
          onPress={onToggle}
          style={{
            position: "absolute", right: 10, top: 0, bottom: 0,
            justifyContent: "center", paddingHorizontal: 6
          }}
        >
          <Text style={{ opacity: 0.7 }}>
            {/* используем ваши переводы show/hide */}
            {visible ? "🙈 " : "👁️ "}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ChangePassword() {
  const { t } = useLanguage();

  const [cur, setCur] = React.useState("");
  const [n1, setN1] = React.useState("");
  const [n2, setN2] = React.useState("");

  const [showCur, setShowCur] = React.useState(false);
  const [showN1, setShowN1] = React.useState(false);
  const [showN2, setShowN2] = React.useState(false);

  const [msg, setMsg] = React.useState("");

  const [mutate, { loading, error }] = useMutation(CHANGE_PASSWORD);

  const canSubmit = cur && n1 && n2 && n1.length >= 6 && n1 === n2;

  const onSubmit = async () => {
    setMsg("");
    if (!canSubmit) {
      setMsg(t("auth.errors.passwordsMismatch"));
      return;
    }
    try {
      await mutate({
        variables: {
          currentPassword: cur,
          password: n1,
          passwordConfirmation: n2,
        },
      });
      setMsg("OK");
      setCur(""); setN1(""); setN2("");
    } catch (e) {
      setMsg(e?.message || t("errors.unknown"));
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        {t("pages.profile.changePassword")}
      </Text>

      <PasswordRow
        label={t("auth.password")}
        value={cur}
        onChange={setCur}
        placeholder={t("auth.password")}
        visible={showCur}
        onToggle={() => setShowCur((v) => !v)}
      />
      <PasswordRow
        label={t("auth.reset.newPassword")}
        value={n1}
        onChange={setN1}
        placeholder={t("auth.reset.newPassword")}
        visible={showN1}
        onToggle={() => setShowN1((v) => !v)}
      />
      <PasswordRow
        label={t("auth.reset.repeatPassword")}
        value={n2}
        onChange={setN2}
        placeholder={t("auth.reset.repeatPassword")}
        visible={showN2}
        onToggle={() => setShowN2((v) => !v)}
      />

      <TouchableOpacity
        disabled={!canSubmit || loading}
        onPress={onSubmit}
        style={{
          backgroundColor: !canSubmit || loading ? "#c7d2fe" : "#4f46e5",
          borderRadius: 10, paddingVertical: 12, alignItems: "center"
        }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={{ color: "#fff", fontWeight: "700" }}>{t("common.save")}</Text>
        )}
      </TouchableOpacity>

      {!!msg && (
        <Text style={{ marginTop: 10, color: msg === "OK" ? "#15803d" : "#b91c1c" }}>
          {msg === "OK" ? t("auth.reset.successTitle") : msg}
        </Text>
      )}
      {error ? <Text style={{ marginTop: 6, color: "#b91c1c" }}>{String(error.message)}</Text> : null}
    </View>
  );
}
