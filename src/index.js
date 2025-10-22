import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaHeartbeat, FaClock, FaCheckCircle } from "react-icons/fa";

import './index.css';
import NavSidebar from './components/sidebar';
import Topbar from './components/topbar';
import Banners from './components/banners';

import PacienteDetalhes from './components/patientsComponents/detailsPatients';
import WeeklyAppointments from './components/appointmentsComponents/WeeklyAppointments'

import Patients from './pages/patients';
import Contracts from './pages/contracts';
import PostOperative from './pages/postOperative';
import Appointments from './pages/appointments';
import Budgets from './pages/budgets';
import Invoices from './pages/invoices';
import Inventory from './pages/inventory'

const HomePage = ({ isSidebarOpen }) => {
  return (
    <section className={`sectionHome ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Topbar showSearch={true} />

      <div className="containerHome">
        <div className="containerHomeText">
          <p>Olá <span>Dr Paulo Vasconcelos</span>, o que precisa hoje?</p>
        </div>
        <div className="contentHomeButtons">
          <Link to="/pacientes" className="HomeButtons">
            <span>Pacientes</span>
          </Link>
          <Link to="/contratos" className="HomeButtons">
            <span>Contratos</span>
          </Link>
          <Link to="/agendamentos" className="HomeButtons">
            <span>Agendamentos</span>
          </Link>
          <Link to="/prontuarios" className="HomeButtons">
            <span>Prontuários</span>
          </Link>
          <Link to="/orcamentos" className="HomeButtons">
            <span>Orçamentos</span>
          </Link>
          <Link to="/orcamentos" className="HomeButtons">
            <span>Faturamento</span>
          </Link>
          <Link to="/insumos" className="HomeButtons">
            <span>Insumos</span>
          </Link>
        </div>
      </div>

      <div className="containerHomeContent">
        <div className="containerHomeContentEsq">
          <div className="containerHomeContentUp">
            <Banners />
          </div>
          <div className="containerHomeContentDown">
            <h3>Pacientes em Pós-Operatórios</h3>

            <div className="contentHomeDown">
              <div className="contentHomeDownPos iniciar">
                <FaHeartbeat className="iconHomeDown" />
                <h4>Iniciando</h4>
                <h1>01</h1>
              </div>

              <div className="contentHomeDivisorR"></div>

              <div className="contentHomeDownPos andamento">
                <FaClock className="iconHomeDown" />
                <h4>Em andamento</h4>
                <h1>02</h1>
              </div>

              <div className="contentHomeDivisorR"></div>

              <div className="contentHomeDownPos concluindo">
                <FaCheckCircle className="iconHomeDown" />
                <h4>Concluindo</h4>
                <h1>06</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="containerHomeContentDir">
          <WeeklyAppointments />
        </div>
      </div>
      
    </section>
  );
};

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Router>
      <NavSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Routes>
        <Route path="/" element={<HomePage isSidebarOpen={isSidebarOpen} />} />
        <Route path="/pacientes" element={<Patients />} />
        <Route path="/paciente/:id" element={<PacienteDetalhes />} />
        <Route path="/contratos" element={<Contracts />} />
        <Route path="/prontuarios" element={<PostOperative />} />
        <Route path="/agendamentos" element={<Appointments />} />
        <Route path="/orcamentos" element={<Budgets />} />
        <Route path="/faturamentos" element={<Invoices />} />
        <Route path="/insumos" element={<Inventory />} />
        <Route path="/login" element={<loginPage />} />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);