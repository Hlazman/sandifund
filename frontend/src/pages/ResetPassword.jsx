import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { post } from "../api/rest";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const nav = useNavigate();
  const q = useQuery();
  const code = q.get("code") || q.get("token") || ""; // на всякий случай

  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (pass !== pass2) { setErr(t("auth.errors.passwordsMismatch")); return; }
    setLoading(true);
    try {
      await post("/api/auth/reset-password", {
        password: pass,
        passwordConfirmation: pass2,
        code,
      });
      setDone(true);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className={`text-xl font-semibold mb-2 ${isRTL ? "text-right" : ""}`}>
        {t("auth.reset.title")}
      </h1>

      {done ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="font-medium mb-1">{t("auth.reset.successTitle")}</div>
          <div className="text-sm text-gray-700">{t("auth.reset.successDesc")}</div>
          <button
            onClick={() => nav("/auth")}
            className="mt-4 w-full rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
            {t("auth.backToLogin")}
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 bg-white rounded-2xl border border-gray-200 p-4">
          <label className={`text-sm block ${isRTL ? "text-right" : ""}`}>
            {t("auth.reset.newPassword")}
          </label>
          <input
            type="password"
            required
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder={t("auth.placeholders.password")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <label className={`text-sm block ${isRTL ? "text-right" : ""}`}>
            {t("auth.reset.repeatPassword")}
          </label>
          <input
            type="password"
            required
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            placeholder={t("auth.placeholders.confirmPassword")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "..." : t("auth.reset.submit")}
          </button>
        </form>
      )}
    </div>
  );
}
