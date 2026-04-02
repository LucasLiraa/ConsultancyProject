import React, { useState, useEffect } from 'react';
import '../../styles/budgetsStyles/FormulariosStyles.css';

const opcoesEquipe = [
  'Anestesista',
  'Instrumentadora',
  'Médico Auxiliar',
];

const FormularioEquipeCirurgica = ({ data, onChange }) => {
  const [selecionados, setSelecionados] = useState(data || {});
  const [somaTotal, setSomaTotal] = useState(0);

  useEffect(() => {
    const total = Object.values(selecionados).reduce((acc, item) => {
      const qtd = Number(item.quantidade || 0);
      const val = Number(item.valor || 0);
      return acc + qtd * val;
    }, 0);
    setSomaTotal(total);
  }, [selecionados]);

  const handleToggle = (item) => {
    const novo = { ...selecionados };
    if (novo[item]) {
      delete novo[item];
    } else {
      novo[item] = { quantidade: 1, valor: ''};
    }
    setSelecionados(novo);
    onChange(novo);
  };

  const handleInputChange = (item, field, value) => {
    const atualizado = {
      ...selecionados,
      [item]: {
        ...selecionados[item],
        [field]: value,
      },
    };
    setSelecionados(atualizado);
    onChange(atualizado);
  };

  return (
    <div className="formStep">
      <h2>4 - Equipe Cirúrgica</h2>

      {opcoesEquipe.map((item) => (
        <div key={item} className="checkboxRow">
          <label className="checkboxFlex">
            <input
              type="checkbox"
              checked={!!selecionados[item]}
              onChange={() => handleToggle(item)}
            />
            {item}
          </label>

          {selecionados[item] && (
            <div className="checkboxInputs">
              <input
                type="number"
                min="1"
                value={selecionados[item].quantidade}
                onChange={(e) =>
                  handleInputChange(item, 'quantidade', e.target.value)
                }
                placeholder="Qtd"
              />

              <input
                type="number"
                min="0"
                value={selecionados[item].valor}
                onChange={(e) =>
                  handleInputChange(item, 'valor', e.target.value)
                }
                placeholder="Valor R$"
              />
            </div>
          )}
        </div>
      ))}

      <div className="somaContainer">
        <strong>Total da Equipe: R$ {somaTotal.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default FormularioEquipeCirurgica;