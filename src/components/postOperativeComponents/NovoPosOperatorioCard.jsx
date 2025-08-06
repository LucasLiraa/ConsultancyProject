import React, { useState, useEffect } from "react";
import "../styles/postOperativeStyles/novoPosOperatorioCard.css";
import { buscarAcompanhamentos } from "../../utils/localStorageUtils";

const NovoPosOperatorioCard = ({ onClose, onIniciar }) => {
  const [listaPacientes, setListaPacientes] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    // Buscando os pacientes do localStorage (ou usando sua função utilitária)
    const pacientesCadastrados = JSON.parse(localStorage.getItem("pacientes")) || [];
    setListaPacientes(pacientesCadastrados);
  }, []);

  const pacientesFiltrados = listaPacientes.filter((paciente) =>
    paciente.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="novoPosOverlay">
      <div className="novoPosCard">
        <div className="novoPosHeader">
          <h3>Iniciar novo pós-operatório</h3>
          <button className="closeButton" onClick={onClose}>X</button>
        </div>

        <input
          type="text"
          placeholder="Buscar paciente..."
          className="searchInput"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <div className="pacienteLista">
          {pacientesFiltrados.length > 0 ? (
            pacientesFiltrados.map((paciente) => (
              <div key={paciente.id} className="pacienteItem">
                <div className="pacienteInfo">
                  <h4>{paciente.nome}</h4>
                  <p>{paciente.cirurgia}</p>
                </div>
                <button
                  className="iniciarBtn"
                  onClick={() => onIniciar(paciente)}
                >
                  Iniciar
                </button>
              </div>
            ))
          ) : (
            <p>Nenhum paciente encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NovoPosOperatorioCard;
