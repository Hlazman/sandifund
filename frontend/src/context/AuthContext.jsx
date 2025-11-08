import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [jwt, setJwt] = useState(() => sessionStorage.getItem("sf_jwt") || localStorage.getItem("sf_jwt") || null);

  // единая точка, если кто-то извне положил токен
  useEffect(() => {
    const handler = () => setJwt(sessionStorage.getItem("sf_jwt") || localStorage.getItem("sf_jwt") || null);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const loginWithToken = useCallback((token, remember = true) => {
    // чистим оба, пишем в выбранное хранилище
    localStorage.removeItem("sf_jwt");
    sessionStorage.removeItem("sf_jwt");
    if (remember) localStorage.setItem("sf_jwt", token);
    else sessionStorage.setItem("sf_jwt", token);
    setJwt(token);
  }, []);

  const logout = useCallback(() => {
    // JWT и userInfoId — вон; язык оставляем (локаль полезна и без авторизации)
    localStorage.removeItem("sf_jwt");
    sessionStorage.removeItem("sf_jwt");
    localStorage.removeItem("sf_userInfoId");
    // sf_lang сохраняем
    setJwt(null);
  }, []);

  const value = useMemo(() => ({
    jwt, isAuthed: !!jwt, loginWithToken, logout,
  }), [jwt, loginWithToken, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
