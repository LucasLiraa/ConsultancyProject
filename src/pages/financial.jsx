import React, { useState, useEffect, useMemo } from "react";
import FiltersBar from "../components/financialComponents/FiltersBar";
import SummaryCards from "../components/financialComponents/SummaryCards";
import ExpenseCategoryCards from "../components/financialComponents/ExpenseCategoryCards";
import TransactionsList from "../components/financialComponents/TransactionsList";
import ChartsSection from "../components/financialComponents/ChartsSection";
import TransactionDetailsPanel from "../components/financialComponents/TransactionDetailsPanel";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

import "./styles/financial.css";


const Financial = () => {

  /* ============================
        ESTADOS PRINCIPAIS
  ============================= */
  const [periodo, setPeriodo] = useState("mensal");
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);


  /* ============================
      WIZARD (multi-etapas)
  ============================= */
  const [step, setStep] = useState(1);               // etapa 1 → 2 → 3
  const [tipoRegistro, setTipoRegistro] = useState("");  // Entrada / Saída
  const [subtipo, setSubtipo] = useState("");            // muda conforme tipo

  // gera um id único para agrupar transações relacionadas (timeline)
  const groupId = useMemo(() => crypto.randomUUID(), []);


  /* ============================
      FORMULÁRIO DA ETAPA 3
  ============================= */

  // Primeiro pagamento
  const [formData, setFormData] = useState({
    nome_paciente: "",
    procedimento: "",
    data_cirurgia: "",
    valor_honorario: "",
    valor_recebido: "",
    data_pagamento: "",
    forma_pagamento: "",
    multi_pag_texto: "",
    observacoes: ""
  });

  // Segundo pagamento opcional
  const [pagamentoExtra, setPagamentoExtra] = useState(false);
  const [multiFormaPagamento, setMultiFormaPagamento] = useState(false);
  const [formData2, setFormData2] = useState({
    valor_recebido: "",
    data_pagamento: "",
    agendado: false,
  });

  // Outros valores pagos ao consultório (repasses → saída automática)
  const [outrosPagosAtConsultorio, setOutrosPagosAtConsultorio] = useState(false);
  const [repasseTipo, setRepasseTipo] = useState(""); // Hospital / Equipe / Equipamento / Outros

  // REBASE: Hospital
  const [repHospital, setRepHospital] = useState({
    hospital: "",
    valor: "",
    data: "",
    repassarSaida: true,
  });

  // REBASE: Equipe cirúrgica (checkbox + multi)
  const [repEquipeChecks, setRepEquipeChecks] = useState({
    Anestesista: false,
    "Cirurgião auxiliar": false,
    Instrumentadora: false,
    Outro: false,
  });
  const [repEquipe, setRepEquipe] = useState([]);

  // REBASE: Equipamento
  const [repEquip, setRepEquip] = useState({
    equipamento: "",
    valor: "",
    data: "",
    repassarSaida: true,
  });

  // REBASE: Outros valores
  const [repOutros, setRepOutros] = useState({
    descricao: "",
    valor: "",
    data: "",
    repassarSaida: true,
  });


  /* ============================
      SAÍDA — subtipos
  ============================= */

  const [saidaSubtipoCir, setSaidaSubtipoCir] = useState("");          // categoria dentro de "Pagamento cirúrgico"
  const [gastosCirurgicos, setGastosCirurgicos] = useState([]);        // lista → [{ categoria, descricao, valor, data }]
  const [profPagamentos, setProfPagamentos] = useState([]);            // lista → [{ nome, valor, data, observacoes }]


  /* ============================
      AJUSTE DE DATA (corrige -1 dia)
  ============================= */
  const ajustarData = (dataString) => {
    if (!dataString) return "--";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  };


  /* ============================
      CARREGAR DADOS DO SUPABASE
  ============================= */
  useEffect(() => {
    async function carregarTransacoes() {
      const { data, error } = await supabase
        .from("registros_financeiros")
        .select("*")
        .order("data_pagamento", { ascending: false });

      if (error) {
        console.error("❌ Erro ao carregar transações:", error);
        return;
      }

      const transformadas = data.map((registro) => ({
        id: registro.id,
        group_id: registro.group_id,
        data: ajustarData(registro.data_pagamento),
        descricao:
          registro.subtipo === "Pagamento da Paciente"
            ? `${registro.nome_paciente} - ${registro.procedimento}`
            : registro.procedimento || registro.subtipo,
        tipo: registro.tipo,
        valor: registro.valor_recebido,
        forma: registro.forma_pagamento,
        valor_pendente: registro.valor_pendente,
        subtipo: registro.subtipo,
      }));

      setTransactions(transformadas);
    }

    carregarTransacoes();
  }, []);


  /* ============================
    FUNÇÃO DE FORMATAÇÃO (R$)
  ============================= */
  const formatCurrencyInput = (value) => {
    const onlyDigits = value.replace(/\D/g, "");
    return (Number(onlyDigits) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };


  /* ======================================================
        🔥 SALVAR (Wizard Multi-Step)
        → cria múltiplos registros (entrada + saídas automáticas)
  ======================================================= */
  const handleSaveWizard = async () => {
    try {
      setSalvando(true);

      const parseBRL = (str) => {
        if (!str) return 0;
        const only = String(str).replace(/[R$\s.]/g, "").replace(",", ".");
        return Number(only) / 100;
      };

      const honorarioTotal = parseBRL(formData.valor_honorario);

      // lista de pagamentos (1 ou 2)
      const pagamentos = [
        {
          valor: Number(formData.valor_recebido || 0),
          data: formData.data_pagamento,
          agendado: false,
        },
      ];

      if (pagamentoExtra && formData2.valor_recebido && formData2.data_pagamento) {
        pagamentos.push({
          valor: Number(formData2.valor_recebido),
          data: formData2.data_pagamento,
          agendado: !!formData2.agendado,
        });
      }


      /* =======================
          ✅ ENTRADA
      ======================= */
      if (tipoRegistro === "Entrada") {

        /* ••• SUBTIPO: PAGAMENTO DA PACIENTE ••• */
        if (subtipo === "Pagamento da Paciente") {
          let acumulado = 0;

          for (const p of pagamentos) {
            acumulado += Number(p.valor || 0);
            const valorPendente = Math.max(honorarioTotal - acumulado, 0);

            const payload = {
              group_id: groupId,
              tipo: "Entrada",
              subtipo: "Pagamento da Paciente",
              nome_paciente: formData.nome_paciente,
              procedimento: formData.procedimento,
              data_cirurgia: formData.data_cirurgia,
              valor_honorario: honorarioTotal,
              valor_recebido: Number(p.valor),
              forma_pagamento: multiFormaPagamento ? formData.multi_pag_texto : formData.forma_pagamento,
              data_pagamento: p.data,
              observacoes: formData.observacoes,
              valor_pendente: valorPendente,
              status_pagamento: p.agendado ? "Agendado" : "Pago",
            };

            const { data, error } = await supabase
              .from("registros_financeiros")
              .insert([payload])
              .select();

            if (error) throw error;

            const r = data[0];
            setTransactions((prev) => [{
              id: r.id,
              group_id: r.group_id,
              data: ajustarData(r.data_pagamento),
              descricao: `${r.nome_paciente} - ${r.procedimento}`,
              tipo: r.tipo,
              valor: r.valor_recebido,
              forma: r.forma_pagamento,
              valor_pendente: r.valor_pendente,
              subtipo: r.subtipo,
            }, ...prev]);
          }


          /* ••• SE HOUVER REPASSES → GERAR SAÍDAS ••• */
          const saidasToCreate = [];

          if (outrosPagosAtConsultorio) {

            if (repasseTipo === "Hospital" && repHospital.hospital && repHospital.valor && repHospital.repassarSaida) {
              saidasToCreate.push({
                group_id: groupId,
                tipo: "Saída",
                subtipo: "Pagamento cirúrgico",
                categoria: "Hospital",
                descricao: repHospital.hospital,
                valor_recebido: Number(repHospital.valor),
                data_pagamento: repHospital.data,
                observacoes: `Repasse (gerado de entrada → paciente)`
              });
            }

            if (repasseTipo === "Equipe cirúrgica") {
              repEquipe.forEach((p) => {
                if (p.repassarSaida) {
                  saidasToCreate.push({
                    group_id: groupId,
                    tipo: "Saída",
                    subtipo: "Pagamento para profissionais",
                    categoria: p.funcao,
                    descricao: p.nome || p.funcao,
                    valor_recebido: Number(p.valor),
                    data_pagamento: p.data,
                    observacoes: `Repasse (gerado de entrada → paciente)`
                  });
                }
              });
            }

            if (repasseTipo === "Equipamento cirúrgico" && repEquip.equipamento && repEquip.valor && repEquip.repassarSaida) {
              saidasToCreate.push({
                group_id: groupId,
                tipo: "Saída",
                subtipo: "Pagamento cirúrgico",
                categoria: "Equipamento",
                descricao: repEquip.equipamento,
                valor_recebido: Number(repEquip.valor),
                data_pagamento: repEquip.data,
                observacoes: `Repasse (gerado de entrada → paciente)`
              });
            }

            if (repasseTipo === "Outros" && repOutros.descricao && repOutros.valor && repOutros.repassarSaida) {
              saidasToCreate.push({
                group_id: groupId,
                tipo: "Saída",
                subtipo: "Outros tipos de pagamento",
                descricao: repOutros.descricao,
                valor_recebido: Number(repOutros.valor),
                data_pagamento: repOutros.data,
                observacoes: `Repasse (gerado de entrada → paciente)`
              });
            }
          }

          if (saidasToCreate.length) {
            const { data: ds, error: es } = await supabase
              .from("registros_financeiros")
              .insert(saidasToCreate)
              .select();

            if (es) throw es;

            ds.forEach((r) => {
              setTransactions((prev) => [{
                id: r.id,
                group_id: r.group_id,
                data: ajustarData(r.data_pagamento),
                descricao: r.descricao || r.subtipo,
                tipo: r.tipo,
                valor: r.valor_recebido,
                forma: r.forma_pagamento,
                valor_pendente: 0,
                subtipo: r.subtipo,
              }, ...prev]);
            });
          }
        }


        /* ••• SUBTIPO: OUTRO TIPO DE PAGAMENTO (ENTRADA) ••• */
        if (subtipo === "Outro Tipo de Pagamento") {
          const payload = {
            group_id: groupId,
            tipo: "Entrada",
            subtipo,
            procedimento: formData.procedimento,
            valor_recebido: Number(formData.valor_recebido || 0),
            forma_pagamento: formData.forma_pagamento,
            data_pagamento: formData.data_pagamento,
            observacoes: formData.observacoes,
            valor_pendente: 0,
          };

          const { data, error } = await supabase
            .from("registros_financeiros")
            .insert([payload])
            .select();

          if (error) throw error;

          const r = data[0];
          setTransactions((prev) => [{
            id: r.id,
            group_id: r.group_id,
            data: ajustarData(r.data_pagamento),
            descricao: r.procedimento || r.subtipo,
            tipo: r.tipo,
            valor: r.valor_recebido,
            forma: r.forma_pagamento,
            valor_pendente: r.valor_pendente,
            subtipo: r.subtipo,
          }, ...prev]);
        }
      }


      /* =======================
          ✅ SAÍDA
      ======================= */
      if (tipoRegistro === "Saída") {

        // Pagamento cirúrgico (Hospital / Anestesista / Prótese / Malhas / etc)
        if (subtipo === "Pagamento cirúrgico" && gastosCirurgicos.length) {
          const g = gastosCirurgicos[0];
          const payload = {
            group_id: groupId,
            tipo: "Saída",
            subtipo: "Pagamento cirúrgico",
            categoria: g.tipo,
            descricao: g.descricao,
            valor_recebido: Number(g.valor || 0),
            data_pagamento: g.data,
            observacoes: g.observacoes,
          };

          const { data, error } = await supabase
            .from("registros_financeiros")
            .insert([payload])
            .select();

          if (error) throw error;

          const r = data[0];
          setTransactions((prev) => [{
            id: r.id,
            group_id: r.group_id,
            data: ajustarData(r.data_pagamento),
            descricao: r.descricao || r.subtipo,
            tipo: r.tipo,
            valor: r.valor_recebido,
            forma: r.forma_pagamento,
            valor_pendente: 0,
            subtipo: r.subtipo,
          }, ...prev]);
        }

        // Pagamento para profissionais
        if (subtipo === "Pagamento para profissionais" && profPagamentos.length) {
          const p = profPagamentos[0];

          const payload = {
            group_id: groupId,
            tipo: "Saída",
            subtipo: "Pagamento para profissionais",
            descricao: p.nome,
            valor_recebido: Number(p.valor),
            data_pagamento: p.data,
            observacoes: p.observacoes,
          };

          const { data, error } = await supabase
            .from("registros_financeiros")
            .insert([payload])
            .select();

          if (error) throw error;

          const r = data[0];
          setTransactions((prev) => [{
            id: r.id,
            group_id: r.group_id,
            data: ajustarData(r.data_pagamento),
            descricao: r.descricao || r.subtipo,
            tipo: r.tipo,
            valor: r.valor_recebido,
            forma: r.forma_pagamento,
            valor_pendente: 0,
            subtipo: r.subtipo,
          }, ...prev]);
        }

        // Pagamento de contas / Outros
        if (subtipo === "Pagamento de contas" || subtipo === "Outros tipos de pagamento") {
          const payload = {
            group_id: groupId,
            tipo: "Saída",
            subtipo,
            descricao: formData.procedimento,
            valor_recebido: Number(formData.valor_recebido || 0),
            data_pagamento: formData.data_pagamento,
            observacoes: formData.observacoes,
          };

          const { data, error } = await supabase
            .from("registros_financeiros")
            .insert([payload])
            .select();

          if (error) throw error;

          const r = data[0];
          setTransactions((prev) => [{
            id: r.id,
            group_id: r.group_id,
            data: ajustarData(r.data_pagamento),
            descricao: r.descricao || r.subtipo,
            tipo: r.tipo,
            valor: r.valor_recebido,
            forma: r.forma_pagamento,
            valor_pendente: 0,
            subtipo: r.subtipo,
          }, ...prev]);
        }
      }


      /* =======================
          FINALIZAÇÃO
      ======================= */
      setSucesso(true);
      setTimeout(() => {
        setSalvando(false);
        setShowModal(false);
        setStep(1);
      }, 600);

    } catch (error) {
      console.error("❌ ERRO: ", error);
      alert("Erro ao salvar registro.");
      setSalvando(false);
    }
  };

  /* =========================================================
    RESUMO FINANCEIRO (entradas x saídas)
  =========================================================*/
  const totalEntradas = transactions
    .filter((t) => t.tipo === "Entrada")
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);

  const totalSaidas = transactions
    .filter((t) => t.tipo === "Saída")
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);

  const resumoFinanceiro = {
    entradas: totalEntradas,
    saidas: totalSaidas,
    saldo: totalEntradas - totalSaidas,
  };

  /* =========================================================
      FUNÇÕES DO PAINEL LATERAL
  =========================================================*/
  const handleEditTransaction = (transaction) => {
    setShowModal(true);
    setStep(1);
    setSelectedTransaction(null);

    // pré-preenche com descrição existente
    setFormData({
      nome_paciente: transaction.descricao,
      procedimento: transaction.descricao,
      valor_recebido: transaction.valor,
      data_pagamento: "",
      forma_pagamento: transaction.forma,
      observacoes: "",
    });
  };

  const handleDeleteTransaction = async (id) => {
    const confirmar = window.confirm("Deseja realmente excluir este registro?");
    if (!confirmar) return;

    const { error } = await supabase.from("registros_financeiros").delete().eq("id", id);

    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setSelectedTransaction(null);
    }
  };

  // ============================================================
  // INTERFACE
  // ============================================================
  return (
    <section className="sectionFinancial">
      <div className="financial-container">

        <div className="financial-header">
          <div className="header-top">
            <h2>Dashboard Financeiro</h2>
            <button className="add-btn" onClick={() => { setShowModal(true); setStep(1); }}>
              ➕ Adicionar Registro
            </button>
          </div>
          <FiltersBar periodo={periodo} setPeriodo={setPeriodo} />
        </div>

        <div className="financial-summary">
          <SummaryCards data={resumoFinanceiro} />
        </div>

        <div className="financial-grid">
          <div className="financial-left">
            <ExpenseCategoryCards data={gastosCirurgicos} />
            <TransactionsList data={transactions} onSelect={setSelectedTransaction} />
          </div>

          <div className="financial-right">
            <div className="financial-chart-top">
              <ChartsSection data={transactions} chartType="line" />
            </div>
            <div className="financial-chart-bottom">
              <ChartsSection data={gastosCirurgicos} chartType="doughnut" />
            </div>
          </div>
        </div>

        {/*  MODAL MULTI-STEP INTELIGENTE */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div className="overlay-bg" onClick={() => setShowModal(false)} />

              <motion.div className="modal-wrapper">
                <motion.form
                  className="add-modal"
                  onSubmit={(e) => { e.preventDefault(); handleSaveWizard(); }}
                >
                  {/* Barra de Progresso */}
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${(step / 3) * 100}%` }}></div>
                  </div>

                  {/* Cabeçalho */}
                  <div className="modal-header">
                    <h3>
                      {step === 1 ? "Tipo de Registro"
                      : step === 2 ? "Selecione o Subtipo"
                      : "Formulário"}
                    </h3>
                    <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                      <X size={18} />
                    </button>
                  </div>

                  {/* ====== STEP 1: TIPO ====== */}
                  {step === 1 && (
                    <>
                      <label>Tipo de Registro</label>
                      <select value={tipoRegistro} onChange={(e) => { setTipoRegistro(e.target.value); setSubtipo(""); }}>
                        <option value="">Selecione...</option>
                        <option value="Entrada">Entrada</option>
                        <option value="Saída">Saída</option>
                      </select>

                      <div className="modal-actions space-between">
                        <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button
                          type="button"
                          className="save-btn"
                          disabled={!tipoRegistro}
                          onClick={() => setStep(2)}
                        >
                          Próximo
                        </button>
                      </div>
                    </>
                  )}

                  {/* ====== STEP 2: SUBTIPO DINÂMICO ====== */}
                  {step === 2 && (
                    <>
                      <label>Subtipo</label>
                      {tipoRegistro === "Entrada" ? (
                        <select value={subtipo} onChange={(e) => setSubtipo(e.target.value)}>
                          <option value="">Selecione...</option>
                          <option value="Pagamento da Paciente">Pagamento da Paciente</option>
                          <option value="Outro Tipo de Pagamento">Outro tipo de pagamento</option>
                        </select>
                      ) : (
                        <select value={subtipo} onChange={(e) => setSubtipo(e.target.value)}>
                          <option value="">Selecione...</option>
                          <option value="Pagamento cirúrgico">Pagamento cirúrgico</option>
                          <option value="Pagamento para profissionais">Pagamento para profissionais</option>
                          <option value="Pagamento de contas">Pagamento de contas</option>
                          <option value="Outros tipos de pagamento">Outros tipos de pagamento</option>
                        </select>
                      )}

                      <div className="modal-actions space-between">
                        <button className="cancel-btn" onClick={() => setStep(1)}>Voltar</button>
                        <button
                          type="button"
                          className="save-btn"
                          disabled={!subtipo}
                          onClick={() => setStep(3)}
                        >
                          Próximo
                        </button>
                      </div>
                    </>
                  )}

                  {/* ====== STEP 3: FORM DINÂMICO ====== */}
                  {step === 3 && (
                    <>
                      {/* -------- ENTRADA: PAGAMENTO DA PACIENTE -------- */}
                      {tipoRegistro === "Entrada" && subtipo === "Pagamento da Paciente" && (
                        <>
                          <label>Nome do paciente</label>
                          <input type="text" value={formData.nome_paciente}
                            onChange={(e)=>setFormData({...formData, nome_paciente:e.target.value})} required />

                          <label>Procedimento</label>
                          <input type="text" value={formData.procedimento}
                            onChange={(e)=>setFormData({...formData, procedimento:e.target.value})} required />

                          <label>Data da cirurgia</label>
                          <input type="date" value={formData.data_cirurgia}
                            onChange={(e)=>setFormData({...formData, data_cirurgia:e.target.value})} required />

                          <label>Valor total honorário (R$)</label>
                          <input type="text" value={formData.valor_honorario}
                            onChange={(e)=>setFormData({...formData, valor_honorario: formatCurrencyInput(e.target.value)})} required />

                          {/* Pagamento #1 */}
                          <div className="input-group">
                            <label>Valor recebido (R$) — pagamento #1</label>
                            <input type="number" value={formData.valor_recebido}
                              onChange={(e)=>setFormData({...formData, valor_recebido:e.target.value})} required />
                          </div>
                          <div className="input-group">
                            <label>Data do pagamento — pagamento #1</label>
                            <input type="date" value={formData.data_pagamento}
                              onChange={(e)=>setFormData({...formData, data_pagamento:e.target.value})} required />
                          </div>

                          {/* Forma de pagamento */}
                          <label>Forma de pagamento</label>
                          <select
                            value={formData.forma_pagamento}
                            onChange={(e)=>{ 
                              const v = e.target.value; 
                              setFormData({...formData, forma_pagamento: v}); 
                              setMultiFormaPagamento(v === "Mais de uma forma");
                            }}
                          >
                            <option value="">Selecione...</option>
                            <option>Pix</option>
                            <option>Boleto</option>
                            <option>Cartão de crédito</option>
                            <option>Cartão de débito</option>
                            <option>Dinheiro</option>
                            <option value="Mais de uma forma">Mais de uma forma de pagamento</option>
                          </select>

                          {multiFormaPagamento && (
                            <>
                              <label>Descreva as formas</label>
                              <input type="text" placeholder="Ex.: parte Pix + parte cartão"
                                value={formData.multi_pag_texto}
                                onChange={(e)=>setFormData({...formData, multi_pag_texto:e.target.value})}/>
                            </>
                          )}

                          {/* Segundo pagamento opcional */}
                          <label>Deseja adicionar mais uma data de pagamento?</label>
                          <select value={pagamentoExtra ? "sim" : "nao"} onChange={(e)=>setPagamentoExtra(e.target.value === "sim")}>
                            <option value="nao">Não</option>
                            <option value="sim">Sim</option>
                          </select>

                          {pagamentoExtra && (
                            <div className="opcional">
                              <div className="opcional-bloco">
                                <div>
                                  <label>Valor recebido (R$) — pagamento #2</label>
                                  <input type="number" value={formData2.valor_recebido}
                                    onChange={(e)=>setFormData2({...formData2, valor_recebido:e.target.value})}/>
                                </div>
                                <div>
                                  <label>Data do pagamento — pagamento #2</label>
                                  <input type="date" value={formData2.data_pagamento}
                                    onChange={(e)=>setFormData2({...formData2, data_pagamento:e.target.value})}/>
                                </div>
                                <div>
                                  <label>É um pagamento agendado?</label>
                                  <select value={formData2.agendado ? "sim":"nao"}
                                    onChange={(e)=>setFormData2({...formData2, agendado: e.target.value==="sim"})}>
                                    <option value="nao">Não</option>
                                    <option value="sim">Sim</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Outros valores pagos ao consultório → rebatem em Saída */}
                          <label>Outros valores pagos ao consultório?</label>
                          <select value={outrosPagosAtConsultorio ? "sim":"nao"}
                                  onChange={(e)=>setOutrosPagosAtConsultorio(e.target.value==="sim")}>
                            <option value="nao">Não</option>
                            <option value="sim">Sim</option>
                          </select>

                          {outrosPagosAtConsultorio && (
                            <>
                              <label>Selecione o tipo</label>
                              <select value={repasseTipo} onChange={(e)=>setRepasseTipo(e.target.value)}>
                                <option value="">Selecione...</option>
                                <option>Hospital</option>
                                <option>Equipe cirúrgica</option>
                                <option>Equipamento cirúrgico</option>
                                <option>Outros</option>
                              </select>

                              {/* Hospital */}
                              {repasseTipo === "Hospital" && (
                                <div className="opcional">
                                  <label>Hospital selecionado</label>
                                  <input type="text" value={repHospital.hospital}
                                    onChange={(e)=>setRepHospital({...repHospital, hospital:e.target.value})}/>
                                  <label>Valor (R$)</label>
                                  <input type="number" value={repHospital.valor}
                                    onChange={(e)=>setRepHospital({...repHospital, valor:e.target.value})}/>
                                  <label>Data do pagamento ao consultório</label>
                                  <input type="date" value={repHospital.data}
                                    onChange={(e)=>setRepHospital({...repHospital, data:e.target.value})}/>
                                  <label>Repassar para saída?</label>
                                  <select value={repHospital.repassarSaida ? "sim":"nao"}
                                    onChange={(e)=>setRepHospital({...repHospital, repassarSaida: e.target.value==="sim"})}>
                                    <option value="sim">Sim</option>
                                    <option value="nao">Não</option>
                                  </select>
                                </div>
                              )}

                              {/* Equipe cirúrgica */}
                              {repasseTipo === "Equipe cirúrgica" && (
                                <div className="opcional">
                                  <div className="opcional-bloco" style={{gridTemplateColumns:"1fr 1fr"}}>
                                    {Object.keys(repEquipeChecks).map(fn => (
                                      <label key={fn} style={{display:"flex", gap:8, alignItems:"center"}}>
                                        <input type="checkbox"
                                          checked={repEquipeChecks[fn]}
                                          onChange={(e)=>{
                                            const checked = e.target.checked;
                                            setRepEquipeChecks({...repEquipeChecks, [fn]: checked});
                                            if(checked){
                                              setRepEquipe(prev => [...prev, {funcao: fn, nome:"", valor:"", data:"", repassarSaida:true}]);
                                            } else {
                                              setRepEquipe(prev => prev.filter(p => p.funcao !== fn));
                                            }
                                          }}
                                        />
                                        {fn}
                                      </label>
                                    ))}
                                  </div>

                                  {repEquipe.map((p, idx)=>(
                                    <div key={idx} className="opcional" style={{marginTop:8}}>
                                      <strong>{p.funcao}</strong>
                                      <label>Nome do profissional</label>
                                      <input type="text" value={p.nome}
                                        onChange={(e)=>{
                                          const v=[...repEquipe]; v[idx].nome=e.target.value; setRepEquipe(v);
                                        }}/>
                                      <label>Valor (R$)</label>
                                      <input type="number" value={p.valor}
                                        onChange={(e)=>{
                                          const v=[...repEquipe]; v[idx].valor=e.target.value; setRepEquipe(v);
                                        }}/>
                                      <label>Data do pagamento ao consultório</label>
                                      <input type="date" value={p.data}
                                        onChange={(e)=>{
                                          const v=[...repEquipe]; v[idx].data=e.target.value; setRepEquipe(v);
                                        }}/>
                                      <label>Repassar para saída?</label>
                                      <select value={p.repassarSaida ? "sim":"nao"}
                                        onChange={(e)=>{
                                          const v=[...repEquipe]; v[idx].repassarSaida = (e.target.value==="sim"); setRepEquipe(v);
                                        }}>
                                        <option value="sim">Sim</option>
                                        <option value="nao">Não</option>
                                      </select>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Equipamento */}
                              {repasseTipo === "Equipamento cirúrgico" && (
                                <div className="opcional">
                                  <label>Equipamento utilizado</label>
                                  <input type="text" value={repEquip.equipamento}
                                    onChange={(e)=>setRepEquip({...repEquip, equipamento:e.target.value})}/>
                                  <label>Valor (R$)</label>
                                  <input type="number" value={repEquip.valor}
                                    onChange={(e)=>setRepEquip({...repEquip, valor:e.target.value})}/>
                                  <label>Data do pagamento ao consultório</label>
                                  <input type="date" value={repEquip.data}
                                    onChange={(e)=>setRepEquip({...repEquip, data:e.target.value})}/>
                                  <label>Repassar para saída?</label>
                                  <select value={repEquip.repassarSaida ? "sim":"nao"}
                                    onChange={(e)=>setRepEquip({...repEquip, repassarSaida: e.target.value==="sim"})}>
                                    <option value="sim">Sim</option>
                                    <option value="nao">Não</option>
                                  </select>
                                </div>
                              )}

                              {/* Outros */}
                              {repasseTipo === "Outros" && (
                                <div className="opcional">
                                  <label>Descrição</label>
                                  <input type="text" value={repOutros.descricao}
                                    onChange={(e)=>setRepOutros({...repOutros, descricao:e.target.value})}/>
                                  <label>Valor (R$)</label>
                                  <input type="number" value={repOutros.valor}
                                    onChange={(e)=>setRepOutros({...repOutros, valor:e.target.value})}/>
                                  <label>Data do pagamento ao consultório</label>
                                  <input type="date" value={repOutros.data}
                                    onChange={(e)=>setRepOutros({...repOutros, data:e.target.value})}/>
                                  <label>Repassar para saída?</label>
                                  <select value={repOutros.repassarSaida ? "sim":"nao"}
                                    onChange={(e)=>setRepOutros({...repOutros, repassarSaida: e.target.value==="sim"})}>
                                    <option value="sim">Sim</option>
                                    <option value="nao">Não</option>
                                  </select>
                                </div>
                              )}
                            </>
                          )}

                          <label>Observações</label>
                          <textarea rows="3" value={formData.observacoes}
                            onChange={(e)=>setFormData({...formData, observacoes:e.target.value})}/>
                        </>
                      )}

                      {/* -------- ENTRADA: OUTRO TIPO -------- */}
                      {tipoRegistro === "Entrada" && subtipo === "Outro Tipo de Pagamento" && (
                        <>
                          <label>Descrição do pagamento</label>
                          <input type="text" value={formData.procedimento}
                            onChange={(e)=>setFormData({...formData, procedimento:e.target.value})} />

                          <label>Valor do pagamento</label>
                          <input type="number" value={formData.valor_recebido}
                            onChange={(e)=>setFormData({...formData, valor_recebido:e.target.value})} />

                          <label>Data do pagamento</label>
                          <input type="date" value={formData.data_pagamento}
                            onChange={(e)=>setFormData({...formData, data_pagamento:e.target.value})} />

                          <label>Observações</label>
                          <textarea rows="3" value={formData.observacoes}
                            onChange={(e)=>setFormData({...formData, observacoes:e.target.value})}/>
                        </>
                      )}

                      {/* -------- SAÍDA: PAGAMENTO CIRÚRGICO -------- */}
                      {tipoRegistro === "Saída" && subtipo === "Pagamento cirúrgico" && (
                        <>
                          <label>Categoria do gasto</label>
                          <select value={saidaSubtipoCir} onChange={(e)=>setSaidaSubtipoCir(e.target.value)}>
                            <option value="">Selecione...</option>
                            <option>Hospital</option>
                            <option>Anestesista</option>
                            <option>Prótese</option>
                            <option>Malhas</option>
                            <option>Outros gastos cirúrgicos</option>
                          </select>

                          <div className="opcional">
                            <div className="opcional-bloco" style={{ gridTemplateColumns: "1fr 1fr" }}>
                              <div>
                                <label>Descrição</label>
                                <input type="text" onChange={(e)=>{
                                  const base = { tipo: saidaSubtipoCir || "Outros gastos cirúrgicos", descricao: e.target.value, valor:"", data:"", observacoes:"" };
                                  setGastosCirurgicos([base]);
                                }}/>
                              </div>
                              <div>
                                <label>Valor total (R$)</label>
                                <input type="number" onChange={(e)=>{
                                  setGastosCirurgicos(prev => prev.length ? [{...prev[0], valor:e.target.value}] : [{ tipo: saidaSubtipoCir, descricao:"", valor:e.target.value, data:"", observacoes:""}]);
                                }}/>
                              </div>
                            </div>
                            <label>Data do pagamento</label>
                            <input type="date" onChange={(e)=>{
                              setGastosCirurgicos(prev => prev.length ? [{...prev[0], data:e.target.value}] : [{ tipo: saidaSubtipoCir, descricao:"", valor:"", data:e.target.value, observacoes:""}]);
                            }}/>
                            <label>Observações</label>
                            <textarea rows="2" onChange={(e)=>{
                              setGastosCirurgicos(prev => prev.length ? [{...prev[0], observacoes:e.target.value}] : [{ tipo: saidaSubtipoCir, descricao:"", valor:"", data:"", observacoes:e.target.value}]);
                            }}/>
                          </div>
                        </>
                      )}

                      {/* -------- SAÍDA: PROFISSIONAIS -------- */}
                      {tipoRegistro === "Saída" && subtipo === "Pagamento para profissionais" && (
                        <>
                          <div className="opcional">
                            <div className="opcional-bloco">
                              <div>
                                <label>Profissional</label>
                                <input type="text" onChange={(e)=>setProfPagamentos([{nome:e.target.value, valor:"", data:"", observacoes:""}])}/>
                              </div>
                              <div>
                                <label>Valor (R$)</label>
                                <input type="number" onChange={(e)=>setProfPagamentos(prev => prev.length ? [{...prev[0], valor:e.target.value}] : [{nome:"", valor:e.target.value, data:"", observacoes:""}])}/>
                              </div>
                              <div>
                                <label>Data</label>
                                <input type="date" onChange={(e)=>setProfPagamentos(prev => prev.length ? [{...prev[0], data:e.target.value}] : [{nome:"", valor:"", data:e.target.value, observacoes:""}])}/>
                              </div>
                            </div>
                            <label>Observações</label>
                            <textarea rows="2" onChange={(e)=>setProfPagamentos(prev => prev.length ? [{...prev[0], observacoes:e.target.value}] : [{nome:"", valor:"", data:"", observacoes:e.target.value}])}/>
                          </div>
                        </>
                      )}

                      {/* -------- SAÍDA: CONTAS / OUTROS -------- */}
                      {tipoRegistro === "Saída" && (subtipo === "Pagamento de contas" || subtipo === "Outros tipos de pagamento") && (
                        <>
                          <label>Descrição</label>
                          <input type="text" value={formData.procedimento}
                            onChange={(e)=>setFormData({...formData, procedimento:e.target.value})}/>
                          <label>Valor (R$)</label>
                          <input type="number" value={formData.valor_recebido}
                            onChange={(e)=>setFormData({...formData, valor_recebido:e.target.value})}/>
                          <label>Data do pagamento</label>
                          <input type="date" value={formData.data_pagamento}
                            onChange={(e)=>setFormData({...formData, data_pagamento:e.target.value})}/>
                          <label>Observações</label>
                          <textarea rows="2" value={formData.observacoes}
                            onChange={(e)=>setFormData({...formData, observacoes:e.target.value})}/>
                        </>
                      )}

                      {/* AÇÕES */}
                      <div className="modal-actions space-between" style={{ marginTop: 12 }}>
                        <button type="button" className="cancel-btn" onClick={()=>setStep(2)}>Voltar</button>
                        <button type="submit" className="save-btn" disabled={salvando}>
                          {salvando ? "Salvando..." : "Salvar"}
                        </button>
                      </div>

                      {sucesso && <p className="msg-sucesso">✅ Registro salvo com sucesso!</p>}
                    </>
                  )}
                </motion.form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>

      {/* DETALHES LATERAIS */}
      <AnimatePresence>
        {selectedTransaction && (
          <>
            {/* Fundo escuro */}
            <motion.div
              className="overlay-bg"
              onClick={() => setSelectedTransaction(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
            />

            {/* Painel */}
            <motion.div
              className="details-panel"
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              {/* ✅ AGORA O CONTEÚDO É EXIBIDO AQUI */}
              <TransactionDetailsPanel
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Financial;