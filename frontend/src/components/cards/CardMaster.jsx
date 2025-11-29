import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { ImageBox } from "./_CardParts";

function RichText({ value }) {
  try {
    if (!value) return null;
    if (typeof value === "string")
      return (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {value}
        </p>
      );
    const nodes = Array.isArray(value) ? value : value.children || [];
    return (
      <div className="space-y-1 text-sm text-gray-700">
        {nodes.map((n, i) => {
          const children = (n.children || []).map((ch, j) => {
            let text = ch.text || "";
            if (ch.bold) text = <strong key={j}>{text}</strong>;
            if (ch.italic) text = <em key={j}>{text}</em>;
            return <span key={j}>{text}</span>;
          });
          return (
            <p key={i} className="whitespace-pre-wrap">
              {children}
            </p>
          );
        })}
      </div>
    );
  } catch {
    return null;
  }
}

export default function CardMaster({ master }) {
  const { t } = useLanguage();

  const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");
  const resolveUrl = (url) =>
    url && !url.startsWith("http") ? `${API_BASE}${url}` : url;
  const imgSrc = resolveUrl(master?.photo?.url);

  const productsCount = useMemo(() => {
    const arr = master?.products || [];
    return arr.filter(
      (p) => p?.state === "inStock" || p?.state === "booked"
    ).length;
  }, [master]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col">
      <div className="mb-3">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={master?.name || ""}
            className="w-full aspect-[4/3] object-cover rounded-xl border border-gray-200"
          />
        ) : (
          <ImageBox text="no photo" />
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-tight break-words">
          {master?.name}
        </h3>
        <span className="text-sm text-gray-600">
          {t("card.master.products", "products")}:{" "}
          <b>{productsCount}</b>
        </span>
      </div>

      {master?.description ? (
        <div className="mt-2">
          <RichText value={master.description} />
        </div>
      ) : null}

      <div className="mt-3">
        <Link
          to={`/masters/${master.documentId}`}
          className="w-full inline-flex items-center justify-center px-3 py-2 rounded-xl border border-gray-200 bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {t("card.master.more", "More")}
        </Link>
      </div>
    </div>
  );
}
