import React from "react";
import StatusPosOperatorio from "./PostOperativeStatus";
import ListaAcompanhamentos from "./PostOperativeList";

import '../styles/postOperativeStyles/GerenciadorPosOperatorio.css'

function GerenciadorPosOperatorio({ acompanhamentos = [], onSelecionarPaciente, setShowNovoPos }) {
  return (
    <>
      <StatusPosOperatorio acompanhamentos={acompanhamentos} />

      <div className="postOperativeList">
        <ListaAcompanhamentos
          acompanhamentos={acompanhamentos}
          onSelecionarPaciente={onSelecionarPaciente}
        />
      </div>

      {/* Botão para iniciar novo pós-operatório */}
      <div className="postOperativeButtonNew">
        <button onClick={() => setShowNovoPos(true)}>
          Iniciar um novo pós-operatório
        </button>
      </div>
    </>
  );
}

export default GerenciadorPosOperatorio;
