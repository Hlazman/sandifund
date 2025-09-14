import React from "react";

export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 ${className}`}>
      {title ? <h2 className="text-lg font-semibold mb-2">{title}</h2> : null}
      {children}
    </div>
  );
}
