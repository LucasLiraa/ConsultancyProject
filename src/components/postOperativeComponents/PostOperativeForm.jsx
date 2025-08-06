import React, { useState, useEffect } from "react";
import SidebarProgresso from "./SidebarProgresso";
import InformacoesIniciais from "./InformacoesIniciais";
import SemanaPosOperatorio from "./SemanaPosOperatorio";
import '../styles/postOperativeStyles/PostOperativeForm.css';

function PostOperativeForm({ paciente, onFinalizar }) {
  const [etapaAtual, setEtapaAtual] = useState("informacoes");
  const [informacoesIniciais, setInformacoesIniciais] = useState({
    nome: paciente.nome || "",
    cirurgia: paciente.cirurgia || "",
    dataCirurgia: paciente.dataCirurgia || "",
    auxiliar: "",
    instrumentadora: "",
    diasAtestado: "",
    anestesia: [],
    observacoes: ""
  });

  const [semanas, setSemanas] = useState([{ id: 1, dados: {} }]);

  const handleAdicionarSemana = () => {
    const novaSemana = { id: semanas.length + 1, dados: {} };
    setSemanas([...semanas, novaSemana]);
    setEtapaAtual(`semana-${novaSemana.id}`);
  };

  const handleExcluirSemana = (id) => {
    const novas = semanas.filter((s) => s.id !== id);
    setSemanas(novas);
    setEtapaAtual("informacoes");
  };

  const handleSalvarSemana = (id, dados) => {
    const atualizadas = semanas.map((s) =>
      s.id === id ? { ...s, dados } : s
    );
    setSemanas(atualizadas);
  };

  const [altaDada, setAltaDada] = useState(false);

  const darAlta = () => {
    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientesPos")) || [];
    const atualizado = pacientesSalvos.map((p) =>
      p.nome === paciente.nome ? { ...p, alta: true } : p
    );
    localStorage.setItem("pacientesPos", JSON.stringify(atualizado));
    setAltaDada(true);
  };


  useEffect(() => {
    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientesPos")) || [];
    const atualizado = pacientesSalvos.map((p) =>
      p.nome === paciente.nome ? { ...p, semanas } : p
    );
    localStorage.setItem("pacientesPos", JSON.stringify(atualizado));
  }, [semanas]);

  return (
    <div className="novoPosOverlay">
      <div className="postFormContainer">
        <SidebarProgresso
          etapaAtual={etapaAtual}
          setEtapaAtual={setEtapaAtual}
          semanas={semanas}
          onAdicionarSemana={handleAdicionarSemana}
          onExcluirSemana={handleExcluirSemana}
        />

        <div className="formContent">
          {etapaAtual === "informacoes" && (
            <InformacoesIniciais
              dados={informacoesIniciais}
              setDados={setInformacoesIniciais}
            />
          )}

          {semanas.map((semana) =>
            etapaAtual === `semana-${semana.id}` ? (
              <SemanaPosOperatorio
                key={semana.id}
                semanaId={semana.id}
                dados={semana.dados}
                onSalvar={handleSalvarSemana}
                paciente={paciente} // <-- importante
              />
            ) : null
          )}
          <button onClick={darAlta} className="btnAlta">
            Dar Alta
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostOperativeForm;