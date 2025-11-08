// import React from "react";
// import { useParams } from "react-router-dom";
// import { useQuery, useMutation } from "@apollo/client/react";
// import { GET_ME, GET_MY_USER_INFO } from "../api/get";
// import { UPDATE_PRODUCT } from "../api/mutations";
// import { useLanguage } from "../context/LanguageContext";

// export default function Booked() {
//   const { id } = useParams(); // product documentId
//   const { t } = useLanguage();

//   // Подтягиваем пользователя и user_info (нужно для связи при бронировании)
//   useQuery(GET_ME); // на всякий случай подтянем me
//   const { data: uiData } = useQuery(GET_MY_USER_INFO);
//   const userInfoId = uiData?.meFull?.user_info?.documentId;

//   // Локальное состояние формы
//   const [name, setName] = React.useState("");
//   const [phone, setPhone] = React.useState("");
//   const [byWhatsapp, setByWhatsapp] = React.useState(true);
//   const [byPhone, setByPhone] = React.useState(true);
//   const [success, setSuccess] = React.useState(false);

//   const [mutate, { loading, error }] = useMutation(UPDATE_PRODUCT, {
//     onCompleted() {
//       setSuccess(true);
//       // TODO: здесь можно вызвать отправку данных формы (name, phone, byWhatsapp, byPhone)
//       // Пример (псевдокод):
//       // await sendBookingForm({
//       //   productId: id,
//       //   name,
//       //   phone,
//       //   contact: { whatsapp: byWhatsapp, phone: byPhone },
//       // });
//     },
//   });

//   const onSubmit = () => {
//     if (!id) return;
//     // Бронирование продукта (как и было)
//     const data = userInfoId
//       ? { state: "booked", user_info: userInfoId }
//       : { state: "booked" }; // на всякий случай, если user_info не подтянулся
//     mutate({ variables: { documentId: id, data } });
//   };

//   return (
//     <div className="max-w-xl mx-auto p-4 space-y-4">
//       <h1 className="text-2xl font-semibold">
//         {t("pages.booked.title", "Reserve product")}
//       </h1>

//       {/* Имя */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           {t("pages.booked.form.name", "Name")}
//         </label>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder={t("pages.booked.form.name", "Name")}
//           className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white"
//         />
//       </div>

//       {/* Телефон */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           {t("pages.booked.form.phone", "Phone")}
//         </label>
//         <input
//           type="tel"
//           value={phone}
//           onChange={(e) => setPhone(e.target.value)}
//           placeholder={t("pages.booked.form.phone", "Phone")}
//           className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white"
//         />
//       </div>

//       {/* Контакты: по умолчанию оба включены */}
//       <div>
//         <div className="text-sm font-medium text-gray-700 mb-2">
//           {t("pages.booked.form.contacts", "Contact me via")}
//         </div>
//         <div className="flex items-center gap-6">
//           <label className="inline-flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={byWhatsapp}
//               onChange={(e) => setByWhatsapp(e.target.checked)}
//             />
//             <span>{t("card.fund.whatsapp", "WhatsApp")}</span>
//           </label>
//           <label className="inline-flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={byPhone}
//               onChange={(e) => setByPhone(e.target.checked)}
//             />
//             <span>{t("pages.booked.form.byPhone", "Phone call")}</span>
//           </label>
//         </div>
//       </div>

//       {/* Кнопка забронировать */}
//       <div>
//         <button
//           type="button"
//           disabled={!userInfoId || loading || success}
//           onClick={onSubmit}
//           className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 px-4 py-2"
//         >
//           {t("pages.booked.form.submit", "Reserve")}
//         </button>
//         {!success ? (
//           <p className="text-gray-600 text-sm mt-2">
//             {t("pages.booked.note", "Press OK to reserve this product.")}
//           </p>
//         ) : null}
//       </div>

//       {/* Сообщение об успехе */}
//       {success && (
//         <div className="rounded-xl border border-green-200 bg-green-50 text-green-800 p-3">
//           {t("pages.booked.success", "The product has been reserved.")}
//         </div>
//       )}

//       {/* Ошибка */}
//       {error && <div className="text-red-600 text-sm">{error.message}</div>}

//       {/* Примечание под формой */}
//       <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-900 p-3">
//         {t(
//           "pages.booked.cancelNote",
//           "If you decide to cancel the reservation, please notify the Master via any contact listed on their profile. Or write to us at support@sandifund.com."
//         )}
//       </div>
//     </div>
//   );
// }

// src/pages/Booked.jsx
import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ME, GET_MY_USER_INFO } from "../api/get";
import { UPDATE_PRODUCT } from "../api/mutations";
import { useLanguage } from "../context/LanguageContext";

// ✅ именованный импорт
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

import { PhoneNumberUtil } from "google-libphonenumber";
const phoneUtil = PhoneNumberUtil.getInstance();

export default function Booked() {
  const { id } = useParams(); // product documentId
  const navigate = useNavigate();
  const { t } = useLanguage();

  useQuery(GET_ME);
  const { data: uiData } = useQuery(GET_MY_USER_INFO);
  const userInfoId = uiData?.meFull?.user_info?.documentId || null;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // E.164 из PhoneInput
  const [contactWhatsApp, setContactWhatsApp] = useState(true);
  const [contactPhone, setContactPhone] = useState(true);
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const [updateProduct, { loading, error }] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      setSuccess(true);
      // TODO: отправить данные формы (name, phone, каналы связи)
    },
  });

  const isPhoneValid = useMemo(() => {
    if (!phone) return false;
    try {
      return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
    } catch {
      return false;
    }
  }, [phone]);

  const canSubmit =
    name.trim().length >= 2 &&
    isPhoneValid &&
    (contactWhatsApp || contactPhone) &&
    !!userInfoId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    await updateProduct({
      variables: {
        documentId: id, // важно: documentId
        data: { state: "booked", user_info: userInfoId },
      },
    });
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-semibold mb-3">{t("pages.booked.title")}</h1>
        <div className="rounded-md border border-green-200 bg-green-50 text-green-800 p-3 mb-4">
          {t("pages.booked.success")}
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-line">{t("pages.booked.cancelNote")}</p>
        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4">{t("pages.booked.title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
            {t("pages.booked.form.name")}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {touched && name.trim().length < 2 && (
            <div className="mt-1 text-xs text-red-600">
              {t("errors.unknown", "Unknown error.")}
            </div>
          )}
        </div>

        {/* Phone — внешний вид под «Name» */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
            {t("pages.booked.form.phone")}
          </label>

          {/* Обёртка придаёт общий бордер/радиус/паддинги */}
          <div className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 focus-within:ring-2 focus-within:ring-indigo-500">
            <PhoneInput
              defaultCountry="il"
              forceDialCode
              value={phone}
              onChange={setPhone}
              inputProps={{
                id: "phone",
                name: "phone",
                autoComplete: "tel",
                className: "w-full bg-transparent outline-none border-none px-1 py-1",
              }}
              // className="w-full"
              className="sf-phone w-full"
              countrySelectorStyleProps={{
                buttonStyle: { border: "none", background: "transparent", boxShadow: "none" }
              }}
            />
          </div>

          {touched && !isPhoneValid && (
            <div className="mt-1 text-xs text-red-600">
              {t("errors.invalidPhone", "Invalid phone number.")}
            </div>
          )}
        </div>

        {/* Контакты */}
        <fieldset className="mt-2 border border-gray-200 rounded-md p-3">
          <legend className="px-1 text-sm font-medium text-gray-800">
            {t("pages.booked.form.contacts")}
          </legend>

          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={contactWhatsApp}
                onChange={(e) => setContactWhatsApp(e.target.checked)}
              />
              <span>WhatsApp</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={contactPhone}
                onChange={(e) => setContactPhone(e.target.checked)}
              />
              <span>{t("pages.booked.form.byPhone")}</span>
            </label>

            {touched && !(contactWhatsApp || contactPhone) && (
              <div className="text-xs text-red-600">{t("errors.unknown", "Unknown error.")}</div>
            )}
          </div>
        </fieldset>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="inline-flex w-full items-center justify-center rounded-md px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {t("pages.booked.form.submit")}
          </button>
        </div>

        {error && <div className="text-red-600 text-sm">{error.message}</div>}
      </form>

      <p className="mt-6 text-sm text-gray-700 whitespace-pre-line">
        {t("pages.booked.cancelNote")}
      </p>
    </div>
  );
}






