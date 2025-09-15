import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { GET_TRANSLATIONS, GET_ME } from "../api/get";
import { UPDATE_USER_LANGUAGE } from "../api/mutations";

const LANGS = [
  { code: "en", label: "English", flag: "🇺🇸", dir: "ltr" },
  { code: "ru", label: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "he", label: "עברית",  flag: "🇮🇱", dir: "rtl" },
];

const LanguageCtx = createContext(null);
export const useLanguage = () => useContext(LanguageCtx);

// безопасный геттер "a.b.c"
function pick(obj, path) {
  if (!obj) return undefined;
  return path.split(".").reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
    obj
  );
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(localStorage.getItem("sf_lang") || "en");
  const [userId, setUserId] = useState(null);
  const [savingLanguage, setSavingLanguage] = useState(false);

  // 1) Переводы → JSON
  const { data: trData } = useQuery(GET_TRANSLATIONS, { fetchPolicy: "cache-first" });
  const translations = useMemo(
    () => trData?.translation?.data ?? {},
    [trData]
  );

  // 2) me
  const [fetchMe] = useLazyQuery(GET_ME, { fetchPolicy: "network-only" });
  const refreshMe = useCallback(async () => {
    if (!localStorage.getItem("sf_jwt")) return null;
    const res = await fetchMe();
    const me = res?.data?.me;
    if (me?.id) {
      setUserId(me.id);
      if (!localStorage.getItem("sf_lang") && me.language) {
        setLocaleState(me.language);
        localStorage.setItem("sf_lang", me.language);
      }
    }
    return me;
  }, [fetchMe]);

  useEffect(() => {
    refreshMe().catch(() => {});
  }, [refreshMe]);

  // 3) Обновление языка
  const [updateLanguage] = useMutation(UPDATE_USER_LANGUAGE);

  const setLocale = useCallback(
    async (code) => {
      setLocaleState(code);
      localStorage.setItem("sf_lang", code);
      try {
        if (userId) {
          setSavingLanguage(true);
          await updateLanguage({ variables: { id: userId, language: code } });
        }
      } catch {
        // молчим — права докрутим позже
      } finally {
        setSavingLanguage(false);
      }
    },
    [userId, updateLanguage]
  );

  // 4) Глобальный dir
  useEffect(() => {
    const isRtl = locale === "he";
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
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
