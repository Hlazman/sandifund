import React, {
  createContext, useContext, useMemo, useState, useCallback, useEffect,
} from "react";
import { Platform } from "react-native";
import { useApolloClient } from "@apollo/client/react";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "sf_jwt";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// web-only storage helpers
// function saveToken(token) {
//   if (Platform.OS === "web") {
//     try { localStorage.setItem(STORAGE_KEY, token || ""); } catch {}
//   }
// }
// function clearToken() {
//   if (Platform.OS === "web") {
//     try { localStorage.removeItem(STORAGE_KEY); } catch {}
//   }
// }
// function readTokenSync() {
//   if (Platform.OS === "web") {
//     try { return localStorage.getItem(STORAGE_KEY) || null; } catch {}
//   }
//   return null; // native: no persistence (to avoid AsyncStorage)
// }

async function saveToken(token) {
  if (Platform.OS === "web") {
    try { localStorage.setItem(STORAGE_KEY, token || ""); } catch {}
    return;
  }
  try {
    if (token) await SecureStore.setItemAsync(STORAGE_KEY, token);
  } catch {}
}

async function clearToken() {
  if (Platform.OS === "web") {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    return;
  }
  try { await SecureStore.deleteItemAsync(STORAGE_KEY); } catch {}
}

async function readToken() {
  if (Platform.OS === "web") {
    try { return localStorage.getItem(STORAGE_KEY) || null; } catch {}
    return null;
  }
  try { return await SecureStore.getItemAsync(STORAGE_KEY); } catch {}
  return null;
}


export function AuthProvider({ children }) {
  const apollo = useApolloClient();

  // const [jwt, setJwt] = useState(() => {
  //   const saved = readTokenSync();
  //   if (saved) globalThis.sf_jwt = saved;
  //   return saved || null;
  // });
  // const [ready, setReady] = useState(true);

  const [jwt, setJwt] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const saved = await readToken();
      if (!mounted) return;

      if (saved) globalThis.sf_jwt = saved;
      setJwt(saved || null);
      setReady(true);
    })();

    return () => { mounted = false; };
  }, []);

  const loginWithToken = useCallback(async (token) => {
    globalThis.sf_jwt = token;
    setJwt(token);
    // saveToken(token);
    await saveToken(token);
    try { await apollo.clearStore(); } catch {}
  }, [apollo]);

  const logout = useCallback(async () => {
    try { await apollo.clearStore(); } catch {}
    delete globalThis.sf_jwt;
    delete globalThis.sf_userInfoId;
    setJwt(null);
    // clearToken();
    await clearToken();
    if (Platform.OS === "web") {
      try { localStorage.removeItem("sf_nav_state_authed"); } catch {}
    }
  }, [apollo]);

  const value = useMemo(() => ({
    jwt, isAuthed: !!jwt, ready, loginWithToken, logout,
  }), [jwt, ready, loginWithToken, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

