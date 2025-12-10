// src/pages/LoginAuth/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao obter sessão:", error.message);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!data?.session);
        }
      } catch (err) {
        console.error("Erro inesperado na checagem de sessão:", err);
        setIsAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, []);

  if (checking) {
    return (
      <div className="loading-screen">
        <p>Verificando sessão...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Não logado → joga pro login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logado → libera o conteúdo protegido
  return children;
};

export default ProtectedRoute;