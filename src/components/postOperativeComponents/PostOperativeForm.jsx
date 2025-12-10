import React, { useState } from "react";
import SidebarProgresso from "./SidebarProgresso";
import InformacoesIniciais from "./InformacoesIniciais";
import SemanaPosOperatorio from "./SemanaPosOperatorio";
import "../styles/postOperativeStyles/PostOperativeForm.css";

function PostOperativeForm({ paciente, onFinalizar }) {
  const [etapaAtual, setEtapaAtual] = useState("informacoes");
  const [informacoesIniciais, setInformacoesIniciais] = useState({
    nome: paciente.nome || "",
    cirurgia: paciente.cirurgia || "",
    dataCirurgia: paciente.dataCirurgia || "",
    auxiliar: paciente.auxiliar || "",
    instrumentadora: paciente.instrumentadora || "",
    diasAtestado: paciente.diasAtestado || "",
    anestesia: paciente.anestesia || [],
    observacoes: paciente.observacoes || ""
  });

  const [semanas, setSemanas] = useState(paciente.semanas || [{ id: 1, dados: {} }]);

  const handleAdicionarSemana = () => {
    const novaSemana = { id: semanas.length + 1, dados: {} };
    const novasSemanas = [...semanas, novaSemana];
    setSemanas(novasSemanas);
    setEtapaAtual(`semana-${novaSemana.id}`);

    salvarNoLocalStorage(novasSemanas);
  };

  const handleExcluirSemana = (id) => {
    const novas = semanas.filter((s) => s.id !== id);
    setSemanas(novas);
    setEtapaAtual("informacoes");

    salvarNoLocalStorage(novas);
  };

  const handleSalvarSemana = (id, dados) => {
    const atualizadas = semanas.map((s) =>
      s.id === id ? { ...s, dados } : s
    );
    setSemanas(atualizadas);

    salvarNoLocalStorage(atualizadas);
  };

  const salvarNoLocalStorage = (semanasAtualizadas) => {
    const pacientesPos = JSON.parse(localStorage.getItem("pacientesPos") || "[]");
    const index = pacientesPos.findIndex(p => p.id === paciente.id);

    if (index !== -1) {
      pacientesPos[index] = {
        ...pacientesPos[index],
        ...informacoesIniciais,
        semanas: semanasAtualizadas
      };
    } else {
      pacientesPos.push({
        ...paciente,
        ...informacoesIniciais,
        semanas: semanasAtualizadas
      });
    }

    localStorage.setItem("pacientesPos", JSON.stringify(pacientesPos));
  };

  return (
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
            />
          ) : null
        )}
      </div>
    </div>
  );
}

export default PostOperativeForm;