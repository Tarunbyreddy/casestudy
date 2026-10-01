import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { authenticated, loading } = useAuth();

  // Wait until Keycloak finishes checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    );
  }

  // User is not logged in
  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated
  return children;
}

export default ProtectedRoute;
