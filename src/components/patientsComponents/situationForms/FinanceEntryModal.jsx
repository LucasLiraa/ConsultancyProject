import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";

function normalizeLocalDate(dateStr) {
  // mantém yyyy-mm-dd como veio do input
  return dateStr || null;
}

function formatCurrencyInput(value) {
  const numeric = value.replace(/\D/g, "");
  const floatVal = parseFloat(numeric) / 100;
  if (Number.isNaN(floatVal)) return "";
  return floatVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseBRL(v) {
  if (!v) return 0;
  if (typeof v === "number") return v;
  const n = String(v).replace(/[R$\.\s]/g, "").replace(",", ".");
  const p = parseFloat(n);
  return Number.isNaN(p) ? 0 : p;
}

export default function FinanceEntryModal({ pacienteId, pacienteNome, record, onClose, onSaved }) {
  const isEdit = !!record?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    descricao: "",
    valor_recebido: "",
    data_pagamento: "",
    forma_pagamento: "Pix",
    status_pagamento: "Pago",
    observacoes: "",
    categoria: "",
    subtipo: "",
    procedimento: "",
  });

  useEffect(() => {
    if (!record) return;

    setForm({
      descricao: record.descricao || "",
      valor_recebido: record.valor_recebido ? formatCurrencyInput(String(record.valor_recebido)) : "",
      data_pagamento: record.data_pagamento || "",
      forma_pagamento: record.forma_pagamento || "Pix",
      status_pagamento: record.status_pagamento || "Pago",
      observacoes: record.observacoes || "",
      categoria: record.categoria || "",
      subtipo: record.subtipo || "",
      procedimento: record.procedimento || "",
    });
  }, [record]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "valor_recebido") {
      setForm((p) => ({ ...p, valor_recebido: formatCurrencyInput(value) }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!pacienteId) return;

    const valor = parseBRL(form.valor_recebido);
    if (!valor || valor <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    setSaving(true);

    const payload = {
      paciente_id: pacienteId,
      nome_paciente: pacienteNome || null,

      // fixo no perfil:
      tipo: "Entrada",

      descricao: form.descricao || null,
      procedimento: form.procedimento || null,
      subtipo: form.subtipo || null,
      categoria: form.categoria || null,

      forma_pagamento: form.forma_pagamento || null,
      status_pagamento: form.status_pagamento || null,
      data_pagamento: normalizeLocalDate(form.data_pagamento),

      valor_recebido: valor,

      observacoes: form.observacoes || null,
    };

    let resp;
    if (isEdit) {
      resp = await supabase
        .from("registros_financeiros")
        .update(payload)
        .eq("id", record.id);
    } else {
      resp = await supabase.from("registros_financeiros").insert(payload);
    }

    if (resp.error) {
      console.error("Erro ao salvar registro financeiro:", resp.error.message);
      alert("Erro ao salvar. Verifique os campos e tente novamente.");
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved?.();
  };

  return (
    <div className="pfModalOverlay" onMouseDown={onClose}>
      <div className="pfModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="pfModalHeader">
          <h3>{isEdit ? "Editar registro" : "Adicionar registro"}</h3>
          <button type="button" className="pfClose" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="pfForm" onSubmit={submit}>
          <div className="pfGrid">
            <label>
              Descrição
              <input
                name="descricao"
                value={form.descricao}
                onChange={onChange}
                placeholder="Ex.: Pagamento consulta / Parcela 1"
              />
            </label>

            <label>
              Procedimento (opcional)
              <input
                name="procedimento"
                value={form.procedimento}
                onChange={onChange}
                placeholder="Ex.: Rinoplastia"
              />
            </label>

            <label>
              Valor
              <input
                name="valor_recebido"
                value={form.valor_recebido}
                onChange={onChange}
                placeholder="R$ 0,00"
                inputMode="numeric"
              />
            </label>

            <label>
              Data do pagamento
              <input
                type="date"
                name="data_pagamento"
                value={form.data_pagamento}
                onChange={onChange}
              />
            </label>

            <label>
              Forma de pagamento
              <select name="forma_pagamento" value={form.forma_pagamento} onChange={onChange}>
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Débito</option>
                <option>Crédito</option>
                <option>Boleto</option>
                <option>Transferência</option>
              </select>
            </label>

            <label>
              Status
              <select name="status_pagamento" value={form.status_pagamento} onChange={onChange}>
                <option>Pago</option>
                <option>Pendente</option>
                <option>Parcial</option>
              </select>
            </label>

            <label>
              Categoria (opcional)
              <input
                name="categoria"
                value={form.categoria}
                onChange={onChange}
                placeholder="Ex.: Cirurgia / Consulta"
              />
            </label>

            <label>
              Subtipo (opcional)
              <input
                name="subtipo"
                value={form.subtipo}
                onChange={onChange}
                placeholder="Ex.: Parcela 1"
              />
            </label>

            <label className="pfFull">
              Observações
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={onChange}
                rows={3}
                placeholder="Opcional"
              />
            </label>
          </div>

          <div className="pfActions">
            <button type="button" className="pfBtn ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="pfBtn primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}