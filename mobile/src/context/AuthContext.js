import React, {
  createContext, useContext, useMemo, useState, useCallback, useEffect,
} from "react";
import { Platform } from "react-native";
import { useApolloClient } from "@apollo/client/react";

const STORAGE_KEY = "sf_jwt";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// web-only storage helpers
function saveToken(token) {
  if (Platform.OS === "web") {
    try { localStorage.setItem(STORAGE_KEY, token || ""); } catch {}
  }
}
function clearToken() {
  if (Platform.OS === "web") {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
}
function readTokenSync() {
  if (Platform.OS === "web") {
    try { return localStorage.getItem(STORAGE_KEY) || null; } catch {}
  }
  return null; // native: no persistence (to avoid AsyncStorage)
}

export function AuthProvider({ children }) {
  const apollo = useApolloClient();

  // bootstrap from web localStorage (native: null)
  const [jwt, setJwt] = useState(() => {
    const saved = readTokenSync();
    if (saved) globalThis.sf_jwt = saved;
    return saved || null;
  });
  const [ready, setReady] = useState(true); // no async bootstrap now

  const loginWithToken = useCallback(async (token) => {
    globalThis.sf_jwt = token;
    setJwt(token);
    saveToken(token);
    try { await apollo.clearStore(); } catch {}
  }, [apollo]);

  const logout = useCallback(async () => {
    try { await apollo.clearStore(); } catch {}
    delete globalThis.sf_jwt;
    delete globalThis.sf_userInfoId;
    setJwt(null);
    clearToken();
    // очистим сохранённое состояние навигации на web
    if (Platform.OS === "web") {
      try { localStorage.removeItem("sf_nav_state_authed"); } catch {}
    }
  }, [apollo]);

  const value = useMemo(() => ({
    jwt, isAuthed: !!jwt, ready, loginWithToken, logout,
  }), [jwt, ready, loginWithToken, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

