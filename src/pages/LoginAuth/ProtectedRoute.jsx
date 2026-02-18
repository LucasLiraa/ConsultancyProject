import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mustSetPassword, setMustSetPassword] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao obter sessão:", error.message);
          setIsAuthenticated(false);
          setMustSetPassword(false);
          return;
        }

        const session = data?.session;

        if (!session) {
          setIsAuthenticated(false);
          setMustSetPassword(false);
          return;
        }

        setIsAuthenticated(true);

        // ✅ Sem tabela: usa metadata do próprio Auth
        const mustChange = !!session.user?.user_metadata?.must_change_password;
        setMustSetPassword(mustChange);
      } catch (err) {
        console.error("Erro inesperado na checagem de sessão:", err);
        setIsAuthenticated(false);
        setMustSetPassword(false);
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
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ✅ Logado, mas precisa definir senha → manda pra /nova-senha
  if (mustSetPassword && location.pathname !== "/nova-senha") {
    return <Navigate to="/nova-senha" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;