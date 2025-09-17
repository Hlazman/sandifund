// import React from "react";

// export default function Profile() {
//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <h1 className="text-2xl font-bold">Profile</h1>
//     </div>
//   );
// }

///////////////////////////////////////////////////////

import React, { useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_STICKERS } from "../api/get";
import { LOGIN } from "../api/mutations";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelect from "../components/LanguageSelect";

// демо-логин — подставь свои тестовые данные или убери
const DEMO_EMAIL = "temp@sandifund.com";
const DEMO_PASSWORD = "demo123";

export default function Profile() {
  const { locale, t, refreshMe } = useLanguage();

  const [login] = useMutation(LOGIN, {
    onCompleted: async ({ login }) => {
      if (login?.jwt) {
        localStorage.setItem("sf_jwt", login.jwt);
        await refreshMe(); // сразу подтянем authoritative язык с бэка
      }
    },
  });

  useEffect(() => {
    if (!localStorage.getItem("sf_jwt")) {
      login({ variables: { identifier: DEMO_EMAIL, password: DEMO_PASSWORD } }).catch(() => {});
    } else {
      refreshMe().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: stickersData } = useQuery(GET_STICKERS, {
    variables: { locale },
    fetchPolicy: "network-only",
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Language</label>
        <LanguageSelect />
      </div>

      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-1">auth.register</div>
        <div className="text-lg font-semibold">{t("auth.register")}</div>

        <div className="text-sm text-gray-600 mt-4 mb-1">auth.rememberMe</div>
        <div className="text-lg font-semibold">{t("auth.rememberMe")}</div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Stickers ({locale})</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(stickersData?.stickers || []).map((s, i) => (
            <div key={i} className="rounded-xl border p-3 bg-white">
              <div className="font-medium">{s.title}</div>
              <div className="text-sm opacity-80">{s.description}</div>
            </div>
          ))}
          {(!stickersData?.stickers || stickersData.stickers.length === 0) && (
            <div className="text-sm opacity-70">Нет данных для выбранной локали.</div>
          )}
        </div>
      </div>
    </div>
  );
}



