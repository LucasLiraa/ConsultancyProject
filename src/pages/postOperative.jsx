import React, { useState, useEffect } from "react";
import "./styles/postOperative.css";
import Topbar from "../components/topbar";
import NovoPosOperatorioCard from "../components/postOperativeComponents/NovoPosOperatorioCard";
import PostOperativeForm from "../components/postOperativeComponents/PostOperativeForm";
import PostOperativeStatus from "../components/postOperativeComponents/PostOperativeStatus";
import PostOperativeList from "../components/postOperativeComponents/PostOperativeList";

function PostOperative() {
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    const armazenados = JSON.parse(localStorage.getItem("pacientesPos")) || [];
    setPacientes(armazenados);
  }, []);

  const salvarPacientes = (lista) => {
    setPacientes(lista);
    localStorage.setItem("pacientesPos", JSON.stringify(lista));
  };

  const handleIniciar = (paciente) => {
    const lista = [...pacientes, paciente];
    salvarPacientes(lista);
    setPacienteSelecionado(paciente);
    setMostrarNovo(false);
  };

  const handleSalvar = (pacienteAtualizado) => {
    const lista = pacientes.map((p) =>
      p.id === pacienteAtualizado.id ? pacienteAtualizado : p
    );
    salvarPacientes(lista);
    setPacienteSelecionado(pacienteAtualizado);
  };

  const handleDarAlta = (pacienteAtualizado) => {
    const lista = pacientes.map((p) =>
      p.id === pacienteAtualizado.id ? pacienteAtualizado : p
    );
    salvarPacientes(lista);
    setPacienteSelecionado(null);
  };

  return (
    <section className="sectionPostOperative">
      <Topbar showSearch={true} />

      <div className="containerPostOperative">
        {mostrarNovo && (
          <NovoPosOperatorioCard
            onClose={() => setMostrarNovo(false)}
            onIniciar={handleIniciar}
          />
        )}

        {pacienteSelecionado ? (
          <PostOperativeForm
            paciente={pacienteSelecionado}
            onSalvar={handleSalvar}
            onDarAlta={handleDarAlta}
            onVoltar={() => setPacienteSelecionado(null)}
          />
        ) : (
          <>
            <PostOperativeStatus pacientes={pacientes} />
            <div className="postOperativeButtonNew">
              <button onClick={() => setMostrarNovo(true)}>
                Iniciar um novo pós-operatório
              </button>
            </div>
            <PostOperativeList pacientes={pacientes} onSelecionar={setPacienteSelecionado} />
          </>
        )}
      </div>
    </section>
  );
}

export default PostOperative;