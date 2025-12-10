import React from "react";

const formatMedida = (value) => {
  if (!value) return "—";
  // se já vier com unidade, mantém
  if (typeof value === "string" && /cm|mm|m/i.test(value)) return value;
  return `${value} cm`;
};

export default function ClinicalSummaryCard({ paciente }) {
  const medidas = paciente?.medidas || {};
  const historicos = paciente?.historicosClinicos || {};

  const imcValue = paciente?.imc || "—";
  const pesoValue = paciente?.peso ? `${paciente.peso} kg` : "—";
  const alturaValue = paciente?.altura ? `${paciente.altura} m` : "—";

  const historicosList = [
    { label: "QP", value: historicos.qp },
    { label: "HPP", value: historicos.hpp },
    {
      label: "Alergias / Medicamentos",
      value: historicos.historicoAlergiasMedicamentos,
    },
    { label: "Histórico cirúrgico", value: historicos.historicoCirurgico },
    {
      label: "Histórico ginecológico",
      value: historicos.historicoGinecologico,
    },
    { label: "Qualidade da cicatriz", value: historicos.qualidadeCicatriz },
  ].filter((item) => item.value && item.value.trim() !== "");

  return (
    <section className="summaryCard">
      <div className="summaryCardHeader">
        <div>
          <h3>Avaliação inicial (resumo clínico)</h3>
        </div>
      </div>

      <div className="clinicalSummaryGrid">
        {/* Linha 1: IMC / Peso / Altura */}
        <div className="clinicalMetricCard">
          <span className="clinicalMetricLabel">IMC</span>
          <span className="clinicalMetricValue">{imcValue}</span>
          {paciente?.acimaPeso && (
            <span className="clinicalMetricTag">
              {paciente.acimaPeso}
            </span>
          )}
        </div>

        <div className="clinicalMetricCard">
          <span className="clinicalMetricLabel">Peso</span>
          <span className="clinicalMetricValue">{pesoValue}</span>
        </div>

        <div className="clinicalMetricCard">
          <span className="clinicalMetricLabel">Altura</span>
          <span className="clinicalMetricValue">{alturaValue}</span>
        </div>

        {/* Linha 2: Medidas corporais */}
        <div className="clinicalMetricCard clinicalMetricWide">
          <span className="clinicalMetricLabel">Medidas corporais</span>
          <div className="clinicalMeasuresGrid">
            <div className="measureItem">
              <span className="measureLabel">Busto</span>
              <span className="measureValue">
                {formatMedida(medidas.busto)}
              </span>
            </div>
            <div className="measureItem">
              <span className="measureLabel">Cintura</span>
              <span className="measureValue">
                {formatMedida(medidas.cintura)}
              </span>
            </div>
            <div className="measureItem">
              <span className="measureLabel">Quadril</span>
              <span className="measureValue">
                {formatMedida(medidas.quadril)}
              </span>
            </div>
            <div className="measureItem">
              <span className="measureLabel">Coxa</span>
              <span className="measureValue">
                {formatMedida(medidas.coxa)}
              </span>
            </div>
            <div className="measureItem">
              <span className="measureLabel">Panturrilha</span>
              <span className="measureValue">
                {formatMedida(medidas.panturrilha)}
              </span>
            </div>
          </div>
        </div>

        {/* Linha 3: Formato corporal / Gordura visceral */}
        <div className="clinicalMetricCard">
          <span className="clinicalMetricLabel">Formato corporal</span>
          <span className="clinicalMetricValue">
            {paciente?.formatoCorporal || "—"}
          </span>
        </div>

        <div className="clinicalMetricCard">
          <span className="clinicalMetricLabel">Gordura visceral</span>
          <span className="clinicalMetricValue">
            {paciente?.gorduraVisceral || "—"}
          </span>
        </div>

        {/* Linha 4: Históricos clínicos principais */}
        <div className="clinicalMetricCard clinicalMetricFull">
          <span className="clinicalMetricLabel">
            Históricos clínicos principais
          </span>

          {historicosList.length === 0 ? (
            <p className="clinicalHistoryEmpty">
              Nenhum histórico clínico detalhado foi registrado na avaliação
              inicial.
            </p>
          ) : (
            <ul className="clinicalHistoryList">
              {historicosList.map((item) => (
                <li key={item.label} className="clinicalHistoryItem">
                  <span className="historyLabel">{item.label}:</span>
                  <span className="historyValue">{item.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}