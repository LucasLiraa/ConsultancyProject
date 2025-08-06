import React, { useState, useEffect } from "react";
import GerenciadorPosOperatorio from "../components/postOperativeComponents/GerenciadorPosOperatorio";
import NovoPosOperatorioCard from "../components/postOperativeComponents/NovoPosOperatorioCard";
import PostOperativeForm from "../components/postOperativeComponents/PostOperativeForm";
import "./styles/postOperative.css";

function PostOperative() {
  const [pacientes, setPacientes] = useState([]);
  const [showNovoPos, setShowNovoPos] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  useEffect(() => {
    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientes")) || [];
    setPacientes(pacientesSalvos);
  }, []);

  const handleIniciar = (paciente) => {
    setPacienteSelecionado(paciente);
    setShowNovoPos(false);
  };

  const handleVoltar = () => {
    setPacienteSelecionado(null);
    setShowNovoPos(false);
  };

  return (
    <section className="sectionPostOperative">
      <div className="containerPostOperative">

        {/* Botão de iniciar novo pós */}
        {!showNovoPos && !pacienteSelecionado && (
          <>
            <GerenciadorPosOperatorio />
          </>
        )}

        {/* Modal para selecionar paciente */}
        {showNovoPos && !pacienteSelecionado && (
          <NovoPosOperatorioCard
            onClose={() => setShowNovoPos(false)}
            onIniciar={handleIniciar}
          />
        )}

        {/* Formulário do paciente */}
        {pacienteSelecionado && (
          <PostOperativeForm
            paciente={pacienteSelecionado}
            onFinalizar={handleVoltar}
          />
        )}

      </div>
    </section>
  );
}

export default PostOperative;