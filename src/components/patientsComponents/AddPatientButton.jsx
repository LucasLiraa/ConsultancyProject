import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import FormPatientModal from "./FormPatientModal";
import "../styles/patientsStyles/formsPatients.css";

export default function AddPatientButton({ atualizarPacientes }) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
      <button className="btn_newPatients" onClick={() => setModalAberto(true)}>
        <FiUserPlus style={{ marginRight: 8 }} />
        Adicionar Paciente
      </button>

      {modalAberto && (
        <FormPatientModal
          setModalAberto={setModalAberto}
          atualizarPacientes={atualizarPacientes}
          // sem pacienteEditando => modo "adicionar"
        />
      )}
    </>
  );
}