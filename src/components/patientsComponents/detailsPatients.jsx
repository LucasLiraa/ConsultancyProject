import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";

import "../styles/patientsStyles/detailsPatients.css";

import TabComponent from "../patientsComponents/situationPatients";
import FormPatientModal from "../patientsComponents/FormPatientModal";
import DocumentsManager from "../patientsComponents/DocumentsManager";
import PatientVisitsCalendar from "../patientsComponents/PatientVisitsCalendar";

export default function PacienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState({}); // estado inicial seguro
  const [selectedButton, setSelectedButton] = useState("inicio");
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [pacientes, setPacientes] = useState([]);

  // 🔹 Atualiza lista e paciente após edição
  const atualizarPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // ✅ Se o paciente tiver foto, garantir URL pública e evitar cache
      if (data.foto) {
        if (!/^https?:\/\//.test(data.foto)) {
          const { data: publicUrlData } = supabase.storage
            .from("pacientes_fotos") // 🪣 nome exato do seu bucket
            .getPublicUrl(data.foto);
          data.foto = `${publicUrlData.publicUrl}?t=${Date.now()}`;
        } else {
          // força refresh do cache quando o registro é editado
          data.foto = `${data.foto}?t=${Date.now()}`;
        }
      }

      setPaciente(data);
    } catch (error) {
      console.error("Erro ao atualizar paciente:", error.message);
    }
  };

  // 🔹 Busca paciente específico ao abrir a página
  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const { data, error } = await supabase
          .from("pacientes")
          .select("*")
          .eq("id", id)
          .single();

      if (error || !data) {
        console.error("Erro ao buscar paciente:", error?.message);
        navigate("/pacientes");
      } else {
        // ✅ Gera URL pública da foto se existir (com cache-busting)
        if (data.foto) {
          if (!/^https?:\/\//.test(data.foto)) {
            const { data: publicUrlData } = supabase.storage
              .from("pacientes_fotos")
              .getPublicUrl(data.foto);
            data.foto = `${publicUrlData.publicUrl}?t=${Date.now()}`;
          } else {
            data.foto = `${data.foto}?t=${Date.now()}`;
          }
        }

        setPaciente(data);
      }
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
      navigate("/pacientes");
    }
  };

  fetchPaciente();
}, [id, navigate]);

  // 🔹 Normaliza o campo de indicação cirúrgica (mantido para compatibilidade futura)
  useEffect(() => {
    if (paciente?.indicacaocirurgica) {
      try {
        const parsed =
          typeof paciente.indicacaocirurgica === "string"
            ? JSON.parse(paciente.indicacaocirurgica)
            : paciente.indicacaocirurgica;

        setPaciente((prev) => ({
          ...prev,
          indicacaoCirurgica: parsed || {},
        }));
      } catch {
        setPaciente((prev) => ({
          ...prev,
          indicacaoCirurgica: {},
        }));
      }
    }
  }, [paciente?.indicacaocirurgica]);

  // 🔹 Enquanto carrega o paciente
  if (!paciente) {
    return <p>Carregando...</p>;
  }

  // Helper para data da anamnese
  const dataAnamneseFormatada = paciente.data
    ? new Date(paciente.data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="sectionPatientDetails">
      {/* Cabeçalho */}
      <div className="detailsPatientHeader">
        <div className="namePatientHeader">
          <i className="fa-solid fa-hospital-user"></i>
          <h3>{paciente.nome}</h3>
        </div>

        <div className="buttonsPatientHeader">
          <button
            className="buttonPatientHeader"
            type="button"
            onClick={() => {
              setPacienteEditando(paciente);
              setModalAberto(true);
            }}
          >
            <i className="fa fa-pen-to-square"></i> Editar paciente
          </button>

          <button
            className="buttonPatientHeader"
            type="button"
            onClick={() => navigate("/pacientes")}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="containerPatientDetails">
        {/* Bloco superior: informações + calendário + detalhes do dia */}
        <div className="patientOverviewRow">
          {/* Cartão do paciente / informações gerais */}
          <div className="patientGeneralInfo">
            <div className="patientGeneralInfoEsq">
              <img
                src={paciente?.foto || "/profile-icon.jpg"}
                alt={paciente?.nome || "Paciente"}
                className="paciente-foto"
              />
              <h4>{paciente?.nome || "Carregando..."}</h4>

              <button
                type="button"
                onClick={() => {
                  setPacienteEditando(paciente);
                  setModalAberto(true);
                }}
              >
                Editar Informações
              </button>
            </div>

            {/* Resumo ampliado */}
            <div className="patientGeneralInfoDir">
              <div className="sectionPatientInfo">
                <h4>Informações gerais</h4>
                <p>
                  <b>Situação atual:</b>{" "}
                  {paciente.situacao || paciente.status || "—"}
                </p>
                <p>
                  <b>Cirurgia principal:</b>{" "}
                  {paciente.cirurgia_principal || paciente.procedimento || "—"}
                </p>
                <p>
                  <b>Data da anamnese:</b> {dataAnamneseFormatada}
                </p>
                <p>
                  <b>Sexo:</b> {paciente.sexo || "—"}
                </p>
                <p>
                  <b>IMC:</b> {paciente.imc || "—"}
                </p>
                <p>
                  <b>Telefone:</b> {paciente.telefone || "—"}
                </p>
                <p>
                  <b>Email:</b> {paciente.email || "—"}
                </p>
                <p>
                  <b>Profissão:</b> {paciente.profissao || "—"}
                </p>

                {/* Botão extra para prontuário abaixo das infos */}
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={() => navigate(`/pacientes/${id}/prontuario`)}
                  style={{ marginTop: "1rem" }}
                >
                  <i className="fa-solid fa-file-medical"></i> Ver prontuário
                  completo
                </button>
              </div>
            </div>
          </div>

          {/* Calendário + detalhes do dia (novo componente) */}
          <PatientVisitsCalendar pacienteId={paciente.id} />
        </div>

        <div className="patientDetailsDown">        
          {/* Situação (já existente) */}
          <TabComponent pacienteId={paciente.id} />

          {/* Documentos (já existente) */}
          <div className="patientDocumentation">
            <DocumentsManager pacienteId={paciente.id} />
          </div>
        </div>
      </div>

      {/* Modal de edição funcional */}
      {modalAberto && (
        <FormPatientModal
          setModalAberto={setModalAberto}
          pacienteEditando={pacienteEditando}
          setPacienteEditando={setPacienteEditando}
          atualizarPacientes={atualizarPacientes}
        />
      )}
    </div>
  );
}