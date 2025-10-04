import React from "react";
import { useQuery } from "@apollo/client/react";
import { GET_FUNDS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import CardFund from "../components/cards/CardFund";

function slateToText(nodes) {
  if (!Array.isArray(nodes)) return "";
  return nodes
    .map((n) =>
      Array.isArray(n?.children)
        ? n.children.map((c) => (typeof c?.text === "string" ? c.text : "")).join("")
        : ""
    )
    .filter(Boolean)
    .join("\n\n");
}

export default function Fonds() {
  const { t, locale } = useLanguage();

  const { data, loading, error } = useQuery(GET_FUNDS, {
    variables: { locale, pagination: { limit: 100 } },
    fetchPolicy: "cache-and-network",
  });

  const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");

  const funds = data?.funds || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {t("header.items.funds") || "Funds"}
      </h1>

      {loading && !data && (
        <div className="text-gray-500">{t("notifications.loading") || "Loading…"}</div>
      )}

      {error && (
        <div className="text-red-600">{t("errors.network") || "Network error."}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {funds.map((f) => {
          const logoUrl = f?.logo?.url
            ? (f.logo.url.startsWith("http") ? f.logo.url : `${API_BASE}${f.logo.url}`)
            : null;

          return (
            <CardFund
              key={f.documentId}
              title={f.title}
              logo={logoUrl}
              description={slateToText(f.description)}
              email={f.email}
              phone1={f.phone1}
              phone2={f.phone2}
              address={f.address}
              whatsapp={f.whatsapp}
              totalDonations={typeof f.totalDonations === "number" ? f.totalDonations : undefined}
              website={f.website}
              reports={{
                label: t("card.fund.reports") || "Reports",
                href: `/reports?fundId=${encodeURIComponent(f.documentId)}&fundTitle=${encodeURIComponent(f.title || "")}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
