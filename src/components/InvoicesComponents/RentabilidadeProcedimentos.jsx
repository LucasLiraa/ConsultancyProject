import React from "react";

const RentabilidadeProcedimentos = ({ dados }) => {
  // Agregando lucro por procedimento
  const ranking = {};
  dados.forEach((item) => {
    if (!item.procedimento) return;
    if (!ranking[item.procedimento]) ranking[item.procedimento] = { entrada: 0, saida: 0 };
    if (item.tipo === "entrada") ranking[item.procedimento].entrada += item.valor;
    else ranking[item.procedimento].saida += item.valor;
  });

  const rankingArray = Object.entries(ranking).map(([procedimento, valores]) => ({
    procedimento,
    faturamento: valores.entrada,
    despesas: valores.saida,
    lucro: valores.entrada - valores.saida,
    margem: ((valores.entrada - valores.saida) / valores.entrada) * 100 || 0,
  }));

  // Ordena por lucro decrescente
  rankingArray.sort((a, b) => b.lucro - a.lucro);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Ranking de Rentabilidade por Procedimento</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Procedimento</th>
            <th>Faturamento</th>
            <th>Despesas</th>
            <th>Lucro</th>
            <th>Margem %</th>
          </tr>
        </thead>
        <tbody>
          {rankingArray.map((item, i) => (
            <tr key={i}>
              <td>{item.procedimento}</td>
              <td>R$ {item.faturamento.toLocaleString()}</td>
              <td>R$ {item.despesas.toLocaleString()}</td>
              <td>R$ {item.lucro.toLocaleString()}</td>
              <td>{item.margem.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RentabilidadeProcedimentos;