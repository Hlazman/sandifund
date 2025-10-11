import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ME, GET_MY_USER_INFO } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelect from "../components/LanguageSelect";
import { UPDATE_USERS_PERMISSIONS_USER } from "../api/mutations";

function ConfirmModal({ visible, title, desc, onCancel, onOk, t }) {
  if (!visible) return null;
  return (
    <View style={{
      position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "center", alignItems: "center", padding: 24, zIndex: 20,
    }}>
      <View style={{
        width: "100%", maxWidth: 420, backgroundColor: "#fff",
        borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb",
      }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 6 }}>{title}</Text>
        {desc ? <Text style={{ color: "#374151", marginBottom: 12 }}>{desc}</Text> : null}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
          <Pressable onPress={onCancel} style={({ pressed }) => ({
            paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
            borderWidth: 1, borderColor: "#d1d5db", backgroundColor: pressed ? "#f3f4f6" : "#fff",
          })}>
            <Text style={{ fontWeight: "700" }}>{t("common.cancel")}</Text>
          </Pressable>
          <Pressable onPress={onOk} style={({ pressed }) => ({
            paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
            backgroundColor: pressed ? "#4338ca" : "#4f46e5",
          })}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{t("common.ok")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function Profile() {
  const { t } = useLanguage();
  const nav = useNavigation();

  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery(GET_ME, { fetchPolicy: "cache-and-network" });
  useQuery(GET_MY_USER_INFO, { fetchPolicy: "cache-first" });

  const me = meData?.me || null;
  const roleName = useMemo(() => (me?.role?.name || me?.role?.type || "").toString().toLowerCase(), [me]);

  const [updateUser, { loading: updatingUser, error: updateErr }] =
    useMutation(UPDATE_USERS_PERMISSIONS_USER, { onCompleted: () => refetchMe().catch(() => {}) });

  const [email, setEmail] = useState(me?.email || "");
  const [emailMsg, setEmailMsg] = useState("");
  const [username, setUsername] = useState(me?.username || "");
  const [usernameMsg, setUsernameMsg] = useState("");
  const [askUsername, setAskUsername] = useState(false);

  useEffect(() => {
    if (me?.email) setEmail(me.email);
    if (me?.username) setUsername(me.username);
  }, [me?.email, me?.username]);

  const isEmailValid = !!email && /\S+@\S+\.\S+/.test(email);
  const canSaveEmail = !!me?.id && isEmailValid && email !== me?.email;
  const canSaveUsername = !!me?.id && username && username.length >= 2 && username !== me?.username;

  const saveEmail = async () => {
    setEmailMsg("");
    try {
      await updateUser({ variables: { id: me.id, data: { email } } });
      setEmailMsg("OK");
    } catch (e) {
      setEmailMsg(e?.message || t("errors.unknown"));
    }
  };

  const saveUsername = async () => {
    setAskUsername(false);
    setUsernameMsg("");
    try {
      await updateUser({ variables: { id: me.id, data: { username } } });
      setUsernameMsg("OK");
    } catch (e) {
      setUsernameMsg(e?.message || t("errors.unknown"));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        >
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
              {t("header.items.profile") || "My profile"}
            </Text>
            {meLoading ? <ActivityIndicator /> : (
              <>
                <Text style={{ color: "#374151" }}>
                  <Text style={{ opacity: 0.7 }}>{t("pages.profile.changeUsername")}{": "}</Text>
                  <Text style={{ fontWeight: "600" }}>{me?.username || "-"}</Text>
                </Text>
                <Text style={{ color: "#374151", marginTop: 4 }}>
                  <Text style={{ opacity: 0.7 }}>{t("auth.email")}{": "}</Text>
                  <Text style={{ fontWeight: "600" }}>{me?.email || "-"}</Text>
                </Text>
              </>
            )}
          </View>

          {/* Язык */}
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>{t("common.language")}</Text>
            <LanguageSelect />
          </View>

          //TODO {/* Подписка — заглушка */} 
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6 }}>{t("pages.profile.subscription")}</Text>
            <Text style={{ color: "#6b7280" }}>{t("pages.profile.subscriptionDesc")}</Text>
          </View>

          //TODO {/* Платежи — заглушка */}
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6 }}>{t("pages.profile.payment")}</Text>
            <Text style={{ color: "#6b7280" }}>{t("pages.profile.paymentDesc")}</Text>
          </View>

          {/* Email */}
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>{t("pages.profile.changeEmail")}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t("auth.placeholders.email")}
              style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" }}
            />
            {!isEmailValid && !!email ? <Text style={{ color: "#b91c1c" }}>{t("auth.errors.invalidEmail")}</Text> : null}
            <TouchableOpacity
              disabled={!canSaveEmail || updatingUser}
              onPress={saveEmail}
              style={{ backgroundColor: !canSaveEmail || updatingUser ? "#c7d2fe" : "#4f46e5",
                borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
            >
              {updatingUser ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>{t("common.save")}</Text>}
            </TouchableOpacity>
            {!!emailMsg && <Text style={{ color: emailMsg === "OK" ? "#15803d" : "#b91c1c" }}>
              {emailMsg === "OK" ? t("common.ok") : emailMsg}
            </Text>}
            {updateErr ? <Text style={{ color: "#b91c1c" }}>{String(updateErr.message)}</Text> : null}
          </View>

          {/* Пароль — переход на отдельную страницу */}
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>{t("pages.profile.changePassword")}</Text>
            <TouchableOpacity
              onPress={() => nav.navigate("ChangePassword")}
              style={{ backgroundColor: "#4f46e5", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>{t("pages.profile.changePassword")}</Text>
            </TouchableOpacity>
          </View>

          {/* Username — с подтверждением */}
          <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>{t("pages.profile.changeUsername")}</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder={t("pages.profile.changeUsername")}
              style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" }}
            />
            <TouchableOpacity
              disabled={!canSaveUsername || updatingUser}
              onPress={() => setAskUsername(true)}
              style={{ backgroundColor: !canSaveUsername || updatingUser ? "#c7d2fe" : "#4f46e5",
                borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
            >
              {updatingUser ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>{t("common.save")}</Text>}
            </TouchableOpacity>
            {!!usernameMsg && <Text style={{ color: usernameMsg === "OK" ? "#15803d" : "#b91c1c" }}>
              {usernameMsg === "OK" ? t("common.ok") : usernameMsg}
            </Text>}
          </View>

          {/* Низ страницы */}
          <View style={{ borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 8 }}>
            <Text style={{ color: "#374151" }}>
              {roleName === "master" ? t("pages.profile.masterFooter") : t("pages.profile.userFooter")}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* подтверждение имени */}
      <ConfirmModal
        visible={askUsername}
        t={t}
        title={t("pages.profile.changeUsername")}
        desc={t("pages.myGoods.confirmChange")}
        onCancel={() => setAskUsername(false)}
        onOk={saveUsername}
      />
    </SafeAreaView>
  );
}


