import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { CHANGE_PASSWORD } from "../api/mutations";
import { useLanguage } from "../context/LanguageContext";

function PasswordRow({ label, value, onChange, placeholder, visible, onToggle }) {
  return (
    <div>
      <label className="text-sm block mb-1">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-2 grid place-items-center px-1 text-gray-600 hover:text-gray-800"
          aria-label={visible ? "Hide" : "Show"}
        >
          {visible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const { t } = useLanguage();

  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");

  const [showCur, setShowCur] = useState(false);
  const [showN1, setShowN1] = useState(false);
  const [showN2, setShowN2] = useState(false);

  const [msg, setMsg] = useState("");
  const [mutate, { loading, error }] = useMutation(CHANGE_PASSWORD);

  const canSubmit = cur && n1 && n2 && n1.length >= 6 && n1 === n2;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!canSubmit) { setMsg(t("auth.errors.passwordsMismatch")); return; }
    try {
      await mutate({
        variables: {
          currentPassword: cur,
          password: n1,
          passwordConfirmation: n2,
        },
      });
      setMsg("OK");
      setCur(""); setN1(""); setN2("");
    } catch (e2) {
      setMsg(e2?.message || t("errors.unknown"));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("pages.profile.changePassword")}</h1>
      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
        <PasswordRow
          label={t("auth.password")}
          value={cur}
          onChange={setCur}
          placeholder={t("auth.password")}
          visible={showCur}
          onToggle={() => setShowCur(v => !v)}
        />
        <PasswordRow
          label={t("auth.reset.newPassword")}
          value={n1}
          onChange={setN1}
          placeholder={t("auth.reset.newPassword")}
          visible={showN1}
          onToggle={() => setShowN1(v => !v)}
        />
        <PasswordRow
          label={t("auth.reset.repeatPassword")}
          value={n2}
          onChange={setN2}
          placeholder={t("auth.reset.repeatPassword")}
          visible={showN2}
          onToggle={() => setShowN2(v => !v)}
        />

        {msg && (
          <div className={`text-sm ${msg === "OK" ? "text-green-700" : "text-red-600"}`}>
            {msg === "OK" ? t("auth.reset.successTitle") : msg}
          </div>
        )}
        {error && <div className="text-sm text-red-600">{String(error.message)}</div>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "…" : t("common.save")}
        </button>
      </form>
    </div>
  );
}
