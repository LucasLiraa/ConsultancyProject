import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/postOperativeStyles/postOperativeSelector.css";

function PostOperativePatientSelector({ onVoltar, onIniciar }) {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const fetchPacientes = async () => {
      const { data, error } = await supabase
        .from("pacientes") // tabela principal de pacientes
        .select("*")
        .order("nome", { ascending: true });

      if (!error) {
        setPacientes(data);
      } else {
        console.error("Erro ao buscar pacientes:", error.message);
      }
    };

    fetchPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="selectorOverlay">
      <div className="selectorModal">
        <div className="selectorHeader">
          <h2>Selecionar paciente</h2>
          <button onClick={onVoltar}>
            <i className="fa-solid fa-square-xmark"></i></button>
        </div>

        <input
          type="text"
          placeholder="Buscar paciente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="searchInput"
        />

        <div className="patientList">
          {pacientesFiltrados.map((p) => (
            <div key={p.id} className="patientItem">
              <span>{p.nome}</span>
              <button onClick={() => onIniciar(p)}>
                Iniciar pós-operatório
              </button>
            </div>
          ))}
          {pacientesFiltrados.length === 0 && (
            <p className="vazio">Nenhum paciente encontrado</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostOperativePatientSelector;