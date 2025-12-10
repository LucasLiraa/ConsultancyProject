// src/components/financialDashboard/SummaryCards.jsx

import React from "react";
import { motion } from "framer-motion";

const currency = (v) =>
  `R$ ${Number(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;

const SummaryCards = ({ data = {} }) => {
  // valores seguros com fallback
  const {
    entradas = 0,
    saidas = 0,
    saldo = 0,
  } = data;

  return (
    <motion.div
      className="summary-wrapper"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="summary-grid">
        {/* CARD PRINCIPAL (DISPONÍVEL) */}
        <motion.div
          className="summary-left available-card"
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <div className="card-header">
            <span className="dot dot-blue"></span>
            <h3>Disponível</h3>
          </div>

          <div className="amount-big">{currency(saldo)}</div>

          <div className="subinfo">
            <div>
              <span className="label">Entradas</span>
              <span className="value positive">{currency(entradas)}</span>
            </div>
            <div>
              <span className="label">Saídas</span>
              <span className="value negative">{currency(saidas)}</span>
            </div>
          </div>
        </motion.div>

        {/* CARDS MENORES EMPILHADOS */}
        <div className="summary-right">
          <motion.div
            className="mini-card"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            <div className="card-header">
              <span className="dot dot-green"></span>
              <h4>Entradas</h4>
            </div>
            <div className="amount">{currency(entradas)}</div>
            <div className="hint">Receitas do período selecionado</div>
          </motion.div>

          <motion.div
            className="mini-card"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.15 }}
          >
            <div className="card-header">
              <span className="dot dot-red"></span>
              <h4>Saídas</h4>
            </div>
            <div className="amount">{currency(saidas)}</div>
            <div className="hint">Despesas do período selecionado</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryCards;