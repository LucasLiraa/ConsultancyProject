import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import "./styles/patients.css";

import Topbar from '../components/topbar';
import FormButton from '../components/patientsComponents/formsPatients';
import ListaPacientes from '../components/patientsComponents/listPatients';

function Patients() {
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    const fetchPacientes = async () => {
      const pacientesCollection = collection(db, 'pacientes');
      const pacientesSnapshot = await getDocs(pacientesCollection);
      const pacientesList = pacientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPacientes(pacientesList);
    };

    fetchPacientes();
  }, []);

  const atualizarPacientes = async (novos) => {
    setPacientes(novos);
    for (const paciente of novos) {
      const pacienteRef = doc(db, 'pacientes', paciente.id);
      await updateDoc(pacienteRef, paciente);
    }
  };

  const adicionarPaciente = async (novoPaciente) => {
    const pacientesCollection = collection(db, 'pacientes');
    await addDoc(pacientesCollection, novoPaciente);
    // Atualiza a lista de pacientes após adicionar
    setPacientes(prev => [...prev, novoPaciente]);
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
          adicionarPaciente={adicionarPaciente} // Passa a função para adicionar pacientes
        />
      </div>
    </section>
  );
}

export default Patients;