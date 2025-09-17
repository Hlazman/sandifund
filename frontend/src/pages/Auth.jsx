import React, { useEffect, useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { LOGIN, REGISTER, CREATE_USER_INFO, UPDATE_USER_INFO } from "../api/mutations";
import { GET_ME, GET_MY_USER_INFO } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import LanguageSelect from "../components/LanguageSelect";
import Terms from "./Terms";
import Privacy from "./Privacy";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const apollo = useApolloClient();

  // const { locale, setLocale, t } = useLanguage();
  const { locale, setLocale, t, dir } = useLanguage();
  const { loginWithToken } = useAuth();

  // формы
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [remember, setRemember] = useState(true);

  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPass2, setRegPass2] = useState("");
  const [agree, setAgree] = useState(false);

  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const redirectAfterLogin = useMemo(() => location.state?.from?.pathname || "/", [location.state]);

  // выбранный язык на этой странице (чтобы точно сохранить его в UserInfo)
  const [selectedLang, setSelectedLang] = useState(locale);
  useEffect(() => { setSelectedLang(locale); }, [locale]);

  // gql
  const [doLogin, { loading: loggingIn }] = useMutation(LOGIN);
  const [doRegister, { loading: registering }] = useMutation(REGISTER);
  const [createUserInfo] = useMutation(CREATE_USER_INFO);
  const [updateUserInfo] = useMutation(UPDATE_USER_INFO);

  const onLogin = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      const { data } = await doLogin({
        variables: { identifier: loginEmail.trim(), password: loginPass },
      });
      const token = data?.login?.jwt;
      if (!token) throw new Error("No JWT returned");

      loginWithToken(token, remember);
      await apollo.clearStore();

      // Обновим язык в уже существующем UserInfo (если есть)
      try {
        const meFull = await apollo.query({ query: GET_MY_USER_INFO, fetchPolicy: "network-only" });
        const ui = meFull?.data?.meFull?.user_info;
        if (ui?.documentId) {
          localStorage.setItem("sf_userInfoId", ui.documentId);
          await updateUserInfo({ variables: { documentId: ui.documentId, data: { language: selectedLang } } });
        }
      } catch { /* ок */ }

      navigate(redirectAfterLogin, { replace: true });
    } catch (err) {
      setSubmitError(err.message || "Login failed");
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!agree) { setSubmitError(t("auth.agreeWith") || "Нужно согласиться"); return; }
    if (regPass !== regPass2) { setSubmitError("Пароли не совпадают"); return; }

    try {
      const { data } = await doRegister({
        variables: { username: regEmail.trim(), email: regEmail.trim(), password: regPass },
      });
      const token = data?.register?.jwt;
      if (!token) throw new Error("No JWT after register");

      loginWithToken(token, true);
      await apollo.clearStore();

      const me = await apollo.query({ query: GET_ME, fetchPolicy: "network-only" });
      const userDocId = me?.data?.me?.documentId;
      if (!userDocId) throw new Error("No user.documentId after register");

      const info = await createUserInfo({
        variables: { data: { user: userDocId, language: selectedLang } },
      });
      const userInfoId = info?.data?.createUserInfo?.documentId;
      if (userInfoId) localStorage.setItem("sf_userInfoId", userInfoId);

      navigate("/payment", { replace: true });
    } catch (err) {
      setSubmitError(err.message || "Register failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Язык */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">{t("common.language")}</label>
        <LanguageSelect onChange={(code) => { setSelectedLang(code); setLocale(code); }} />
      </div>

      <Tabs.Root defaultValue="login" className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <Tabs.List className="grid grid-cols-2">
          <Tabs.Trigger value="login" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-tl-2xl">
            {t("auth.signIn")}
          </Tabs.Trigger>
          <Tabs.Trigger value="register" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-tr-2xl">
            {t("auth.register")}
          </Tabs.Trigger>
        </Tabs.List>

        {/* ВХОД */}
        <Tabs.Content value="login" className="p-4 space-y-4">
          <form onSubmit={onLogin} className="space-y-3">
            <div>
              {/* <label className="text-sm block mb-1">{t("auth.email")}</label> */}
              <label className={`text-sm block mb-1 ${dir === "rtl" ? "text-right" : ""}`}>{t("auth.email")}</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              {/* <label className="text-sm block mb-1">{t("auth.password")}</label> */}
              <label className={`text-sm block mb-1 ${dir === "rtl" ? "text-right" : ""}`}>{t("auth.password")}</label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                {t("auth.rememberMe")}
              </label>
              <Link to="#" className="text-sm text-indigo-600 hover:underline">
                {t("auth.forgotPassword")}
              </Link>
            </div>

            {submitError && <div className="text-sm text-red-600">{submitError}</div>}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {loggingIn ? "..." : t("common.submit")}
            </button>
          </form>
        </Tabs.Content>

        {/* РЕГИСТРАЦИЯ */}
        <Tabs.Content value="register" className="p-4 space-y-4">
          <form onSubmit={onRegister} className="space-y-3">
            <div>
              {/* <label className="text-sm block mb-1">{t("auth.email")}</label> */}
              <label className={`text-sm block mb-1 ${dir === "rtl" ? "text-right" : ""}`}>{t("auth.email")}</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              {/* <label className="text-sm block mb-1">{t("auth.password")}</label> */}
              <label className={`text-sm block mb-1 ${dir === "rtl" ? "text-right" : ""}`}>{t("auth.password")}</label>
              <input
                type="password"
                required
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              {/* <label className="text-sm block mb-1">{t("auth.confirmPassword")}</label> */}
              <label className={`text-sm block mb-1 ${dir === "rtl" ? "text-right" : ""}`}>{t("auth.confirmPassword")}</label>
              <input
                type="password"
                required
                value={regPass2}
                onChange={(e) => setRegPass2(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* согласие: 3 строки */}
            <div className="text-sm">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <div>{t("auth.agreeWith")}</div>

                  <div>
                    <Dialog.Root open={openPrivacy} onOpenChange={setOpenPrivacy}>
                      <Dialog.Trigger asChild>
                        <button type="button" className="text-indigo-600 hover:underline">
                          {t("auth.privacyPolicy")}
                        </button>
                      </Dialog.Trigger>
                      <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                        <Dialog.Content className="fixed inset-4 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-[720px] max-h-[80vh] overflow-auto bg-white rounded-xl p-4 shadow-xl">
                          <Dialog.Title className="text-lg font-semibold mb-2">{t("auth.privacyPolicy")}</Dialog.Title>
                          <Dialog.Description className="sr-only">{t("auth.privacyPolicy")}</Dialog.Description>
                          <Privacy />
                          <div className="mt-4 text-right">
                            <Dialog.Close className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">{t("common.close")}</Dialog.Close>
                          </div>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                  </div>

                  <div>
                    <Dialog.Root open={openTerms} onOpenChange={setOpenTerms}>
                      <Dialog.Trigger asChild>
                        <button type="button" className="text-indigo-600 hover:underline">
                          {t("auth.termsOfUse")}
                        </button>
                      </Dialog.Trigger>
                      <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                        <Dialog.Content className="fixed inset-4 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-[720px] max-h-[80vh] overflow-auto bg-white rounded-xl p-4 shadow-xl">
                          <Dialog.Title className="text-lg font-semibold mb-2">{t("auth.termsOfUse")}</Dialog.Title>
                          <Dialog.Description className="sr-only">{t("auth.termsOfUse")}</Dialog.Description>
                          <Terms />
                          <div className="mt-4 text-right">
                            <Dialog.Close className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">{t("common.close")}</Dialog.Close>
                          </div>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                  </div>
                </div>
              </div>
            </div>

            {submitError && <div className="text-sm text-red-600">{submitError}</div>}

            <button
              type="submit"
              disabled={registering}
              className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {registering ? "..." : t("common.submit")}
            </button>
          </form>
        </Tabs.Content>
      </Tabs.Root>

      {/* Кнопка Google */}
      <div className="mt-4">
        <a
          href="#"
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 font-medium hover:bg-gray-50"
        >
          <img alt="" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" />
          {t("auth.continueWithGoogle")}
        </a>
      </div>
    </div>
  );
}
