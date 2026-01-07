import React from "react";
import "../../styles/patientsStyles/ProntuarioPaciente.css";
import { supabase } from "../../../utils/supabaseClient";

const ETAPAS = [
  "Primeira consulta / Avaliação",
  "Planejamento cirúrgico",
  "Exames pré-operatórios",
  "Orientações pré-operatórias",
  "Dia da cirurgia",
  "Pós-operatório imediato",
  "Pós-operatório tardio / Acompanhamento",
  "Alta definitiva",
];

const buildDefault = () => ({
  etapa_atual: 1,
  etapas: {},
});

export default function ProntuarioChecklist({ paciente, setPaciente }) {
  const [expandedStep, setExpandedStep] = React.useState(null); // número (1..)
  const [editingStep, setEditingStep] = React.useState(null); // número (1..)

  const [draftResumo, setDraftResumo] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  // 🔹 Fonte de verdade (do paciente)
  const checklist = React.useMemo(() => {
    const raw = paciente?.prontuarioChecklist;
    if (!raw || typeof raw !== "object") return buildDefault();
    return {
      etapa_atual: raw.etapa_atual || 1,
      etapas: raw.etapas || {},
    };
  }, [paciente?.prontuarioChecklist]);

  const etapaAtual = checklist.etapa_atual || 1;

  const getStatus = (stepNumber) => {
    if (stepNumber < etapaAtual) return "concluido";
    if (stepNumber === etapaAtual) return "em_andamento";
    return "pendente";
  };

  const getResumo = (stepNumber) => {
    const r = checklist.etapas?.[String(stepNumber)]?.resumo;
    return typeof r === "string" ? r : "";
  };

  const openStep = (stepNumber) => {
    setError("");
    setExpandedStep((prev) => (prev === stepNumber ? null : stepNumber));

    // se trocar etapa aberta, reseta modo edição
    setEditingStep(null);
    setDraftResumo("");
  };

  const startEdit = (stepNumber) => {
    setError("");
    setEditingStep(stepNumber);
    setDraftResumo(getResumo(stepNumber));
  };

  const cancelEdit = () => {
    setEditingStep(null);
    setDraftResumo("");
    setError("");
  };

  const persistChecklist = async (nextChecklist) => {
    if (!paciente?.id) return false;

    try {
      setSaving(true);
      setError("");

      const { error: updateError } = await supabase
        .from("pacientes")
        .update({
          prontuario_checklist: nextChecklist,
        })
        .eq("id", paciente.id);

      if (updateError) {
        console.error(updateError);
        setError("Não foi possível salvar o checklist do prontuário.");
        return false;
      }

      // atualiza estado local do paciente (sem refetch)
      if (typeof setPaciente === "function") {
        setPaciente((prev) =>
          prev ? { ...prev, prontuarioChecklist: nextChecklist } : prev
        );
      }

      return true;
    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro ao salvar o checklist.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ✅ salvar apenas o resumo (via ícone de salvar)
  const saveResumo = async (stepNumber) => {
    const value = (draftResumo || "").trim();

    if (!value) {
      setError("Preencha o resumo antes de salvar.");
      return;
    }

    const nextChecklist = {
      ...checklist,
      etapas: {
        ...(checklist.etapas || {}),
        [String(stepNumber)]: { resumo: value },
      },
    };

    const ok = await persistChecklist(nextChecklist);
    if (!ok) return;

    setEditingStep(null);
    setDraftResumo("");
  };

  // ✅ avançar etapa salva automaticamente (obrigatório ter resumo)
  const advanceStep = async () => {
    const stepNumber = etapaAtual;
    const resumoAtual = getResumo(stepNumber);

    if (!resumoAtual || !resumoAtual.trim()) {
      setError("É obrigatório preencher e salvar o resumo para avançar.");
      setExpandedStep(stepNumber);
      startEdit(stepNumber);
      return;
    }

    if (etapaAtual >= ETAPAS.length) return;

    const nextChecklist = {
      ...checklist,
      etapa_atual: etapaAtual + 1,
    };

    const ok = await persistChecklist(nextChecklist);
    if (!ok) return;

    // abre automaticamente a próxima etapa
    setExpandedStep(etapaAtual + 1);
    setEditingStep(null);
    setDraftResumo("");
  };

  return (
    <section className="summaryCard">
      <div className="summaryCardHeader">
        <div>
          <h3>Checklist do prontuário</h3>
        </div>

        <span className="summaryStatusChip">
          Etapa {etapaAtual} de {ETAPAS.length}
        </span>
      </div>

      {error && <div className="prontuarioError">{error}</div>}

      <div className="prontuarioStepper">
        {ETAPAS.map((titulo, idx) => {
          const stepNumber = idx + 1;
          const status = getStatus(stepNumber);
          const isExpanded = expandedStep === stepNumber;
          const isEditing = editingStep === stepNumber;

          const resumo = getResumo(stepNumber);

          return (
            <div
              key={stepNumber}
              className={`stepRow ${status} ${isExpanded ? "is-open" : ""}`}
            >
              {/* Linha vertical */}
              <div className="stepRail">
                <div className={`stepCircle ${status}`}>
                  {status === "concluido" ? (
                    <i className="fa-solid fa-check" />
                  ) : (
                    <span className="stepDot" />
                  )}
                </div>

                {stepNumber !== ETAPAS.length && (
                  <div className={`stepLine ${status}`} />
                )}
              </div>

              {/* Conteúdo */}
              <div className="stepContent">
                <button
                  type="button"
                  className="stepHeaderBtn"
                  onClick={() => openStep(stepNumber)}
                >
                  <span className="stepSmall">STEP {stepNumber}</span>
                  <span className="stepTitle">{titulo}</span>

                  <span className={`stepStatusTag ${status}`}>
                    {status === "concluido"
                      ? "Concluído"
                      : status === "em_andamento"
                      ? "Em andamento"
                      : "Pendente"}
                  </span>
                </button>

                {isExpanded && status !== "pendente" && (
                  <div className="stepBody">
                    {!isEditing ? (
                      <>
                        <div className="stepResumoPreview">
                          {resumo ? (
                            <p>{resumo}</p>
                          ) : (
                            <p className="stepResumoEmpty">
                              Nenhum resumo salvo ainda.
                            </p>
                          )}
                        </div>

                        <div className="stepActions">
                          <button
                            type="button"
                            className="iconBtn"
                            title="Editar resumo"
                            onClick={() => startEdit(stepNumber)}
                            disabled={saving}
                          >
                            <i className="fa-regular fa-pen-to-square" />
                          </button>

                          {status === "em_andamento" && (
                            <button
                              type="button"
                              className="advanceBtn"
                              onClick={advanceStep}
                              disabled={saving}
                              title="Avançar etapa (salva automaticamente)"
                            >
                              {saving ? "Salvando..." : "Avançar etapa"}
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <textarea
                          className="stepTextarea"
                          placeholder="Resumo desta etapa..."
                          value={draftResumo}
                          onChange={(e) => setDraftResumo(e.target.value)}
                          rows={4}
                        />

                        <div className="stepActions">
                          <button
                            type="button"
                            className="iconBtn"
                            title="Cancelar"
                            onClick={cancelEdit}
                            disabled={saving}
                          >
                            <i className="fa-solid fa-xmark" />
                          </button>

                          <button
                            type="button"
                            className="iconBtn primary"
                            title="Salvar resumo"
                            onClick={() => saveResumo(stepNumber)}
                            disabled={saving}
                          >
                            <i className="fa-solid fa-floppy-disk" />
                          </button>

                          {status === "em_andamento" && (
                            <button
                              type="button"
                              className="advanceBtn"
                              onClick={advanceStep}
                              disabled={saving}
                              title="Avançar etapa (exige resumo salvo)"
                            >
                              {saving ? "Salvando..." : "Avançar etapa"}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {isExpanded && status === "pendente" && (
                  <div className="stepBody">
                    <p className="stepPendingText">
                      Esta etapa ainda está pendente. Conclua as anteriores para liberar.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}