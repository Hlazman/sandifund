import React from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ME } from "../api/get";
import { useLanguage } from "../context/LanguageContext";

export default function MyGoods() {
  const { t } = useLanguage();
  const { data, loading } = useQuery(GET_ME, { fetchPolicy: "cache-first" });

  // Роль берём из ответа Me (есть и name, и type — нормализуем к lower-case)
  const roleKey =
    (data?.me?.role?.type || data?.me?.role?.name || "").toLowerCase();
  const isMaster = roleKey === "master";

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2">{t("pages.myGoods.title")}</h1>

      {/* Показываем подсказку только когда загрузка прошла и это не мастер */}
      {!loading && !isMaster && (
        <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800">
          {t("pages.myGoods.notMaster")}{" "}
          <a className="underline" href="mailto:support@sandifund.com">
            support@sandifund.com
          </a>
        </div>
      )}
    </div>
  );
}
