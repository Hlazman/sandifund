import React from "react";
import { useQuery } from "@apollo/client/react";
import { GET_STICKERS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import CardSticker from "../components/cards/CardSticker";

export default function Sticers() {
  const { t, locale } = useLanguage();

  const { data, loading, error } = useQuery(GET_STICKERS, {
    variables: { locale },
    fetchPolicy: "cache-and-network",
  });

  const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");

  const stickers = data?.stickers || [];

  const resolveUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {t("header.items.sticers")}
        </h1>
      </div>

      {loading && !data && (
        <div className="text-gray-500">{t("notifications.loading") || "Loading…"}</div>
      )}

      {error && (
        <div className="text-red-600">{t("errors.network") || "Network error."}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stickers.map((s) => {
          const image = resolveUrl(s?.image?.url);
          const zipHref = resolveUrl(s?.zipFile?.url) || s?.zipFileUrl || null;

          return (
            <CardSticker
              key={s.documentId}
              title={s.title}
              description={s.description}
              image={image}
              zipHref={zipHref}
            />
          );
        })}
      </div>
    </div>
  );
}
