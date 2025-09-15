// import React from "react";
// import { View, Text } from "react-native";

// export default function Profile() {
//   return (
//     <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
//       <Text style={{ fontSize: 22, fontWeight: "700" }}>Profile</Text>
//     </View>
//   );
// }

////////////////////////////////////////////////////////////////////////////////

import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useQuery, useMutation } from "@apollo/client/react";
import Card from "../components/Card";
import { GET_STICKERS } from "../api/get";
import { LOGIN } from "../api/mutations";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelect from "../components/LanguageSelect";

const DEMO_EMAIL = "glazman.b@gmail.com";
const DEMO_PASSWORD = "JjgYsyd44cGoGF";

export default function Profile() {
  const { locale, t, refreshMe } = useLanguage();
  // ⬇️ Флаг, что авторизация завершена (есть/нет JWT и мы попробовали me)
  const [authReady, setAuthReady] = useState(!!globalThis.sf_jwt);

  // Демо-логин (как и раньше)
  const [login] = useMutation(LOGIN, {
    onCompleted: async ({ login }) => {
      if (login?.jwt) {
        globalThis.sf_jwt = login.jwt;
        await refreshMe().catch(() => {});
        setAuthReady(true); // теперь можно делать защищённые запросы
      }
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!globalThis.sf_jwt) {
        try {
          await login({ variables: { identifier: DEMO_EMAIL, password: DEMO_PASSWORD } });
        } catch {
          // ок, без прав — оставим authReady=false (запросы скипнутся)
        }
      } else {
        await refreshMe().catch(() => {});
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⬇️ ВАЖНО: не шлём запрос stickers, пока не готовы по auth (skip)
  const {
    data: stickersData,
    error: stickersError,
    loading,
    networkStatus,
    refetch,
  } = useQuery(GET_STICKERS, {
    variables: { locale: (locale || "en").toLowerCase() },
    fetchPolicy: "cache-and-network",     // держим старые данные, пока прилетает новая локаль
    returnPartialData: true,               // можно показывать прежний список
    notifyOnNetworkStatusChange: true,     // чтобы видеть refetch/setVariables
    skip: !authReady,                      // ← решает «Forbidden access» на входе
  });

  // Когда идёт любой запрос/рефетч — показываем лоадер (а не «Нет данных…»)
  const isLoading =
    !authReady || loading || networkStatus === 1 || networkStatus === 2 || networkStatus === 4;

  const stickers = Array.isArray(stickersData?.stickers) ? stickersData.stickers : [];

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
      <Card title="Profile">
        <View style={{ marginBottom: 12 }}>
          <Text style={{ marginBottom: 6 }}>Language</Text>
          <LanguageSelect />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ opacity: 0.6 }}>auth.register</Text>
          <Text style={{ fontWeight: "700" }}>{t("auth.register")}</Text>

          <Text style={{ opacity: 0.6, marginTop: 8 }}>auth.rememberMe</Text>
          <Text style={{ fontWeight: "700" }}>{t("auth.rememberMe")}</Text>
        </View>

        <View>
          <Text style={{ fontWeight: "700", marginBottom: 6 }}>Stickers ({locale})</Text>

          {/* Ошибку показываем только если мы «готовы» по auth и это не временный refetch */}
          {!isLoading && stickersError ? (
            <View
              style={{
                padding: 8,
                borderWidth: 1,
                borderColor: "#fecaca",
                borderRadius: 8,
                backgroundColor: "#fff1f2",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#b91c1c", fontWeight: "600" }}>GraphQL error</Text>
              <Text selectable style={{ marginTop: 4, color: "#7f1d1d" }}>
                {String(stickersError.message || stickersError)}
              </Text>
              <Text
                onPress={() => refetch()}
                style={{ marginTop: 8, color: "#2563eb", fontWeight: "600" }}
              >
                Повторить запрос
              </Text>
            </View>
          ) : null}

          {/* Лоадер вместо «Нет данных…», чтобы убрать мерцание при смене языка */}
          {isLoading ? (
            <View style={{ paddingVertical: 8 }}>
              <ActivityIndicator />
            </View>
          ) : stickers.length > 0 ? (
            stickers.map((s, i) => (
              <View
                key={i}
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: "600" }}>{s.title}</Text>
                <Text style={{ opacity: 0.8 }}>{s.description}</Text>
              </View>
            ))
          ) : (
            <Text style={{ opacity: 0.7 }}>Нет данных для выбранной локали.</Text>
          )}
        </View>
      </Card>
    </View>
  );
}
