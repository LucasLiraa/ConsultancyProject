import React, { useState, useEffect } from "react";
import '../styles/postOperativeStyles/SemanaPosOperatorio.css'

function SemanaPosOperatorio({ semanaId, dados, onSalvar, paciente }) {
  const [campos, setCampos] = useState(dados || {});
  const [altaConfirmada, setAltaConfirmada] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCampos((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSalvar = () => {
    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientes")) || [];
    const indexPaciente = pacientesSalvos.findIndex(p => p.id === paciente.id);

    if (indexPaciente !== -1) {
      const pacienteAtualizado = { ...pacientesSalvos[indexPaciente] };
      pacienteAtualizado.semanas = pacienteAtualizado.semanas || [];
      pacienteAtualizado.semanas[semanaId - 1] = campos;
      pacientesSalvos[indexPaciente] = pacienteAtualizado;
      localStorage.setItem("pacientes", JSON.stringify(pacientesSalvos));
      onSalvar(semanaId, campos); // Atualiza no componente pai também
    }
  };

  const handleAlta = () => {
    if (!altaConfirmada) return;

    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientes")) || [];
    const indexPaciente = pacientesSalvos.findIndex(p => p.id === paciente.id);

    if (indexPaciente !== -1) {
      pacientesSalvos[indexPaciente].alta = true;
      localStorage.setItem("pacientes", JSON.stringify(pacientesSalvos));
      alert("Alta confirmada e salva!");
    }
  };

  return (
    <div className="semanaPosContainer">
      <h3>Semana {semanaId}</h3>
      <label>
        Observações:
        <textarea name="observacoes" value={campos.observacoes || ""} onChange={handleChange} />
      </label>
      <button onClick={handleSalvar}>Salvar Semana</button>

      {semanaId >= 6 && !paciente.alta && (
        <div className="altaContainer">
          <label>
            <input
              type="checkbox"
              checked={altaConfirmada}
              onChange={(e) => setAltaConfirmada(e.target.checked)}
            />
            Confirmo que o paciente recebeu alta
          </label>
          <button onClick={handleAlta} disabled={!altaConfirmada}>
            Dar Alta
          </button>
        </div>
      )}
    </div>
  );
}

export default SemanaPosOperatorio;