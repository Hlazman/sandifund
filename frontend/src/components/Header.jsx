import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Menu,
  X,
  Sparkles,
  User,
  PiggyBank,
  Package,
  HelpCircle,
  ClipboardList,
  FileText,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import NotificationsPanel from "./NotificationsPanel.jsx"; // ⬅️ добавлено
import logo from "../logo.svg";

const ITEMS = [
  { to: "/", key: "sticers", Icon: Sparkles },
  { to: "/fonds", key: "fonds", Icon: PiggyBank },
  { to: "/goods", key: "goods", Icon: Package },
  { to: "/orders", key: "orders", Icon: ClipboardList },
  { to: "/faq", key: "faq", Icon: HelpCircle },
  { to: "/terms", key: "terms", Icon: FileText },
  { to: "/privacy", key: "privacy", Icon: ShieldCheck },
  { to: "/profile", key: "profile", Icon: User },
];

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const { isAuthed, logout } = useAuth();
  const { t, dir } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Sandifund"
            className="h-8 w-8 cursor-pointer"
            onClick={() => navigate(isAuthed ? "/" : "/auth")}
          />
          <Link to={isAuthed ? "/" : "/auth"} className="font-semibold select-none">
            {t("header.title")}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* 🔔 Колокольчик → панель уведомлений */}
          {isAuthed ? (
            <NotificationsPanel />
          ) : (
            <button
              aria-label={t("header.notifications")}
              className="p-2 rounded-xl opacity-50 cursor-not-allowed"
              disabled
              type="button"
            >
              <span className="block w-5 h-5 bg-gray-300 rounded" />
            </button>
          )}

          {isAuthed ? (
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button
                  aria-label={t("header.menu")}
                  className="p-2 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <Menu size={22} />
                </button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay
                  data-overlay
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                />

                <Dialog.Content
                  data-panel="drawer"
                  className={[
                    "fixed top-0 z-50 h-screen w-72 sm:w-80 bg-white border-gray-100 shadow-2xl",
                    "overflow-y-auto overflow-x-hidden focus:outline-none",
                    dir === "rtl" ? "left-0 border-r" : "right-0 border-l",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "p-4 flex items-center justify-between border-gray-100",
                      dir === "rtl" ? "border-b" : "border-b",
                    ].join(" ")}
                  >
                    <Dialog.Title className="text-lg font-semibold">
                      {t("header.menu")}
                    </Dialog.Title>

                    <Dialog.Close asChild>
                      <button
                        aria-label={t("common.close")}
                        className="p-2 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        <X size={20} />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* скрытое описание для доступности */}
                  <Dialog.Description className="sr-only">
                    {t("header.menu")}
                  </Dialog.Description>

                  <nav className="p-2">
                    {ITEMS.map(({ to, key, Icon }) => {
                      const active = isActive(to);
                      return (
                        <Dialog.Close asChild key={to}>
                          <Link
                            to={to}
                            aria-current={active ? "page" : undefined}
                            className={[
                              "group flex items-center gap-3 rounded-lg px-3 py-2 select-none transition-colors",
                              dir === "rtl" ? "flex-row-reverse" : "",
                              active
                                ? "bg-indigo-50 text-indigo-700"
                                : "hover:bg-gray-100 text-gray-800",
                            ].join(" ")}
                          >
                            <Icon
                              size={18}
                              className={[
                                "shrink-0 transition-transform duration-200",
                                dir === "rtl" ? "ml-2" : "mr-2",
                                active ? "text-indigo-600" : "text-gray-600",
                                "group-hover:scale-110",
                              ].join(" ")}
                            />
                            <span className="text-sm font-medium">
                              {t(`header.items.${key}`)}
                            </span>
                          </Link>
                        </Dialog.Close>
                      );
                    })}

                    {/* Logout */}
                    <Dialog.Close asChild>
                      <button
                        className={[
                          "mt-2 w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-100",
                          dir === "rtl" ? "flex-row-reverse" : "",
                        ].join(" ")}
                        onClick={() => {
                          logout();
                          navigate("/auth");
                        }}
                      >
                        <LogOut
                          size={18}
                          className={dir === "rtl" ? "ml-2 text-gray-600" : "mr-2 text-gray-600"}
                        />
                        <span className="text-sm font-medium">
                          {t("header.items.logout")}
                        </span>
                      </button>
                    </Dialog.Close>
                  </nav>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          ) : (
            <button
              aria-label="Menu disabled"
              className="p-2 rounded-xl opacity-50 cursor-not-allowed"
              disabled
              type="button"
            >
              <Menu size={22} />
            </button>
          )}
        </div>
      </div>

      {/* анимации */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          [data-overlay] {
            opacity: 0;
            animation-duration: 260ms;
            animation-timing-function: cubic-bezier(0.2, 0.0, 0.2, 1);
            animation-fill-mode: both;
            will-change: opacity;
          }
          [data-overlay][data-state="open"]   { animation-name: overlay-fade-in; }
          [data-overlay][data-state="closed"] { animation-name: overlay-fade-out; }
          @keyframes overlay-fade-in   { from { opacity: 0 } to { opacity: 1 } }
          @keyframes overlay-fade-out  { from { opacity: 1 } to { opacity: 0 } }

          [data-panel="drawer"] {
            transform: translateX(100%);
            animation-duration: 380ms;
            animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
            animation-fill-mode: both;
            will-change: transform;
            scrollbar-gutter: stable both-edges;
          }
          /* RTL: панель заезжает слева */
          [dir="rtl"] [data-panel="drawer"] { transform: translateX(-100%); }
          [data-panel="drawer"][data-state="open"]   { animation-name: drawer-in; }
          [data-panel="drawer"][data-state="closed"] { animation-name: drawer-out; }
          @keyframes drawer-in  { from { transform: translateX(100%) } to { transform: translateX(0) } }
          @keyframes drawer-out { from { transform: translateX(0) }     to { transform: translateX(100%) } }
        }
      `}</style>
    </header>
  );
}
