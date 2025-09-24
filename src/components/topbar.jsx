import React, { useState, useEffect } from "react";
import "./styles/topbar.css";

const Topbar = ({ showSearch = false, isSidebarOpen }) => {
  const [termoBusca, setTermoBusca] = useState("");
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);

  useEffect(() => {
    if (termoBusca.trim() === "") {
      setPacientesFiltrados([]);
      return;
    }

    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientes")) || [];
    const resultadoBusca = pacientesSalvos.filter((p) =>
      p.nome.toLowerCase().includes(termoBusca.toLowerCase())
    );

    setPacientesFiltrados(resultadoBusca);
  }, [termoBusca]);

  return (
    <div className={`topbar ${showSearch ? "with-search" : "no-search"} ${isSidebarOpen ? "expanded" : "collapsed"}`}>
      {/* Barra de Pesquisa */}
      {showSearch && (
        <div className="topbarSearch">
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />
        <i className="fa fa-search"></i>
      
        {termoBusca && (
          <div className="searchResultsContainer">
            <div className="searchResults">
              {pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((patient, index) => (
                  <div key={index} className="searchItem">
                    <i className="fa fa-search"></i>
                    <p>{patient.nome}</p>
                  </div>
                ))
              ) : (
                <p className="noResults">Nenhum paciente encontrado.</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      )}

      {/* Seção Direita com Notificação e Perfil */}
      <div className="right-section">
        <button className="topbarNotification">
          <i className="fa fa-bell"></i>
        </button>

        <div className="divider"></div>

        <div className="topbarUserInfo">
          <img src="profile-dr-paulo.jpeg" alt="Usuário" className="topbarUserAvatar" />
          <span className="topbarUserName">Dr. Paulo Vasconcelos</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;