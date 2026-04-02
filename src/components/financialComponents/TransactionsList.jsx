import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "../styles/financialStyles/transactionsList.css";

export default function TransactionsList({ data, onSelect }) {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (id) => {
    if (openItem === id) return setOpenItem(null);
    setOpenItem(id);
  };

  const formatCurrency = (value) =>
    Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="transactions-container">
      <h3 className="transactions-title">Histórico de Transações</h3>

      <div className="transactions-header">
        <span>Data</span>
        <span>Descrição</span>
        <span>Tipo</span>
        <span>Valor</span>
        <span>Forma</span>
        <span></span>
      </div>

      <div className="transactions-list">
        {data.length === 0 ? (
          <p className="no-data">Nenhum registro encontrado.</p>
        ) : (
          data.map((item) => (
            <div key={item.id} className="transaction-item">
              <div className="transaction-row" onClick={() => toggleItem(item.id)}>
                <span>{item.data || "--"}</span>

                <span className="descricao">{item.descricao}</span>

                <span className={`tipo ${item.tipo === "Entrada" ? "entrada" : "saida"}`}>
                  {item.tipo}
                </span>

                <div className="valor-wrapper">
                  <span className="valor">{formatCurrency(item.valor)}</span>

                  {item.valor_pendente > 0 && (
                    <small className="pendente">
                      Pendente: {formatCurrency(item.valor_pendente)}
                    </small>
                  )}
                </div>

                <span>{item.forma}</span>

                <span className="icone">
                  {openItem === item.id ? <ChevronUp /> : <ChevronDown />}
                </span>
              </div>

              {/* OPCOES EXPANDIDAS */}
              {openItem === item.id && (
                <div className="transaction-options">
                  <button onClick={() => onSelect(item)}>
                    Ver detalhes
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}