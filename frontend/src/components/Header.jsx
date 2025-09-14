import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Bell,
  Menu,
  X,
  Sparkles,
  CreditCard,
  User,
  PiggyBank,
  Package,
  HelpCircle,
  ClipboardList,
  FileText,
  ShieldCheck
} from "lucide-react";
import logo from "../logo.svg";

const MENU_ITEMS = [
  { to: "/", label: "Sticers", Icon: Sparkles },
  { to: "/fonds", label: "Fonds", Icon: PiggyBank },
  { to: "/goods", label: "Goods", Icon: Package },
  { to: "/orders", label: "Orders", Icon: ClipboardList },
  { to: "/faq", label: "FAQ", Icon: HelpCircle },
  { to: "/terms", label: "Terms of Use", Icon: FileText },
  { to: "/privacy", label: "Privacy Policy", Icon: ShieldCheck },
  { to: "/profile", label: "Profile", Icon: User },
  // { to: "/payment", label: "Payment", Icon: CreditCard },
  // Auth — умышленно не добавляем
];

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Sandifund"
            className="h-8 w-8 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <Link to="/" className="font-semibold select-none">Sandifund</Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="p-2 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            onClick={() => {}}
          >
            <Bell size={20} />
          </button>

          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                aria-label="Open menu"
                className="p-2 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <Menu size={22} />
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              {/* Overlay: плавный fade, Radix сам лочит скролл фона */}
              <Dialog.Overlay
                data-overlay
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
              />

              {/* Drawer: плавный slide с мажорной кривой, без горизонтального скролла */}
              <Dialog.Content
                data-panel="drawer"
                className="fixed right-0 top-0 z-50 h-screen w-72 sm:w-80 bg-white border-l border-gray-100 shadow-2xl overflow-y-auto overflow-x-hidden focus:outline-none"
              >
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                  <div className="text-lg font-semibold">Меню</div>
                  <Dialog.Close asChild>
                    <button
                      aria-label="Close menu"
                      className="p-2 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                </div>

                <nav className="p-2">
                  {MENU_ITEMS.map(({ to, label, Icon }) => {
                    const active = isActive(to);
                    return (
                      <Dialog.Close asChild key={to}>
                        <Link
                          to={to}
                          aria-current={active ? "page" : undefined}
                          className={[
                            "group flex items-center gap-3 rounded-lg px-3 py-2 select-none",
                            "transition-colors",
                            active ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-100 text-gray-800",
                          ].join(" ")}
                        >
                          <Icon
                            size={18}
                            className={[
                              "shrink-0 transition-transform duration-200",
                              active ? "text-indigo-600" : "text-gray-600",
                              "group-hover:scale-110",
                            ].join(" ")}
                          />
                          <span className="text-sm font-medium">{label}</span>
                        </Link>
                      </Dialog.Close>
                    );
                  })}
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Чистые CSS-анимации по data-state = open/closed (без дёрганий) */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          /* Overlay */
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

          /* Drawer panel */
          [data-panel="drawer"] {
            transform: translateX(100%);
            animation-duration: 380ms;
            animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); /* мягкий выезд */
            animation-fill-mode: both;
            will-change: transform;
            scrollbar-gutter: stable both-edges; /* без сдвигов и горизонтали */
          }
          [data-panel="drawer"][data-state="open"]   { animation-name: drawer-in; }
          [data-panel="drawer"][data-state="closed"] { animation-name: drawer-out; }

          @keyframes drawer-in  { from { transform: translateX(100%) } to { transform: translateX(0) } }
          @keyframes drawer-out { from { transform: translateX(0) }     to { transform: translateX(100%) } }
        }
      `}</style>
    </header>
  );
}



