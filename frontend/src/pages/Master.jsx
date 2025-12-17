import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_MASTERS, GET_PRODUCTS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";
import CardProduct from "../components/cards/CardProduct";

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

export default function Master() {
  const { id } = useParams();
  const { t } = useLanguage();

  const { data: mData } = useQuery(GET_MASTERS, {
    variables: {
      pagination: { limit: 100 },
      productsPagination2: { limit: 100 },
    },
  });

  const { data: pData } = useQuery(GET_PRODUCTS, {
    variables: { pagination: { limit: 100 } },
  });

  const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");
  const resolveUrl = (url) =>
    url && !url.startsWith("http") ? `${API_BASE}${url}` : url;

  const master = useMemo(
    () => (mData?.masters || []).find((x) => x.documentId === id),
    [mData, id]
  );

  const products = useMemo(() => {
    const all = pData?.products || [];
    return all.filter(
      (p) =>
        p.master?.documentId === id &&
        p.state !== "sold" &&
        p.state !== "notValid"
    );
  }, [pData, id]);

  const productsCount = useMemo(() => {
    const list = master?.products || [];
    return list.filter(
      (p) => p?.state === "inStock" || p?.state === "booked"
    ).length;
  }, [master]);

  if (!master)
    return <div className="max-w-6xl mx-auto p-4">Loading…</div>;

  const photo = resolveUrl(master?.photo?.url);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* верхний блок: фото слева, данные справа, счётчик */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
        <div>
          {photo ? (
            <img
              src={photo}
              alt={master.name}
              className="w-full aspect-[4/3] object-cover rounded-xl border border-gray-200"
            />
          ) : (
            <div className="w-full aspect-[4/3] rounded-xl bg-gray-100 border border-gray-200 grid place-items-center text-gray-500 text-sm select-none">
              no photo
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold">{master.name}</h1>
            <span className="text-sm text-gray-600">
              {t("card.master.products", "products")}:{" "}
              <b>{productsCount}</b>
            </span>
          </div>

          <div className="mt-2">
            <RichText value={master.description} />
          </div>
        </div>
      </div>

      {/* продукты мастера */}
      <section>
        <h2 className="text-xl font-semibold mb-3">
          {t("header.items.goods", "Goods")}
        </h2>
        {products.length === 0 ? (
          <div className="text-gray-500">No products yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <CardProduct
                key={p.documentId}
                documentId={p.documentId}
                title={p.title}
                image={p.image?.url}
                description={p.description}
                price={p.price}
                donationPercent={p.donationPercent}
                status={p.state}
                master={{
                  documentId: master.documentId,
                  name: master.name,
                  href: `/masters/${master.documentId}`,
                  email: master.email,
                  whatsapp: master.whatsapp,
                  otherContact: master.otherContact,
                  messenger: master.messenger,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
