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

const LanguageCtx = createContext(null);
export const useLanguage = () => useContext(LanguageCtx);

// безопасный геттер a.b.c
function pick(obj, path) {
  if (!obj) return undefined;
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export function LanguageProvider({ children }) {
  // 0) мгновенная локаль из рантайма; сервер потом может её перезаписать
  const [locale, setLocaleState] = useState(globalThis.sf_lang || "en");
  const [savingLanguage, setSavingLanguage] = useState(false);

  // 1) documentId сущности UserInfo: из рантайма или ENV (как запасной вариант)
  const envUserInfoId = process.env.EXPO_PUBLIC_USERINFO_ID || null;
  const [userInfoId, setUserInfoId] = useState(globalThis.sf_userInfoId || envUserInfoId || null);
  useEffect(() => {
    if (userInfoId) globalThis.sf_userInfoId = userInfoId;
  }, [userInfoId]);

  // 2) Переводы
  const { data: trData } = useQuery(GET_TRANSLATIONS, { fetchPolicy: "cache-first" });
  const translations = useMemo(() => trData?.translation?.data ?? {}, [trData]);

  // 3) Чтение своих данных (authoritative язык): meFull → user_info
  const [fetchMyUserInfo] = useLazyQuery(GET_MY_USER_INFO, { fetchPolicy: "network-only" });

  const bootstrap = useCallback(async () => {
    // если нет JWT — просто используем локальный язык
    if (!globalThis.sf_jwt && !envUserInfoId) return;

    try {
      const res = await fetchMyUserInfo();
      const ui = res?.data?.meFull?.user_info || null;

      if (ui?.documentId) {
        setUserInfoId(ui.documentId);
        globalThis.sf_userInfoId = ui.documentId;
      }

      if (ui?.language) {
        if (ui.language !== locale) {
          setLocaleState(ui.language);
          globalThis.sf_lang = ui.language;
        }
      }
    } catch {
      // нет прав/резолвера — остаёмся на локальном языке
    }
  }, [fetchMyUserInfo, locale, envUserInfoId]);

  useEffect(() => {
    bootstrap().catch(() => {});
  }, [bootstrap]);

  // 4) Обновление на бэке
  const [updateUserInfo] = useMutation(UPDATE_USER_INFO);

  // 5) Смена языка: мгновенно локально + запись в UserInfo (если знаем documentId)
  const setLocale = useCallback(
    async (code) => {
      setLocaleState(code);
      globalThis.sf_lang = code;

      // гарантируем документ
      let id = userInfoId;
      if (!id) {
        try {
          const res = await fetchMyUserInfo();
          id = res?.data?.meFull?.user_info?.documentId || envUserInfoId || null;
          if (id) {
            setUserInfoId(id);
            globalThis.sf_userInfoId = id;
          }
        } catch {
          // не смогли достать id — останемся только на локальном языке
        }
      }

      if (!id) return;

      try {
        setSavingLanguage(true);
        await updateUserInfo({ variables: { documentId: id, data: { language: code } } });
      } catch {
        // права/валидация могут быть не готовы — не шумим
      } finally {
        setSavingLanguage(false);
      }
    },
    [userInfoId, fetchMyUserInfo, envUserInfoId, updateUserInfo]
  );

  // 6) RTL — без forceRTL, чтобы не требовать перезапуска
  useEffect(() => {
    I18nManager.allowRTL(locale === "he");
    // На web forceRTL не применяем, на native — поведение корректное без перезапуска
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, Platform.OS]);

  // 7) t()
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
      refreshMe: bootstrap,   // дергать после логина
      userInfoId,
      setUserInfoId,
    }),
    [locale, setLocale, t, savingLanguage, bootstrap, userInfoId]
  );

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}
