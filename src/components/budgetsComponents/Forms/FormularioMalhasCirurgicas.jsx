import React from 'react';
import '../../styles/budgetsStyles/FormulariosStyles.css';

const FormularioMalhasCirurgicas = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="formStep">
      <h2>5 - Kit Cirúrgico e Malhas</h2>

      <label>
        Tipo de Malha:
        <select
          name="tipoMalha"
          value={data.tipoMalha || ''}
          onChange={handleChange}
        >
          <option value="">Selecione</option>
          <option value="Malha Tipo 1">Malha Tipo 1</option>
          <option value="Malha Tipo 2">Malha Tipo 2</option>
          <option value="Malha Pós-Cirúrgica">Malha Pós-Cirúrgica</option>
          <option value="Outro">Outro</option>
        </select>
      </label>

      {data.tipoMalha === 'Outro' && (
        <label>
          Descrição da Malha:
          <input
            type="text"
            name="descricaoMalha"
            value={data.descricaoMalha || ''}
            onChange={handleChange}
            placeholder="Digite o nome do tipo de malha"
          />
        </label>
      )}

      <label>
        Valor da Malha (R$):
        <input
          type="number"
          name="valorMalha"
          value={data.valorMalha || ''}
          onChange={handleChange}
          min="0"
          placeholder="Ex: 350"
        />
      </label>
    </div>
  );
};

export default FormularioMalhasCirurgicas;