import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client/react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const apollo = useApolloClient();
  const [jwt, setJwt] = useState(globalThis.sf_jwt || null);

  const loginWithToken = useCallback(async (token) => {
    globalThis.sf_jwt = token;
    setJwt(token);
    try { await apollo.clearStore(); } catch {}
  }, [apollo]);

  const logout = useCallback(async () => {
    try { await apollo.clearStore(); } catch {}
    delete globalThis.sf_jwt;
    delete globalThis.sf_userInfoId;
    setJwt(null);
  }, [apollo]);

  const value = useMemo(() => ({
    jwt, isAuthed: !!jwt, loginWithToken, logout,
  }), [jwt, loginWithToken, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
