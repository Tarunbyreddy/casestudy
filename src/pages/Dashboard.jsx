import {
  ShoppingBag,
  Package,
  Store,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  const isAdmin = user?.roleName === "ADMIN";
  const isTenant = user?.roleName === "TENANT";

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.username || "User"} 👋</h1>

        <p className="page-subtitle">Welcome to your ShopSphere dashboard.</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <Package size={25} />
          <h3>Products</h3>
          <strong>Browse</strong>
        </div>

        <div className="stat-card">
          <ShoppingBag size={25} />
          <h3>Orders</h3>
          <strong>History</strong>
        </div>

        {isTenant && (
          <div className="stat-card">
            <Store size={25} />
            <h3>Your Store</h3>
            <strong>{user?.tenantName || "Store"}</strong>
          </div>
        )}

        {isAdmin && (
          <div className="stat-card">
            <ShieldCheck size={25} />
            <h3>Administration</h3>
            <strong>Admin</strong>
          </div>
        )}
      </div>

      <div className="section-card" style={{ marginTop: "25px" }}>
        <h2 className="section-title">Quick Actions</h2>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link to="/products" className="primary-btn">
            Browse Products <ArrowRight size={16} />
          </Link>

          <Link to="/orders" className="primary-btn">
            My Orders
          </Link>

          {isTenant && (
            <Link to="/my-store" className="primary-btn">
              Manage Store
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="primary-btn">
              Admin Panel
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
