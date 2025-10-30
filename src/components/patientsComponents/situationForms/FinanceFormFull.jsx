import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";

const BUCKET = "registros-uploads";

const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));

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

// ✅ Data pura (sem timezone)
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

export default function FinanceFormFull({ pacienteId, mode = "create", record = null, onCancel, onSaved }) {
  const readOnly = mode === "view";
  const [form, setForm] = useState({
    descricao_pagamento: "",
    valor_contrato: "",
    valor_honorario: "",
    valor_hospital: "",
    responsavel_pagamento_hospital: "consultorio",
    valor_anestesista: "",
    responsavel_pagamento_anestesista: "consultorio",
    outros_pagamentos_json: [],
    valor_recebido: "",
    forma_pagamento: "",
    mais_de_uma_forma: "nao",
    detalhes_pagamento: "",
    data_pagamento: "",
    notaFiscalFile: null,
    comprovanteFile: null,
    observacoes: "",
    nota_fiscal_url: null,
    comprovante_url: null,
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    if (record) {
      setForm({
        ...form,
        descricao_pagamento: record.descricao_pagamento || "",
        valor_contrato: fmtBRL(record.valor_contrato ?? ""),
        valor_honorario: fmtBRL(record.valor_honorario ?? ""),
        valor_hospital: fmtBRL(record.valor_hospital ?? ""),
        responsavel_pagamento_hospital: record.responsavel_pagamento_hospital || "consultorio",
        valor_anestesista: fmtBRL(record.valor_anestesista ?? ""),
        responsavel_pagamento_anestesista: record.responsavel_pagamento_anestesista || "consultorio",
        outros_pagamentos_json: Array.isArray(record.outros_pagamentos_json)
          ? record.outros_pagamentos_json
          : [],
        valor_recebido: fmtBRL(record.valor_recebido ?? ""),
        forma_pagamento: record.forma_pagamento || "",
        mais_de_uma_forma: record.mais_de_uma_forma ? "sim" : "nao",
        detalhes_pagamento: record.detalhes_pagamento || "",
        data_pagamento: record.data_pagamento || "",
        observacoes: record.observacoes || "",
        nota_fiscal_url: record.nota_fiscal_url || null,
        comprovante_url: record.comprovante_url || null,
      });
    }
  }, [record]);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (files) return setForm((p) => ({ ...p, [name]: files[0] }));
    if (name.startsWith("valor")) setForm((p) => ({ ...p, [name]: formatCurrencyInput(value) }));
    else setForm((p) => ({ ...p, [name]: value }));
  };

  const addOutro = () =>
    setForm((p) => ({
      ...p,
      outros_pagamentos_json: [...p.outros_pagamentos_json, { titulo: "", valor: "", responsavel: "consultorio" }],
    }));

  const updateOutro = (idx, field, value) =>
    setForm((p) => {
      const arr = [...p.outros_pagamentos_json];
      if (field === "valor") value = formatCurrencyInput(value);
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...p, outros_pagamentos_json: arr };
    });

  const removeOutro = (idx) =>
    setForm((p) => {
      const arr = [...p.outros_pagamentos_json];
      arr.splice(idx, 1);
      return { ...p, outros_pagamentos_json: arr };
    });

  const totalOutros = useMemo(
    () => form.outros_pagamentos_json.reduce((acc, it) => acc + parseBRL(it.valor), 0),
    [form.outros_pagamentos_json]
  );

  const aReceberBase = useMemo(() => {
    const contrato = parseBRL(form.valor_contrato);
    const hosp = parseBRL(form.valor_hospital);
    const anes = parseBRL(form.valor_anestesista);
    const outrosPaciente = form.outros_pagamentos_json
      .filter((o) => o.responsavel === "paciente")
      .reduce((acc, o) => acc + parseBRL(o.valor), 0);
    const hDesc = form.responsavel_pagamento_hospital === "paciente" ? hosp : 0;
    const aDesc = form.responsavel_pagamento_anestesista === "paciente" ? anes : 0;
    return contrato - hDesc - aDesc - outrosPaciente;
  }, [form]);

  const valorRecebidoNumber = parseBRL(form.valor_recebido);
  const valor_a_receber = Math.max(aReceberBase - valorRecebidoNumber, 0);

  const uploadFile = async (file, prefix) => {
    if (!file) return null;
    const ext = file.name.split(".").pop();
    const path = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pacienteId) return;
    setSaving(true);

    const notaUrl = await uploadFile(form.notaFiscalFile, "notaFiscal");
    const compUrl = await uploadFile(form.comprovanteFile, "comprovante");
    const dataCorrigida = normalizeLocalDate(form.data_pagamento);

    const payload = {
      paciente_id: pacienteId,
      tipo: "financeiro",
      descricao_pagamento: form.descricao_pagamento || null,
      valor_contrato: parseBRL(form.valor_contrato),
      valor_honorario: parseBRL(form.valor_honorario),
      valor_hospital: parseBRL(form.valor_hospital),
      responsavel_pagamento_hospital: form.responsavel_pagamento_hospital,
      valor_anestesista: parseBRL(form.valor_anestesista),
      responsavel_pagamento_anestesista: form.responsavel_pagamento_anestesista,
      outros_pagamentos_json: form.outros_pagamentos_json.map((o) => ({
        titulo: o.titulo || null,
        valor: parseBRL(o.valor),
        responsavel: o.responsavel || "consultorio",
      })),
      valor_total_outros: totalOutros,
      valor_recebido: valorRecebidoNumber,
      valor_a_receber,
      forma_pagamento: form.forma_pagamento || null,
      mais_de_uma_forma: form.mais_de_uma_forma === "sim",
      detalhes_pagamento: form.mais_de_uma_forma === "sim" ? form.detalhes_pagamento || null : null,
      data_pagamento: dataCorrigida,
      nota_fiscal_url: notaUrl ?? form.nota_fiscal_url ?? null,
      comprovante_url: compUrl ?? form.comprovante_url ?? null,
      observacoes: form.observacoes || null,
    };

    const query =
      mode === "edit" && record?.id
        ? supabase.from("registros_pacientes").update(payload).eq("id", record.id)
        : supabase.from("registros_pacientes").insert([payload]);

    const { error } = await query;
    setSaving(false);
    if (error) showToast("Erro ao salvar registro.", "error");
    else {
      showToast("Registro salvo com sucesso!", "success");
      setTimeout(() => onSaved?.(), 1200);
    }
  };

  return (
    <>
      {toast && <Toast {...toast} />}
      <form onSubmit={handleSubmit}>
        <div className="formCard">
          <h4>Informações do Pagamento</h4>
          <label>
            Descrição do pagamento
            <input
              name="descricao_pagamento"
              value={form.descricao_pagamento}
              onChange={onChange}
              disabled={readOnly}
            />
          </label>
        </div>

        <div className="formCard">
          <h4>Valores principais</h4>
          <div className="twoCols">
            <label>
              Valor total do contrato (R$)
              <input name="valor_contrato" value={form.valor_contrato} onChange={onChange} />
            </label>
            <label>
              Valor total honorário (R$)
              <input name="valor_honorario" value={form.valor_honorario} onChange={onChange} />
            </label>
          </div>

          <div className="twoCols">
            <label>
              Valor do hospital (R$)
              <input name="valor_hospital" value={form.valor_hospital} onChange={onChange} />
            </label>
            <label>
              Pagamento do hospital realizado por quem?
              <select
                name="responsavel_pagamento_hospital"
                value={form.responsavel_pagamento_hospital}
                onChange={onChange}
              >
                <option value="consultorio">Consultório</option>
                <option value="paciente">Paciente</option>
              </select>
            </label>
          </div>

          <div className="twoCols">
            <label>
              Valor da anestesista (R$)
              <input name="valor_anestesista" value={form.valor_anestesista} onChange={onChange} />
            </label>
            <label>
              Pagamento da anestesista realizado por quem?
              <select
                name="responsavel_pagamento_anestesista"
                value={form.responsavel_pagamento_anestesista}
                onChange={onChange}
              >
                <option value="consultorio">Consultório</option>
                <option value="paciente">Paciente</option>
              </select>
            </label>
          </div>
        </div>

        <div className="formCard">
          <h4>Outros pagamentos</h4>
          {form.outros_pagamentos_json.map((o, i) => (
            <div key={i} className="twoCols">
              <label>
                Descrição
                <input
                  value={o.titulo}
                  onChange={(e) => updateOutro(i, "titulo", e.target.value)}
                />
              </label>
              <label>
                Valor (R$)
                <input value={o.valor} onChange={(e) => updateOutro(i, "valor", e.target.value)} />
              </label>
              <label>
                Responsável
                <select
                  value={o.responsavel}
                  onChange={(e) => updateOutro(i, "responsavel", e.target.value)}
                >
                  <option value="consultorio">Consultório</option>
                  <option value="paciente">Paciente</option>
                </select>
              </label>
              <button type="button" onClick={() => removeOutro(i)}>
                Remover
              </button>
            </div>
          ))}
          <button type="button" onClick={addOutro}>
            Adicionar outro pagamento
          </button>
          <p>
            <strong>Total outros:</strong> {fmtBRL(totalOutros)}
          </p>
        </div>

        <div className="formCard">
          <h4>Recebimentos</h4>
          <div className="twoCols">
            <label>
              Valor recebido até o momento (R$)
              <input name="valor_recebido" value={form.valor_recebido} onChange={onChange} />
            </label>
            <label>
              Valor ainda a receber (R$)
              <input value={fmtBRL(valor_a_receber)} readOnly />
            </label>
          </div>
        </div>

        <div className="formCard">
          <h4>Detalhes</h4>
          <div className="twoCols">
            <label>
              Forma de pagamento
              <select
                name="forma_pagamento"
                value={form.forma_pagamento}
                onChange={onChange}
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
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </label>
          </div>
          {form.mais_de_uma_forma === "sim" && (
            <label>
              Detalhes das formas
              <textarea
                name="detalhes_pagamento"
                value={form.detalhes_pagamento}
                onChange={onChange}
              />
            </label>
          )}
          <label>
            Data do pagamento
            <input
              type="date"
              name="data_pagamento"
              value={form.data_pagamento || ""}
              onChange={onChange}
            />
           </label>
        </div>

        <div className="formCard">
          <h4>Anexos</h4>
          <label>
            Nota fiscal
            <input type="file" name="notaFiscalFile" onChange={onChange} />
            {form.nota_fiscal_url && (
              <a href={form.nota_fiscal_url} target="_blank" rel="noreferrer">
                Ver atual
              </a>
            )}
          </label>
          <label>
            Comprovante
            <input type="file" name="comprovanteFile" onChange={onChange} />
            {form.comprovante_url && (
              <a href={form.comprovante_url} target="_blank" rel="noreferrer">
                Ver atual
              </a>
            )}
          </label>
        </div>

        <div className="formCard">
          <h4>Observações</h4>
          <textarea name="observacoes" value={form.observacoes} onChange={onChange} />
        </div>

        <div className="formActions">
          <button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}