import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../utils/supabaseClient";

import FiltrosPacientes from './filterPatients';
import '../styles/patientsStyles/listPatients.css';

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [menuAberto, setMenuAberto] = useState(null);
  const navigate = useNavigate();

  // 🔹 Buscar pacientes ao carregar a tela
  useEffect(() => {
    async function fetchPacientes() {
      try {
        const { data, error } = await supabase
          .from("pacientes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setPacientes(data || []);
        setPacientesFiltrados(data || []);
      } catch (error) {
        console.error("Erro ao buscar pacientes:", error.message);
      }
    }

    fetchPacientes();
  }, []);

  // 🔹 Aplicar filtros
  const aplicarFiltros = (nome) => {
    let filtrados = pacientes;

    if (nome) {
      filtrados = filtrados.filter(
        (p) => p.nome?.toLowerCase().includes(nome.toLowerCase())
      );
    }

    setPacientesFiltrados(filtrados);
  };

  // 🔹 Remover paciente no Supabase
  const removerPaciente = async (id) => {
    try {
      const { error } = await supabase
        .from("pacientes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      const novaLista = pacientes.filter((p) => p.id !== id);
      setPacientes(novaLista);
      setPacientesFiltrados(novaLista);
      setMenuAberto(null);
    } catch (err) {
      console.error("Erro ao remover paciente:", err.message);
    }
  };

  // 🔹 Visualizar paciente
  const visualizarPaciente = (id) => {
    navigate(`/paciente/${id}`);
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
              <div className="noPhoto">
                <img src={patient.foto || "/profile-icon.jpg"} alt={patient.nome} />
              </div>

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