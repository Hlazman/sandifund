import React, {
  createContext, useContext, useEffect, useMemo, useState, useCallback,
} from "react";
import { I18nManager, Platform } from "react-native";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { GET_TRANSLATIONS, GET_MY_USER_INFO } from "../api/get";
import { UPDATE_USER_INFO } from "../api/mutations";

const LANGS = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "he", label: "עברית",  dir: "rtl" },
];

const LANG_KEY = "sf_lang";
const LanguageCtx = createContext(null);
export const useLanguage = () => useContext(LanguageCtx);

// безопасный геттер a.b.c
function pick(obj, path) {
  if (!obj) return undefined;
  return path.split(".").reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
    obj
  );
}

export function LanguageProvider({ children }) {
  // начальный язык — синхронно из localStorage на web (native: "en")
  const [locale, setLocaleState] = useState(() => {
    let initial = "en";
    if (Platform.OS === "web") {
      try {
        const saved = localStorage.getItem(LANG_KEY);
        if (saved) initial = saved;
      } catch {}
    }
    globalThis.sf_lang = initial;
    return initial;
  });

  const [savingLanguage, setSavingLanguage] = useState(false);

  // переводы
  const { data: trData } = useQuery(GET_TRANSLATIONS, { fetchPolicy: "cache-first" });
  const translations = useMemo(() => trData?.translation?.data ?? {}, [trData]);

  // user_info → подтянуть language/documentId после авторизации
  const [fetchMyUserInfo] = useLazyQuery(GET_MY_USER_INFO, { fetchPolicy: "network-only" });
  const [updateUserInfo] = useMutation(UPDATE_USER_INFO);

  // bootstrap читает meFull.user_info и синхронизирует язык
  const bootstrap = useCallback(async () => {
    if (!globalThis.sf_jwt) return;
    try {
      const res = await fetchMyUserInfo();
      const ui = res?.data?.meFull?.user_info || null;
      if (ui?.documentId) globalThis.sf_userInfoId = ui.documentId;
      if (ui?.language && ui.language !== locale) {
        setLocaleState(ui.language);
        globalThis.sf_lang = ui.language;
        if (Platform.OS === "web") {
          try { localStorage.setItem(LANG_KEY, ui.language); } catch {}
        }
      }
    } catch {}
  }, [fetchMyUserInfo, locale]);

  // автозапуск bootstrap
  useEffect(() => { bootstrap().catch(() => {}); }, [bootstrap]);

  // смена языка пользователем
  const setLocale = useCallback(
    async (code) => {
      setLocaleState(code);
      globalThis.sf_lang = code;
      if (Platform.OS === "web") {
        try { localStorage.setItem(LANG_KEY, code); } catch {}
      }

      const id = globalThis.sf_userInfoId || null;
      if (!id) return;

      try {
        setSavingLanguage(true);
        await updateUserInfo({ variables: { documentId: id, data: { language: code } } });
      } catch {} finally {
        setSavingLanguage(false);
      }
    },
    [updateUserInfo]
  );

  // RTL — без forceRTL
  useEffect(() => {
    I18nManager.allowRTL(locale === "he");
  }, [locale]);

  const t = useMemo(
    () => (path, fallback = "-") => pick(translations?.[locale], path) ?? fallback,
    [translations, locale]
  );

  const value = useMemo(
    () => ({
      locale,
      dir: locale === "he" ? "rtl" : "ltr",
      setLocale,
      t,
      languages: LANGS,
      savingLanguage,
      refreshMe: bootstrap, // ⬅️ вернул метод, который ждёт Profile.js
    }),
    [locale, setLocale, t, savingLanguage, bootstrap]
  );

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}


