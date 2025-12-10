import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const GraficoEvolucao = ({ dados }) => {
  // Preparando dados agregados por dia/mês
  // Exemplo simples: [{data: '01/10', entrada: 12000, saida: 5000}, ...]
  const dadosAgregados = dados.reduce((acc, cur) => {
    const dataFormatada = new Date(cur.data).toLocaleDateString("pt-BR");
    const existente = acc.find((d) => d.data === dataFormatada);
    if (existente) {
      if (cur.tipo === "entrada") existente.entrada += cur.valor;
      else existente.saida += cur.valor;
    } else {
      acc.push({
        data: dataFormatada,
        entrada: cur.tipo === "entrada" ? cur.valor : 0,
        saida: cur.tipo === "saida" ? cur.valor : 0,
      });
    }
    return acc;
  }, []);

  return (
    <div style={{ width: "100%", height: 300, margin: "2rem 0" }}>
      <ResponsiveContainer>
        <LineChart data={dadosAgregados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" />
          <YAxis />
          <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
          <Legend />
          <Line type="monotone" dataKey="entrada" stroke="#4caf50" />
          <Line type="monotone" dataKey="saida" stroke="#c62828" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoEvolucao;