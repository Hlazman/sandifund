import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { post } from "../api/rest";

export default function ForgotPassword() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await post("/api/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className={`text-xl font-semibold mb-2 ${isRTL ? "text-right" : ""}`}>
        {t("auth.forgot.title")}
      </h1>
      <p className={`text-sm text-gray-600 mb-4 ${isRTL ? "text-right" : ""}`}>
        {t("auth.forgot.intro")}
      </p>

      {sent ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="font-medium mb-1">{t("auth.forgot.sentTitle")}</div>
          <div className="text-sm text-gray-700">{t("auth.forgot.sentDesc")}</div>
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
            {t("auth.email")}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.placeholders.email")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "..." : t("auth.forgot.send")}
          </button>
        </form>
      )}
    </div>
  );
}
