import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Sticers from "./pages/Sticers";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import Fonds from "./pages/Fonds";
import Goods from "./pages/Goods";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import CheckEmail from "./pages/CheckEmail";
import ChangePassword from "./pages/ChangePassword";
import GoogleRedirect from "./pages/GoogleRedirect";
import ProtectedRoute from "./components/ProtectedRoute";

import Masters from "./pages/Masters";
import Master from "./pages/Master";
import Booked from "./pages/Booked";
import MyOrders from "./pages/MyOrders";
import MyGoods from "./pages/MyGoods";
import Reports from "./pages/Reports";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { loginWithToken } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = searchParams.get("jwt");
    const user = searchParams.get("user");
    if (jwt && user) {
      loginWithToken(jwt, true);
      localStorage.setItem("sf_user", user);
      navigate("/?loggedIn=true");
    }
  }, [searchParams, loginWithToken, navigate]);

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
          <Route path="/connect/google/redirect" element={<GoogleRedirect />} />

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
            path="/masters/:id"
            element={
              <ProtectedRoute>
                <Master />
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

          <Route
            path="/my-goods"
            element={
              <ProtectedRoute>
                  <MyGoods />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                  <MyOrders />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/orders"
            element={<Navigate to="/my-orders" replace />}
          />

          <Route
            path="/booked/:id"
            element={
              <ProtectedRoute>
                <Booked />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
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
