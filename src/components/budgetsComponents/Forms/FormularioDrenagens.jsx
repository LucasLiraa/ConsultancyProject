<<<<<<< HEAD
import React from 'react';
import '../../styles/budgetsStyles/FormulariosStyles.css';

const FormularioDrenagens = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="formStep">
      <h2>Drenagens</h2>

      <label>
        Quantidade de Drenagens:
        <input
          type="number"
          name="quantidadeDrenagens"
          value={data.quantidadeDrenagens || ''}
          onChange={handleChange}
          min="0"
          placeholder="Ex: 3"
        />
      </label>

      <label>
        Valor Total das Drenagens (R$):
        <input
          type="number"
          name="valorTotalDrenagens"
          value={data.valorTotalDrenagens || ''}
          onChange={handleChange}
          min="0"
          placeholder="Ex: 1500"
        />
      </label>
    </div>
  );
};

export default FormularioDrenagens;
=======
import React from 'react';
import '../../styles/budgetsStyles/FormulariosStyles.css';

const FormularioDrenagens = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="formStep">
      <h2>Drenagens</h2>

      <label>
        Quantidade de Drenagens:
        <input
          type="number"
          name="quantidadeDrenagens"
          value={data.quantidadeDrenagens || ''}
          onChange={handleChange}
          min="0"
          placeholder="Ex: 3"
        />
      </label>

      <label>
        Valor Total das Drenagens (R$):
        <input
          type="number"
          name="valorTotalDrenagens"
          value={data.valorTotalDrenagens || ''}
          onChange={handleChange}
          min="0"
          placeholder="Ex: 1500"
        />
      </label>
    </div>
  );
};

export default FormularioDrenagens;
>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
