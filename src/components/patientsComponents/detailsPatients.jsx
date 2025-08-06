import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../styles/patientsStyles/detailsPatients.css';

import PatientNotes from '../patientsComponents/notePatients'
import PatientSituation from '../patientsComponents/situationPatients'
import TabComponent from "../patientsComponents/situationPatients";
export default function PacienteDetalhes() {
  const { id } = useParams(); // Obtém o ID do paciente da URL
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [selectedButton, setSelectedButton] = useState("inicio"); // Estado para botão selecionado

  useEffect(() => {
    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientes")) || [];
    const pacienteEncontrado = pacientesSalvos[id];
    if (pacienteEncontrado) {
      setPaciente(pacienteEncontrado);
    } else {
      navigate("/pacientes"); // Se o paciente não for encontrado, redireciona
    }
  }, [id, navigate]);

  // Função para manipular clique nos botões
  const handleButtonClick = (value) => {
    setSelectedButton(value);  
  };

  // Função para aplicar estilo no botão selecionado
  const getButtonStyle = (value) => {
    return value === selectedButton ? "selected" : "";
  };

  if (!paciente) {
    return <p>Carregando...</p>;
  }


  return (
    <div className="sectionPatientDetails">
      {/* Cabeçalho */}
      <div className="detailsPatientHeader">
        <div className="namePatientHeader">
          <i className="fa-solid fa-hospital-user"></i>
          <h3>{paciente.nome}</h3>
        </div>
        
        <div className="buttonsPatientHeader">
          <button className="buttonPatientHeader"><i class="fa fa-pen-to-square"></i>Editar paciente</button>
          <button className="buttonPatientHeader" onClick={() => navigate("/pacientes")}><i className="fa fa-chevron-right"></i></button>
        </div>
      </div>

      <div className="containerPatientDetails">

        {/* Cartão do paciente */}
        <div className="patientGeneralInfo">
          <div className="patientGeneralInfoEsq">
            <img
              src={paciente.foto || "https://via.placeholder.com/100"}
              alt={paciente.nome}
              className="paciente-foto"
            />
            <h4>{paciente.nome}</h4>
            <button>Editar Informações</button>
          </div>
        
          <div className="patientGeneralInfoDir">
           
            <div className="containerPatientInfo">
              <div className="contentPatientInfo">
                <span>Procedimentos realizados</span>
                <p>{paciente.procedimento}</p>
              </div>
              <div className="contentPatientInfo">
                <span>Data do contrato</span>
                <p>{paciente.dataContrato ? new Date(paciente.dataContrato).toLocaleDateString('pt-BR') : "Não informado"}</p>
              </div>
              <div className="contentPatientInfo">
                <span>Data da cirurgia</span>
                <p>{paciente.dataCirurgia ? new Date(paciente.dataCirurgia).toLocaleDateString('pt-BR') : "Não informado"}</p>
              </div>
            </div>
            <div className="containerPatientInfo">
              <div className="contentPatientInfo">
                <span>RG</span>
                <p>{paciente.rg}</p>
              </div>
              <div className="contentPatientInfo">
                <span>CPF</span>
                <p>{paciente.cpf}</p>
              </div>
              <div className="contentPatientInfo">
                <span>Data de Nascimento</span>
                <p>{paciente.dataNascimento ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR') : "Não informado"}</p>
              </div>
            </div>
            <div className="containerPatientInfo">
              <div className="contentPatientInfo">
                <span>Endereço</span>
                <p>{paciente.endereco}</p>
              </div>
              <div className="contentPatientInfo">
                <span>Cidade/UF</span>
                <p>{paciente.cidadeUF}</p>
              </div>
              <div className="contentPatientInfo">
                <span>CEP</span>
                <p>{paciente.cep}</p>
              </div>
            </div>
            <div className="containerPatientInfo">
              <div className="contentPatientInfo">
                <span>Profissão</span>
                <p>{paciente.profissao}</p>
              </div>
              <div className="contentPatientInfo">
                <span>Celular</span>
                <p>{paciente.celular}</p>
              </div>
              <div className="contentPatientInfo">
                <span>Situação</span>
                <p>{paciente.status}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Notas */} 
        <PatientNotes />

        {/* Situação */}
        <TabComponent />

        {/* Documentos */}
        <div className="patientDocumentation">
          <div className="patientDocumentationTitle">
            <h4>Arquivos/Documentos</h4>
            <button>Adicionar</button>
          </div>

          <div className="containerPatientDocumentation">

            <div className="contentPatientDocumentation">
              <div className="contentDocInfo">
                <i className="fa-solid fa-file-lines"></i>
                <p>Proposta de Adesão.pdf</p>
              </div>
              <div className="contentDocIcons">
                <i className="fa-solid fa-cloud-arrow-down"></i>
                <i className="fa-solid fa-trash-can"></i>
              </div>
            </div>

            <div className="contentPatientDocumentation">
              <div className="contentDocInfo">
                <i className="fa-solid fa-file-lines"></i>
                <p>Ficha Anamnese.pdf</p>
              </div>
              <div className="contentDocIcons">
                <i className="fa-solid fa-cloud-arrow-down"></i>
                <i className="fa-solid fa-trash-can"></i>
              </div>
            </div>

            <div className="contentPatientDocumentation">
              <div className="contentDocInfo">
                <i className="fa-solid fa-file-lines"></i>
                <p>Contrato Cirurgico.pdf</p>
              </div>
              <div className="contentDocIcons">
                <i className="fa-solid fa-cloud-arrow-down"></i>
                <i className="fa-solid fa-trash-can"></i>
              </div>
            </div>

            <div className="contentPatientDocumentation">
              <div className="contentDocInfo">
                <i className="fa-solid fa-file-lines"></i>
                <p>Orçamento Aprovado.pdf</p>
              </div>
              <div className="contentDocIcons">
                <i className="fa-solid fa-cloud-arrow-down"></i>
                <i className="fa-solid fa-trash-can"></i>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}


