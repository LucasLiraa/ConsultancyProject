import React, { useState, useEffect } from 'react';
import "./styles/patients.css";

import Topbar from '../components/topbar';
import FormButton from '../components/patientsComponents/btn_newPatients';
import ListaPacientes from '../components/patientsComponents/listPatients';

function Patients() {
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientes")) || [];
    setPacientes(pacientesSalvos);
  }, []);

  const atualizarPacientes = (novos) => {
    setPacientes(novos);
    localStorage.setItem("pacientes", JSON.stringify(novos));
  };

  return (
    <section className="sectionPatients">
      <Topbar showSearch={true} />

      <div className="containerPatients">
        <ListaPacientes 
          pacientes={pacientes} 
          setPacientes={atualizarPacientes} 
          setPacienteEditando={setPacienteEditando} 
        />
        <FormButton 
          pacienteEditando={pacienteEditando} 
          setPacienteEditando={setPacienteEditando}
          pacientes={pacientes}
          atualizarPacientes={atualizarPacientes}
        />
      </div>
    </section>
  );
}

export default Patients;