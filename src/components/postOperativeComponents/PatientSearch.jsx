import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";

const PatientSearch = ({ onSelectPatient }) => {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data } = await supabase
        .from("pacientes")
        .select("id, nome")
        .ilike("nome", `%${query}%`);
      setPatients(data || []);
    };
    if (query.length > 1) fetchPatients();
  }, [query]);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Buscar Paciente</h2>
      <input
        className="border rounded p-2 w-full"
        placeholder="Digite o nome do paciente"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className="mt-4 space-y-2">
        {patients.map((p) => (
          <li
            key={p.id}
            className="p-2 border rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelectPatient(p)}
          >
            {p.nome}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientSearch;