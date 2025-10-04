import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { ImageBox, Badge, Field, statusKeyFrom } from "./_CardParts";

export default function CardProduct(props) {
  const {
    className = "",
    title,
    image,
    description,
    price,
    donationPercent,
    status,
    master,        // { name, href, image? }
    reserveLabel,
    onReserve,
  } = props;

  const { t } = useLanguage();
  const L = (k, fallback) => t(k) || fallback;

  const statusKey = statusKeyFrom(status);
  const badgeColor = { inStock: "green", reserved: "amber", sold: "red" }[statusKey] || "gray";
  const statusLabel = statusKey ? L(`card.product.status.${statusKey}`, status) : status;

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 ${className}`}>
      {image ? (
        <img src={image} alt={title || ""} className="w-full aspect-[4/3] object-cover rounded-xl border" />
      ) : (
        <ImageBox />
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-tight">{title || "Untitled product"}</h3>
        {status ? <Badge color={badgeColor}>{statusLabel}</Badge> : null}
      </div>

      <div className="grid gap-1.5">
        {typeof price === "number" ? (
          <Field label={L("card.product.price", "Price")} value={`${price}`} />
        ) : null}
        {typeof donationPercent === "number" ? (
          <Field label={L("card.product.donation", "Donation")} value={`${donationPercent}%`} />
        ) : null}
        {master?.name ? (
          <div className="text-sm flex items-center gap-2">
            {master?.image ? (
              <img src={master.image} alt={master.name} className="w-6 h-6 rounded-full border" />
            ) : null}
            <span className="text-gray-500">{L("card.product.master", "Master")}:</span>
            {master.href ? (
              <a href={master.href} className="text-indigo-600 hover:underline">
                {master.name}
              </a>
            ) : (
              <span className="text-gray-900">{master.name}</span>
            )}
          </div>
        ) : null}
      </div>

      {description ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p> : null}

      {typeof onReserve === "function" ? (
        <div className="pt-1">
          <button
            type="button"
            onClick={onReserve}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            {reserveLabel || L("card.product.reserve", "Reserve")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
