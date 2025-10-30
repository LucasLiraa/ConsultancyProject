import React from 'react';
import '../styles/budgetsStyles/EtapasFormulario.css'

import FormularioCirurgia from './Forms/FormularioCirurgia';
import FormularioHospital from './Forms/FormularioHospital';
import FormularioKitCirurgico from './Forms/FormularioKitCirurgico';
import FormularioMalhasCirurgicas from './Forms/FormularioMalhasCirurgicas';
import FormularioEquipeCirurgica from './Forms/FormularioEquipeCirurgica';
import FormularioDrenagens from './Forms/FormularioDrenagens';

const formulariosMap = {
  cirurgia: FormularioCirurgia,
  hospital: FormularioHospital,
  kitCirurgico: FormularioKitCirurgico,
  malhas: FormularioMalhasCirurgicas,
  equipe: FormularioEquipeCirurgica,
  drenagens: FormularioDrenagens,
};

const EtapasFormulario = ({ modulos, etapaAtual, formData, setFormData }) => {
  const modulo = modulos[etapaAtual];
  const FormularioComponente = formulariosMap[modulo];

  const handleChange = (dadosAtualizados) => {
    setFormData((prev) => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        ...dadosAtualizados,
      },
    }));
  };

  if (!FormularioComponente) {
    return (
      <div className="etapaFormularioContainerError">

      </div>
    );
  }

  return (
    <div className="etapaFormularioContainer">
      <FormularioComponente data={formData[modulo] || {}} onChange={handleChange} />
    </div>
  );
};

export default EtapasFormulario;
