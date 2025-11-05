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

  const [paciente, setPaciente] = useState({}); // estado inicial seguro
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

      // ✅ Se o paciente tiver foto, garantir URL pública e evitar cache
      if (data.foto) {
        if (!/^https?:\/\//.test(data.foto)) {
          const { data: publicUrlData } = supabase
            .storage
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
              const { data: publicUrlData } = supabase
                .storage
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
  // 🔹 Normaliza o campo de indicação cirúrgica assim que o paciente é carregado
  useEffect(() => {
    if (paciente?.indicacaocirurgica) {
      try {
        const parsed =
          typeof paciente.indicacaocirurgica === "string"
            ? JSON.parse(paciente.indicacaocirurgica)
            : paciente.indicacaocirurgica;

        // ✅ Atualiza o estado do paciente com a chave correta
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
  // 🔹 Mapa de objetivos cirúrgicos
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
              </div>
            )}

            {secaoAtiva === "biotipo" && (
              <div className="sectionPatientInfo">
                <h4>Biotipo Corporal e Medidas</h4>
                <p><b>Está acima do peso:</b> {paciente.acimaPeso}</p>
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

                  if (!objetivos) return <li>Nenhum objetivo informado</li>;

                  // 🔹 Corrige JSON duplamente serializado
                  try {
                    while (typeof objetivos === "string" && objetivos.includes("["))
                      objetivos = JSON.parse(objetivos);
                  } catch {
                    objetivos = objetivos.split(",").map((o) => o.trim());
                  }

                  // 🔹 Remove falsos valores e arrays vazios
                  if (!Array.isArray(objetivos) || objetivos.length === 0)
                    return <li>Nenhum objetivo informado</li>;

                  const validos = objetivos.filter(
                    (o) => o && o !== "null" && o !== "undefined" && o.trim() !== ""
                  );

                  if (validos.length === 0) return <li>Nenhum objetivo informado</li>;

                  return validos.map((item, index) => (
                    <li key={index}>{objetivosMap[item.trim()] || item.trim()}</li>
                  ));
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
                {paciente.realizouCirurgia === "Sim" && (
                  <>
                    <p><b>Qual cirurgia?</b> {paciente.descricaoCirurgia}</p>
                    <p><b>Houve complicações?</b> {paciente.complicacoes}</p>
                  </>
                )}

                <p><b>Cicatrização anterior foi boa?</b> {paciente.cicatrizacao}</p>
                <p><b>Queloide?</b> {paciente.queloide}</p>

                <p><b>Possui alergias?</b> {paciente.alergias}</p>
                {paciente.alergias === "Sim" && (
                  <p><b>Quais alergias?</b> {paciente.descricaoAlergia}</p>
                )}

                <p><b>Usa medicamentos?</b> {paciente.medicamentos}</p>
                {paciente.medicamentos === "Sim" && (
                  <p><b>Quais medicamentos?</b> {paciente.descricaoMedicamentos}</p>
                )}

                <p><b>Usa medicamento controlado?</b> {paciente.medicamentosControlados}</p>
                {paciente.medicamentosControlados === "Sim" && (
                  <p><b>Quais medicamentos controlados?</b> {paciente.descricaoMedicamentosControlados}</p>
                )}

                <p><b>Condições médicas atuais:</b> {paciente.condicoesMedicas}</p>

                <p><b>Fuma?</b> {paciente.fumante}</p>
                {paciente.fumante === "Sim" && (
                  <p><b>Quantos por dia?</b> {paciente.fumanteQuantidade}</p>
                )}

                <p><b>Já fumou?</b> {paciente.jaFumou}</p>

                <p><b>Usa substâncias recreativas?</b> {paciente.substanciasRecreativas}</p>
                {paciente.substanciasRecreativas === "Sim" && (
                  <p><b>Quais substâncias?</b> {paciente.descricaoSubstancias}</p>
                )}

                <p><b>Possui assimetria mamária?</b> {paciente.assimetriaMamaria}</p>
                <p><b>Alterações posturais?</b> {paciente.alteracoesPosturais}</p>
                {paciente.alteracoesPosturais === "Sim" && (
                  <p><b>Descrição:</b> {paciente.descricaoPosturais}</p>
                )}
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
                <p><b>Outras anotações:</b> {paciente.outrasAnotacoes}</p>
              </div>
            )}

            {secaoAtiva === "indicacao" && (
              <div className="sectionPatientInfo">
                <h3><i className="fa-solid fa-user-doctor"></i> Indicação Cirúrgica</h3>

                {paciente.indicacaoCirurgica ? (
                  <>
                    {/* BLOCO DE CATEGORIAS */}
                    <div className="indicacao-grid">
                      {[
                        ["Mamas", paciente.indicacaoCirurgica?.mamas],
                        ["Abdômen", paciente.indicacaoCirurgica?.abdomen],
                        ["Lipoaspiração / Lipoescultura", paciente.indicacaoCirurgica?.lipo],
                        ["Pernas e Glúteos", paciente.indicacaoCirurgica?.pernas_gluteos],
                        ["Braços", paciente.indicacaoCirurgica?.bracos],
                        ["Área Íntima", paciente.indicacaoCirurgica?.intima],
                      ].map(
                        ([titulo, lista], i) =>
                          lista && (
                            <div key={i} className="indicacao-card">
                              <h4>{titulo}</h4>
                              <ul>
                                {lista.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )
                      )}

                      {/* ÁREAS E TECNOLOGIAS DE LIPO */}
                      {paciente.indicacaoCirurgica?.lipo_areas && (
                        <div className="indicacao-card sub-card">
                          <h4>Áreas da Lipoescultura</h4>
                          <ul>
                            {paciente.indicacaoCirurgica?.lipo_areas.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {paciente.indicacaoCirurgica?.lipo_hd && (
                        <div className="indicacao-card sub-card">
                          <h4>Tecnologia Lipo HD</h4>
                          <ul>
                            {paciente.indicacaoCirurgica?.lipo_hd.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* BLOCO DE DETALHES */}
                    <div className="indicacao-details">
                      <h4><i className="fa-solid fa-notes-medical"></i> Detalhes da Cirurgia</h4>
                      <div className="indicacao-columns">
                        <p><strong>Número de Cirurgias:</strong> {paciente.indicacaoCirurgica?.num_cirurgias || "—"}</p>
                        <p><strong>Tempo Estimado:</strong> {paciente.indicacaoCirurgica?.tempo_cirurgia || "—"} horas</p>
                        <p><strong>Anestesia:</strong> {paciente.indicacaoCirurgica?.anestesia || "—"}</p>
                        <p><strong>Prótese:</strong> {paciente.indicacaoCirurgica?.protese_marca || "—"} - {paciente.indicacaoCirurgica?.protese_volume || "—"}ml</p>
                        <p><strong>Revestimento:</strong> {paciente.indicacaoCirurgica?.protese_revestimento || "—"}</p>
                        <p><strong>Perfil:</strong> {paciente.indicacaoCirurgica?.protese_perfil || "—"}</p>
                      </div>
                    </div>

                    {/* BLOCO DE EQUIPE */}
                    <div className="indicacao-details">
                      <h4><i className="fa-solid fa-user-nurse"></i> Equipe Cirúrgica</h4>
                      <p><strong>Auxiliar:</strong> {paciente.indicacaoCirurgica?.tem_auxiliar === "Sim" ? paciente.indicacaoCirurgica?.auxiliar_nome : "Não"}</p>
                      <p><strong>Instrumentadoras:</strong> {paciente.indicacaoCirurgica?.instrumentadoras || "—"}</p>
                    </div>

                    {/* BLOCO DE OBSERVAÇÕES */}
                    <div className="indicacao-observacoes">
                      <h4><i className="fa-solid fa-clipboard-list"></i> Observações Importantes</h4>
                      <p>{paciente.indicacaoCirurgica?.observacoes || "Nenhuma observação registrada."}</p>
                    </div>
                  </>
                ) : (
                  <p>Nenhuma indicação registrada.</p>
                )}
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