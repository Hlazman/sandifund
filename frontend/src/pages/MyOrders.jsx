import React, { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
// import { GET_PRODUCTS, GET_MY_PRODUCTS_IDS, GET_MY_USER_INFO } from "../api/get";
import { GET_PRODUCTS, GET_MY_USER_INFO } from "../api/get";
import CardProduct from "../components/cards/CardProduct";
import { useLanguage } from "../context/LanguageContext";

export default function MyOrders() {
  const { t } = useLanguage();
  const [showSold, setShowSold] = useState(true);
  const [showBooked, setShowBooked] = useState(true);

  const { data: uiData } = useQuery(GET_MY_USER_INFO);
  const myUserInfoId = uiData?.meFull?.user_info?.documentId;

  // const { data: idsData } = useQuery(GET_MY_PRODUCTS_IDS);
  // const myIds = (idsData?.meFull?.user_info?.products || []).map((p) => p.documentId);
  const myIds = (uiData?.meFull?.user_info?.products || []).map((p) => p.documentId);

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { pagination: { limit: 100 } },
    fetchPolicy: "cache-and-network",
  });

  const items = useMemo(() => {
    const all = data?.products || [];
    const mine = all.filter((p) => {
      const byRelation = p.user_info?.documentId && myUserInfoId && p.user_info.documentId === myUserInfoId;
      const byIds = myIds.includes(p.documentId);
      return byRelation || byIds;
    });

    const filtered = mine.filter((p) => {
      if (p.state === "booked") return showBooked;
      if (p.state === "sold") return showSold;
      return true;
    });

    return filtered.sort((a, b) => {
      const rank = (s) => (s === "booked" ? 0 : s === "sold" ? 1 : 2);
      return rank(a.state) - rank(b.state);
    });
  }, [data, myIds, myUserInfoId, showBooked, showSold]);

  if (loading && !data) return <div className="max-w-6xl mx-auto p-4">{t("common.loading", "Loading…")}</div>;
  if (error) return <div className="max-w-6xl mx-auto p-4 text-red-600">{error.message}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">{t("header.myOrders", "My Orders")}</h1>

      {/* <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showBooked} onChange={(e) => setShowBooked(e.target.checked)} />
          <span>booked</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showSold} onChange={(e) => setShowSold(e.target.checked)} />
          <span>sold</span>
        </label>
      </div> */}

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showBooked} onChange={(e) => setShowBooked(e.target.checked)} />
          <span>{t("filters.booked", "booked")}</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={showSold} onChange={(e) => setShowSold(e.target.checked)} />
          <span>{t("filters.bought", "bought")}</span>
        </label>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-500">
          {t("pages.myOrders.empty", "У вас нету забронированых или купленных продуктов")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <CardProduct
              key={p.documentId}
              title={p.title}
              image={p.image?.url}
              description={p.description}
              price={p.price}
              donationPercent={p.donationPercent}
              status={p.state}
              // master={{
              //   name: p.master?.name,
              //   href: p.master?.documentId ? `/masters/${p.master.documentId}` : undefined,
              // }}
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
