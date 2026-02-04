import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Search, X } from "lucide-react";
import "../styles/postOperativeStyles/postOperativeSelector.css";

/**
 * Seleciona um paciente.
 * IMPORTANTE: este componente agora é "embutível":
 * - NÃO renderiza overlay/fixed
 * - quem controla o modal/overlay é o componente pai (PostOperative.jsx)
 */
const PostOperativePatientSelector = ({ onPatientSelected, onClose }) => {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select("id, nome")
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao carregar pacientes:", error.message);
        return;
      }
      setPacientes(data || []);
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    const q = (busca || "").trim().toLowerCase();
    if (!q) return pacientes;
    return (pacientes || []).filter((p) =>
      (p.nome || "").toLowerCase().includes(q)
    );
  }, [pacientes, busca]);

  return (
    <div className="selectorContainer">
      <div className="selectorHeader">
        <div className="selectorTitle">
          <h3>Selecionar paciente</h3>
          <p>Escolha um paciente para iniciar o pós-operatório.</p>
        </div>

        <button className="btnIcon" onClick={onClose} type="button" title="Fechar">
          <X size={18} />
        </button>
      </div>

      <div className="searchRow">
        <Search size={16} />
        <input
          placeholder="Buscar paciente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="patientList">
        {filtered.length === 0 ? (
          <div className="emptyList">Nenhum paciente encontrado</div>
        ) : (
          filtered.map((p) => (
            <button
              type="button"
              className="patientRow"
              key={p.id}
              onClick={() => onPatientSelected?.(p)}
            >
              <div className="patientName">{p.nome}</div>
              <span className="pill">Selecionar</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default PostOperativePatientSelector;