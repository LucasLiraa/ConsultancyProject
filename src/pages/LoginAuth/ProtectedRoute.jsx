import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { usuario, carregando } = useAuth();

  if (carregando) return null; // Pode colocar um loader aqui se quiser

  return usuario ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;