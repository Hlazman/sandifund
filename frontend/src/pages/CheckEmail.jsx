import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function CheckEmail() {
  const { t, dir } = useLanguage();
  const { state } = useLocation(); // { email }
  const navigate = useNavigate();
  const isRTL = dir === "rtl";
  const email = state?.email;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className={`text-xl font-semibold mb-2 ${isRTL ? "text-right" : ""}`}>
        {t("auth.confirm.pageTitle")}
      </h1>
      
      <div className={`rounded-2xl border border-gray-200 bg-white p-4 ${isRTL ? "text-right" : ""}`}>
        <p className="font-medium mb-1">{t("auth.confirm.thanks")}</p>
        <p className="text-sm text-gray-700 mb-2">
          {t("auth.confirm.checkEmail")}
          <strong>{email ? ` ${email}` : ""} </strong>
        </p>
        <p className="text-sm text-gray-700">
          {t("auth.confirm.noEmailPrefix")}{" "}
          <a className="underline" href="mailto:art-charity@sandifund.com">art-charity@sandifund.com</a>.
        </p>

        <button
          onClick={() => navigate("/auth")}
          className="mt-4 w-full rounded-lg border px-3 py-2 hover:bg-gray-50"
        >
          {t("auth.backToLogin")}
        </button>
      </div>
    </div>
  );
}
