// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Header from "./components/Header";
// import Footer from "./components/Footer";

// import Sticers from "./pages/Sticers";
// import Payment from "./pages/Payment";
// import Profile from "./pages/Profile";
// import Fonds from "./pages/Fonds";
// import Goods from "./pages/Goods";
// import FAQ from "./pages/FAQ";
// import Orders from "./pages/Orders";
// import Terms from "./pages/Terms";
// import Privacy from "./pages/Privacy";
// import Auth from "./pages/Auth";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import EmailConfirmation from "./pages/EmailConfirmation";
// import CheckEmail from "./pages/CheckEmail";
// import ProtectedRoute from "./components/ProtectedRoute";

// export default function App() {
//   return (
//     <div className="min-h-full flex flex-col bg-gray-50">
//       <Header />

//       <main className="flex-1">
//         <Routes>
//           {/* Публичные */}
//           <Route path="/auth" element={<Auth />} />
//           <Route path="/terms" element={<Terms />} />
//           <Route path="/privacy" element={<Privacy />} />
//           <Route path="/forgot" element={<ForgotPassword />} />
//           <Route path="/reset-password" element={<ResetPassword />} />
//           <Route path="/email-confirmation" element={<EmailConfirmation />} />
//           <Route path="/check-email" element={<CheckEmail />} />

//           {/* Защищённые */}
//           <Route
//             path="/"
//             element={
//               <ProtectedRoute>
//                 <Sticers />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/payment"
//             element={
//               <ProtectedRoute>
//                 <Payment />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/profile"
//             element={
//               <ProtectedRoute>
//                 <Profile />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/fonds"
//             element={
//               <ProtectedRoute>
//                 <Fonds />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/goods"
//             element={
//               <ProtectedRoute>
//                 <Goods />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/faq"
//             element={
//               <ProtectedRoute>
//                 <FAQ />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/orders"
//             element={
//               <ProtectedRoute>
//                 <Orders />
//               </ProtectedRoute>
//             }
//           />

//           {/* Фоллбек */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </main>

//       <Footer />
//     </div>
//   );
// }

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Sticers from "./pages/Sticers";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import Fonds from "./pages/Fonds"; // используем тот же компонент, но путь будет /funds
import Goods from "./pages/Goods";
import FAQ from "./pages/FAQ";
import Orders from "./pages/Orders";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import CheckEmail from "./pages/CheckEmail";
import ProtectedRoute from "./components/ProtectedRoute";

import Masters from "./pages/Masters";
import MyGoods from "./pages/MyGoods";
import Reports from "./pages/Reports";

import { useAuth } from "./context/AuthContext";

// Небольшой guard по ролям (имена сравниваем в нижнем регистре)
function RequireRoles({ allowed = [], children }) {
  const { isAuthed, roles, user } = useAuth?.() || {};

  // Нормализуем возможные варианты структуры ролей
  const raw =
    roles ??
    user?.roles ??
    (user?.role ? [user.role] : []);

  const roleNames = (Array.isArray(raw) ? raw : [raw])
    .filter(Boolean)
    .map((r) => (typeof r === "string" ? r : r?.name || r?.type || ""))
    .map((s) => s.toLowerCase());

  // Если авторизован, но роль не пришла — считаем как "authenticated"
  if (isAuthed && !roleNames.length) roleNames.push("authenticated");

  const ok = allowed.length === 0 || allowed.some((a) => roleNames.includes(a.toLowerCase()));
  return ok ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <Routes>
          {/* Публичные */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/check-email" element={<CheckEmail />} />

          {/* Защищённые */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Sticers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Funds: новый путь /funds; старый /fonds → редирект */}
          <Route
            path="/funds"
            element={
              <ProtectedRoute>
                <Fonds />
              </ProtectedRoute>
            }
          />
          <Route path="/fonds" element={<Navigate to="/funds" replace />} />

          <Route
            path="/goods"
            element={
              <ProtectedRoute>
                <Goods />
              </ProtectedRoute>
            }
          />

          <Route
            path="/masters"
            element={
              <ProtectedRoute>
                <Masters />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faq"
            element={
              <ProtectedRoute>
                <FAQ />
              </ProtectedRoute>
            }
          />

          {/* My Goods: роли Free и Masters, временно допускаем Authenticated */}
          <Route
            path="/my-goods"
            element={
              <ProtectedRoute>
                <RequireRoles allowed={["free", "masters", "authenticated"]}>
                  <MyGoods />
                </RequireRoles>
              </ProtectedRoute>
            }
          />

          {/* Orders: роли Free и Authenticated */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <RequireRoles allowed={["free", "authenticated"]}>
                  <Orders />
                </RequireRoles>
              </ProtectedRoute>
            }
          />

          {/* Reports — страница есть, но в меню не показываем */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Фоллбек */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
