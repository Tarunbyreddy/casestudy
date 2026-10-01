import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, LogIn } from "lucide-react";

import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { authenticated, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && authenticated) {
      navigate("/dashboard");
    }
  }, [authenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <ShoppingBag size={32} />
        </div>

        <h1>Welcome to ShopSphere</h1>

        <p>
          Discover products from multiple brands, manage your purchases and
          track your orders.
        </p>

        <button onClick={login} className="primary-btn">
          <LogIn size={18} />
          &nbsp; Login with Keycloak
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
