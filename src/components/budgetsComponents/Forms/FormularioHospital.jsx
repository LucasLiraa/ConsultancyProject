import React, { useState } from 'react';
import '../../styles/budgetsStyles/FormulariosStyles.css';

const FormularioHospital = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="formStep">
      <h2>Valor do Hospital</h2>

      <label>
        Selecione o Hospital:
        <select
          name="hospitalSelecionado"
          value={data.hospitalSelecionado || ''}
          onChange={handleChange}
        >
          <option value="">Selecione</option>
          <option value="Hospital Vila Mariana">Hospital Vila Mariana</option>
          <option value="Hospital Santa Sara">Hospital Santa Sara</option>
          <option value="Outro">Outro</option>
        </select>
      </label>

      {data.hospitalSelecionado === 'Outro' && (
        <label>
          Nome do Hospital:
          <input
            type="text"
            name="hospitalOutro"
            value={data.hospitalOutro || ''}
            onChange={handleChange}
            placeholder="Digite o nome do hospital"
          />
        </label>
      )}

      <label>
        Valor do Hospital (R$):
        <input
          type="number"
          name="valorHospital"
          value={data.valorHospital || ''}
          onChange={handleChange}
          min="0"
          placeholder="Ex: 5000"
        />
      </label>
    </div>
  );
};

export default FormularioHospital;
