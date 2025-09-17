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

// export default function App() {
//   return (
//     <div className="min-h-full flex flex-col bg-gray-50">
//       <Header />
//       <main className="flex-1">
//         <Routes>
//           <Route path="/" element={<Sticers />} />
//           <Route path="/payment" element={<Payment />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/fonds" element={<Fonds />} />
//           <Route path="/goods" element={<Goods />} />
//           <Route path="/faq" element={<FAQ />} />
//           <Route path="/orders" element={<Orders />} />
//           <Route path="/terms" element={<Terms />} />
//           <Route path="/privacy" element={<Privacy />} />
//           <Route path="/auth" element={<Auth />} />
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
import Fonds from "./pages/Fonds";
import Goods from "./pages/Goods";
import FAQ from "./pages/FAQ";
import Orders from "./pages/Orders";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Auth from "./pages/Auth";

import ProtectedRoute from "./components/ProtectedRoute";

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
            path="/fonds"
            element={
              <ProtectedRoute>
                <Fonds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goods"
            element={
              <ProtectedRoute>
                <Goods />
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
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
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
