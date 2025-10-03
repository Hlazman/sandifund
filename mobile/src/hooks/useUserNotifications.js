// mobile/src/hooks/useUserNotifications.js
import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_NOTIFICATIONS, GET_MY_READ_NOTIFICATIONS } from "../api/get";

export default function useUserNotifications({
  isAuthed,
  visible = true,
  ctxLocale,
}) {
  // 1) user_info: язык + прочитанные + createdAt
  const { data: mineData, loading: mineLoading } = useQuery(
    GET_MY_READ_NOTIFICATIONS,
    {
      variables: { pagination: { limit: 250 } },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      skip: !isAuthed || !visible,
    }
  );

  const userLang = mineData?.meFull?.user_info?.language || ctxLocale;

  // 2) уведомления по userLang
  const { data: allData, loading: allLoading } = useQuery(GET_NOTIFICATIONS, {
    variables: { pagination: { limit: 250 }, locale: userLang },
    fetchPolicy: "cache-and-network",
    skip: !isAuthed || !visible || mineLoading,
  });

  // createdAt из user_info
  const hasRegisteredAt = Boolean(mineData?.meFull?.user_info?.createdAt);
  const registeredAtTs = useMemo(
    () =>
      hasRegisteredAt ? Date.parse(mineData.meFull.user_info.createdAt) : null,
    [hasRegisteredAt, mineData]
  );

  // общий флаг загрузки
  const isLoading = allLoading || mineLoading || !hasRegisteredAt;

  // список: фильтр по дате регистрации + сортировка (новые сверху)
  const items = useMemo(() => {
    if (isLoading) return [];
    const list = allData?.notifications ?? [];
    const filtered = registeredAtTs
      ? list.filter((n) => {
          const pt = n?.publishedAt ? Date.parse(n.publishedAt) : 0;
          return pt >= registeredAtTs;
        })
      : list;
    return [...filtered].sort((a, b) => {
      const at = a?.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bt = b?.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bt - at; // DESC
    });
  }, [isLoading, allData, registeredAtTs]);

  // прочитанные (сервер)
  const readIdsFromServer = useMemo(() => {
    const arr = mineData?.meFull?.user_info?.notifications || [];
    return new Set(arr.map((n) => n.documentId));
  }, [mineData]);

  const userInfoId = mineData?.meFull?.user_info?.documentId || null;

  return {
    isLoading,
    items,
    userLang,
    readIdsFromServer,
    userInfoId,
  };
}
