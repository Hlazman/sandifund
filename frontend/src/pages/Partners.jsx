import React, { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, X } from "lucide-react";
import { GET_PARTNERS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";

const API_BASE =
  process.env.REACT_APP_GRAPHQL_URL?.replace("/graphql", "") ?? "";

function resolveLogoUrl(logo) {
  const url = logo?.url;
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
}

// Тот же простой рендер Slate-JSON, что и в About
function renderRichText(nodes) {
  if (!Array.isArray(nodes)) return null;

  return nodes.map((node, idx) => {
    if (node.type === "paragraph") {
      return (
        <p key={idx} className="mb-3 leading-relaxed">
          {renderRichText(node.children)}
        </p>
      );
    }

    if (node.type?.startsWith("heading")) {
      return (
        <h2
          key={idx}
          className="mt-4 mb-3 text-lg font-semibold leading-snug tracking-tight"
        >
          {renderRichText(node.children)}
        </h2>
      );
    }

    if (!node.type || node.type === "text") {
      let text = node.text ?? "";
      if (!text) return null;

      let className = "";
      if (node.bold) className += " font-semibold";
      if (node.italic) className += " italic";
      if (node.underline) className += " underline";

      return (
        <span key={idx} className={className || undefined}>
          {text}
        </span>
      );
    }

    if (Array.isArray(node.children)) {
      return (
        <span key={idx} className="block mb-2">
          {renderRichText(node.children)}
        </span>
      );
    }

    return null;
  });
}

const Partners = () => {
  const { locale, t, dir } = useLanguage();

  const { data, loading, error } = useQuery(GET_PARTNERS, {
    variables: {
      locale,
      pagination: { limit: 100 },
    },
    fetchPolicy: "cache-and-network",
  });

  const partners = useMemo(
    () => data?.partners ?? [],
    [data]
  );

  const isRtl = dir === "rtl";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1
        className={`text-2xl font-bold mb-6 ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        {t("pages.partners.title", "Partners")}
      </h1>

      {loading && !data && (
        <p className="text-sm text-gray-500">
          {t("notifications.loading", "Loading...")}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          {t("errors.network", "Network error")}
        </p>
      )}

      {!loading && !error && partners.length === 0 && (
        <p className="text-sm text-gray-500">
          {t("notifications.empty", "No partners yet")}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {partners.map((p) => {
          const logoUrl = resolveLogoUrl(p.logo);
          const link = p.link || "";
          const hasLink = !!link;

          return (
            <Dialog.Root key={p.documentId}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  className="group w-full text-left bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
                >
                  <div className="p-4 flex flex-col gap-3">
                    {/* Логотип в аккуратной "рамке" с object-contain */}
                    <div className="w-full h-32 sm:h-36 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 overflow-hidden">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={p.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">
                          {t("card.fund.noLogo", "No logo")}
                        </span>
                      )}
                    </div>

                    <div className={isRtl ? "text-right" : "text-left"}>
                      <h2 className="text-base font-semibold mb-1">
                        {p.title}
                      </h2>

                      {hasLink && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>{link}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut" />
                <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center px-4 data-[state=open]:animate-slideInUp data-[state=closed]:animate-slideOutDown">
                  <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6 relative">
                    <Dialog.Close className="absolute top-3 right-3 inline-flex rounded-full p-1 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                      <X className="w-4 h-4 text-gray-500" />
                    </Dialog.Close>

                    <Dialog.Title
                      className={`text-lg font-semibold mb-4 ${
                        isRtl ? "text-right" : "text-left"
                      }`}
                    >
                      {p.title}
                    </Dialog.Title>

                    <div
                      className={`text-sm sm:text-base ${
                        isRtl ? "text-right" : "text-left"
                      }`}
                    >
                      {Array.isArray(p.description) &&
                      p.description.length > 0 ? (
                        renderRichText(p.description)
                      ) : (
                        <p className="text-gray-500">
                          {t(
                            "notifications.empty",
                            "No description provided"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          );
        })}
      </div>
    </div>
  );
};

export default Partners;
