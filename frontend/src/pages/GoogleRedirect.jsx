// src/pages/GoogleRedirect.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = (process.env.REACT_APP_GRAPHQL_URL || "").replace(/\/graphql$/,"");

export default function GoogleRedirect() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    (async () => {
      const qs = new URLSearchParams(loc.search);
      const accessToken = qs.get("access_token");
      if (!accessToken) return;

      const r = await fetch(
        `${API_BASE}/api/auth/google/callback?access_token=${encodeURIComponent(accessToken)}`
      );
      const data = await r.json();
      if (data?.jwt) {
        // сохрани JWT так же, как делаешь при обычном логине (твой AuthContext)
        localStorage.setItem("sf_jwt", data.jwt);
        // ...и дальше твоя логика (Apollo reset, загрузка me, и т.п.)
        nav("/", { replace: true });
      }
    })();
  }, [loc.search, nav]);

  return <div className="p-6">Completing Google sign-in…</div>;
}
