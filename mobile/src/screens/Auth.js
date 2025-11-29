import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { useNavigation } from "@react-navigation/native";

import { LOGIN, REGISTER, CREATE_USER_INFO, UPDATE_USER_INFO } from "../api/mutations";
import { GET_ME, GET_MY_USER_INFO } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import LanguageSelect from "../components/LanguageSelect";
import Terms from "./Terms";
import Privacy from "./Privacy";

function Checkbox({ value, onChange, label, dir }) {
  return (
    <TouchableOpacity onPress={() => onChange(!value)} style={[s.checkboxRow, dir === "rtl" && { flexDirection: "row-reverse" }]}>
      <Ionicons name={value ? "checkbox-outline" : "square-outline"} size={20} />
      <Text style={[s.checkboxLabel, dir === "rtl" && { textAlign: "right" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function Auth() {
  const nav = useNavigation();
  const apollo = useApolloClient();

  const { locale, dir, t, setLocale } = useLanguage();
  const { loginWithToken } = useAuth();

  const [tab, setTab] = useState("login");
  const [selectedLang, setSelectedLang] = useState(locale);

  // login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [remember, setRemember] = useState(true);

  // register form
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPass2, setRegPass2] = useState("");
  const [agree, setAgree] = useState(false);

  // dialogs
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // показать/скрыть пароли
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegPass2, setShowRegPass2] = useState(false);

  const [error, setError] = useState("");

  const [doLogin, { loading: loggingIn }] = useMutation(LOGIN);
  const [doRegister, { loading: registering }] = useMutation(REGISTER);
  const [createUserInfo] = useMutation(CREATE_USER_INFO);
  const [updateUserInfo] = useMutation(UPDATE_USER_INFO);

  const submitLogin = async () => {
    setError("");
    try {
      const { data } = await doLogin({ variables: { identifier: loginEmail.trim(), password: loginPass } });
      const token = data?.login?.jwt;
      if (!token) throw new Error("No JWT");

      await loginWithToken(token);

      try {
        const res = await apollo.query({ query: GET_MY_USER_INFO, fetchPolicy: "network-only" });
        let ui = res?.data?.meFull?.user_info;
        if (ui?.documentId) {
          globalThis.sf_userInfoId = ui.documentId;
          await updateUserInfo({ variables: { documentId: ui.documentId, data: { language: selectedLang } } });
        } else {
          const me = await apollo.query({ query: GET_ME, fetchPolicy: "network-only" });
          const userDocId = me?.data?.me?.documentId;
          if (userDocId) {
            const created = await createUserInfo({ variables: { data: { user: userDocId, language: selectedLang } } });
            const newId = created?.data?.createUserInfo?.documentId;
            if (newId) globalThis.sf_userInfoId = newId;
          }
        }
      } catch {}

      nav.reset({ index: 0, routes: [{ name: "Sticers" }] });
    } catch (e) {
      // setError(e.message || "Login failed");
      setError(t("errors.loginFailed"));
    }
  };

  const submitRegister = async () => {
    setError("");
    if (!agree) { setError(t("auth.errors.agreeRequired")); return; }
    if (regPass !== regPass2) { setError(t("auth.errors.passwordsMismatch")); return; }

    try {
      // 1) регистрация
      const { data } = await doRegister({
        variables: { username: regEmail.trim(), email: regEmail.trim(), password: regPass },
      });
      const token = data?.register?.jwt;
      // if (!token) throw new Error("No JWT after register");

      if (!token) {
        nav.replace("CheckEmail", { email: regEmail.trim() });
        return;
      }

      await loginWithToken(token);

      // 2) узнаём user.documentId
      const me = await apollo.query({ query: GET_ME, fetchPolicy: "network-only" });
      const userDocId = me?.data?.me?.documentId;
      if (!userDocId) throw new Error("No user.documentId");

      // 3) создаём UserInfo с выбранным языком
      const info = await createUserInfo({ variables: { data: { user: userDocId, language: selectedLang } } });
      const userInfoId = info?.data?.createUserInfo?.documentId;
      if (userInfoId) globalThis.sf_userInfoId = userInfoId;

      // 4) на Payment
      nav.reset({ index: 0, routes: [{ name: "Payment" }] });
    } catch (e) {
      setError(e.message || "Register failed");
    }
  };

  const labelAlign = dir === "rtl" ? { textAlign: "right", alignSelf: "flex-end" } : null;

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* язык */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[s.label, labelAlign]}>{t("common.language")}</Text>
        <LanguageSelect onChange={(code) => { setSelectedLang(code); setLocale(code); }} />
      </View>

      {/* табы */}
      <View style={s.tabs}>
        <TouchableOpacity onPress={() => setTab("login")} style={[s.tab, tab === "login" && s.tabActive]}>
          <Text style={[s.tabText, tab === "login" && s.tabTextActive]}>{t("auth.signIn")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("register")} style={[s.tab, tab === "register" && s.tabActive]}>
          <Text style={[s.tabText, tab === "register" && s.tabTextActive]}>{t("auth.register")}</Text>
        </TouchableOpacity>
      </View>

      {tab === "login" ? (
        <View style={s.card}>
          <Text style={[s.label, labelAlign]}>{t("auth.email")}</Text>
          <TextInput 
            value={loginEmail} 
            onChangeText={setLoginEmail} 
            keyboardType="email-address" 
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={t("auth.placeholders.email")}
            style={s.input} 
          />

          <Text style={[s.label, labelAlign]}>{t("auth.password")}</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              value={loginPass}
              onChangeText={setLoginPass}
              secureTextEntry={!showLoginPass}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              placeholder={t("auth.placeholders.password")}
              style={[s.input, dir === "rtl" ? s.inputWithIconRtl : s.inputWithIcon]}
            />
            <TouchableOpacity
              onPress={() => setShowLoginPass(v => !v)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              style={[s.eye, dir === "rtl" && s.eyeRtl]}
              accessibilityLabel={showLoginPass ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              <Ionicons name={showLoginPass ? "eye" : "eye-off"} size={20} />
            </TouchableOpacity>
          </View>

          <View style={{ marginVertical: 6, flexDirection: dir === "rtl" ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between" }}>
            <Checkbox value={remember} onChange={setRemember} label={t("auth.rememberMe")} dir={dir} />
            {/* <TouchableOpacity><Text style={{ color: "#2563eb" }}>{t("auth.forgotPassword")}</Text></TouchableOpacity> */}

            <TouchableOpacity onPress={() => nav.navigate("ForgotPassword")}>
              <Text style={{ color: "#2563eb" }}>{t("auth.forgotPassword")}</Text>
            </TouchableOpacity>           
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity disabled={loggingIn} onPress={submitLogin} style={s.primaryBtn}>
            <Text style={s.primaryBtnText}>{t("common.submit")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.card}>
          <Text style={[s.label, labelAlign]}>{t("auth.email")}</Text>
          <TextInput 
            value={regEmail} 
            onChangeText={setRegEmail} 
            keyboardType="email-address" 
            autoCapitalize="none"
            placeholder={t("auth.placeholders.email")}
            style={s.input} 
          />

          <Text style={[s.label, labelAlign]}>{t("auth.password")}</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              value={regPass}
              onChangeText={setRegPass}
              secureTextEntry={!showRegPass}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              placeholder={t("auth.placeholders.password")}
              style={[s.input, dir === "rtl" ? s.inputWithIconRtl : s.inputWithIcon]}
            />
            <TouchableOpacity
              onPress={() => setShowRegPass(v => !v)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              style={[s.eye, dir === "rtl" && s.eyeRtl]}
              accessibilityLabel={showLoginPass ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              <Ionicons name={showRegPass ? "eye" : "eye-off"} size={20} />
            </TouchableOpacity>
          </View>

          <Text style={[s.label, labelAlign]}>{t("auth.confirmPassword")}</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              value={regPass2}
              onChangeText={setRegPass2}
              secureTextEntry={!showRegPass2}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              placeholder={t("auth.placeholders.confirmPassword")}
              style={[s.input, dir === "rtl" ? s.inputWithIconRtl : s.inputWithIcon]}
            />
            <TouchableOpacity
              onPress={() => setShowRegPass2(v => !v)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              style={[s.eye, dir === "rtl" && s.eyeRtl]}
              accessibilityLabel={showLoginPass ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              <Ionicons name={showRegPass2 ? "eye" : "eye-off"} size={20} />
            </TouchableOpacity>
          </View>

          {/* согласие — 3 строки */}
          <View style={{ marginTop: 6, alignItems: dir === "rtl" ? "flex-end" : "flex-start" }}>
            <Checkbox value={agree} onChange={setAgree} label={t("auth.agreeWith")} dir={dir} />

            <TouchableOpacity onPress={() => setShowPrivacy(true)}>
              <Text style={[s.link, dir === "rtl" && s.linkRtl]}>{t("auth.privacyPolicy")}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowTerms(true)}>
              <Text style={[s.link, dir === "rtl" && s.linkRtl]}>{t("auth.termsOfUse")}</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity disabled={registering} onPress={submitRegister} style={s.primaryBtn}>
            <Text style={s.primaryBtnText}>{t("common.submit")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Privacy modal */}
      <Modal
        visible={showPrivacy}
        onRequestClose={() => setShowPrivacy(false)}
        animationType="slide"
        statusBarTranslucent
      >
        <SafeAreaView style={s.modalRoot} edges={["top"]}>
          <View style={s.modalHeader}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>{t("auth.privacyPolicy")}</Text>
            <TouchableOpacity
              onPress={() => setShowPrivacy(false)}
              accessibilityLabel="Close"
              hitSlop={{ top: 16, right: 16, bottom: 16, left: 16 }}
              activeOpacity={0.7}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={26} />
            </TouchableOpacity>
          </View>

          <ScrollView style={s.modalScroll} contentContainerStyle={{ padding: 12 }}>
            <Privacy />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Terms modal */}
      <Modal
        visible={showTerms}
        onRequestClose={() => setShowTerms(false)}
        animationType="slide"
        statusBarTranslucent
      >
        <SafeAreaView style={s.modalRoot} edges={["top"]}>
          <View style={s.modalHeader}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>{t("auth.termsOfUse")}</Text>
            <TouchableOpacity
              onPress={() => setShowTerms(false)}
              accessibilityLabel="Close"
              hitSlop={{ top: 16, right: 16, bottom: 16, left: 16 }}
              activeOpacity={0.7}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={26} />
            </TouchableOpacity>
          </View>

          <ScrollView style={s.modalScroll} contentContainerStyle={{ padding: 12 }}>
            <Terms />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, gap: 12 },
  tabs: {
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", flexDirection: "row",
    overflow: "hidden",
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#eef2ff" },
  tabText: { fontWeight: "600", color: "#374151" },
  tabTextActive: { color: "#4f46e5" },

  card: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 12, gap: 8 },

  label: { fontSize: 12, color: "#374151", marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: "#fff",
  },

  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  checkboxLabel: { fontSize: 14 },

  primaryBtn: { marginTop: 8, backgroundColor: "#4f46e5", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  error: { color: "#b91c1c", marginTop: 6 },

  link: { color: "#2563eb", marginTop: 14 },

  googleBtn: {
    marginTop: 12, alignSelf: "stretch", backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db",
    borderRadius: 10, paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row",
  },
  modalRoot: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
   height: 52,
   paddingHorizontal: 12,
   flexDirection: "row",
   alignItems: "center",
   justifyContent: "space-between",
   backgroundColor: "#fff",
   borderBottomWidth: 1,
   borderBottomColor: "#e5e7eb",
   zIndex: 2,
   elevation: 2,
  },
  modalScroll: { flex: 1, zIndex: 0 },
  linkRtl: { alignSelf: "flex-end", textAlign: "right" },
  inputWithIcon: { paddingRight: 52 },
  inputWithIconRtl: { paddingLeft: 52 },
  eye: { position: "absolute", right: 12, top: "50%", marginTop: -10, padding: 6 },
  eyeRtl: { right: "auto", left: 12 },
});