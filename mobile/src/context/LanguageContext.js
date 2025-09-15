import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { I18nManager } from "react-native";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { GET_TRANSLATIONS, GET_ME } from "../api/get";
import { UPDATE_USER_LANGUAGE } from "../api/mutations";

const LANGS = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "he", label: "עברית",  dir: "rtl" },
];

const LanguageCtx = createContext(null);
export const useLanguage = () => useContext(LanguageCtx);

function pick(obj, path) {
  if (!obj) return undefined;
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(globalThis.sf_lang || "en");
  const [userId, setUserId] = useState(null);
  const [savingLanguage, setSavingLanguage] = useState(false);

  // 1) Переводы
  const { data: trData } = useQuery(GET_TRANSLATIONS, { fetchPolicy: "cache-first" });
  const translations = useMemo(() => trData?.translation?.data ?? {}, [trData]);

  // 2) me
  const [fetchMe] = useLazyQuery(GET_ME, { fetchPolicy: "network-only" });
  const refreshMe = useCallback(async () => {
    if (!globalThis.sf_jwt) return null;
    const res = await fetchMe();
    const me = res?.data?.me;
    if (me?.id) {
      setUserId(me.id);
      if (!globalThis.sf_lang && me.language) {
        setLocaleState(me.language);
        globalThis.sf_lang = me.language;
      }
    }
    return me;
  }, [fetchMe]);

  useEffect(() => {
    refreshMe().catch(() => {});
  }, [refreshMe]);

  // 3) update language
  const [updateLanguage] = useMutation(UPDATE_USER_LANGUAGE);

  const setLocale = useCallback(
    async (code) => {
      setLocaleState(code);
      globalThis.sf_lang = code;
      try {
        if (userId) {
          setSavingLanguage(true);
          await updateLanguage({ variables: { id: userId, language: code } });
        }
      } catch {
        /* пермишены докрутим позже */
      } finally {
        setSavingLanguage(false);
      }
    },
    [userId, updateLanguage]
  );

  // 4) RTL (на некоторых экранах может требовать перезапуск приложения для полного эффекта)
  useEffect(() => {
    I18nManager.allowRTL(locale === "he");
  }, [locale]);

  // 5) t()
  const t = useMemo(() => {
    return (path, fallback = "-") => pick(translations?.[locale], path) ?? fallback;
  }, [translations, locale]);

  const value = useMemo(
    () => ({
      locale,
      dir: locale === "he" ? "rtl" : "ltr",
      setLocale,
      t,
      languages: LANGS,
      savingLanguage,
      refreshMe,
    }),
    [locale, setLocale, t, savingLanguage, refreshMe]
  );

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}
