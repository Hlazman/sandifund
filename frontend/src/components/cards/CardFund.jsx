import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { LogoBox, Badge, Field, ButtonLink } from "./_CardParts";

export default function CardFund(props) {
  const {
    className = "",
    title,
    logo,
    description,
    email,
    phone1,
    phone2,
    address,
    whatsapp,
    totalDonations,
    website,
    reports, // { href, label? }
  } = props;

  const { t } = useLanguage();
  const L = (k, fallback) => t(k) || fallback;

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
