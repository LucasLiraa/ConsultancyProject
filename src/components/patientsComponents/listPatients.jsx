import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FiltrosPacientes from './filterPatients';
import '../styles/patientsStyles/listPatients.css';

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [menuAberto, setMenuAberto] = useState(null); // Estado do menu suspenso
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientes")) || [];
    setPacientes(pacientesSalvos);
    setPacientesFiltrados(pacientesSalvos);
  }, []);

  const aplicarFiltros = (status, procedimento) => {
    let filtrados = pacientes;

    if (status) {
      filtrados = filtrados.filter(
        (p) => p.status?.toLowerCase() === status.toLowerCase()
      );
    }

    if (procedimento) {
      filtrados = filtrados.filter((p) => {
        const valor = p.procedimento?.toLowerCase().trim() || "";
        return valor.includes(procedimento.toLowerCase().trim());
      });
    }

    setPacientesFiltrados(filtrados);
  };

  // Função para remover paciente
  const removerPaciente = (index) => {
    const novaLista = pacientes.filter((_, i) => i !== index);
    setPacientes(novaLista);
    setPacientesFiltrados(novaLista);
    localStorage.setItem("pacientes", JSON.stringify(novaLista));
    setMenuAberto(null); // Fecha o menu após ação
  };

  const visualizarPaciente = (index) => {
    navigate(`/paciente/${index}`); // Redireciona para a página do paciente
  };
  
  return (
    <div className="containerPatientsList">
      <FiltrosPacientes onFilter={aplicarFiltros} />
      <div className="listPatients">
        {pacientesFiltrados.length === 0 ? (
          <p>Nenhum paciente encontrado.</p>
        ) : (
          pacientesFiltrados.map((patient, index) => (
            <div key={index} className="patientCard">
              {patient.foto ? (
                <img
                  src={patient.foto} // Removemos o URL.createObjectURL()
                  alt={patient.nome}
                  className="patientPhoto"
                />
              ) : (
                <div className="noPhoto">Sem Foto</div>
              )}

              <div className="patientDetails">
                <h3>{patient.nome}</h3>
                <p>{patient.celular} - {patient.procedimento}</p>
                <p>Contrato: {patient.dataContrato ? new Date(patient.dataContrato).toLocaleDateString('pt-BR') : "Não informado"} | 
                   Cirurgia: {patient.dataCirurgia ? new Date(patient.dataCirurgia).toLocaleDateString('pt-BR') : "Não informado"}</p>
              </div>

              <div className="patientActions">
                <span className={`status ${patient.status.toLowerCase()}`}>{patient.status}</span>
                <button 
                  className="actionsButton"
                  onClick={() => setMenuAberto(menuAberto === index ? null : index)}
                >
                  ⋯
                </button>

                {/* Menu suspenso */}
                {menuAberto === index && (
                  <div className="dropdownMenu">
                    <button onClick={() => visualizarPaciente(index)}>👁 Visualizar</button>
                    <button onClick={() => removerPaciente(index)}>🗑 Remover</button>
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
