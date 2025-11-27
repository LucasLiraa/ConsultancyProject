import React, { useState, useEffect } from "react";
import "./styles/patients.css";

import ListaPacientes from "../components/patientsComponents/listPatients";

import { supabase } from "../utils/supabaseClient";

function Patients() {
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [pacientes, setPacientes] = useState([]);

  // 🔹 Buscar pacientes ao carregar
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const { data, error } = await supabase
          .from("pacientes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPacientes(data || []);
      } catch (err) {
        console.error("Erro ao buscar pacientes:", err.message);
      }
    };

    fetchPacientes();
  }, []);

  // 🔹 Atualizar pacientes (recarrega lista do Supabase)
  const atualizarPacientes = async (novos = null) => {
    try {
      if (novos) {
        setPacientes(novos);
      } else {
        const { data, error } = await supabase
          .from("pacientes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPacientes(data || []);
      }
    } catch (err) {
      console.error("Erro ao atualizar pacientes:", err.message);
    }
  };

  // 🔹 Adicionar paciente
  const adicionarPaciente = async (novoPaciente) => {
    try {
      const { data, error } = await supabase
        .from("pacientes")
        .insert([novoPaciente])
        .select();

      if (error) throw error;

      // adiciona à lista local sem precisar refazer fetch
      setPacientes((prev) => [...prev, ...data]);
    } catch (err) {
      console.error("Erro ao adicionar paciente:", err.message);
    }
  };

  return (
    <section className="sectionPatients">
      <div className="containerPatients">
        <ListaPacientes
          pacientes={pacientes}
          setPacientes={setPacientes}
          setPacienteEditando={setPacienteEditando}
        />
      </div>
    </section>
  );
}

export default Patients;