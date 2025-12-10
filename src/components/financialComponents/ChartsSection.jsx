// src/components/financialComponents/ChartsSection.jsx

import React from "react";
import { Line, Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const ChartsSection = ({ data, chartType }) => {
  const isArray = Array.isArray(data); // ✅ garante que não exploda ao receber objeto

  // ============================================================
  // 📊 GRÁFICO DE LINHA (Evolução Financeira)
  // ============================================================
  const lineData = {
    labels: isArray ? data.map((t) => t.data) : [], // datas das transações
    datasets: [
      {
        label: "Valores (R$)",
        data: isArray ? data.map((t) => t.valor) : [],
        borderColor: "#00BFA6",
        backgroundColor: "rgba(0,191,166,0.15)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#00BFA6",
      },
    ],
  };

  // ============================================================
  // 🍩 GRÁFICO DE ROSCA (Distribuição de Gastos)
  // ============================================================
  const doughnutData = {
    labels: ["Próteses", "Hospitais", "Tecnologias", "Equipe"],
    datasets: [
      {
        data: !isArray
          ? [
              data.protese || 0,
              data.hospital || 0,
              data.equipamentos || 0,
              data.equipe || 0,
            ]
          : [0, 0, 0, 0],

        backgroundColor: ["#00BFA6", "#007AFF", "#8B5CF6", "#FF6B6B"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // ============================================================
  // ⚙️ CONFIGURAÇÕES VISUAIS (com altura respeitando 58vh)
  // ============================================================
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#475569",
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="chart-card">
      {chartType === "line" ? (
        <>
          <h4>Evolução Financeira</h4>
          <div className="chart-wrapper">
            <Line data={lineData} options={options} />
          </div>
        </>
      ) : (
        <>
          <h4>Distribuição de Gastos</h4>
          <div className="chart-wrapper">
            <Doughnut data={doughnutData} options={options} />
          </div>
        </>
      )}
    </div>
  );
};

export default ChartsSection;