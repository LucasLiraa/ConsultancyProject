<<<<<<< HEAD
import React from 'react';
import '../styles/budgetsStyles/SelecaoModulos.css';

const MODULOS = [
  { id: 'cirurgia', label: 'Valores de Cirurgia' },
  { id: 'hospital', label: 'Valores dos Hospitais' },
  { id: 'kitCirurgico', label: 'Kit Cirurgico e Serviços' },
  { id: 'malhas', label: 'Malhas Cirurgicas' },
  { id: 'equipe', label: 'Equipe Cirurgica' },
  { id: 'drenagens', label: 'Drenagens Pós-Operatório' },
];

const SelecaoModulos = ({ modulosSelecionados, setModulosSelecionados }) => {
  const toggleModulo = (id) => {
    setModulosSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter((mod) => mod !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="modulosContainer">
      <h3>Selecionar módulos do orçamento</h3>
      <ul>
        {MODULOS.map((modulo) => (
          <li key={modulo.id}>
            <label>
              <input
                type="checkbox"
                checked={modulosSelecionados.includes(modulo.id)}
                onChange={() => toggleModulo(modulo.id)}
              />
              {modulo.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

=======
import React from 'react';
import '../styles/budgetsStyles/SelecaoModulos.css';

const MODULOS = [
  { id: 'cirurgia', label: 'Valores de Cirurgia' },
  { id: 'hospital', label: 'Valores dos Hospitais' },
  { id: 'kitCirurgico', label: 'Kit Cirurgico e Serviços' },
  { id: 'malhas', label: 'Malhas Cirurgicas' },
  { id: 'equipe', label: 'Equipe Cirurgica' },
  { id: 'drenagens', label: 'Drenagens Pós-Operatório' },
];

const SelecaoModulos = ({ modulosSelecionados, setModulosSelecionados }) => {
  const toggleModulo = (id) => {
    setModulosSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter((mod) => mod !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="modulosContainer">
      <h3>Selecionar módulos do orçamento</h3>
      <ul>
        {MODULOS.map((modulo) => (
          <li key={modulo.id}>
            <label>
              <input
                type="checkbox"
                checked={modulosSelecionados.includes(modulo.id)}
                onChange={() => toggleModulo(modulo.id)}
              />
              {modulo.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
export default SelecaoModulos;