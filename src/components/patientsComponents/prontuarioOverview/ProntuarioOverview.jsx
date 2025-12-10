import React from "react";
import TimelineCard from "./TimelineCard";
import ProceduresCard from "./ProceduresCard";
import PreOpChecklistCard from "./PreOpChecklistCard";
import ClinicalSummaryCard from "./ClinicalSummaryCard";

export default function ProntuarioOverview({ paciente }) {
  if (!paciente) {
    return (
      <div className="prontuarioUnderConstruction">
        <h3>Carregando dados da paciente...</h3>
        <p>Assim que os dados forem carregados, a visão geral será exibida.</p>
      </div>
    );
  }

  return (
    <div className="summaryContent">
        {/* Card da linha do tempo */}
        <TimelineCard paciente={paciente} />

        {/* Card de procedimentos */}
        <ProceduresCard paciente={paciente} />

        {/* Card de checklist pré-operatório */}
        <PreOpChecklistCard paciente={paciente} />

        {/* Card de avaliação inicial (resumo clínico) */}
        <ClinicalSummaryCard paciente={paciente} />

    </div>
    );
}
