import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "../styles/postOperativeStyles/novoPosOperatorioCard.css";

const NovoPosOperatorioCard = ({ onClose, onIniciar }) => {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const pacientesCadastrados = JSON.parse(localStorage.getItem("pacientes")) || [];
    setPacientes(pacientesCadastrados);
  }, []);

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const handleIniciar = (paciente) => {
    // garante que cada paciente tenha ID único
    if (!paciente.id) {
      paciente.id = uuidv4();
    }
    if (!paciente.semanas) {
      paciente.semanas = [];
    }

    // salva no localStorage se ainda não existir
    const pacientesPos = JSON.parse(localStorage.getItem("pacientesPos") || "[]");
    const jaExiste = pacientesPos.some(p => p.id === paciente.id);
    if (!jaExiste) {
      pacientesPos.push(paciente);
      localStorage.setItem("pacientesPos", JSON.stringify(pacientesPos));
    }

    onIniciar(paciente);
  };

  return (
    <div className="novoPosOverlay">
      <div className="novoPosCard">
        <div className="novoPosHeader">
          <h2>Selecionar paciente</h2>
          <button className="closeButton" onClick={onClose}>X</button>
        </div>

        <input
          type="text"
          placeholder="Buscar paciente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="searchInput"
        />

        <div className="pacienteLista">
          {pacientesFiltrados.map((p) => (
            <div key={p.id || p.nome} className="pacienteItem">
              <div className="pacienteInfo">
                <h4>{p.nome}</h4>
                <p>{p.cirurgia}</p>
              </div>
              <button
                className="iniciarBtn"
                onClick={() => handleIniciar(p)}
              >
                Iniciar
              </button>
            </div>
          ))}
          {pacientesFiltrados.length === 0 && <p>Nenhum paciente encontrado.</p>}
        </div>
      </div>
    </div>
  );
};

export default NovoPosOperatorioCard;