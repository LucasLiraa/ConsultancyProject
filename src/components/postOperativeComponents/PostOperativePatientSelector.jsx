import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Search, X } from "lucide-react";
import "../styles/postOperativeStyles/postOperativeSelector.css";

/**
 * Modal simples para escolher paciente.
 * Chama onPatientSelected(patient) no clique.
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

  const filtered = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="selectorOverlay">
      <div className="selectorContainer">
        <div className="selectorHeader">
          <h3>Selecionar paciente</h3>
          <button className="btnIcon" onClick={onClose}><X size={18} /></button>
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
            <div className="emptyList">Nenhum paciente</div>
          ) : (
            filtered.map((p) => (
              <div
                className="patientRow"
                key={p.id}
                onClick={() => onPatientSelected?.(p)}
              >
                <div className="patientName">{p.nome}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostOperativePatientSelector;