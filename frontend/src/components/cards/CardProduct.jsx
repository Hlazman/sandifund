// import React from "react";
// import { useLanguage } from "../../context/LanguageContext";
// import { ImageBox, Badge, Field, statusKeyFrom } from "./_CardParts";

// export default function CardProduct(props) {
//   const {
//     className = "",
//     title,
//     image,
//     description,
//     price,
//     donationPercent,
//     status,
//     master,        // { name, href, image? }
//     reserveLabel,
//     onReserve,
//   } = props;

//   const { t } = useLanguage();
//   const L = (k, fallback) => t(k) || fallback;

//   const statusKey = statusKeyFrom(status);
//   const badgeColor = { inStock: "green", reserved: "amber", sold: "red" }[statusKey] || "gray";
//   const statusLabel = statusKey ? L(`card.product.status.${statusKey}`, status) : status;

//   return (
//     <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 ${className}`}>
//       {image ? (
//         <img src={image} alt={title || ""} className="w-full aspect-[4/3] object-cover rounded-xl border" />
//       ) : (
//         <ImageBox />
//       )}

//       <div className="flex items-start justify-between gap-3">
//         <h3 className="text-lg font-semibold leading-tight">{title || "Untitled product"}</h3>
//         {status ? <Badge color={badgeColor}>{statusLabel}</Badge> : null}
//       </div>

//       <div className="grid gap-1.5">
//         {typeof price === "number" ? (
//           <Field label={L("card.product.price", "Price")} value={`${price}`} />
//         ) : null}
//         {typeof donationPercent === "number" ? (
//           <Field label={L("card.product.donation", "Donation")} value={`${donationPercent}%`} />
//         ) : null}
//         {master?.name ? (
//           <div className="text-sm flex items-center gap-2">
//             {master?.image ? (
//               <img src={master.image} alt={master.name} className="w-6 h-6 rounded-full border" />
//             ) : null}
//             <span className="text-gray-500">{L("card.product.master", "Master")}:</span>
//             {master.href ? (
//               <a href={master.href} className="text-indigo-600 hover:underline">
//                 {master.name}
//               </a>
//             ) : (
//               <span className="text-gray-900">{master.name}</span>
//             )}
//           </div>
//         ) : null}
//       </div>

//       {description ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p> : null}

//       {typeof onReserve === "function" ? (
//         <div className="pt-1">
//           <button
//             type="button"
//             onClick={onReserve}
//             className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
//           >
//             {reserveLabel || L("card.product.reserve", "Reserve")}
//           </button>
//         </div>
//       ) : null}
//     </div>
//   );
// }

import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { ImageBox, Badge, Field, statusKeyFrom } from "./_CardParts";

function RichText({ value }) {
  try {
    if (!value) return null;
    if (typeof value === "string") return <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>;
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
          return <p key={i} className="whitespace-pre-wrap">{children}</p>;
        })}
      </div>
    );
  } catch { return null; }
}

export default function CardProduct(props) {
  const {
    className = "",
    title,
    image,
    description,
    price,
    donationPercent,
    status,
    master,        // { name, href }
    reserveLabel,
    reserveDisabled = false,
    onReserve,
  } = props;

  const { t } = useLanguage();

  // resolve relative image URL from Strapi
  const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");
  const resolveUrl = (url) => (url && !url.startsWith("http") ? `${API_BASE}${url}` : url);
  const imgSrc = resolveUrl(image);

  // status label and color (translation path matches your JSON: card.product.status.*)
  const statusKey = statusKeyFrom(status) || status || null;
  const statusColor =
    statusKey === "booked" ? "indigo" :
    statusKey === "inStock" ? "gray" :
    statusKey === "reserved" ? "yellow" :
    statusKey === "sold" ? "red" : "gray";

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col ${className}`}>
      <div>
        {imgSrc ? (
          <img src={imgSrc} alt={title || ""} className="w-full aspect-[4/3] object-cover rounded-xl border border-gray-200" />
        ) : (<ImageBox />)}
      </div>

      <div className="pt-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-tight break-words">{title}</h3>
        {statusKey ? (
          <Badge color={statusColor}>
            {t(`card.product.status.${statusKey}`, statusKey)}
          </Badge>
        ) : null}
      </div>

      {description ? <div className="pt-1"><RichText value={description} /></div> : null}

      <div className="pt-2 grid gap-1.5">
        {typeof price === "number" && <Field label={t("card.product.price", "Price")} value={`${price} ₪`} />}
        {typeof donationPercent === "number" && <Field label={t("card.product.donation", "Donation")} value={`${donationPercent}%`} />}
        {master?.name && (
          <Field label={t("card.product.master", "Master")} value={
            master?.href
              ? <Link to={master.href} className="text-indigo-600 hover:underline">{master.name}</Link>
              : master.name
          } />
        )}
      </div>

      {typeof onReserve === "function" && (
        <div className="pt-2">
          <button
            type="button"
            onClick={reserveDisabled ? undefined : onReserve}
            disabled={reserveDisabled}
            className="w-full inline-flex items-center justify-center px-3 py-2 rounded-xl border border-gray-200 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {reserveLabel || t("card.product.reserve", "Reserve")}
          </button>
        </div>
      )}
    </div>
  );
}




