import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { X, Pencil, Trash } from "lucide-react";

const TransactionDetailsPanel = ({ transaction, onClose, onEdit, onDelete }) => {
  const [siblings, setSiblings] = useState([]);

  // ✅ Formatador BRL (antes dava erro)
  const formatCurrency = (value) => {
    if (!value) return "R$ 0,00";
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // ✅ Busca outros registros do mesmo group_id (timeline)
  useEffect(() => {
    async function fetchRelated() {
      if (!transaction?.group_id) return;

      const { data, error } = await supabase
        .from("registros_financeiros")
        .select("*")
        .eq("group_id", transaction.group_id)
        .order("data_pagamento", { ascending: true });

      if (!error) setSiblings(data);
    }

    fetchRelated();
  }, [transaction]);

  if (!transaction) return null;

  return (
    <div className="panel-content">
      <div className="panel-header">
        <h3>Detalhes da Transação</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={22} />
        </button>
      </div>

      <div className="detail-item">
        <span>Tipo</span>
        <p>{transaction.tipo}</p>
      </div>

      <div className="detail-item">
        <span>Subtipo</span>
        <p>{transaction.subtipo}</p>
      </div>

      <div className="detail-item">
        <span>Valor</span>
        <p>{formatCurrency(transaction.valor)}</p>
      </div>

      <div className="detail-item">
        <span>Forma de pagamento</span>
        <p>{transaction.forma || "--"}</p>
      </div>

      <div className="detail-item">
        <span>Data</span>
        <p>{transaction.data}</p>
      </div>

      {/* ✅ Timeline */}
      {siblings.length > 1 && (
        <div className="documents-section">
          <h4>Timeline de pagamentos / repasses</h4>
          <ul className="timeline">
            {siblings.map((s) => (
              <li key={s.id}>
                <strong>{formatCurrency(s.valor_recebido)}</strong>
                <br />
                {s.tipo} — {s.subtipo}
                <br />
                <small>{s.data_pagamento?.split("-").reverse().join("/")}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botões de ação */}
      <div className="actions-list">
        <button className="details-btn green" onClick={() => onEdit(transaction)}>
          <Pencil size={16} /> Editar
        </button>
        <button className="details-btn gray" onClick={() => onDelete(transaction.id)}>
          <Trash size={16} /> Excluir
        </button>
      </div>
    </div>
  );
};

export default TransactionDetailsPanel;