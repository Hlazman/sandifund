import React, {
  createContext, useContext, useEffect, useMemo, useState, useCallback,
} from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { GET_TRANSLATIONS, GET_MY_USER_INFO } from "../api/get";
import { UPDATE_USER_INFO, LOGIN } from "../api/mutations";

const LANGS = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "he", label: "עברית",  dir: "rtl" },
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
  // локаль: читаем из localStorage для мгновенного старта (перезапишем серверной)
  const [locale, setLocaleState] = useState(localStorage.getItem("sf_lang") || "en");
  const [savingLanguage, setSavingLanguage] = useState(false);

  // documentId сущности UserInfo
  const [userInfoId, setUserInfoId] = useState(localStorage.getItem("sf_userInfoId") || null);

  // Переводы
  const { data: trData } = useQuery(GET_TRANSLATIONS, { fetchPolicy: "cache-first" });
  const translations = useMemo(() => trData?.translation?.data ?? {}, [trData]);

  // Чтение своих данных (user_info) — единственный авторитетный источник языка
  const [fetchMyUserInfo] = useLazyQuery(GET_MY_USER_INFO, { fetchPolicy: "network-only" });

  // Обновление языка на бэке
  const [updateUserInfo] = useMutation(UPDATE_USER_INFO);

  // (опционально) демо-логин — оставлен, если ты используешь автологин
  const [login] = useMutation(LOGIN, {
    onCompleted: async ({ login }) => {
      if (login?.jwt) {
        localStorage.setItem("sf_jwt", login.jwt);
        await bootstrap(); // после логина сразу подтянем user_info + язык
      }
    },
  });

  // Источник правды: тянем meFull→user_info и синхронизируем локаль
  const bootstrap = useCallback(async () => {
    try {
      const res = await fetchMyUserInfo();
      const ui = res?.data?.meFull?.user_info || null;

      if (ui?.documentId) {
        setUserInfoId(ui.documentId);
        localStorage.setItem("sf_userInfoId", ui.documentId);
      }

      if (ui?.language) {
        // Сервер главнее: перезаписываем локаль и localStorage
        if (ui.language !== locale) {
          setLocaleState(ui.language);
          localStorage.setItem("sf_lang", ui.language);
        }
      }
    } catch {
      // молчим: если нет прав/резолвера — локальная локаль продолжит работать
    }
  }, [fetchMyUserInfo, locale]);

  // Один раз при монтировании — тянем authoritative язык
  useEffect(() => {
    bootstrap().catch(() => {});
  }, [bootstrap]);

  // Проставляем dir на html
  useEffect(() => {
    document.documentElement.setAttribute("dir", locale === "he" ? "rtl" : "ltr");
  }, [locale]);

  // Смена языка: мгновенно локально + запись на сервер
  const setLocale = useCallback(
    async (code) => {
      setLocaleState(code);
      localStorage.setItem("sf_lang", code);

      // гарантируем, что знаем userInfoId: если вдруг ещё нет — попробуем подтянуть
      let id = userInfoId;
      if (!id) {
        try {
          const res = await fetchMyUserInfo();
          id = res?.data?.meFull?.user_info?.documentId || null;
          if (id) {
            setUserInfoId(id);
            localStorage.setItem("sf_userInfoId", id);
          }
        } catch {
          // не смогли достать id — просто останемся на локальном языке
        }
      }

      if (!id) return; // нет id — не отправляем мутацию

      try {
        setSavingLanguage(true);
        await updateUserInfo({
          variables: { documentId: id, data: { language: code } },
        });
      } catch {
        // тихо: права/валидация могут появиться позже
      } finally {
        setSavingLanguage(false);
      }
    },
    [userInfoId, fetchMyUserInfo, updateUserInfo]
  );

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
      refreshMe: bootstrap,  // можно дернуть после явного логина
      userInfoId,
      setUserInfoId,
      loginDemo: login,      // если хочешь вызывать демо-логин снаружи
    }),
    [locale, setLocale, t, savingLanguage, bootstrap, userInfoId, login]
  );

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}
