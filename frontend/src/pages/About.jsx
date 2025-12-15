import React, { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ABOUT } from "../api/get";
import { useLanguage } from "../context/LanguageContext";

// Простой рендер Slate-JSON с базовыми стилями
function renderRichText(nodes) {
  if (!Array.isArray(nodes)) return null;

  return nodes.map((node, idx) => {
    if (node.type === "paragraph") {
      return (
        <p key={idx} className="mb-3 leading-relaxed">
          {renderRichText(node.children)}
        </p>
      );
    }

    if (node.type === "heading" || node.type === "heading-one") {
      return (
        <h2
          key={idx}
          className="mt-4 mb-3 text-lg font-semibold leading-snug tracking-tight"
          style={{marginTop: '40px'}}
        >
          {renderRichText(node.children)}
        </h2>
      );
    }

    if (!node.type || node.type === "text") {
      let text = node.text ?? "";
      if (!text) return null;

      let className = "";
      if (node.bold) className += " font-semibold";
      if (node.italic) className += " italic";
      if (node.underline) className += " underline";

      return (
        <span key={idx} className={className || undefined}>
          {text}
        </span>
      );
    }

    // fallback — рекурсивно рендерим дочерние
    if (Array.isArray(node.children)) {
      return (
        <span key={idx} className="block mb-2">
          {renderRichText(node.children)}
        </span>
      );
    }

    return null;
  });
}

const About = () => {
  const { locale, t, dir } = useLanguage();

  const { data, loading, error } = useQuery(GET_ABOUT, {
    variables: { locale },
    fetchPolicy: "cache-and-network",
  });

  const content = useMemo(() => {
    const text = data?.about?.text;
    if (!text || !Array.isArray(text) || text.length === 0) {
      return null;
    }
    return renderRichText(text);
  }, [data]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1
        className={`text-2xl font-bold mb-6 ${
          dir === "rtl" ? "text-right" : "text-left"
        }`}
      >
        {t("pages.about.title", "About us")}
      </h1>

      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 sm:p-8">
        {loading && !data && (
          <p className="text-sm text-gray-500">
            {t("notifications.loading", "Loading...")}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {t("errors.network", "Network error")}
          </p>
        )}

        {!loading && !error && !content && (
          <p className="text-sm text-gray-500">
            {t("notifications.empty", "Nothing here yet")}
          </p>
        )}

        {!loading && !error && content && (
          <div
            className={`text-sm sm:text-base ${
              dir === "rtl" ? "text-right" : "text-left"
            }`}
          >
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
