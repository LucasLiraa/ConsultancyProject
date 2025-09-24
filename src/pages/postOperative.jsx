import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient"; 

import "./styles/postOperative.css";

import Topbar from "../components/topbar";
import Banners from "../components/banners";

import PostOperativeDashboard from "../components/postOperativeComponents/PostOperativeDashboard";
import PostOperativePatientSelector from "../components/postOperativeComponents/PostOperativePatientSelector";
import PostOperativeManager from "../components/postOperativeComponents/PostOperativeManager";

function PostOperative() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [mostrarSelector, setMostrarSelector] = useState(false);

  // Buscar pacientes com contagem de retornos
  useEffect(() => {
    const fetchPacientes = async () => {
      const { data, error } = await supabase
        .from("paciente_pos")
        .select("*, pos_operatorio(count)")
        .order("criado_em", { ascending: false });

      if (!error) {
        const withCounts = data.map((p) => ({
          ...p,
          retorno_count: p.pos_operatorio[0]?.count || 0,
        }));
        setPacientes(withCounts);
      } else {
        console.error("Erro ao buscar pacientes:", error.message);
      }
    };
    fetchPacientes();
  }, []);

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
          <button className="primary" onClick={() => setMostrarSelector(true)}>
            Procurar
          </button>
        </div>
      </div>

      <div className="contentPostOperative">
        {/* Dashboard sempre no fundo */}
        <PostOperativeDashboard
          pacientes={pacientes}
          onNovo={() => setMostrarSelector(true)}
          onSelecionar={(paciente) => setPacienteSelecionado(paciente)}
        />

        {/* Overlay do selector */}
        {mostrarSelector && (
          <PostOperativePatientSelector
            onVoltar={() => setMostrarSelector(false)}
            onIniciar={(paciente) => {
              setMostrarSelector(false);
              setPacienteSelecionado(paciente);
            }}
          />
        )}

        {/* Overlay do manager */}
        {pacienteSelecionado && (
          <PostOperativeManager
            paciente={pacienteSelecionado}
            onVoltar={() => setPacienteSelecionado(null)}
          />
        )}
      </div>
    </section>
  );
}

export default PostOperative;