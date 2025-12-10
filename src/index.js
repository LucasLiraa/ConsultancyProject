import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FaHeartbeat, FaClock, FaCheckCircle } from "react-icons/fa";

import "./index.css";

import NavSidebar from "./components/sidebar";
import Topbar from "./components/topbar";
import Banners from "./components/banners";
import Profile from "./components/profile";
import WeeklyAppointments from "./components/appointmentsComponents/WeeklyAppointments";
import PacienteDetalhes from "./components/patientsComponents/detailsPatients";
import DashboardGeral from "./components/DashboardGeral";
import ProntuarioPaciente from "./components/patientsComponents/ProntuarioPaciente";

import Patients from "./pages/patients";
import Contracts from "./pages/contracts";
import PostOperative from "./pages/postOperative";
import Appointments from "./pages/appointments";
import Budgets from "./pages/budgets";
import Financial from "./pages/financial";
import Inventory from "./pages/inventory";

import ProtectedRoute from "./pages/LoginAuth/ProtectedRoute";
import Login from "./pages/LoginAuth/Login";
import NovaSenha from "./pages/LoginAuth/NovaSenha";

import { AuthProvider } from "./contexts/AuthContext";

// Home usando o layout novo
const HomePage = ({ isSidebarOpen }) => {
  return (
    <section
      className={`sectionHome ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <div className="containerHomeContent" style={{ display: "flex" }}>
        <div className="containerHomeContentEsq">
          <Topbar showSearch={true} />

          <div className="containerHomeContentUp">
            <Banners />
          </div>

          <div className="containerHomeContentDown">
            <h3>Pacientes em Pós-Operatórios</h3>

            <div className="contentHomeDown">
              <div className="contentHomeDownPos iniciar">
                <FaHeartbeat className="iconHomeDown" />
                <h4>Iniciando</h4>
                <h1>0</h1>
              </div>

              <div className="contentHomeDivisorR"></div>

              <div className="contentHomeDownPos andamento">
                <FaClock className="iconHomeDown" />
                <h4>Em andamento</h4>
                <h1>0</h1>
              </div>

              <div className="contentHomeDivisorR"></div>

              <div className="contentHomeDownPos concluindo">
                <FaCheckCircle className="iconHomeDown" />
                <h4>Concluindo</h4>
                <h1>0</h1>
              </div>
            </div>
          </div>

          <DashboardGeral />
        </div>

        <div className="containerHomeContentDir">
          <Profile />
          <WeeklyAppointments />
        </div>
      </div>
    </section>
  );
};

// Layout geral das páginas protegidas
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <>
      <NavSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      {React.cloneElement(children, { isSidebarOpen })}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ROTAS PÚBLICAS */}
          <Route path="/login" element={<Login />} />
          <Route path="/nova-senha" element={<NovaSenha />} />

          {/* ROTAS PROTEGIDAS */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pacientes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Patients />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/paciente/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PacienteDetalhes />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pacientes/:id/prontuario"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProntuarioPaciente />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contratos"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Contracts />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/prontuarios"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PostOperative />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agendamentos"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Appointments />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orcamentos"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Budgets />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faturamentos"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Financial />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/insumos"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Inventory />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);