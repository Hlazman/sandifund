import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

/**
 * Универсальная карточка (web)
 * variant: "product" | "fund" | "sticker"
 * Все поля опциональны. Неуказанные — не рендерятся.
 */
export default function Card(props) {
  const {
    variant,
    className = "",

    // общие
    title,
    image, // url | null/undefined => "no image"
    description,

    // product
    price,
    donationPercent,
    status, // "в наличии" | "забронировано" | "куплено"
    master, // { name, href, image? }
    reserveLabel, // подпись кнопки "Забронировать" (опционально)
    onReserve, // обработчик бронирования (опционально)

    // fund
    logo,
    email,
    phone1,
    phone2,
    address,
    whatsapp, // "+972..." или "https://wa.me/..."
    totalDonations,
    website,
    reports, // { label?, href }

    // sticker
    link,

    // fallback
    children,
  } = props;

  const { t } = useLanguage();
  const L = (k, fallback) => t(k) || fallback;

  // ---------- Fallback без variant ----------
  if (!variant) {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 ${className}`}>
        {title ? <h2 className="text-lg font-semibold mb-2">{title}</h2> : null}
        {children}
      </div>
    );
  }

  // ---------- вспомогалки ----------
  const ImageBox = ({ text = "no image" }) => (
    <div className="w-full aspect-[4/3] rounded-xl bg-gray-100 border border-gray-200 grid place-items-center text-gray-500 text-sm select-none">
      {text}
    </div>
  );

  const LogoBox = ({ text = "no image" }) => (
    <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 grid place-items-center text-gray-500 text-xs shrink-0">
      {text}
    </div>
  );

  const Badge = ({ color = "gray", children: c }) => {
    const map = {
      gray: "bg-gray-100 text-gray-700",
      green: "bg-green-100 text-green-700",
      amber: "bg-amber-100 text-amber-700",
      red: "bg-red-100 text-red-700",
      indigo: "bg-indigo-100 text-indigo-700",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[color] || map.gray}`}>
        {c}
      </span>
    );
  };

  const Field = ({ label, value, href }) => {
    if (!value) return null;
    const content = href ? (
      <a href={href} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
        {value}
      </a>
    ) : (
      <span>{value}</span>
    );
    return (
      <div className="text-sm flex items-start gap-2">
        <span className="text-gray-500 shrink-0">{label}:</span>
        <div className="text-gray-900 break-words">{content}</div>
      </div>
    );
  };

  const ButtonLink = ({ to, href, children: c }) => {
    const cls =
      "inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors";
    if (to) return <Link to={to} className={cls}>{c}</Link>;
    if (href) return <a href={href} target="_blank" rel="noreferrer" className={cls}>{c}</a>;
    return null;
  };

  const statusKeyFrom = (s) => {
    const v = (s || "").toString().toLowerCase();
    if (!v) return null;
    if (v.includes("stock") || v.includes("налич")) return "inStock";
    if (v.includes("reserv") || v.includes("заброн")) return "reserved";
    if (v.includes("sold") || v.includes("куплен") || v.includes("bought") || v.includes("purchas")) return "sold";
    return null;
  };
  const statusKey = statusKeyFrom(status);
  const badgeColor = { inStock: "green", reserved: "amber", sold: "red" }[statusKey] || "gray";
  const statusLabel = statusKey ? L(`card.product.status.${statusKey}`, status) : status;

  // ---------- Варианты ----------
  if (variant === "product") {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 ${className}`}>
        {/* картинка перед заголовком */}
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
                <Link to={master.href} className="text-indigo-600 hover:underline">
                  {master.name}
                </Link>
              ) : (
                <span className="text-gray-900">{master.name}</span>
              )}
            </div>
          ) : null}
        </div>

        {description ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p> : null}

        {/* опциональная кнопка "Забронировать" */}
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

  if (variant === "fund") {
    const waHref = whatsapp
      ? whatsapp.startsWith("http")
        ? whatsapp
        : `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`
      : undefined;

    return (
      <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 ${className}`}>
        <div className="flex items-center gap-3">
          {logo ? (
            <img src={logo} alt={title || ""} className="w-20 h-20 object-cover rounded-xl border" />
          ) : (
            <LogoBox />
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight truncate">{title || "Untitled fund"}</h3>
            {typeof totalDonations === "number" ? (
              <div className="mt-1">
                <Badge color="indigo">
                  {L("card.fund.donations", "Donations")}: {totalDonations}
                </Badge>
              </div>
            ) : null}
          </div>
        </div>

        {description ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p> : null}

        <div className="grid gap-1.5">
          <Field label={L("card.fund.email", "Email")} value={email} href={email ? `mailto:${email}` : undefined} />
          <Field label={L("card.fund.phone1", "Phone 1")} value={phone1} href={phone1 ? `tel:${phone1}` : undefined} />
          <Field label={L("card.fund.phone2", "Phone 2")} value={phone2} href={phone2 ? `tel:${phone2}` : undefined} />
          <Field label={L("card.fund.address", "Address")} value={address} />
          <Field label={L("card.fund.whatsapp", "WhatsApp")} value={whatsapp} href={waHref} />
          <Field label={L("card.fund.website", "Website")} value={website} href={website} />
        </div>

        {reports?.href ? (
          <div className="pt-1">
            <ButtonLink to={reports.href}>{reports.label || L("card.fund.reports", "Reports")}</ButtonLink>
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "sticker") {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 ${className}`}>
        {/* картинка перед заголовком */}
        {image ? (
          <img src={image} alt={title || ""} className="w-full aspect-[4/3] object-cover rounded-xl border" />
        ) : (
          <ImageBox />
        )}

        <h3 className="text-lg font-semibold leading-tight">{title || "Untitled sticker pack"}</h3>

        {description ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p> : null}

        {link ? (
          <div className="pt-1">
            <ButtonLink href={link}>{L("card.sticker.openLink", "Open link")}</ButtonLink>
          </div>
        ) : null}
      </div>
    );
  }

  // safety
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 ${className}`}>
      <h3 className="text-lg font-semibold leading-tight">{title || "Card"}</h3>
      {description ? <p className="text-sm text-gray-700">{description}</p> : null}
      {children}
    </div>
  );
}
