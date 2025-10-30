import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";

import "../styles/patientsStyles/detailsPatients.css";

import PatientNotes from "../patientsComponents/notePatients";
import TabComponent from "../patientsComponents/situationPatients";
import FormPatientModal from "../patientsComponents/FormPatientModal";
import DocumentsManager from "../patientsComponents/DocumentsManager";

export default function PacienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState(null);
  const [secaoAtiva, setSecaoAtiva] = useState("dados");
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

      // ✅ Se o paciente tiver foto, gerar URL pública corretamente
      if (data.foto) {
        const { data: publicUrlData } = supabase
          .storage
          .from("pacientes_fotos") // 🪣 nome exato do seu bucket
          .getPublicUrl(data.foto);

        data.foto = publicUrlData.publicUrl;
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
          // ✅ Gera URL pública da foto se existir
          if (data.foto) {
            const { data: publicUrlData } = supabase
              .storage
              .from("pacientes_fotos") // 🪣 nome exato do seu bucket
              .getPublicUrl(data.foto);

            data.foto = publicUrlData.publicUrl;
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

  if (!paciente) {
    return <p>Carregando...</p>;
  }

  const objetivosMap = {
    abdomen_definido: "Abdômen mais definido",
    reducao_abdomen: "Redução de abdômen",
    reducao_flancos: "Redução de flancos",
    aumento_gluteos: "Aumento dos glúteos",
    reducao_gluteos: "Redução dos glúteos",
    reducao_coxas: "Redução da gordura das coxas",
    aumento_coxas: "Aumento das coxas (enxertia)",
    contorno_harmonico: "Contorno corporal mais harmônico",
    lipo_hd: "Lipo HD",
    aumento_mamas: "Aumento e firmeza das mamas",
    reducao_mamas: "Redução das mamas",
    mastopexia: "Mastopexia",
    rejuvenescimento: "Rejuvenescimento facial",
    cicatriz: "Correção de cicatriz",
    outros: "Outros",
  };

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
        {/* Cartão do paciente */}
        <div className="patientGeneralInfo">
          <div className="patientGeneralInfoEsq">
            <img
              src={paciente.foto || "/profile-icon.jpg"}
              alt={paciente.nome}
              className="paciente-foto"
            />
            <h4>{paciente.nome}</h4>

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

          <div className="patientGeneralInfoDir">
            {/* Botões de navegação */}
            <div className="tabs">
              <button
                className={secaoAtiva === "dados" ? "active" : ""}
                onClick={() => setSecaoAtiva("dados")}
              >
                Dados do paciente
              </button>
              <button
                className={secaoAtiva === "biotipo" ? "active" : ""}
                onClick={() => setSecaoAtiva("biotipo")}
              >
                Biotipo Corporal
              </button>
              <button
                className={secaoAtiva === "queixas" ? "active" : ""}
                onClick={() => setSecaoAtiva("queixas")}
              >
                Queixas e Objetivos
              </button>
              <button
                className={secaoAtiva === "historico" ? "active" : ""}
                onClick={() => setSecaoAtiva("historico")}
              >
                Histórico Clínico
              </button>
              <button
                className={secaoAtiva === "expectativas" ? "active" : ""}
                onClick={() => setSecaoAtiva("expectativas")}
              >
                Expectativas
              </button>
              <button
                className={secaoAtiva === "anotacoes" ? "active" : ""}
                onClick={() => setSecaoAtiva("anotacoes")}
              >
                Anotações Gerais
              </button>
              <button
                className={secaoAtiva === "indicacao" ? "active" : ""}
                onClick={() => setSecaoAtiva("indicacao")}
              >
                Indicação Cirúrgica
              </button>
            </div>

            {/* Conteúdo das abas */}
            {secaoAtiva === "dados" && (
              <div className="sectionPatientInfo">
                <h4>Dados do Paciente</h4>
                <p>
                  <b>Data da Anamnese:</b>{" "}
                  {paciente.data
                    ? new Date(paciente.data).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Não informado"}
                </p>
                <p><b>Sexo:</b> {paciente.sexo}</p>
                <p><b>Altura:</b> {paciente.altura}</p>
                <p><b>Peso:</b> {paciente.peso}</p>
                <p><b>IMC:</b> {paciente.imc}</p>
                <p><b>Telefone:</b> {paciente.telefone}</p>
                <p><b>Email:</b> {paciente.email}</p>
                <p><b>Profissão:</b> {paciente.profissao}</p>
                <p><b>Estado Civil:</b> {paciente.estadoCivil}</p>
              </div>
            )}

            {secaoAtiva === "biotipo" && (
              <div className="sectionPatientInfo">
                <h4>Biotipo Corporal e Medidas</h4>
                <p><b>Está acima do peso:</b> {paciente.acimaPes}</p>
                <p><b>Gordura visceral:</b> {paciente.gorduraVisceral}</p>
                <p><b>Formato corporal percebido:</b> {paciente.formatoCorporal}</p>
                <h4>Medidas</h4>
                <p><b>Busto:</b> {paciente.busto}</p>
                <p><b>Cintura:</b> {paciente.cintura}</p>
                <p><b>Quadril:</b> {paciente.quadril}</p>
                <p><b>Coxa:</b> {paciente.coxa}</p>
                <p><b>Panturrilha:</b> {paciente.panturrilha}</p>
              </div>
            )}

            {secaoAtiva === "queixas" && (
              <div className="sectionPatientInfo">
                <h4>Queixas e Objetivos Cirúrgicos</h4>
                <ul>
                  {(() => {
                    let objetivos = paciente.objetivos;

                    if (typeof objetivos === "string") {
                      try {
                        objetivos = JSON.parse(objetivos);
                      } catch {
                        objetivos = objetivos.split(",");
                      }
                    }

                    if (!Array.isArray(objetivos)) objetivos = [];

                    return objetivos.length > 0 ? (
                      objetivos.map((item, index) => (
                        <li key={index}>{objetivosMap[item.trim()] || item.trim()}</li>
                      ))
                    ) : (
                      <li>Nenhum objetivo informado</li>
                    );
                  })()}
                </ul>

                {paciente.outrosTexto && (
                  <>
                    <br />
                    <p>
                      <b>Descrição dos outros:</b> {paciente.outrosTexto}
                    </p>
                  </>
                )}
              </div>
            )}

            {secaoAtiva === "historico" && (
              <div className="sectionPatientInfo">
                <h4>Histórico Clínico e Cirúrgico</h4>
                <p><b>Já realizou alguma cirurgia?</b> {paciente.realizouCirurgia}</p>
                <p><b>Qual cirurgia?</b> {paciente.descricaoCirurgia}</p>
                <p><b>Houve complicações?</b> {paciente.complicacoes}</p>
                <p><b>Cicatrização anterior foi boa?</b> {paciente.cicatrizacao}</p>
                <p><b>Queloide?</b> {paciente.queloide}</p>
                <p><b>Possui alergias?</b> {paciente.alergias}</p>
                <p><b>Quais Alergias?</b> {paciente.descricaoAlergia}</p>
                <p><b>Quais medicamentos?</b> {paciente.medicamentos}</p>
                <p><b>Usa medicamento controlado?</b> {paciente.descricaoMedicamentos}</p>
                <p><b>Quais medicamentos?</b> {paciente.medicamentosControlados}</p>
                <p><b>Condições médicas atuais:</b> {paciente.condicoesMedicas}</p>
                <p><b>Fuma?</b> {paciente.fumante}</p>
                <p><b>Quantos por dia?</b> {paciente.fumanteQuantidade}</p>
                <p><b>Já fumou?</b> {paciente.jaFumou}</p>
                <p><b>Usa substâncias recreativas?</b> {paciente.substanciasRecreativas}</p>
                <p><b>Quais substâncias?</b> {paciente.descricaoSubstancias}</p>
                <p><b>Possui assimetria mamária?</b> {paciente.assimetriaMamaria}</p>
                <p><b>Alterações posturais?</b> {paciente.alteracoesPosturais}</p>
              </div>
            )}

            {secaoAtiva === "expectativas" && (
              <div className="sectionPatientInfo">
                <h4>Expectativas do Paciente</h4>
                <p>{paciente.expectativas}</p>
              </div>
            )}

            {secaoAtiva === "anotacoes" && (
              <div className="sectionPatientInfo">
                <h3>Anotações Gerais (para o médico)</h3>
                <p><b>QP:</b> {paciente.qp}</p>
                <p><b>HPP:</b> {paciente.hpp}</p>
                <p><b>Histórico de alergias/medicamentos:</b> {paciente.historicoAlergiasMedicamentos}</p>
                <p><b>Histórico cirúrgico:</b> {paciente.historicoCirurgico}</p>
                <p><b>Histórico ginecológico:</b> {paciente.historicoGinecologico}</p>
                <p><b>Qualidade da cicatriz:</b> {paciente.qualidadeCicatriz}</p>
                <p><b>Convênio:</b> {paciente.convenio}</p>
                <p><b>Indicação Cirúrgica:</b> {paciente.indicacaoCirurgica}</p>
                <p><b>Outras anotações:</b> {paciente.outrasAnotacoes}</p>
              </div>
            )}

            {secaoAtiva === "indicacao" && (
              <div className="sectionPatientInfo">
                <h4>Indicação Cirúrgica</h4>
                <p>{paciente.indicacaoCirurgica || "Nenhuma indicação registrada."}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notas */}
        <PatientNotes pacienteId={paciente.id} />

        {/* Situação */}
        <TabComponent pacienteId={paciente.id}/>

        {/* Documentos */}
        <div className="patientDocumentation">
          <DocumentsManager pacienteId={paciente.id} />
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
