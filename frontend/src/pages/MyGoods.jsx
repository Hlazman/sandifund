import React, { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_MY_USER_INFO, GET_MASTERS } from "../api/get";
import CardProduct from "../components/cards/CardProduct";
import { useLanguage } from "../context/LanguageContext";

export default function MyGoods() {
  const { t } = useLanguage();

  const { data: uiData, loading: uiLoading } = useQuery(GET_MY_USER_INFO, { fetchPolicy: "cache-first" });
  const masterId = uiData?.meFull?.user_info?.master?.documentId || null;

  const { data, loading, error } = useQuery(GET_MASTERS, {
    skip: !masterId,
    variables: {
      pagination: { limit: 100 },
      productsPagination2: { limit: 100 },
    },
    fetchPolicy: "cache-and-network",
  });

  const [showBooked, setShowBooked] = useState(true);
  const [showSold, setShowSold] = useState(true);
  const [showInStock, setShowInStock] = useState(true);
  const [showNotValid, setShowNotValid] = useState(true);

  const items = useMemo(() => {
    if (!masterId) return [];

    const masters = data?.masters || [];
    const me = masters.find((m) => m.documentId === masterId);
    const all = me?.products || [];

    return all
      .filter((p) => {
        if (p.state === "booked") return showBooked;
        if (p.state === "sold") return showSold;
        if (p.state === "inStock") return showInStock;
        if (p.state === "notValid") return showNotValid;
        return true;
      })
      .sort((a, b) => {
        const rank = (s) =>
          s === "booked"
            ? 0
            : s === "sold"
            ? 1
            : s === "notValid"
            ? 2
            : s === "inStock"
            ? 3
            : 4;
        return rank(a.state) - rank(b.state);
      });
  }, [data, masterId, showBooked, showSold, showInStock, showNotValid]);

  if (uiLoading) return <div className="max-w-6xl mx-auto p-4">{t("common.loading", "Loading…")}</div>;

  if (!masterId) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">{t("pages.myGoods.title", "My goods")}</h1>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800">
          {t("pages.myGoods.notMaster", "To become a master, write to")}{" "}
          <a className="underline" href="mailto:art-charity@sandifund.com">art-charity@sandifund.com</a>
        </div>
      </div>
    );
  }

  if (loading && !data) return <div className="max-w-6xl mx-auto p-4">{t("common.loading", "Loading…")}</div>;

  const isAbort =
    error?.name === "AbortError" ||
    error?.networkError?.name === "AbortError" || /aborted/i.test(error?.message || "");

  if (error && !isAbort) {
    return <div className="max-w-6xl mx-auto p-4 text-red-600">{error.message}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">{t("pages.myGoods.title", "My goods")}</h1>

      <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-blue-800">
        {t("pages.myGoods.topNote", "If you want to temporarily hide a product from sale, choose 'notValid' in the list.")}
      </div>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showBooked} onChange={(e) => setShowBooked(e.target.checked)} />
          <span>{t("filters.booked", "booked")}</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showSold} onChange={(e) => setShowSold(e.target.checked)} />
          <span>{t("filters.sold", "sold")}</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showInStock} onChange={(e) => setShowInStock(e.target.checked)} />
          <span>{t("filters.inStock", "inStock")}</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showNotValid} onChange={(e) => setShowNotValid(e.target.checked)} />
          <span>{t("filters.notValid", "notValid")}</span>
        </label>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-500">—</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
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
                documentId: p.master?.documentId,
                name: p.master?.name,
                href: p.master?.documentId ? `/masters/${p.master.documentId}` : undefined,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
