import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ME, GET_MY_USER_INFO } from "../api/get";
import { UPDATE_PRODUCT } from "../api/mutations";
import { useLanguage } from "../context/LanguageContext";

export default function Booked() {
  const { id } = useParams(); // product documentId
  const navigate = useNavigate();
  const { t } = useLanguage();

  useQuery(GET_ME); // на всякий случай подтянем me
  const { data: uiData } = useQuery(GET_MY_USER_INFO);
  const userInfoId = uiData?.meFull?.user_info?.documentId;

  const [mutate, { loading, error }] = useMutation(UPDATE_PRODUCT, {
    onCompleted() {
      navigate("/my-orders");
    },
  });

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">{t("pages.booked.title", "Reserve product")}</h1>
      <p className="text-gray-600">{t("pages.booked.note", "Press OK to reserve this product.")}</p>

      <button
        type="button"
        disabled={!userInfoId || loading}
        onClick={() => {
          mutate({
            variables: {
              documentId: id,
              data: { state: "booked", user_info: userInfoId },
            },
          });
        }}
        className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-gray-200 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        OK
      </button>

      {error && <div className="text-red-600 text-sm">{error.message}</div>}
    </div>
  );
}
