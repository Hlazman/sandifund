import React from "react";
import { Link } from "react-router-dom";

export const ImageBox = ({ text = "no image" }) => (
  <div className="w-full aspect-[4/3] rounded-xl bg-gray-100 border border-gray-200 grid place-items-center text-gray-500 text-sm select-none">
    {text}
  </div>
);

export const LogoBox = ({ text = "no image" }) => (
  <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 grid place-items-center text-gray-500 text-xs shrink-0">
    {text}
  </div>
);

export const Badge = ({ color = "gray", children }) => {
  const map = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[color] || map.gray}`}>
      {children}
    </span>
  );
};

export const Field = ({ label, value, href }) => {
  if (!value) return null;
  const content = href ? (
    <a href={href} target={href?.startsWith("#") ? "_self" : "_blank"} rel="noreferrer" className="text-indigo-600 hover:underline break-all">
      {value}
    </a>
  ) : (
    <span className="break-words">{value}</span>
  );
  return (
    <div className="text-sm flex items-start gap-2">
      <span className="text-gray-500 shrink-0">{label}:</span>
      <div className="text-gray-900 break-words">{content}</div>
    </div>
  );
};

export const ButtonLink = ({ to, href, children, fullWidth, download }) => {
  const base =
    "inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors";
  const cls = fullWidth ? `${base} w-full text-center` : base;

  if (to) return <Link to={to} className={cls}>{children}</Link>;

  if (href) {
    if (download) {
      return (
        <a href={href} download className={cls}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return null;
};

export const statusKeyFrom = (s) => {
  const v = (s || "").toString().toLowerCase();
  if (!v) return null;
  if (v.includes("booked") || v.includes("брон")) return "booked";
  if (v.includes("stock") || v.includes("налич")) return "inStock";
  if (v.includes("reserv") || v.includes("заброн")) return "reserved";
  if (v.includes("sold") || v.includes("куплен") || v.includes("bought") || v.includes("purchas")) return "sold";
  if (v.includes("notvalid") || v.includes("not valid") || v.includes("невали")) return "notValid";
  return null;
};
