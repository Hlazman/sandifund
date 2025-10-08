import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "../api/get";
import CardProduct from "../components/cards/CardProduct";
import { useLanguage } from "../context/LanguageContext";

export default function Goods() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { pagination: { limit: 100 } },
    fetchPolicy: "cache-and-network",
  });

  const products = useMemo(() => {
    const all = data?.products || [];
    return all.filter((p) => p.state !== "sold" && p.state !== "notValid");
  }, [data]);

  if (loading && !data) return <div className="max-w-6xl mx-auto p-4">{t("common.loading", "Loading…")}</div>;
  if (error) return <div className="max-w-6xl mx-auto p-4 text-red-600">{error.message}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">{t("header.goods", "Goods")}</h1>

      {products.length === 0 ? (
        <div className="text-gray-500">{t("pages.goods.empty", "No products yet")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <CardProduct
              key={p.documentId}
              title={p.title}
              image={p.image?.url}
              description={p.description}
              price={p.price}
              donationPercent={p.donationPercent}
              status={p.state}
              master={{
                name: p.master?.name,
                href: p.master?.documentId ? `/masters/${p.master.documentId}` : undefined,
              }}
              reserveLabel={t("card.product.reserve", "Reserve")}
              reserveDisabled={p.state === "booked"}
              onReserve={() => navigate(`/booked/${p.documentId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
