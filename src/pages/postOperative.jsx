import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../utils/supabaseClient";

import PostOperativeDashboard from "../components/postOperativeComponents/PostOperativeDashboard";
import PostOperativePatientSelector from "../components/postOperativeComponents/PostOperativePatientSelector";
import PostOperativeManager from "../components/postOperativeComponents/PostOperativeManager";

import "./styles/postOperative.css";

export default function PostOperative() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [mostrarNovo, setMostrarNovo] = useState(false);

  const [search, setSearch] = useState("");

  // 🔄 Buscar pacientes em pós-operatório
  const fetchPacientes = async () => {
    const { data, error } = await supabase
      .from("pacientes_pos")
      .select("*")
      .order("data_cirurgia", { ascending: false });

    if (!error) setPacientes(data || []);
    else console.error("Erro ao buscar pacientes:", error.message);
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const handleVoltar = () => {
    setPacienteSelecionado(null);
    setMostrarNovo(false);
  };

  const handleNovoPaciente = () => {
    // abre o manager sem paciente selecionado (fluxo novo)
    setPacienteSelecionado(null);
    setMostrarSelector(true); // abre seletor primeiro (mais elegante)
    setMostrarNovo(false);
  };

  const filteredPacientes = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return pacientes;

    return (pacientes || []).filter((p) => {
      const nome = (p.nome || "").toLowerCase();
      const cirurgia = (p.cirurgia || p.procedimento || "").toLowerCase();
      return nome.includes(q) || cirurgia.includes(q);
    });
  }, [pacientes, search]);

  return (
    <section className="poPage">
      {/* Topbar (sem banner) */}
      <header className="poTopbar">
        <div className="poTitle">
          <h1>Pós-operatório</h1>
          <p>Gestão clínica • acompanhamento por semanas • registros e fotos</p>
        </div>

        <div className="poActions">
          <div className="poSearch">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou cirurgia…"
            />
          </div>

          <button className="poBtn poBtnPrimary" onClick={handleNovoPaciente}>
            Novo paciente
          </button>

          <button className="poBtn" onClick={fetchPacientes} title="Atualizar lista">
            Atualizar
          </button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="poContent">
        <PostOperativeDashboard
          pacientes={filteredPacientes}
          onSelecionar={(paciente) => {
            setPacienteSelecionado(paciente);
            setMostrarNovo(true);
          }}
        />
      </main>

      {/* Overlay do SELETOR DE PACIENTE */}
      <AnimatePresence>
        {mostrarSelector && (
          <motion.div
            className="poOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="poModal"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <PostOperativePatientSelector
                onPatientSelected={(p) => {
                  setPacienteSelecionado(p);
                  setMostrarSelector(false);
                  setMostrarNovo(true);
                }}
                onClose={() => setMostrarSelector(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay do MANAGER */}
      <AnimatePresence>
        {(pacienteSelecionado || mostrarNovo) && (
          <motion.div
            className="poOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="poModal poModalLarge"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <PostOperativeManager
                paciente={pacienteSelecionado}
                onVoltar={handleVoltar}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}