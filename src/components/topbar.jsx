import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/topbar.css";
import { supabase } from "../utils/supabaseClient"; // <-- ajuste o caminho

const Topbar = ({ showSearch = false, isSidebarOpen }) => {
  const navigate = useNavigate();

  const [termoBusca, setTermoBusca] = useState("");
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    let alive = true;
    const term = termoBusca.trim();

    if (!term) {
      setPacientesFiltrados([]);
      setLoadingSearch(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoadingSearch(true);

      const { data, error } = await supabase
        .from("pacientes")
        .select("id, nome")
        .ilike("nome", `%${term}%`)
        .order("nome", { ascending: true })
        .limit(8);

      if (!alive) return;

      if (error) {
        console.error("Erro ao buscar pacientes:", error);
        setPacientesFiltrados([]);
      } else {
        setPacientesFiltrados(data || []);
      }

      setLoadingSearch(false);
    }, 250);

    return () => {
      alive = false;
      clearTimeout(timeout);
    };
  }, [termoBusca]);

  const handleSelectPatient = (patient) => {
    // limpa UI
    setTermoBusca("");
    setPacientesFiltrados([]);

    // navega para sua rota existente
    navigate(`/paciente/${patient.id}`);
  };

  return (
    <div
      className={`topbar ${showSearch ? "with-search" : "no-search"} ${
        isSidebarOpen ? "expanded" : "collapsed"
      }`}
    >
      <div className="topbarLeft">
        {showSearch && (
          <div className="topbarSearch">
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              autoComplete="off"
            />
            <i className="fa fa-search"></i>

            {termoBusca && (
              <div className="searchResultsContainer">
                <div className="searchResults">
                  {loadingSearch ? (
                    <p className="noResults">Buscando...</p>
                  ) : pacientesFiltrados.length > 0 ? (
                    pacientesFiltrados.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        className="searchItem"
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <i className="fa fa-user"></i>
                        <p>{patient.nome}</p>
                      </button>
                    ))
                  ) : (
                    <p className="noResults">Nenhum paciente encontrado.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button className="topbarNotification" type="button">
          <i className="fa fa-bell"></i>
        </button>
      </div>
    </div>
  );
};

export default Topbar;