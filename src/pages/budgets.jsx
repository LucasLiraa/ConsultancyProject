import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles/budgets.css";
import { supabase } from "../utils/supabaseClient";

import EtapasFormulario from "../components/budgetsComponents/EtapasFormulario";
import PrevisualizacaoOrcamento from "../components/budgetsComponents/PrevisualizacaoOrcamento";
import SelecaoModulos from "../components/budgetsComponents/SelecaoModulos";

const STORAGE_KEY = "orcamento_builder_v2";

const MODULOS = [
  { id: "dados", label: "Dados iniciais", required: true },
  { id: "orcamento", label: "Orçamento" },
  { id: "kit", label: "Kit e brindes" },
  { id: "hospital", label: "Hospital" },
  { id: "equipe", label: "Equipe cirúrgica" },
  { id: "kit_malhas", label: "Kit cirúrgico e malhas" },
  { id: "drenagens", label: "Drenagens" },
  { id: "resumo", label: "Resumo financeiro" },
  { id: "pagamento", label: "Forma de pagamento" },
];

const MODULOS_PERMITIDOS = MODULOS.map((m) => m.id);
const MODULO_LABEL = Object.fromEntries(MODULOS.map((m) => [m.id, m.label]));

const getInitialFormData = () => ({
  patient: {
    mode: "linked",
    patient_id: null,
    manual: { nome: "" },
  },
  dados: {
    data_consulta: "",
    previsao_cirurgia: "",
    cirurgia: "",
    tempo_sala: "",
    tipo_anestesia: "",
  },
});

const normalizeModulos = (mods) => {
  const base = Array.isArray(mods) ? mods : [];
  const filtrados = base.filter((m) => MODULOS_PERMITIDOS.includes(m));
  const withRequired = ["dados", ...filtrados.filter((m) => m !== "dados")];
  return [...new Set(withRequired)];
};

const clampEtapa = (etapa, total) => {
  const max = Math.max(0, total - 1);
  return Math.max(0, Math.min(etapa, max));
};

const OrcamentoBuilder = () => {
  const [modulosSelecionados, setModulosSelecionados] = useState(() =>
    normalizeModulos(["dados"])
  );
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [formData, setFormData] = useState(getInitialFormData);
  const [mostrarResumo, setMostrarResumo] = useState(false);

  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);

  const [draftStatus, setDraftStatus] = useState("Rascunho vazio");
  const saveTimer = useRef(null);

  const totalEtapas = modulosSelecionados.length;
  const moduloAtual = modulosSelecionados[etapaAtual];
  const moduloAtualLabel = MODULO_LABEL[moduloAtual] || "Etapa";

  const progresso = useMemo(() => {
    if (!totalEtapas) return 0;
    return Math.min(100, Math.round(((etapaAtual + 1) / totalEtapas) * 100));
  }, [etapaAtual, totalEtapas]);

  const avancar = () => {
    setMostrarResumo(false);
    setEtapaAtual((prev) => clampEtapa(prev + 1, totalEtapas));
  };

  const voltar = () => {
    setMostrarResumo(false);
    setEtapaAtual((prev) => clampEtapa(prev - 1, totalEtapas));
  };

  const handleGerarOrcamento = () => {
    setMostrarResumo(true);
  };

  const handleSetModulosSelecionados = (nextValue) => {
    setMostrarResumo(false);

    setModulosSelecionados((prev) => {
      const resolved = typeof nextValue === "function" ? nextValue(prev) : nextValue;
      const normalized = normalizeModulos(resolved);

      setEtapaAtual((old) => clampEtapa(old, normalized.length));
      return normalized;
    });
  };

  const resetarTudo = () => {
    setModulosSelecionados(normalizeModulos(["dados"]));
    setEtapaAtual(0);
    setFormData(getInitialFormData());
    setMostrarResumo(false);

    try {
      localStorage.removeItem(STORAGE_KEY);
      setDraftStatus("Rascunho limpo");
    } catch (error) {
      console.warn("Não foi possível limpar o rascunho:", error);
      setDraftStatus("Erro ao limpar rascunho");
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setPatientsLoading(true);

        const { data, error } = await supabase
          .from("pacientes")
          .select("id, nome")
          .order("nome", { ascending: true });

        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error("Erro ao carregar pacientes:", error);
        setPatients([]);
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const mods = normalizeModulos(parsed?.modulosSelecionados);

      setModulosSelecionados(mods);

      if (parsed?.formData && typeof parsed.formData === "object") {
        setFormData(parsed.formData);
      }

      if (typeof parsed?.mostrarResumo === "boolean") {
        setMostrarResumo(parsed.mostrarResumo);
      }

      if (typeof parsed?.etapaAtual === "number") {
        setEtapaAtual(clampEtapa(parsed.etapaAtual, mods.length));
      }

      setDraftStatus("Rascunho carregado");
    } catch (error) {
      console.warn("Não foi possível carregar o rascunho:", error);
      setDraftStatus("Erro ao carregar rascunho");
    }
  }, []);

  useEffect(() => {
    const etapaSanitizada = clampEtapa(etapaAtual, modulosSelecionados.length);

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    setDraftStatus("Salvando...");

    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            modulosSelecionados: normalizeModulos(modulosSelecionados),
            etapaAtual: etapaSanitizada,
            formData,
            mostrarResumo,
            savedAt: new Date().toISOString(),
          })
        );

        setDraftStatus("Rascunho salvo");
      } catch (error) {
        console.warn("Não foi possível salvar o rascunho:", error);
        setDraftStatus("Erro ao salvar");
      }
    }, 350);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [modulosSelecionados, etapaAtual, formData, mostrarResumo]);

  useEffect(() => {
    const etapaCorrigida = clampEtapa(etapaAtual, modulosSelecionados.length);

    if (etapaCorrigida !== etapaAtual) {
      setEtapaAtual(etapaCorrigida);
    }
  }, [etapaAtual, modulosSelecionados.length]);

  return (
    <section className="sectionBudgets">
      <div className="orcamentoPage">
        <header className="orcamentoHeader">
          <div className="orcamentoHeader__top">
            <div className="orcamentoHeaderLeft">
              <span className="orcamentoHeader__eyebrow">Builder de orçamento</span>
              <h1>Gerador de orçamento cirúrgico</h1>
              <p className="orcamentoHeaderSub">
                Configure os módulos, preencha as etapas e gere a pré-visualização do
                orçamento.
              </p>
            </div>

            <div className="orcamentoHeaderRight">
              <div className="orcamentoStatus">
                <span className="pill">{draftStatus}</span>

                {totalEtapas > 0 && !mostrarResumo ? (
                  <span className="pill subtle">
                    Etapa {etapaAtual + 1} de {totalEtapas}
                    {moduloAtual ? ` • ${moduloAtualLabel}` : ""}
                  </span>
                ) : null}

                {mostrarResumo ? <span className="pill subtle">Pré-visualização</span> : null}
              </div>

              <div className="orcamentoHeaderActions">
                <button className="btn ghost" onClick={resetarTudo} type="button">
                  Limpar tudo
                </button>

                <button
                  className="btn"
                  onClick={() => setMostrarResumo((prev) => !prev)}
                  type="button"
                >
                  {mostrarResumo ? "Voltar para edição" : "Ir para prévia"}
                </button>
              </div>
            </div>
          </div>

          {totalEtapas > 0 && !mostrarResumo ? (
            <>
              <div
                className="progressWrap"
                aria-label={`Progresso do orçamento: ${progresso}%`}
              >
                <div className="progressBar" style={{ width: `${progresso}%` }} />
              </div>

              <div className="progressMeta">
                <span>{progresso}% concluído</span>
                <strong>{moduloAtualLabel}</strong>
              </div>
            </>
          ) : null}
        </header>

        <div className="orcamentoGrid">
          <aside className="orcamentoSidebar">
            <div className="card card--sidebar">
              <SelecaoModulos
                modulosDisponiveis={MODULOS}
                selectedModulos={modulosSelecionados}
                setSelectedModulos={handleSetModulosSelecionados}
              />
            </div>
          </aside>

          <main className="orcamentoMain">
            <div className="card content">
              {mostrarResumo ? (
                <PrevisualizacaoOrcamento
                  formData={formData}
                  patients={patients}
                  nomeClinica="Clínica"
                  nomeMedico="Dr(a). Responsável"
                />
              ) : (
                <>
                  <EtapasFormulario
                    modulos={modulosSelecionados}
                    etapaAtual={etapaAtual}
                    formData={formData}
                    setFormData={setFormData}
                    patients={patients}
                    patientsLoading={patientsLoading}
                  />

                  <div className="navFooter">
                    <button
                      className="btn ghost"
                      onClick={voltar}
                      disabled={etapaAtual === 0}
                      type="button"
                    >
                      Voltar
                    </button>

                    <div className="navRight">
                      <span className="navHint">
                        {etapaAtual + 1}/{modulosSelecionados.length}
                      </span>

                      {etapaAtual < modulosSelecionados.length - 1 ? (
                        <button className="btn" onClick={avancar} type="button">
                          Próximo
                        </button>
                      ) : (
                        <button
                          className="btn success"
                          onClick={handleGerarOrcamento}
                          type="button"
                        >
                          Gerar orçamento
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default OrcamentoBuilder;