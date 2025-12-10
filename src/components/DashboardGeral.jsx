<<<<<<< HEAD
import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import "./styles/DashboardGeral.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardGeral = () => {
  const [periodo, setPeriodo] = useState("Todos");

  // Dados mockados (Operacional)
  const dadosInternos = [
    { titulo: "Aguardando cirurgia", quantidade: 12, cor: "#7b68ee" },
    { titulo: "Aguardando exames", quantidade: 8, cor: "#ff7f50" },
    { titulo: "Aguardando resultados", quantidade: 6, cor: "#ffa500" },
    { titulo: "Em recuperação", quantidade: 10, cor: "#20b2aa" },
    { titulo: "Alta liberada", quantidade: 4, cor: "#2e8b57" }
  ];

  // Dados mockados (Jurídico / Documental)
  const dadosJuridicos = [
    { titulo: "Aguardando orçamento", quantidade: 9, cor: "#4682b4" },
    { titulo: "Aguardando contrato", quantidade: 7, cor: "#9370db" },
    { titulo: "Aguardando pagamento de entrada", quantidade: 5, cor: "#ffa07a" },
    { titulo: "Pagamento pendente", quantidade: 4, cor: "#ff6347" },
    { titulo: "Contrato finalizado", quantidade: 6, cor: "#3cb371" }
  ];

  const totalInternos = dadosInternos.reduce((acc, item) => acc + item.quantidade, 0);
  const totalJuridicos = dadosJuridicos.reduce((acc, item) => acc + item.quantidade, 0);

  // Máximo valor para escalar as barras
  const maxValor = Math.max(...dadosJuridicos.map((d) => d.quantidade));

  const chartOptions = {
    cutout: "75%",
    plugins: { legend: { display: false } }
  };

  return (
    <div className="dashboardContainer">
      {/* Painel ESQUERDO */}
      <div className="dashboardCard">
        <div className="dashboardHeader">
          <h3>Fluxo Operacional</h3>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option>Todos</option>
            <option>Ano</option>
            <option>Semestre</option>
            <option>Trimestre</option>
            <option>Mês</option>
          </select>
        </div>

        <div className="dashboardContent">
          <div className="chartContainer">
            <Doughnut
              data={{
                labels: dadosInternos.map((d) => d.titulo),
                datasets: [
                  {
                    data: dadosInternos.map((d) => d.quantidade),
                    backgroundColor: dadosInternos.map((d) => d.cor)
                  }
                ]
              }}
              options={chartOptions}
            />
            <div className="chartCenter">
              <h2>{totalInternos}</h2>
              <p>Pacientes</p>
            </div>
          </div>

          <div className="chartLegend">
            {dadosInternos.map((item, index) => (
              <div className="legendItem" key={index}>
                <span
                  className="legendColor"
                  style={{ backgroundColor: item.cor }}
                ></span>
                <p>{item.titulo}</p>
                <strong>{item.quantidade}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel DIREITO (barras proporcionais à quantidade) */}
      <div className="dashboardCard">
        <div className="dashboardHeader">
          <h3>Fluxo Jurídico / Documental</h3>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option>Todos</option>
            <option>Ano</option>
            <option>Semestre</option>
            <option>Trimestre</option>
            <option>Mês</option>
          </select>
        </div>

        <div className="dashboardProgressContainer">

          <div className="progressList">
            {dadosJuridicos.map((item, index) => {
              // Escala da barra com base na quantidade máxima
              const largura = (item.quantidade / maxValor) * 100;
              return (
                <div className="progressItem" key={index}>
                  <div className="progressTop">
                    <span>{item.titulo}</span>
                    <span>{item.quantidade}</span>
                  </div>
                  <div className="progressBar">
                    <div
                      className="progressFill"
                      style={{
                        width: `${largura}%`,
                        backgroundColor: item.cor
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

=======
import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import "./styles/DashboardGeral.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardGeral = () => {
  const [periodo, setPeriodo] = useState("Todos");

  // Dados mockados (Operacional)
  const dadosInternos = [
    { titulo: "Aguardando cirurgia", quantidade: 12, cor: "#7b68ee" },
    { titulo: "Aguardando exames", quantidade: 8, cor: "#ff7f50" },
    { titulo: "Aguardando resultados", quantidade: 6, cor: "#ffa500" },
    { titulo: "Em recuperação", quantidade: 10, cor: "#20b2aa" },
    { titulo: "Alta liberada", quantidade: 4, cor: "#2e8b57" }
  ];

  // Dados mockados (Jurídico / Documental)
  const dadosJuridicos = [
    { titulo: "Aguardando orçamento", quantidade: 9, cor: "#4682b4" },
    { titulo: "Aguardando contrato", quantidade: 7, cor: "#9370db" },
    { titulo: "Aguardando pagamento de entrada", quantidade: 5, cor: "#ffa07a" },
    { titulo: "Pagamento pendente", quantidade: 4, cor: "#ff6347" },
    { titulo: "Contrato finalizado", quantidade: 6, cor: "#3cb371" }
  ];

  const totalInternos = dadosInternos.reduce((acc, item) => acc + item.quantidade, 0);
  const totalJuridicos = dadosJuridicos.reduce((acc, item) => acc + item.quantidade, 0);

  // Máximo valor para escalar as barras
  const maxValor = Math.max(...dadosJuridicos.map((d) => d.quantidade));

  const chartOptions = {
    cutout: "75%",
    plugins: { legend: { display: false } }
  };

  return (
    <div className="dashboardContainer">
      {/* Painel ESQUERDO */}
      <div className="dashboardCard">
        <div className="dashboardHeader">
          <h3>Fluxo Operacional</h3>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option>Todos</option>
            <option>Ano</option>
            <option>Semestre</option>
            <option>Trimestre</option>
            <option>Mês</option>
          </select>
        </div>

        <div className="dashboardContent">
          <div className="chartContainer">
            <Doughnut
              data={{
                labels: dadosInternos.map((d) => d.titulo),
                datasets: [
                  {
                    data: dadosInternos.map((d) => d.quantidade),
                    backgroundColor: dadosInternos.map((d) => d.cor)
                  }
                ]
              }}
              options={chartOptions}
            />
            <div className="chartCenter">
              <h2>{totalInternos}</h2>
              <p>Pacientes</p>
            </div>
          </div>

          <div className="chartLegend">
            {dadosInternos.map((item, index) => (
              <div className="legendItem" key={index}>
                <span
                  className="legendColor"
                  style={{ backgroundColor: item.cor }}
                ></span>
                <p>{item.titulo}</p>
                <strong>{item.quantidade}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel DIREITO (barras proporcionais à quantidade) */}
      <div className="dashboardCard">
        <div className="dashboardHeader">
          <h3>Fluxo Jurídico / Documental</h3>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option>Todos</option>
            <option>Ano</option>
            <option>Semestre</option>
            <option>Trimestre</option>
            <option>Mês</option>
          </select>
        </div>

        <div className="dashboardProgressContainer">

          <div className="progressList">
            {dadosJuridicos.map((item, index) => {
              // Escala da barra com base na quantidade máxima
              const largura = (item.quantidade / maxValor) * 100;
              return (
                <div className="progressItem" key={index}>
                  <div className="progressTop">
                    <span>{item.titulo}</span>
                    <span>{item.quantidade}</span>
                  </div>
                  <div className="progressBar">
                    <div
                      className="progressFill"
                      style={{
                        width: `${largura}%`,
                        backgroundColor: item.cor
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
export default DashboardGeral;