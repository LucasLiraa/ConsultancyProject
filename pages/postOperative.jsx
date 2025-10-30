import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../utils/supabaseClient";

import Topbar from "../components/topbar";
import Banners from "../components/banners";

import PostOperativeDashboard from "../components/postOperativeComponents/PostOperativeDashboard";
import PostOperativePatientSelector from "../components/postOperativeComponents/PostOperativePatientSelector";
import PostOperativeManager from "../components/postOperativeComponents/PostOperativeManager";

import "./styles/postOperative.css";

export default function PostOperative() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [mostrarNovo, setMostrarNovo] = useState(false);

  // 🔄 Buscar pacientes em pós-operatório
  const fetchPacientes = async () => {
    const { data, error } = await supabase
      .from("pacientes_pos")
      .select("*")
      .order("data_cirurgia", { ascending: false });

    if (!error) setPacientes(data);
    else console.error("Erro ao buscar pacientes:", error.message);
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const handleVoltar = () => {
    setPacienteSelecionado(null);
    setMostrarNovo(false);
  };

  return (
    <section className="sectionPostOperative">
      {/* 🔹 Barra superior */}
      <Topbar showSearch={true} />

      {/* 🔹 Header e botão */}
      <div className="containerPostOperative">
        <div className="contentPostOperativeHeader">
          <Banners />
        </div>

        <div className="contentPostOperativeButton">
          <button
            className="primary"
            onClick={() => setMostrarSelector(true)}
          >
            Novo paciente
          </button>
        </div>
      </div>

      {/* 🔹 Lista principal (Dashboard) */}
      <div className="contentPostOperative">
        <PostOperativeDashboard
          pacientes={pacientes}
          onSelecionar={(paciente) => {
            setPacienteSelecionado(paciente);
            setMostrarNovo(true);
          }}
        />
      </div>

      {/* 🔹 Overlay do SELETOR DE PACIENTE */}
      <AnimatePresence>
        {mostrarSelector && (
          <motion.div
            className="selectorOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="selectorModal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
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

      {/* 🔹 Overlay do MANAGER (fluxo de pós-operatório) */}
      <AnimatePresence>
        {(pacienteSelecionado || mostrarNovo) && (
          <motion.div
            className="managerOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="managerModal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
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