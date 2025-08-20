import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../utils/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import FiltrosPacientes from './filterPatients';
import '../styles/patientsStyles/listPatients.css';

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [menuAberto, setMenuAberto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const pacientesCollection = collection(db, 'pacientes');
        const pacientesSnapshot = await getDocs(pacientesCollection);
        const pacientesList = pacientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPacientes(pacientesList);
        setPacientesFiltrados(pacientesList);
      } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
      }
    };

    fetchPacientes();
  }, []);

  const aplicarFiltros = (nome) => {
    let filtrados = pacientes;

    if (nome) {
      filtrados = filtrados.filter(
        (p) => p.nome?.toLowerCase().includes(nome.toLowerCase())
      );
    }

    setPacientesFiltrados(filtrados);
  };
  const removerPaciente = async (id) => {
    await deleteDoc(doc(db, 'pacientes', id)); // Remove o paciente do Firestore
    const novaLista = pacientes.filter((p) => p.id !== id);
    setPacientes(novaLista);
    setPacientesFiltrados(novaLista);
    setMenuAberto(null); // Fecha o menu após ação
  };
  const visualizarPaciente = (id) => {
    navigate(`/paciente/${id}`); // Redireciona para a página do paciente
  };
  
  return (
    <div className="containerPatientsList">
      <FiltrosPacientes onFilter={aplicarFiltros} />
      <div className="listPatients">
        {pacientesFiltrados.length === 0 ? (
          <p>Nenhum paciente encontrado.</p>
        ) : (
          pacientesFiltrados.map((patient) => (
            <div key={patient.id} className="patientCard">
              <div className="noPhoto"><img src="/profile-icon.jpg"/></div>

              <div className="patientDetails">
                <h3>{patient.nome}</h3>
              </div>

              <div className="patientActions">
                <button 
                  className="actionsButton"
                  onClick={() => setMenuAberto(menuAberto === patient.id ? null : patient.id)}
                >
                  ⋯
                </button>

                {/* Menu suspenso */}
                {menuAberto === patient.id && (
                  <div className="dropdownMenu">
                    <button onClick={() => visualizarPaciente(patient.id)}>👁 Visualizar</button>
                    <button onClick={() => removerPaciente(patient.id)}>🗑 Remover</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}