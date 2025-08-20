import { useState, useEffect } from "react";
import "../styles/patientsStyles/formsPatients.css";

export default function FiltrosPacientes({ onFilter }) {
  const [statusSelecionado, setStatusSelecionado] = useState("");
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState("");

  useEffect(() => {
    onFilter(statusSelecionado, procedimentoSelecionado);
  }, [statusSelecionado, procedimentoSelecionado, onFilter]);

  const handleReset = () => {
    setStatusSelecionado("");
    setProcedimentoSelecionado("");
    onFilter("", "");
  };

  return (
    <div className="filterContainer">
      <span>Filtrar por:</span>

      <select
        value={statusSelecionado}
        onChange={(e) => setStatusSelecionado(e.target.value)}
      >
        <option value="">Situação</option>
        <option value="Em avaliação">Em avaliação</option>
        <option value="Aguardando Contrato">Aguardando Contrato</option>
        <option value="Em fechamento">Em fechamento</option>
        <option value="Aguardando Cirurgia">Aguardando Cirurgia</option>
        <option value="Operado(a)">Operado(a)</option>
        <option value="Em pós-operatório">Em pós-operatório</option>
      </select>

      <select
        value={procedimentoSelecionado}
        onChange={(e) => setProcedimentoSelecionado(e.target.value)}
      >
        <option value="">Procedimento</option>
        <option value="Prótese de Mama">Prótese de Mama</option>
        <option value="Lipoescultura">Lipoescultura</option>
        <option value="Abdominoplastia">Abdominoplastia</option>
        <option value="Mamoplastia">Mamoplastia</option>
        <option value="Lipo HD">Lipo HD</option>
        <option value="Blefaroplastia">Blefaroplastia</option>
      </select>

      <button onClick={handleReset}>Limpar Filtros</button>
    </div>
  );
}