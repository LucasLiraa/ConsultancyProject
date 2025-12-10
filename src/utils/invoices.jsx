import React, { useState, useEffect } from "react";
import FiltrosFinanceiros from "../components/InvoicesComponents/FiltrosFinanceiros";
import GraficoEvolucao from "../components/InvoicesComponents/GraficoEvolucao";
import RentabilidadeProcedimentos from "../components/InvoicesComponents/RentabilidadeProcedimentos";
import "./styles/invoices.css";

const Invoices = () => {
 
  return (
    <section className="sectionInvoices">
      <div className="invoices-container">
        <div className="top-section">
          <h1>Dashboard Financeiro</h1>
          <FiltrosFinanceiros filtros={filtros} setFiltros={setFiltros} />
        </div>

        <div className="kpi-cards">
          <div className="card destaque">
            <h2>Lucro Líquido</h2>
            <p>R$ {totais.lucro.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3>Faturamento</h3>
            <p>R$ {totais.faturamento.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3>Despesas</h3>
            <p>R$ {totais.despesas.toLocaleString()}</p>
          </div>
        </div>

        <GraficoEvolucao dados={dadosFiltrados} />

        <div className="bottom-section">
          <div className="historico-financeiro">
            <h2>Movimentações Recentes</h2>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Procedimento</th>
                  <th>Hospital</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map((item, i) => (
                  <tr
                    key={i}
                    className={item.tipo === "entrada" ? "entrada" : "saida"}
                  >
                    <td>{new Date(item.data).toLocaleDateString("pt-BR")}</td>
                    <td>{item.descricao}</td>
                    <td>{item.procedimento || "-"}</td>
                    <td>{item.hospital || "-"}</td>
                    <td>{item.tipo === "entrada" ? "Entrada" : "Saída"}</td>
                    <td>R$ {item.valor.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <RentabilidadeProcedimentos dados={dadosFiltrados} />
        </div>
      </div>
    </section>
  );
};

export default Invoices;