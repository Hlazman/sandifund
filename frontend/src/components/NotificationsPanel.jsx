import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Bell, ChevronDown, ExternalLink } from "lucide-react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_NOTIFICATIONS, GET_MY_READ_NOTIFICATIONS } from "../api/get";
import { SET_USERINFO_NOTIFICATIONS } from "../api/mutations";
import { useLanguage } from "../context/LanguageContext.jsx";

// Дата/время по локали
function formatPublished(iso, locale) {
  try {
    const dt = new Date(iso);
    return new Intl.DateTimeFormat(locale || "en", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dt);
  } catch {
    return iso;
  }
}

// Простой рендер Slate-like JSON: paragraph + text/bold
function RichText({ nodes }) {
  if (!Array.isArray(nodes)) return null;
  return (
    <div className="space-y-2">
      {nodes.map((p, i) => {
        if (p?.type !== "paragraph" || !Array.isArray(p.children)) return null;
        return (
          <p key={i} className="leading-relaxed">
            {p.children.map((ch, j) => {
              if (!ch || typeof ch.text !== "string") return null;
              if (ch.bold) return <strong key={j}>{ch.text}</strong>;
              return <span key={j}>{ch.text}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function NotificationsPanel() {
  const { locale, t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(() => new Set());
  const [locallyRead, setLocallyRead] = React.useState(() => new Set());

  // Таймер для батчинга отправок «прочитано»
  const flushTimerRef = React.useRef(null);

  // Все уведомления (до 250) — сразу просим нужную локаль
  const { data: allData, loading: allLoading } = useQuery(GET_NOTIFICATIONS, {
    variables: { pagination: { limit: 250 }, locale },
    fetchPolicy: "cache-and-network",
  });

  // Прочитанные из user_info
  const { data: mineData, loading: mineLoading } = useQuery(
    GET_MY_READ_NOTIFICATIONS,
    {
      variables: { pagination: { limit: 250 } },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    }
  );

  const userInfoId = mineData?.meFull?.user_info?.documentId || null;

  const readIdsFromServer = React.useMemo(() => {
    const arr = mineData?.meFull?.user_info?.notifications || [];
    return new Set(arr.map((n) => n.documentId));
  }, [mineData]);

  // Эффективно прочитанные = сервер + локально помеченные
  const effectiveReadIds = React.useMemo(() => {
    const s = new Set(readIdsFromServer);
    for (const id of locallyRead) s.add(id);
    return s;
  }, [readIdsFromServer, locallyRead]);

  // Список по текущей локали (отдаётся сервером уже отфильтрованным)
  const items = React.useMemo(() => allData?.notifications ?? [], [allData]);

  // Badge: непрочитанные ТЕКУЩЕЙ ЛОКАЛИ
  const unreadCount = React.useMemo(
    () => items.filter((n) => !effectiveReadIds.has(n.documentId)).length,
    [items, effectiveReadIds]
  );

  // Показывать бэйдж — только когда обе выборки готовы
  const showBadge = React.useMemo(
    () => !allLoading && !mineLoading && unreadCount > 0,
    [allLoading, mineLoading, unreadCount]
  );

  const [setUserInfoNotifications] = useMutation(SET_USERINFO_NOTIFICATIONS, {
    onError: (e) => {
      console.error("Failed to persist read notifications:", e);
    },
  });

  // Батч-сброс: объединяем серверные + все локально отмеченные и отправляем одной мутацией
  const scheduleFlush = React.useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      if (!userInfoId) return;

      const union = new Set(readIdsFromServer);
      for (const id of locallyRead) union.add(id);
      const nextIds = Array.from(union);

      setUserInfoNotifications({
        variables: { userInfoId, notifications: nextIds },
      });
    }, 300); // 300мс достаточно, чтобы «схватить» серию кликов
  }, [userInfoId, readIdsFromServer, locallyRead, setUserInfoNotifications]);

  // Клик по карточке: раскрыть/свернуть + пометить прочитанным (локально) + запланировать батч-сброс
  const onToggle = (n) => {
    const next = new Set(expanded);
    if (next.has(n.documentId)) {
      next.delete(n.documentId);
      setExpanded(next);
      return;
    }
    next.add(n.documentId);
    setExpanded(next);

    if (!effectiveReadIds.has(n.documentId) && userInfoId) {
      setLocallyRead((prev) => {
        const s = new Set(prev);
        s.add(n.documentId);
        return s;
      });
      scheduleFlush();
    }
  };

  // Смена языка — сбрасываем раскрытые
  React.useEffect(() => {
    setExpanded(new Set());
  }, [locale]);

  // Очистка таймера при размонтировании
  React.useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, []);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setExpanded(new Set());
          // На закрытии — финальный flush на всякий случай
          scheduleFlush();
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={t("notifications.title") || "Notifications"}
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:shadow"
        >
          <Bell className="w-5 h-5" />
          {showBadge && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold bg-red-600 text-white flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50 w-[380px] max-h-[70vh] overflow-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-xl"
        >
          <div className="px-2 py-1.5 text-sm font-medium opacity-70 flex items-center gap-1">
            <span>{t("notifications.title") || "Notifications"}</span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </div>

          {allLoading ? (
            <div className="p-4 text-sm opacity-70">
              {t("notifications.loading") || "Loading…"}
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm opacity-70">
              {t("notifications.empty") || "No notifications"}
            </div>
          ) : (
            <ul className="p-1 space-y-2">
              {items.map((n) => {
                const isRead = effectiveReadIds.has(n.documentId);
                const isOpen = expanded.has(n.documentId);
                return (
                  <li key={n.documentId}>
                    <button
                      type="button"
                      onClick={() => onToggle(n)}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${
                        isRead ? "border-gray-200 bg-white" : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      {/* Заголовок + дата */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className={`truncate font-medium ${!isRead ? "text-blue-900" : ""}`}>
                            {n.title}
                          </div>
                          <div className="text-xs opacity-60">
                            {formatPublished(n.publishedAt, locale)}
                          </div>
                        </div>
                        <div
                          className={`mt-0.5 shrink-0 rounded-full w-2 h-2 ${
                            isRead ? "bg-transparent border border-gray-300" : "bg-blue-500"
                          }`}
                          title={isRead ? "Read" : "Unread"}
                        />
                      </div>

                      {/* Контент (без refetch — карточка не дёргается) */}
                      <div
                        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
                          isOpen ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="text-sm leading-relaxed">
                            <RichText nodes={n.text} />
                            {n.link && (
                              <a
                                href={n.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-blue-600 underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {t("notifications.openLink") || "Open link"}{" "}
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
