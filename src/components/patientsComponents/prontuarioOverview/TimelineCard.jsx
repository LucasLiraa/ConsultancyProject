import React from "react";

// 🔹 Etapas da jornada do paciente baseadas nos status reais
const processSteps = [
  {
    id: "avaliacao",
    label: "Em avaliação",
    /*support: "Primeiro contato e análise do caso",*/
    matches: ["Em avaliação", "em avaliação", "em avaliacao"],
  },
  {
    id: "aguardando_contrato",
    label: "Aguardando Contrato",
    /*support: "Envio e assinatura do contrato",*/
    matches: ["Aguardando Contrato", "aguardando contrato"],
  },
  {
    id: "fechamento",
    label: "Em fechamento",
    /*support: "Ajustes finais e confirmação",*/
    matches: ["Em fechamento", "em fechamento"],
  },
  {
    id: "aguardando_cirurgia",
    label: "Aguardando Cirurgia",
    /*support: "Cirurgia agendada, aguardando data",*/
    matches: ["Aguardando Cirurgia", "aguardando cirurgia"],
  },
  {
    id: "operado",
    label: "Operado(a)",
    /*support: "Procedimento realizado",*/
    matches: ["Operado(a)", "operado", "operada"],
  },
  {
    id: "pos_operatorio",
    label: "Em pós-operatório",
    /*support: "Acompanhamento e retornos",*/
    matches: ["Em pós-operatório", "pos-operatorio", "pós-operatório"],
  },
];

// 🔹 Converte o texto de situação vindo do Supabase para a etapa da timeline
const mapSituacaoToStageId = (situacao) => {
  if (!situacao) return "avaliacao";

  const s = situacao.toLowerCase().trim();

  // tenta achar o step cuja lista `matches` contém a situação
  const found = processSteps.find((step) =>
    step.matches.some((m) => s.includes(m.toLowerCase()))
  );

  // se achou, devolve o id desse step; se não, volta pra "avaliacao"
  return found ? found.id : "avaliacao";
};

export default function TimelineCard({ paciente }) {
  const currentStageId = React.useMemo(
    () => mapSituacaoToStageId(paciente?.situacao),
    [paciente?.situacao]
  );

  const currentStageIndex = React.useMemo(() => {
    const idx = processSteps.findIndex((step) => step.id === currentStageId);
    return idx === -1 ? 0 : idx;
  }, [currentStageId]);

  return (
    <section className="summaryCard">
      <div className="summaryCardHeader">
        <div>
          <h3>Jornada da paciente</h3>
        </div>

        <span className="summaryStatusChip">
          Situação atual: {paciente?.situacao || "—"}
        </span>
      </div>

      <div className="processTimelineTrack">
        {processSteps.map((step, index) => {
          const isDone = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`processStep ${isDone ? "is-active" : ""} ${
                  isCurrent ? "current" : ""
                }`}
              >
                <div
                  className={`stepIconCircle ${isDone ? "done" : ""} ${
                    isCurrent ? "current" : ""
                  }`}
                >
                  {isDone ? (
                    <i className="fa-solid fa-check" />
                  ) : (
                    <span className="stepIndex">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                <span className="stepLabel">{step.label}</span>
                {step.support && (
                  <span className="stepSupport">{step.support}</span>
                )}
              </div>

              {index < processSteps.length - 1 && (
                <div
                  className={`processConnector ${
                    index < currentStageIndex ? "active" : ""
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}