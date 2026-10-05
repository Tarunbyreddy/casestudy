import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import MyStorePage from "./pages/MyStorePage";
import AdminPage from "./pages/AdminPage";
import FavouritesPage from "./pages/FavouritesPage";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/products" element={<ProductsPage />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <FavouritesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-store"
          element={
            <ProtectedRoute>
              <MyStorePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
