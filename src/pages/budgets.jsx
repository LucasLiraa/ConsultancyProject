import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles/budgets.css";

// ✅ AJUSTE ESTE IMPORT conforme seu projeto:
import { supabase } from "../utils/supabaseClient"; // <-- troque o caminho se necessário

import EtapasFormulario from "../components/budgetsComponents/EtapasFormulario";
import PrevisualizacaoOrcamento from "../components/budgetsComponents/PrevisualizacaoOrcamento";
import SelecaoModulos from "../components/budgetsComponents/SelecaoModulos";

const STORAGE_KEY = "orcamento_builder_v1";

const MODULOS_FIXOS = ["dados"];
const MODULO_LABEL = { dados: "Dados do paciente" };

const OrcamentoBuilder = () => {
  const [modulosSelecionados, setModulosSelecionados] = useState(MODULOS_FIXOS);
  const [etapaAtual, setEtapaAtual] = useState(0);

  // ✅ Agora inclui o modo do paciente (linked/manual)
  const [formData, setFormData] = useState({
    patient: {
      mode: "linked", // "linked" | "manual"
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

  const [mostrarResumo, setMostrarResumo] = useState(false);

  // ✅ Pacientes
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);

  const [draftStatus, setDraftStatus] = useState("—");
  const saveTimer = useRef(null);

  const totalEtapas = modulosSelecionados.length;

  const progresso = useMemo(() => {
    if (!totalEtapas) return 0;
    return Math.min(100, Math.round(((etapaAtual + 1) / totalEtapas) * 100));
  }, [etapaAtual, totalEtapas]);

  const avancar = () => {
    if (etapaAtual < modulosSelecionados.length - 1) setEtapaAtual((prev) => prev + 1);
  };

  const voltar = () => {
    if (etapaAtual > 0) setEtapaAtual((prev) => prev - 1);
  };

  const handleGerarOrcamento = () => setMostrarResumo(true);
  const handleEditar = () => setMostrarResumo(false);

  const resetarTudo = () => {
    setModulosSelecionados(MODULOS_FIXOS);
    setEtapaAtual(0);
    setFormData({
      patient: { mode: "linked", patient_id: null, manual: { nome: "" } },
      dados: {
        data_consulta: "",
        previsao_cirurgia: "",
        cirurgia: "",
        tempo_sala: "",
        tipo_anestesia: "",
      },
    });
    setMostrarResumo(false);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setDraftStatus("Rascunho limpo");
  };

  // ✅ Buscar pacientes
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
      } catch (err) {
        console.error("Erro ao carregar pacientes:", err);
        setPatients([]);
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Carrega rascunho
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      setModulosSelecionados(MODULOS_FIXOS);

      if (typeof parsed?.etapaAtual === "number") setEtapaAtual(parsed.etapaAtual);
      if (parsed?.formData && typeof parsed.formData === "object") setFormData(parsed.formData);
      if (typeof parsed?.mostrarResumo === "boolean") setMostrarResumo(parsed.mostrarResumo);

      setDraftStatus("Rascunho carregado");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salva rascunho (debounce)
  useEffect(() => {
    const etapaSanitizada = Math.max(0, Math.min(etapaAtual, Math.max(0, modulosSelecionados.length - 1)));

    setDraftStatus("Salvando…");
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            modulosSelecionados,
            etapaAtual: etapaSanitizada,
            formData,
            mostrarResumo,
            savedAt: new Date().toISOString(),
          })
        );
        setDraftStatus("Rascunho salvo");
      } catch {
        setDraftStatus("Não foi possível salvar");
      }
    }, 350);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [modulosSelecionados, etapaAtual, formData, mostrarResumo]);

  useEffect(() => {
    if (!modulosSelecionados.length) {
      setEtapaAtual(0);
      setMostrarResumo(false);
      return;
    }
    if (etapaAtual > modulosSelecionados.length - 1) {
      setEtapaAtual(modulosSelecionados.length - 1);
    }
  }, [modulosSelecionados, etapaAtual]);

  const moduloAtual = modulosSelecionados[etapaAtual];
  const moduloAtualLabel = MODULO_LABEL[moduloAtual] || moduloAtual;

  return (
    <section className="sectionBudgets">
      <div className="orcamentoPage">
        <header className="orcamentoHeader">
          <div className="orcamentoHeaderLeft">
            <h1>Gerador de Orçamento</h1>
            <p className="orcamentoHeaderSub">
              Preencha os dados e avance pelas etapas para gerar o orçamento.
            </p>
          </div>

          <div className="orcamentoHeaderRight">
            <div className="orcamentoStatus">
              <span className="pill">{draftStatus}</span>
              {totalEtapas > 0 && !mostrarResumo && (
                <span className="pill subtle">
                  Etapa {etapaAtual + 1} de {totalEtapas}
                  {moduloAtual ? ` • ${moduloAtualLabel}` : ""}
                </span>
              )}
            </div>

            <div className="orcamentoHeaderActions">
              <button className="btn ghost" onClick={resetarTudo} type="button">
                Limpar tudo
              </button>

              {totalEtapas > 0 && (
                <button className="btn" onClick={() => setMostrarResumo((prev) => !prev)} type="button">
                  {mostrarResumo ? "Voltar para edição" : "Ir para prévia"}
                </button>
              )}
            </div>
          </div>

          {totalEtapas > 0 && !mostrarResumo && (
            <div className="progressWrap" aria-label="Progresso do orçamento">
              <div className="progressBar" style={{ width: `${progresso}%` }} />
            </div>
          )}
        </header>

        <div className="orcamentoGrid">
          <aside className="orcamentoSidebar">
            <div className="card">
              <SelecaoModulos
                modulosSelecionados={modulosSelecionados}
                setModulosSelecionados={(mods) => {
                  // ✅ por enquanto, só permitimos "dados"
                  const sanitized = (Array.isArray(mods) ? mods : []).filter((m) => m === "dados");

                  // garante que sempre exista "dados" (não deixa vazio)
                  const next = sanitized.length ? sanitized : ["dados"];

                  setEtapaAtual(0);
                  setMostrarResumo(false);
                  setModulosSelecionados(next);
                }}
              />
            </div>
          </aside>

          <main className="orcamentoMain">
            <div className="card content">
              {mostrarResumo ? (
                <PrevisualizacaoOrcamento
                  formData={formData}
                  patients={patients}
                  onVoltar={handleEditar}
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
                    <button className="btn ghost" onClick={voltar} disabled={etapaAtual === 0} type="button">
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
                        <button className="btn success" onClick={handleGerarOrcamento} type="button">
                          Gerar Orçamento
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