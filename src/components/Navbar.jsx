import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  ShieldCheck,
  LogOut,
  Heart,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { authenticated, user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <ShoppingBag size={25} />
          <span>ShopSphere</span>
        </Link>

        <div className="nav-links">
          {authenticated && (
            <Link to="/dashboard" className="nav-link">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          )}

          <Link to="/products" className="nav-link">
            <Package size={18} />
            Products
          </Link>

          {authenticated && (
            <Link to="/orders" className="nav-link">
              <ShoppingBag size={18} />
              Orders
            </Link>
          )}
          {authenticated && (
            <Link to="/favourites" className="nav-link">
              <Heart size={18} />
              Favourites
            </Link>
          )}

          {authenticated && (
            <Link to="/cart" className="cart-link">
              <ShoppingCart size={20} />
              Cart
              {totalQuantity > 0 && (
                <span className="cart-badge">{totalQuantity}</span>
              )}
            </Link>
          )}

          {user?.roleName === "TENANT" && (
            <Link to="/my-store" className="nav-link">
              <Store size={18} />
              My Store
            </Link>
          )}

          {user?.roleName === "ADMIN" && (
            <Link to="/admin" className="nav-link">
              <ShieldCheck size={18} />
              Admin
            </Link>
          )}
        </div>

        <div className="nav-user">
          {authenticated && user && (
            <div className="user-info">
              <strong>{user.username}</strong>
              <span>{user.roleName}</span>
            </div>
          )}

          {authenticated && (
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
