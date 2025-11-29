import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import { useLanguage } from "../../context/LanguageContext";
import { ImageBox, Badge, Field, statusKeyFrom } from "./_CardParts";
import { GET_MY_USER_INFO, GET_PRODUCTS_BY_MASTER } from "../../api/get";
import { UPDATE_PRODUCT } from "../../api/mutations";

function RichText({ value }) {
  try {
    if (!value) return null;
    if (typeof value === "string") {
      return (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {value}
        </p>
      );
    }
    const nodes = Array.isArray(value) ? value : value.children || [];
    return (
      <div className="space-y-1 text-sm text-gray-700">
        {nodes.map((n, i) => {
          const children = (n.children || []).map((ch, j) => {
            let text = ch.text || "";
            if (ch.bold) text = <strong key={j}>{text}</strong>;
            if (ch.italic) text = <em key={j}>{text}</em>;
            if (ch.underline) text = <u key={j}>{text}</u>;
            return <span key={j}>{text}</span>;
          });
          switch (n.type) {
            case "paragraph":
              return <p key={i}>{children}</p>;
            case "ul":
            case "list":
              return (
                <ul key={i} className="list-disc pl-5">
                  {children}
                </ul>
              );
            case "ol":
              return (
                <ol key={i} className="list-decimal pl-5">
                  {children}
                </ol>
              );
            case "li":
              return <li key={i}>{children}</li>;
            default:
              return <p key={i}>{children}</p>;
          }
        })}
      </div>
    );
  } catch {
    return null;
  }
}

export default function CardProduct(props) {
  const {
    className = "",
    documentId,
    title,
    image,
    description,
    price,
    donationPercent,
    status, // product.state
    // master: { documentId?, name, href, email?, whatsapp? }
    master,
  } = props;

  const { t } = useLanguage();

  // Resolve relative Strapi URL
  const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");
  const resolveUrl = (url) =>
    url && !url.startsWith("http") ? `${API_BASE}${url}` : url;
  const imgSrc = resolveUrl(image);

  // Определяем, является ли текущий пользователь мастером-владельцем товара
  const { data: meData } = useQuery(GET_MY_USER_INFO, {
    fetchPolicy: "cache-first",
  });
  const myMasterId =
    meData?.meFull?.user_info?.master?.documentId || null;
  const productMasterId =
    master?.documentId ||
    (master?.href ? master.href.split("/").pop() : null);
  const isOwner =
    !!myMasterId && !!productMasterId && myMasterId === productMasterId;

  // Контакты мастера (для покупателей)
  const normalizeWhatsapp = (value) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const digits = trimmed.replace(/\D/g, "");
    if (!digits) return null;
    return `https://wa.me/${digits}`;
  };

  const whatsappHref = normalizeWhatsapp(master?.whatsapp);
  const emailHref = master?.email ? `mailto:${master.email}` : null;
  const hasContacts = !!(whatsappHref || emailHref);
  const [contactValue, setContactValue] = useState("");

  // Badge отражает текущий статус
  const [localState, setLocalState] = useState(status || "inStock");

  // Select (действие) + модалка подтверждения для мастера
  const [selectValue, setSelectValue] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingState, setPendingState] = useState(null);

  const [mutate, { loading: saving }] = useMutation(UPDATE_PRODUCT);

  const statusKey = useMemo(
    () => statusKeyFrom(localState) || localState || null,
    [localState]
  );
  const statusColor =
    statusKey === "booked"
      ? "indigo"
      : statusKey === "inStock"
      ? "gray"
      : statusKey === "reserved"
      ? "amber"
      : statusKey === "sold"
      ? "red"
      : statusKey === "notValid"
      ? "amber"
      : "gray";

  const labelFor = (s) => {
    if (s === "inStock")
      return t("card.product.status.inStock", "inStock");
    if (s === "booked")
      return t("card.product.status.booked", "booked");
    if (s === "notValid")
      return t("filters.notValid", "notValid");
    if (s === "sold")
      return t("card.product.status.sold", "sold");
    return s || "";
  };

  const onOwnerActionChange = (e) => {
    const next = e.target.value;
    setSelectValue(next);
    if (!next) return;
    setPendingState(next);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setPendingState(null);
    setSelectValue("");
  };

  const confirmAction = async () => {
    if (!pendingState) return;

    const data = { state: pendingState };
    if (pendingState === "inStock" || pendingState === "notValid") {
      // при возврате в inStock/notValid отвязываем user_info
      data.user_info = null;
    }

    try {
      await mutate({
        variables: { documentId, data },
        refetchQueries: myMasterId
          ? [
              {
                query: GET_PRODUCTS_BY_MASTER,
                variables: {
                  pagination: { limit: 100 },
                  masterId: myMasterId,
                },
              },
            ]
          : [],
        awaitRefetchQueries: false,
        optimisticResponse: {
          updateProduct: {
            __typename: "Product",
            documentId,
            state: pendingState,
          },
        },
      });
      setLocalState(pendingState);
    } catch (err) {
      if (
        !/aborted/i.test(err?.message || "") &&
        err?.name !== "AbortError"
      ) {
        console.error(err);
      }
    } finally {
      closeConfirm();
    }
  };

  const OwnerControls = () => (
    <div className="mt-3">
      <select
        value={selectValue}
        onChange={onOwnerActionChange}
        disabled={saving || confirmOpen}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {/* Плейсхолдер */}
        <option value="">
          {t("pages.myGoods.selectAction", "Выберите действие")}
        </option>
        <option value="inStock">
          {t("card.product.status.inStock", "inStock")}
        </option>
        <option value="booked">
          {t("card.product.status.booked", "booked")}
        </option>
        <option value="notValid">
          {t("filters.notValid", "notValid")}
        </option>
        <option value="sold">
          {t("card.product.status.sold", "sold")}
        </option>
      </select>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={saving ? undefined : closeConfirm}
          />

          <div className="relative z-[61] w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl border border-gray-200 p-5">
            <h4 className="text-lg font-semibold">
              {t("pages.myGoods.confirmTitle", "Подтверждение")}
            </h4>
            <p className="mt-2 text-sm text-gray-700">
              {t(
                "pages.myGoods.confirmChange",
                "Подтвердите изменение статуса товара?"
              )}{" "}
              <span className="font-medium">
                ({labelFor(pendingState)})
              </span>
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={saving ? undefined : closeConfirm}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {t("common.cancel", "Отмена")}
              </button>
              <button
                type="button"
                onClick={saving ? undefined : confirmAction}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {t("common.ok", "Ок")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col ${className}`}
    >
      <div>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={title || "product"}
            className="w-full aspect-[4/3] object-cover rounded-xl bg-gray-100 border border-gray-200"
            loading="lazy"
          />
        ) : (
          <ImageBox />
        )}
      </div>

      <div className="mt-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight">
            {title}
          </h3>
          {statusKey && (
            <Badge color={statusColor}>
              {t(`card.product.status.${statusKey}`, statusKey)}
            </Badge>
          )}
        </div>

        <div className="mt-2 space-y-1">
          {!!description && <RichText value={description} />}
          {typeof price === "number" && (
            <Field
              label={t("card.product.price", "Price")}
              value={`${price} ₪`}
            />
          )}
          {typeof donationPercent === "number" && (
            <Field
              label={t("card.product.donation", "Donation")}
              value={`${donationPercent}%`}
            />
          )}
          {master?.name && (
            <Field
              label={t("card.product.master", "Master")}
              value={
                master?.href ? (
                  <Link
                    to={master.href}
                    className="text-indigo-600 hover:underline"
                  >
                    {master.name}
                  </Link>
                ) : (
                  master.name
                )
              }
            />
          )}
        </div>
      </div>

      {isOwner ? (
        <OwnerControls />
      ) : hasContacts ? (
        <div className="pt-2">
          <select
            value={contactValue}
            onChange={(e) => {
              const value = e.target.value;
              setContactValue(value);
              if (!value) return;
              if (typeof window !== "undefined") {
                window.open(value, "_blank", "noopener,noreferrer");
              }
              setContactValue("");
            }}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">
              {t(
                "card.product.chooseContact",
                "Связаться с мастером"
              )}
            </option>
            {whatsappHref && (
              <option value={whatsappHref}> WhatsApp</option>
            )}
            {emailHref && (
              <option value={emailHref}> Email</option>
            )}
          </select>
        </div>
      ) : null}
    </div>
  );
}
