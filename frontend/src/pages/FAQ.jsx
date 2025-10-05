import React from "react";
import { useQuery } from "@apollo/client/react";
import { GET_FAQS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";

/** Простой рендер Slate-подобного JSON (только параграфы и базовые стили) */
function renderSlate(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) return null;

  const renderLeaf = (leaf, idx) => {
    let el = leaf?.text ?? "";
    if (!el) el = "";
    let child = <>{el}</>;

    if (leaf?.underline) child = <u>{child}</u>;
    if (leaf?.italic) child = <em>{child}</em>;
    if (leaf?.bold) child = <strong>{child}</strong>;

    return <React.Fragment key={idx}>{child}</React.Fragment>;
  };

  const renderNode = (n, idx) => {
    if (n?.type === "paragraph") {
      const inner = Array.isArray(n.children)
        ? n.children.map((c, i) =>
            typeof c?.text === "string" ? renderLeaf(c, i) : null
          )
        : null;
      return (
        <p key={idx} className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {inner}
        </p>
      );
    }
    // fallback: просто текст из children
    if (Array.isArray(n?.children)) {
      const text = n.children.map((c) => (typeof c?.text === "string" ? c.text : "")).join("");
      return (
        <p key={idx} className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {text}
        </p>
      );
    }
    return null;
  };

  return nodes.map((n, i) => renderNode(n, i));
}

export default function FAQ() {
  const { t, locale } = useLanguage();

  const { data, loading, error } = useQuery(GET_FAQS, {
    variables: { locale, pagination: { limit: 100 } },
    fetchPolicy: "cache-and-network",
  });

  const faqs = data?.faqs || [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{"FAQ"}</h1>

      {loading && !data && (
        <div className="text-gray-500">{t("notifications.loading") || "Loading…"}</div>
      )}

      {error && (
        <div className="text-red-600">{t("errors.network") || "Network error."}</div>
      )}

      {faqs.length === 0 && !loading ? (
        <div className="text-gray-500">{t("faq.empty") || "No questions yet."}</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((item) => {
            const answer =
              Array.isArray(item?.answerFofmated) && item.answerFofmated.length > 0
                ? renderSlate(item.answerFofmated)
                : null;

            return (
              <details
                key={item.documentId}
                className="group border border-gray-200 rounded-xl bg-white shadow-sm open:shadow-md transition-shadow"
              >
                <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-4">
                  <span className="text-base md:text-lg font-medium text-gray-900">
                    {item.question || "—"}
                  </span>
                  <span className="shrink-0 rounded-full border border-gray-300 w-6 h-6 grid place-items-center text-gray-500 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <div className="px-4 pb-4 pt-2">
                  {answer || (
                    <p className="text-sm text-gray-500">{t("faq.noAnswer") || "Answer coming soon."}</p>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
