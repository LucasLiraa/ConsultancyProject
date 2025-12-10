import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";

const BUCKET = "registros-uploads";

const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(n || 0)
  );

const parseBRL = (v) => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  const n = String(v).replace(/[R$\.\s]/g, "").replace(",", ".");
  const p = parseFloat(n);
  return Number.isNaN(p) ? 0 : p;
};

function formatCurrencyInput(value) {
  const numeric = value.replace(/\D/g, "");
  const floatVal = parseFloat(numeric) / 100;
  if (Number.isNaN(floatVal)) return "";
  return floatVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ✅ Corrigido: não aplica offset manual — mantém a data exata do input
function normalizeLocalDate(dateStr) {
  return dateStr || null;
}

const Toast = ({ message, type }) => (
  <div
    style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      background: type === "error" ? "#c0392b" : "#27ae60",
      color: "#fff",
      padding: "12px 18px",
      borderRadius: "8px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
      fontSize: "0.9rem",
      zIndex: 1000,
    }}
  >
    {message}
  </div>
);

export default function FinanceFormResumo({
  pacienteId,
  mode = "create",
  record = null,
  initialFinance = null,
  registros = [],
  onCancel,
  onSaved,
}) {
  const readOnly = mode === "view";
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  const [form, setForm] = useState({
    descricao_pagamento: "",
    valor_pago_agora: "",
    data_pagamento: "",
    forma_pagamento: "",
    mais_de_uma_forma: "nao",
    detalhes_pagamento: "",
    notaFiscalFile: null,
    comprovanteFile: null,
    observacoes: "",
    nota_fiscal_url: null,
    comprovante_url: null,
  });

  useEffect(() => {
    if (record) {
      setForm({
        descricao_pagamento: record.descricao_pagamento || "",
        valor_pago_agora: fmtBRL(record.valor_pago_agora ?? ""),
        data_pagamento: record.data_pagamento || "",
        forma_pagamento: record.forma_pagamento || "",
        mais_de_uma_forma: record.mais_de_uma_forma ? "sim" : "nao",
        detalhes_pagamento: record.detalhes_pagamento || "",
        notaFiscalFile: null,
        comprovanteFile: null,
        observacoes: record.observacoes || "",
        nota_fiscal_url: record.nota_fiscal_url || null,
        comprovante_url: record.comprovante_url || null,
      });
    }
  }, [record]);

  const outrosArray = Array.isArray(initialFinance?.outros_pagamentos_json)
    ? initialFinance.outros_pagamentos_json
    : [];

  // ✅ cálculo base idêntico ao formulário completo
  const aReceberBase = useMemo(() => {
    if (!initialFinance) return 0;
    const contrato = parseBRL(initialFinance.valor_contrato);
    const hosp = parseBRL(initialFinance.valor_hospital);
    const anes = parseBRL(initialFinance.valor_anestesista);
    const outrosPaciente = outrosArray
      .filter((o) => o?.responsavel === "paciente")
      .reduce((acc, o) => acc + parseBRL(o.valor), 0);
    const hDesc =
      initialFinance.responsavel_pagamento_hospital === "paciente" ? hosp : 0;
    const aDesc =
      initialFinance.responsavel_pagamento_anestesista === "paciente" ? anes : 0;
    return contrato - hDesc - aDesc - outrosPaciente;
  }, [initialFinance, outrosArray]);

  // ✅ Corrigido: não soma duas vezes o primeiro registro
  const totalRecebido = useMemo(() => {
    const inicial = parseBRL(initialFinance?.valor_recebido || 0);
    const adicionais = registros
        .filter((r) => r.tipo === "financeiro")
        .reduce((acc, cur) => acc + parseBRL(cur.valor_pago_agora || 0), 0);
    return inicial + adicionais;
    }, [initialFinance, registros]);

  const pendente = Math.max(aReceberBase - totalRecebido, 0);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (files) return setForm((p) => ({ ...p, [name]: files[0] }));
    if (name.startsWith("valor")) {
      setForm((p) => ({ ...p, [name]: formatCurrencyInput(value) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const uploadFile = async (file, prefix) => {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const path = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const updateInitialAccumulated = async (delta) => {
    if (!initialFinance?.id) return;
    const novoRecebido = totalRecebido + delta;
    const novoAReceber = Math.max(aReceberBase - novoRecebido, 0);
    await supabase
      .from("registros_pacientes")
      .update({
        valor_recebido: novoRecebido,
        valor_a_receber: novoAReceber,
      })
      .eq("id", initialFinance.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataCorrigida = normalizeLocalDate(form.data_pagamento);
    const valorPagoAgoraNumber = parseBRL(form.valor_pago_agora);

    const notaUrl = await uploadFile(form.notaFiscalFile, "notaFiscal");
    const compUrl = await uploadFile(form.comprovanteFile, "comprovante");

    const common = {
      paciente_id: pacienteId,
      tipo: "financeiro",
      descricao_pagamento: form.descricao_pagamento || null,
      valor_pago_agora: valorPagoAgoraNumber,
      data_pagamento: dataCorrigida,
      forma_pagamento: form.forma_pagamento || null,
      mais_de_uma_forma: form.mais_de_uma_forma === "sim",
      detalhes_pagamento:
        form.mais_de_uma_forma === "sim" ? form.detalhes_pagamento || null : null,
      nota_fiscal_url: notaUrl ?? form.nota_fiscal_url ?? null,
      comprovante_url: compUrl ?? form.comprovante_url ?? null,
      observacoes: form.observacoes || null,
    };

    if (mode === "edit" && record?.id) {
      const before = parseBRL(record.valor_pago_agora || 0);
      const delta = valorPagoAgoraNumber - before;
      const { error } = await supabase
        .from("registros_pacientes")
        .update(common)
        .eq("id", record.id);
      if (error) showToast("Erro ao atualizar registro", "error");
      else {
        await updateInitialAccumulated(delta);
        showToast("Registro atualizado!", "success");
        setTimeout(() => onSaved?.(), 1200);
      }
      return;
    }

    const { error } = await supabase.from("registros_pacientes").insert([common]);
    if (error) showToast("Erro ao salvar registro", "error");
    else {
      await updateInitialAccumulated(valorPagoAgoraNumber);
      showToast("Registro salvo com sucesso!", "success");
      setTimeout(() => onSaved?.(), 1200);
    }
  };

  return (
    <>
      {toast && <Toast {...toast} />}
      <form onSubmit={handleSubmit}>
        <div className="formCard">
          <h4>Resumo Financeiro</h4>
          <p>
            <strong>Valor total do contrato:</strong>{" "}
            {fmtBRL(initialFinance?.valor_contrato)} <br />
            <strong>Valor recebido até o momento:</strong> {fmtBRL(totalRecebido)} <br />
            <strong>Valor pendente:</strong> {fmtBRL(pendente)}
          </p>
        </div>

        <div className="formCard">
          <h4>Próximo pagamento</h4>
          <label>
            Descrição do pagamento
            <input
              name="descricao_pagamento"
              value={form.descricao_pagamento}
              onChange={onChange}
              disabled={readOnly}
            />
          </label>

          <label>
            Valor a ser pago agora (R$)
            <input
              name="valor_pago_agora"
              value={form.valor_pago_agora}
              onChange={onChange}
              disabled={readOnly}
            />
          </label>

          <label>
            Data do pagamento
            <input
                type="date"
                name="data_pagamento"
                value={form.data_pagamento || ""}
                onChange={onChange}
                disabled={readOnly}
                />
          </label>

          <div className="twoCols">
            <label>
              Forma de pagamento
              <select
                name="forma_pagamento"
                value={form.forma_pagamento}
                onChange={onChange}
                disabled={readOnly}
              >
                <option value="">Selecione</option>
                <option value="pix">Pix</option>
                <option value="boleto">Boleto</option>
                <option value="debito">Cartão Débito</option>
                <option value="credito">Cartão Crédito</option>
              </select>
            </label>

            <label>
              Mais de uma forma de pagamento?
              <select
                name="mais_de_uma_forma"
                value={form.mais_de_uma_forma}
                onChange={onChange}
                disabled={readOnly}
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </label>
          </div>

          {form.mais_de_uma_forma === "sim" && (
            <label>
              Detalhes das formas de pagamento
              <textarea
                name="detalhes_pagamento"
                value={form.detalhes_pagamento}
                onChange={onChange}
                disabled={readOnly}
              />
            </label>
          )}
        </div>

        <div className="formCard">
          <h4>Anexos e Observações</h4>
          <label>
            Nota fiscal
            <input type="file" name="notaFiscalFile" onChange={onChange} disabled={readOnly} />
            {form.nota_fiscal_url && (
              <a href={form.nota_fiscal_url} target="_blank" rel="noreferrer">
                Ver atual
              </a>
            )}
          </label>

          <label>
            Comprovante
            <input type="file" name="comprovanteFile" onChange={onChange} disabled={readOnly} />
            {form.comprovante_url && (
              <a href={form.comprovante_url} target="_blank" rel="noreferrer">
                Ver atual
              </a>
            )}
          </label>

          <label>
            Observações
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={onChange}
              disabled={readOnly}
            />
          </label>
        </div>

        <div className="formActions">
          {readOnly ? (
            <button type="button" onClick={onCancel}>
              Fechar
            </button>
          ) : (
            <>
              <button type="submit">Salvar</button>
              <button type="button" onClick={onCancel}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </form>
    </>
  );
}
