import React from "react";
import "../styles/InvoicesStyles/FiltrosFinanceiros.css";

const FiltrosFinanceiros = ({ filtros, setFiltros }) => {
  return (
    <div className="filtros-container">
      {/* Filtro por período */}
      <div className="filtro-grupo">
        <label>Período:</label>
        <select
          value={filtros.periodo}
          onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
        >
          <option value="dia">Dia</option>
          <option value="semana">Semana</option>
          <option value="mes">Mês</option>
        </select>
      </div>

      {/* Filtro por procedimento */}
      <div className="filtro-grupo">
        <label>Procedimento:</label>
        <select
          value={filtros.procedimento}
          onChange={(e) =>
            setFiltros({ ...filtros, procedimento: e.target.value })
          }
        >
          <option value="">Todos</option>
          <option value="Lipo HD">Lipo HD</option>
          <option value="Abdominoplastia">Abdominoplastia</option>
          <option value="Mama com Prótese">Mama com Prótese</option>
        </select>
      </div>

      {/* Filtro por hospital */}
      <div className="filtro-grupo">
        <label>Hospital:</label>
        <select
          value={filtros.hospital}
          onChange={(e) => setFiltros({ ...filtros, hospital: e.target.value })}
        >
          <option value="">Todos</option>
          <option value="Hospital São Lucas">Hospital São Lucas</option>
          <option value="Hospital Santa Maria">Hospital Santa Maria</option>
          <option value="Hospital Estética Vida">Hospital Estética Vida</option>
        </select>
      </div>
    </div>
  );
};

export default FiltrosFinanceiros;