import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Store from "../pages/Store";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import GameDetailPage from "../pages/GameDetailPage.jsx";
import Profile from "../pages/Profile.jsx";
import OrderConfirmation from "../pages/OrderConfirmation.jsx";
import OrderHistory from "../pages/OrderHistory.jsx";
import Admin from "../pages/Admin.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/store" element={<Store />} />
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute redirectTo="/register">
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/game/:steamId" element={<GameDetailPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute redirectTo="/login">
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-confirmation/:orderId"
        element={
          <ProtectedRoute redirectTo="/login">
            <OrderConfirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute redirectTo="/login">
            <OrderHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute redirectTo="/login">
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
