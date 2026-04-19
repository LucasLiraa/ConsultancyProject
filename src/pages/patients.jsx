import React, { useState, useEffect } from "react";
import "./styles/patients.css";

import ListaPacientes from "../components/patientsComponents/listPatients";

import { supabase } from "../utils/supabaseClient";

function Patients() {
  const [setPacienteEditando] = useState(null);
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