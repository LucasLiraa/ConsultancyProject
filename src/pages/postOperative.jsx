import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient"; 

import "./styles/postOperative.css";

import Topbar from "../components/topbar";
import Banners from "../components/banners";

import PostOperativeDashboard from "../components/postOperativeComponents/PostOperativeDashboard";
import PostOperativeManager from "../components/postOperativeComponents/PostOperativeManager";
import PostOperativePatientSelector from "../components/postOperativeComponents/PostOperativePatientSelector";

function PostOperative() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);

  // 🔁 Buscar pacientes com contagem de retornos
  const fetchPacientes = async () => {
    const { data, error } = await supabase
      .from("pacientes_pos")
      .select("*, pos_operatorio(count)")
      .order("data_pos", { ascending: false });

    if (!error) {
      const withCounts = data.map((p) => ({
        ...p,
        retorno_count: p.pos_operatorio?.[0]?.count || 0,
      }));
      setPacientes(withCounts);
    } else {
      console.error("Erro ao buscar pacientes:", error);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  // 🔙 Após salvar ou iniciar pós
  const handleVoltar = () => {
    fetchPacientes();
    setPacienteSelecionado(null);
    setMostrarNovo(false);
    setMostrarSelector(false);
  };

  // 👥 Quando clicar em "Novo paciente"
  if (mostrarSelector) {
    return (
      <section className="sectionPatients">
        <PostOperativePatientSelector
          onIniciar={(p) => {
            setPacienteSelecionado(p);
            setMostrarSelector(false);
            setMostrarNovo(true);
          }}
          onVoltar={handleVoltar}
        />
      </section>
    );
  }

  // 📝 Quando estiver preenchendo dados do pós
  if (pacienteSelecionado || mostrarNovo) {
    return (
      <section className="sectionPatients">
        <PostOperativeManager
          paciente={pacienteSelecionado}
          onVoltar={handleVoltar}
        />
      </section>
    );
  }

  // 🧠 Dashboard principal
  return (
    <section className="sectionPostOperative">
      <Topbar showSearch={true} />

      <div className="containerPostOperative">
        <div className="contentPostOperativeHeader">
          <Banners />
        </div>
        <div className="contentPostOperativeButton">
          <button className="primary" onClick={() => setMostrarSelector(true)}>
            Novo paciente
          </button>
        </div>
      </div>

      <div className="contentPostOperative">
        <PostOperativeDashboard
          pacientes={pacientes}
          onSelecionar={(paciente) => setPacienteSelecionado(paciente)}
        />
      </div>
    </section>
  );
}

export default PostOperative;