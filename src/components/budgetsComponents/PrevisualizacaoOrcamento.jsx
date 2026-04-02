import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "../styles/budgetsStyles/FormulariosStyles.css";

const formatBRLFromCents = (cents) => {
  const n = Number(cents || 0) / 100;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const formatDateBR = (value) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
};

const getPatientName = (patient, patients = []) => {
  if (patient?.mode === "linked" && patient?.patient_id) {
    const found = patients.find((p) => String(p.id) === String(patient.patient_id));
    return found?.nome || "";
  }

  if (patient?.mode === "manual") {
    return patient?.manual?.nome || "";
  }

  return "";
};

const ORCAMENTO_LABELS = {
  cirurgiao_plastico: "Cirurgião Plástico",
  cirurgiao_auxiliar: "Cirurgião Auxiliar",
  instrumentadora: "Instrumentadora",
  protese: "Prótese",
  laser: "Laser",
  retraction: "Retraction",
  microair: "MicroAir",
};

const KIT_LABELS = {
  cinta: "Cinta cirúrgica",
  sutia: "Sutiã cirúrgico",
  placas: "Placas",
  meia: "Meia anti-trombo",
  manta: "Manta térmica",
  sequel: "Sequel (bota pneumática)",
  taping: "Taping",
};

const PAGO_POR_LABEL = {
  paciente: "Paciente",
  consultorio: "Consultório",
};

const COBRANCA_LABEL = {
  incluso_hospital: "Incluso no hospital",
  valor_separado: "Valor separado",
};

const TIPO_EQUIPE_LABEL = {
  equipe_hospital: "Equipe do hospital",
  particular: "Particular",
};

const getResumoFinanceiro = (formData) => {
  const orc = formData?.orcamento?.items || {};
  const hosp = formData?.hospital || {};
  const eq = formData?.equipe || {};
  const km = formData?.kitMalhas || {};
  const dr = formData?.drenagens || {};

  const sumProfissionais = (grupo) =>
    grupo?.enabled
      ? (grupo.profissionais || []).reduce((sum, p) => {
          if (p.cobranca === "incluso_hospital") return sum;
          return sum + (p.valor_cents || 0);
        }, 0)
      : 0;

  const honorario = orc.cirurgiao_plastico?.enabled
    ? orc.cirurgiao_plastico.valor_cents || 0
    : 0;

  const medicoAuxiliarAvulso = orc.cirurgiao_auxiliar?.enabled
    ? orc.cirurgiao_auxiliar.valor_cents || 0
    : 0;

  const instrumentadoraAvulsa = orc.instrumentadora?.enabled
    ? orc.instrumentadora.valor_cents || 0
    : 0;

  const hospitalValor =
    (hosp?.hospital?.valor_cents || 0) +
    (hosp?.hospital_opcao2?.enabled ? hosp?.hospital_opcao2?.valor_cents || 0 : 0);

  const anestesista = sumProfissionais(eq.anestesista);
  const medicoAuxEquipe = sumProfissionais(eq.medico_auxiliar);
  const instrumentadoraEquipe = sumProfissionais(eq.instrumentadora);

  const aparelhos =
    (orc.laser?.enabled ? orc.laser.valor_cents || 0 : 0) +
    (orc.retraction?.enabled ? orc.retraction.valor_cents || 0 : 0) +
    (orc.microair?.enabled ? orc.microair.valor_cents || 0 : 0);

  const protese = orc.protese?.enabled ? orc.protese.valor_cents || 0 : 0;
  const kitCirurgico = km?.kit_cirurgico?.enabled ? km.kit_cirurgico.valor_cents || 0 : 0;
  const malhas = km?.malhas?.enabled ? km.malhas.valor_cents || 0 : 0;
  const drenagens = dr?.enabled ? dr.valor_cents || 0 : 0;

  const total =
    honorario +
    medicoAuxiliarAvulso +
    medicoAuxEquipe +
    instrumentadoraAvulsa +
    instrumentadoraEquipe +
    hospitalValor +
    anestesista +
    aparelhos +
    protese +
    kitCirurgico +
    malhas +
    drenagens;

  return {
    honorario,
    medicoAuxiliar: medicoAuxiliarAvulso + medicoAuxEquipe,
    hospital: hospitalValor,
    anestesista,
    aparelhos,
    protese,
    instrumentadora: instrumentadoraAvulsa + instrumentadoraEquipe,
    kitCirurgico,
    malhas,
    drenagens,
    total,
  };
};

const DataRow = ({ label, value }) => (
  <div className="orcPreview__dataRow">
    <span className="orcPreview__dataLabel">{label}</span>
    <strong className="orcPreview__dataValue">{value || "—"}</strong>
  </div>
);

const MoneyRow = ({ label, value, muted = false }) => (
  <div className={`orcPreview__moneyRow ${muted ? "is-muted" : ""}`}>
    <span>{label}</span>
    <strong>{formatBRLFromCents(value || 0)}</strong>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="orcPreview__empty">
    <span>{text}</span>
  </div>
);

const SectionCard = ({ title, subtitle, children }) => (
  <section className="orcPreview__card">
    <header className="orcPreview__cardHeader">
      <h3>{title}</h3>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
    <div className="orcPreview__cardBody">{children}</div>
  </section>
);

const PrevisualizacaoOrcamento = ({
  formData = {},
  patients = [],
  nomeClinica = "Clínica",
  nomeMedico = "Dr(a). Responsável",
}) => {
  const previewRef = useRef(null);
  const clearStatusTimeoutRef = useRef(null);
  const [pdfStatus, setPdfStatus] = useState("");

  useEffect(() => {
    return () => {
      if (clearStatusTimeoutRef.current) {
        clearTimeout(clearStatusTimeoutRef.current);
      }
    };
  }, []);

  const patient = formData?.patient || {};
  const dados = formData?.dados || {};
  const orcamento = formData?.orcamento?.items || {};
  const kit = formData?.kit?.items || {};
  const hospital = formData?.hospital || {};
  const equipe = formData?.equipe || {};
  const kitMalhas = formData?.kitMalhas || {};
  const drenagens = formData?.drenagens || {};
  const pagamento = formData?.pagamento || {};

  const pacienteNome = useMemo(
    () => getPatientName(patient, patients),
    [patient, patients]
  );

  const itensOrcamentoAtivos = useMemo(() => {
    return Object.entries(orcamento)
      .filter(([, item]) => item?.enabled)
      .map(([key, item]) => ({
        id: key,
        label: ORCAMENTO_LABELS[key] || key,
        valor_cents: item.valor_cents || 0,
        pago_por: item.pago_por || "paciente",
      }));
  }, [orcamento]);

  const itensKitAtivos = useMemo(() => {
    return Object.entries(kit)
      .filter(([, item]) => item?.enabled)
      .map(([key, item]) => ({
        id: key,
        label: KIT_LABELS[key] || key,
        tipo: item.tipo || "brinde",
        valor_cents: item.valor_cents || 0,
      }));
  }, [kit]);

  const equipeGruposAtivos = useMemo(() => {
    const grupos = [
      { key: "anestesista", title: "Anestesista" },
      { key: "instrumentadora", title: "Instrumentadora" },
      { key: "medico_auxiliar", title: "Médico Auxiliar" },
    ];

    return grupos
      .map((grupo) => {
        const state = equipe?.[grupo.key];
        if (!state?.enabled || !(state.profissionais || []).length) return null;

        return {
          ...grupo,
          profissionais: (state.profissionais || []).map((p, index) => ({
            id: p.id || `${grupo.key}-${index}`,
            nome: p.nome || "",
            tipo: p.tipo || "equipe_hospital",
            cobranca: p.cobranca || "incluso_hospital",
            valor_cents: p.valor_cents || 0,
          })),
        };
      })
      .filter(Boolean);
  }, [equipe]);

  const resumo = useMemo(() => getResumoFinanceiro(formData), [formData]);

  const handleGeneratePDF = async () => {
    if (!previewRef.current) return;

    try {
      setPdfStatus("Gerando PDF...");

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: previewRef.current.scrollWidth,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const usableWidth = pdfWidth - margin * 2;
      const usableHeight = pdfHeight - margin * 2;

      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= usableHeight;
      }

      const fileName = `orcamento-${(pacienteNome || "paciente")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "") || "preview"}.pdf`;

      pdf.save(fileName);

      setPdfStatus("PDF gerado com sucesso.");

      if (clearStatusTimeoutRef.current) {
        clearTimeout(clearStatusTimeoutRef.current);
      }

      clearStatusTimeoutRef.current = setTimeout(() => {
        setPdfStatus("");
      }, 3000);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      setPdfStatus("Não foi possível gerar o PDF.");

      if (clearStatusTimeoutRef.current) {
        clearTimeout(clearStatusTimeoutRef.current);
      }

      clearStatusTimeoutRef.current = setTimeout(() => {
        setPdfStatus("");
      }, 4000);
    }
  };

  const hospitalPrincipalNome = hospital?.hospital?.nome || "";
  const hospitalPrincipalValor = hospital?.hospital?.valor_cents || 0;
  const hospitalOpcao2 = hospital?.hospital_opcao2 || {};
  const pagamentoHospital = hospital?.pagamento || {};
  const totalParcelado =
    (pagamento.entrada_cents || 0) +
    Math.max(1, Number(pagamento.parcelas || 1)) * (pagamento.valor_parcela_cents || 0);

  return (
    <div className="orcPreviewWrapper">
      <div className="orcPreviewToolbar">
        <div>
          <h2>Pré-visualização do orçamento</h2>
          <p>Revise as informações antes de compartilhar ou gerar o PDF.</p>
        </div>

        <div className="orcPreviewToolbar__actions">
          <button type="button" className="btn primary" onClick={handleGeneratePDF}>
            Gerar PDF
          </button>
        </div>
      </div>

      {pdfStatus ? (
        <div
          className={`orcPreviewStatus ${
            pdfStatus.includes("Não foi possível") ? "is-error" : "is-success"
          }`}
        >
          {pdfStatus}
        </div>
      ) : null}

      <div className="orcPreviewScroll">
        <div className="orcPreview" ref={previewRef}>
          <header className="orcPreview__hero">
            <div className="orcPreview__heroText">
              <span className="orcPreview__eyebrow">Orçamento cirúrgico</span>
              <h1>{nomeClinica}</h1>
              <p>{nomeMedico}</p>
            </div>

            <div className="orcPreview__heroMeta">
              <div>
                <span>Data da consulta</span>
                <strong>{formatDateBR(dados.data_consulta)}</strong>
              </div>
              <div>
                <span>Validade</span>
                <strong>
                  {pagamento.data_validade
                    ? formatDateBR(pagamento.data_validade)
                    : pagamento.validade_dias
                      ? `${pagamento.validade_dias} dias`
                      : "—"}
                </strong>
              </div>
            </div>
          </header>

          <section className="orcPreview__grid">
            <SectionCard title="Dados da paciente" subtitle="Informações iniciais do orçamento">
              <div className="orcPreview__dataGrid">
                <DataRow label="Paciente" value={pacienteNome || "Não informado"} />
                <DataRow label="Cirurgia" value={dados.cirurgia || "Não informada"} />
                <DataRow
                  label="Previsão da cirurgia"
                  value={formatDateBR(dados.previsao_cirurgia)}
                />
                <DataRow label="Tempo de sala" value={dados.tempo_sala || "—"} />
                <DataRow label="Anestesia" value={dados.tipo_anestesia || "—"} />
              </div>
            </SectionCard>

            <SectionCard title="Resumo financeiro" subtitle="Composição consolidada do orçamento">
              <div className="orcPreview__moneyList">
                <MoneyRow label="Honorário" value={resumo.honorario} muted={!resumo.honorario} />
                <MoneyRow
                  label="Médico auxiliar"
                  value={resumo.medicoAuxiliar}
                  muted={!resumo.medicoAuxiliar}
                />
                <MoneyRow label="Hospital" value={resumo.hospital} muted={!resumo.hospital} />
                <MoneyRow
                  label="Anestesista"
                  value={resumo.anestesista}
                  muted={!resumo.anestesista}
                />
                <MoneyRow label="Aparelhos" value={resumo.aparelhos} muted={!resumo.aparelhos} />
                <MoneyRow label="Prótese" value={resumo.protese} muted={!resumo.protese} />
                <MoneyRow
                  label="Instrumentadora"
                  value={resumo.instrumentadora}
                  muted={!resumo.instrumentadora}
                />
                <MoneyRow
                  label="Kit cirúrgico"
                  value={resumo.kitCirurgico}
                  muted={!resumo.kitCirurgico}
                />
                <MoneyRow label="Malhas" value={resumo.malhas} muted={!resumo.malhas} />
                <MoneyRow
                  label="Drenagens"
                  value={resumo.drenagens}
                  muted={!resumo.drenagens}
                />

                <div className="orcPreview__moneyTotal">
                  <span>Total geral</span>
                  <strong>{formatBRLFromCents(resumo.total)}</strong>
                </div>
              </div>
            </SectionCard>
          </section>

          <section className="orcPreview__grid">
            <SectionCard
              title="Itens de orçamento"
              subtitle="Itens ativados no bloco de honorários, materiais e aparelhos"
            >
              {itensOrcamentoAtivos.length ? (
                <div className="orcPreview__list">
                  {itensOrcamentoAtivos.map((item) => (
                    <div key={item.id} className="orcPreview__listItem">
                      <div>
                        <strong>{item.label}</strong>
                        <span>Pago por: {PAGO_POR_LABEL[item.pago_por] || item.pago_por}</span>
                      </div>
                      <strong>{formatBRLFromCents(item.valor_cents)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Nenhum item de orçamento ativado." />
              )}
            </SectionCard>

            <SectionCard
              title="Kit e brindes"
              subtitle="Itens complementares incluídos ou cobrados à parte"
            >
              {itensKitAtivos.length ? (
                <div className="orcPreview__list">
                  {itensKitAtivos.map((item) => (
                    <div key={item.id} className="orcPreview__listItem">
                      <div>
                        <strong>{item.label}</strong>
                        <span>
                          {item.tipo === "brinde" ? "Brinde / incluso" : "Cobrado à parte"}
                        </span>
                      </div>
                      <strong>
                        {item.tipo === "brinde"
                          ? "Incluso"
                          : formatBRLFromCents(item.valor_cents)}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Nenhum item de kit selecionado." />
              )}
            </SectionCard>
          </section>

          <section className="orcPreview__grid">
            <SectionCard
              title="Hospital"
              subtitle="Opções hospitalares e forma de pagamento hospitalar"
            >
              <div className="orcPreview__stack">
                <div className="orcPreview__boxed">
                  <div className="orcPreview__boxedHead">
                    <strong>Hospital principal</strong>
                    <strong>{formatBRLFromCents(hospitalPrincipalValor)}</strong>
                  </div>
                  <span>{hospitalPrincipalNome || "Não informado"}</span>
                </div>

                {hospitalOpcao2?.enabled ? (
                  <div className="orcPreview__boxed">
                    <div className="orcPreview__boxedHead">
                      <strong>Hospital opção 2</strong>
                      <strong>{formatBRLFromCents(hospitalOpcao2.valor_cents || 0)}</strong>
                    </div>
                    <span>{hospitalOpcao2.nome || "Não informado"}</span>
                  </div>
                ) : null}

                <div className="orcPreview__boxed">
                  <div className="orcPreview__boxedHead">
                    <strong>Pagamento do hospital</strong>
                    <strong>
                      {pagamentoHospital.fluxo === "pago_consultorio"
                        ? "Pago no consultório"
                        : "Direto no hospital"}
                    </strong>
                  </div>
                  <span>
                    {pagamentoHospital.observacao || hospital.validade_texto || "Sem observações."}
                  </span>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Equipe cirúrgica"
              subtitle="Profissionais adicionais e respectivas formas de cobrança"
            >
              {equipeGruposAtivos.length ? (
                <div className="orcPreview__stack">
                  {equipeGruposAtivos.map((grupo) => (
                    <div key={grupo.key} className="orcPreview__group">
                      <div className="orcPreview__groupTitle">{grupo.title}</div>

                      <div className="orcPreview__list">
                        {grupo.profissionais.map((prof) => (
                          <div key={prof.id} className="orcPreview__listItem is-multiline">
                            <div>
                              <strong>
                                {prof.nome?.trim()
                                  ? prof.nome
                                  : `${grupo.title} ${
                                      grupo.profissionais.findIndex((p) => p.id === prof.id) + 1
                                    }`}
                              </strong>
                              <span>{TIPO_EQUIPE_LABEL[prof.tipo] || prof.tipo}</span>
                              <span>{COBRANCA_LABEL[prof.cobranca] || prof.cobranca}</span>
                            </div>

                            <strong>
                              {prof.cobranca === "valor_separado"
                                ? formatBRLFromCents(prof.valor_cents)
                                : "Incluso"}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Nenhum profissional adicional configurado." />
              )}
            </SectionCard>
          </section>

          <section className="orcPreview__grid">
            <SectionCard
              title="Kit cirúrgico, malhas e drenagens"
              subtitle="Itens opcionais adicionais informados no orçamento"
            >
              <div className="orcPreview__stack">
                {kitMalhas?.kit_cirurgico?.enabled ? (
                  <div className="orcPreview__boxed">
                    <div className="orcPreview__boxedHead">
                      <strong>Kit cirúrgico</strong>
                      <strong>{formatBRLFromCents(kitMalhas.kit_cirurgico.valor_cents || 0)}</strong>
                    </div>
                    <span>{kitMalhas.kit_cirurgico.descricao || "Sem descrição."}</span>
                  </div>
                ) : null}

                {kitMalhas?.malhas?.enabled ? (
                  <div className="orcPreview__boxed">
                    <div className="orcPreview__boxedHead">
                      <strong>Malhas</strong>
                      <strong>{formatBRLFromCents(kitMalhas.malhas.valor_cents || 0)}</strong>
                    </div>
                    <span>{kitMalhas.malhas.descricao || "Sem descrição."}</span>
                  </div>
                ) : null}

                {drenagens?.enabled ? (
                  <div className="orcPreview__boxed">
                    <div className="orcPreview__boxedHead">
                      <strong>Drenagens</strong>
                      <strong>{formatBRLFromCents(drenagens.valor_cents || 0)}</strong>
                    </div>
                    <span>
                      Quantidade prevista: <strong>{drenagens.quantidade || 1}</strong>
                    </span>
                  </div>
                ) : null}

                {!kitMalhas?.kit_cirurgico?.enabled &&
                !kitMalhas?.malhas?.enabled &&
                !drenagens?.enabled ? (
                  <EmptyState text="Nenhum item adicional informado." />
                ) : null}
              </div>
            </SectionCard>

            <SectionCard
              title="Forma de pagamento"
              subtitle="Condição comercial prevista para a proposta"
            >
              <div className="orcPreview__paymentGrid">
                <DataRow label="Tipo" value={(pagamento.tipo || "pix").toUpperCase()} />
                <DataRow
                  label="Entrada"
                  value={formatBRLFromCents(pagamento.entrada_cents || 0)}
                />
                <DataRow
                  label="Parcelas"
                  value={`${Math.max(1, Number(pagamento.parcelas || 1))}x`}
                />
                <DataRow
                  label="Valor por parcela"
                  value={formatBRLFromCents(pagamento.valor_parcela_cents || 0)}
                />
                <DataRow
                  label="Primeiro vencimento"
                  value={formatDateBR(pagamento.vencimento_primeira)}
                />
                <DataRow
                  label="Consultora"
                  value={pagamento.consultora || "Não informada"}
                />
              </div>

              <div className="orcPreview__paymentTotal">
                <span>Composição informada</span>
                <strong>{formatBRLFromCents(totalParcelado)}</strong>
              </div>

              {pagamento.observacoes ? (
                <div className="orcPreview__note">
                  <strong>Observações</strong>
                  <p>{pagamento.observacoes}</p>
                </div>
              ) : null}
            </SectionCard>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrevisualizacaoOrcamento;