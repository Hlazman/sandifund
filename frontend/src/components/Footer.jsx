import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t, dir } = useLanguage();

  return (
    <footer className="border-t border-gray-200 mt-auto bg-white">
      <div
        className={[
          "max-w-6xl mx-auto px-4 h-14 flex items-center justify-center text-sm",
          dir === "rtl" ? "text-right" : "text-left",
        ].join(" ")}
      >
        {t("footer.createdBy")}{" "}
        <a
          href="https://sandifund.com/"
          target="_blank"
          rel="noreferrer"
          className="mx-1 font-medium underline hover:no-underline text-indigo-600"
        >
          {t("footer.brand")}
        </a>
      </div>
    </footer>
  );
}
