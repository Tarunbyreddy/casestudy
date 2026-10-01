import { createContext, useContext, useEffect, useState } from "react";

import keycloak from "../Keycloak";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    keycloak
      .init({
        onLoad: "check-sso",
        pkceMethod: "S256",
      })
      .then(async (auth) => {
        setAuthenticated(auth);

        if (auth) {
          try {
            /*
             * Get application user from Spring Boot.
             *
             * Keycloak gives us authentication.
             * Spring Boot gives us application information
             * such as role and tenant.
             */

            const response = await api.get("/users/me");

            setUser(response.data);
          } catch (error) {
            console.error("Failed to load application user:", error);
          }
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Keycloak initialization failed:", error);

        setLoading(false);
      });
  }, []);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        loading,
        user,
        login,
        logout,
        keycloak,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
