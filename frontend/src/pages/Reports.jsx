import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_REPORTS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";

function parseDMY(str) {
  if (typeof str !== "string") return 0;
  const m = str.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return Date.parse(str) || 0;
  const [, dd, mm, yyyy] = m;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
}

export default function Reports() {
  const { t, locale } = useLanguage();
  const [sp] = React.useState(() => new URLSearchParams(window.location.search)); // stable on first render
  const fundId = sp.get("fundId") || "";
  const fundTitle = sp.get("fundTitle") || "";

  const { data, loading, error } = useQuery(GET_REPORTS, {
    variables: {
      locale,
      pagination: { limit: 100 },
      filters: fundId ? { fund: { documentId: { eqi: fundId } } } : undefined,
    },
    fetchPolicy: "cache-and-network",
    skip: !fundId,
  });

  const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");

  const rows = React.useMemo(() => {
    const arr = (data?.reports || []).slice();
    arr.sort((a, b) => parseDMY(b?.title) - parseDMY(a?.title));
    return arr;
  }, [data]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {(t("pages.reports.title") || "Reports") + (fundTitle ? ` — ${fundTitle}` : "")}
      </h1>

      {loading && !data && (
        <div className="text-gray-500">{t("notifications.loading") || "Loading…"}</div>
      )}

      {error && (
        <div className="text-red-600 mb-3">{t("errors.network") || "Network error."}</div>
      )}

      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        {/* header */}
        <div className="grid grid-cols-3 bg-gray-100 px-4 py-2 font-semibold">
          <div>{t("pages.reports.columns.date") || "Date"}</div>
          <div className="text-right">{t("pages.reports.columns.sum") || "Sum"}</div>
          <div className="text-center">{t("pages.reports.columns.file") || "File"}</div>
        </div>

        {/* rows */}
        {rows.map((r) => {
          const href = r?.pdf?.url
            ? (r.pdf.url.startsWith("http") ? r.pdf.url : `${API_BASE}${r.pdf.url}`)
            : null;
          return (
            <div key={r.documentId} className="grid grid-cols-3 items-center px-4 py-2 border-t border-gray-200">
              <div>{r.title}</div>
              <div className="text-right font-semibold">{typeof r.sum === "number" ? `${r.sum} ₪` : ""}</div>
              <div className="text-center">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5"
                  >
                    {/* иконка опциональна */}
                    {/* <FileText size={16} /> */}
                    {t("pages.reports.columns.file") || "File"}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && rows.length === 0 && (
        <div className="text-gray-500 mt-3">{t("notifications.empty") || "No notifications"}</div>
      )}
    </div>
  );
}
