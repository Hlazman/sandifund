import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { get } from "../api/rest";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function EmailConfirmation() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const nav = useNavigate();
  const q = useQuery();

  const confirmation = q.get("confirmation") || q.get("code") || "";
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        await get(`/api/auth/email-confirmation?confirmation=${encodeURIComponent(confirmation)}`);
        if (!mounted) return;
        setOk(true);
      } catch (e) {
        if (!mounted) return;
        setErr(e.message);
      }
    }
    if (confirmation) run();
    else setErr("Missing token");
    return () => { mounted = false; };
  }, [confirmation]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className={`text-xl font-semibold mb-2 ${isRTL ? "text-right" : ""}`}>
        {t("auth.confirm.title")}
      </h1>

      {ok ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="font-medium mb-1">{t("auth.confirm.successTitle")}</div>
          <div className="text-sm text-gray-700">{t("auth.confirm.successDesc")}</div>
          <button
            onClick={() => nav("/auth")}
            className="mt-4 w-full rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
            {t("auth.backToLogin")}
          </button>
        </div>
      ) : err ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="font-medium mb-1">{t("auth.confirm.errorTitle")}</div>
          <div className="text-sm text-red-700">{err || t("errors.unknown")}</div>
          <button
            onClick={() => nav("/auth")}
            className="mt-4 w-full rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
            {t("auth.backToLogin")}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">{t("auth.confirm.loading")}</div>
        </div>
      )}
    </div>
  );
}
