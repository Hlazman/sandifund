import React from "react";
import { useQuery } from "@apollo/client/react";
import { GET_MASTERS } from "../api/get";
import CardMaster from "../components/cards/CardMaster";
import { useLanguage } from "../context/LanguageContext";

export default function Masters() {
  const { t } = useLanguage();

  const { data, loading, error } = useQuery(GET_MASTERS, {
    variables: { pagination: { limit: 100 }, productsPagination2: { limit: 100 } },
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) return <div className="max-w-6xl mx-auto p-4">Loading…</div>;
  if (error) return <div className="max-w-6xl mx-auto p-4 text-red-600">{error.message}</div>;

  const masters = data?.masters || [];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">{t("header.items.masters", "Masters")}</h1>
      {masters.length === 0 ? (
        <div className="text-gray-500">No masters yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {masters.map((m) => (<CardMaster key={m.documentId} master={m} />))}
        </div>
      )}
    </div>
  );
}
