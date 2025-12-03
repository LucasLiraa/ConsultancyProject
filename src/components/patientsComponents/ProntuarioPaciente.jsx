import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/patientsStyles/ProntuarioPaciente.css";

// Helper para formatar data de nascimento + idade
const formatDataNascimento = (isoDate) => {
  if (!isoDate) return "—";
  const data = new Date(isoDate);
  const hoje = new Date();

  let idade = hoje.getFullYear() - data.getFullYear();
  const m = hoje.getMonth() - data.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < data.getDate())) {
    idade--;
  }

  const dataFormatada = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `${dataFormatada} (${idade} anos)`;
};

// Configuração dos módulos do prontuário (os 9 itens que você listou)
const prontuarioModules = [
  {
    id: "anamnese",
    title: "Ficha de anamnese",
    type: "documento",
    status: "completo",
    shortDescription: "Histórico clínico, comorbidades e avaliação inicial.",
  },
  {
    id: "indicacao",
    title: "Indicação cirúrgica",
    type: "documento",
    status: "parcial",
    shortDescription: "Registro da indicação cirúrgica e planos de procedimento.",
  },
  {
    id: "termos_cirurgicos",
    title: "Termos cirúrgicos",
    type: "documento",
    status: "pendente",
    shortDescription: "Termos específicos de cada procedimento.",
  },
  {
    id: "termo_consentimento",
    title: "Termo de consentimento",
    type: "documento",
    status: "pendente",
    shortDescription: "Consentimento informado do paciente para o ato cirúrgico.",
  },
  {
    id: "pedido_exames",
    title: "Pedido de exames",
    type: "documento",
    status: "completo",
    shortDescription: "Solicitação de exames pré-operatórios.",
  },
  {
    id: "controle_exames",
    title: "Controle de entrega de exames",
    type: "documento",
    status: "parcial",
    shortDescription: "Quais exames foram entregues e o que ainda falta.",
  },
  {
    id: "questionario_alergia",
    title: "Questionário alergia pré-operatório",
    type: "documento",
    status: "pendente",
    shortDescription: "Rastreio de alergias e reações prévias.",
  },
  {
    id: "controle_cirurgico",
    title: "Controle cirúrgico",
    type: "controle",
    status: "parcial",
    shortDescription: "Linha do tempo cirúrgica e acompanhamentos.",
  },
  {
    id: "controle_medicacoes",
    title: "Controle de medicações",
    type: "controle",
    status: "pendente",
    shortDescription: "Medicações em uso, pós-operatório e suspensões.",
  },
];

// Mock de documentos (futuramente vem do Supabase/storage)
const mockDocuments = [
  {
    id: "doc1",
    name: "Termo de consentimento - Abdominoplastia",
    type: "PDF",
    category: "Termos cirúrgicos",
    date: "10/10/2025",
  },
  {
    id: "doc2",
    name: "Pedido de exames pré-operatórios",
    type: "PDF",
    category: "Pedido de exames",
    date: "05/10/2025",
  },
  {
    id: "doc3",
    name: "Laudo cardiológico",
    type: "PDF",
    category: "Laudos",
    date: "08/10/2025",
  },
];

// Mock de eventos da aba "Linha do tempo"
const mockTimelineEvents = [
  {
    id: "evt1",
    date: "21/11/2025",
    type: "Avaliação",
    tag: "avaliacao",
    title: "Avaliação inicial",
    description:
      "Anamnese completa, definição de expectativas e plano de tratamento.",
  },
  {
    id: "evt2",
    date: "30/11/2025",
    type: "Exames",
    tag: "exame",
    title: "Exames pré-operatórios",
    description:
      "Pedido de exames, coleta e análise dos resultados laboratoriais.",
  },
  {
    id: "evt3",
    date: "12/12/2025",
    type: "Cirurgia",
    tag: "cirurgia",
    title: "Abdominoplastia",
    description:
      "Realização da abdominoplastia conforme plano cirúrgico definido.",
  },
];

// Mock de etapas do processo (timeline horizontal da visão geral)
const processSteps = [
  { id: "avaliacao", label: "Avaliação", state: "done" },
  { id: "planejamento", label: "Planejamento", state: "done" },
  { id: "exames", label: "Exames", state: "current" },
  { id: "cirurgia", label: "Cirurgia", state: "upcoming" },
  { id: "pos_op", label: "Pós-op", state: "upcoming" },
];

// Mock de agenda (card calendário da visão geral)
const mockAppointments = [
  {
    id: 1,
    title: "Retorno pós-op (7 dias)",
    time: "10:00",
    room: "Consultório 1",
    status: "future",
  },
  {
    id: 2,
    title: "Revisão de curativos",
    time: "11:30",
    room: "Sala curativos",
    status: "future",
  },
  {
    id: 3,
    title: "Controle de exames",
    time: "14:00",
    room: "Consultório 2",
    status: "past",
  },
];

// Mock de estatísticas de exames (gauge da visão geral)
const mockExamStats = {
  requested: 10,
  delivered: 8,
  approved: 7,
  rejected: 1,
};

// Mock de status geral / risco / pós-op / mídia / KPIs
const globalStatusMock = {
  phase: "Pré-operatório",
  label: "Pré-operatório",
  riskLevel: "Moderado",
  criticalAlerts: 1,
  nextImportantDate: "Retorno em 21/12/2025",
};

const riskInfoMock = {
  summary: "Risco cirúrgico moderado (ASA II).",
  comorbidities: ["Hipertensão controlada", "IMC 27"],
  allergies: ["Alergia a dipirona"],
};

const postopInfoMock = {
  hasSurgery: true,
  currentWeek: 2,
  totalWeeks: 6,
  nextReturn: "Revisão em 21/12/2025",
  pending: ["Registrar curativo semana 3"],
};

const mediaPreviewMock = [
  { id: 1, label: "Antes", date: "01/11/2025" },
  { id: 2, label: "Pós-op semana 1", date: "19/11/2025" },
];

const kpiStatsMock = {
  formsCompleted: 5,
  formsTotal: 9,
  signedDocs: 3,
  signedDocsTotal: 4,
  finishedVisits: 2,
  totalVisits: 5,
  daysSinceSurgery: 12,
};

export default function PatientProntuario() {
  const navigate = useNavigate();
  const { id } = useParams();

  // 🔹 Por enquanto dados mockados, depois puxamos do Supabase
  const paciente = {
    nome: "Mary George",
    dataAnamnese: "21 de novembro de 2025",
    foto: "/profile-icon.jpg",
    instagram: "@mary.george",
    whatsapp: "(11) 99999-9999",
    dataNascimento: "2000-11-24", // ISO (mock)
    altura: 1.65, // em metros
    peso: 65, // kg
    situacao: "Em avaliação",
  };

  const cirurgias = [
    {
      id: 1,
      nome: "Abdominoplastia",
      dataCirurgia: "12/10/2025",
      inicioPosOperatorio: "19/10/2025",
    },
    {
      id: 2,
      nome: "Lipoaspiração",
      dataCirurgia: "05/08/2025",
      inicioPosOperatorio: "12/08/2025",
    },
  ];

  const imc =
    paciente.altura && paciente.peso
      ? (paciente.peso / (paciente.altura * paciente.altura)).toFixed(1)
      : null;

  const procedimentosUnicos = [...new Set(cirurgias.map((c) => c.nome))];
  const cirurgiaPrincipal = cirurgias[0] || null;

  // Mapa rápido de módulos por id (para possíveis usos futuros)
  const modulesById = React.useMemo(() => {
    const map = {};
    prontuarioModules.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, []);

  // Estado da área central / direita
  const [viewMode, setViewMode] = React.useState("overview"); // "overview" | "checklist" | "documents" | "timeline"
  const [selectedItem, setSelectedItem] = React.useState(null); // id dos módulos do prontuário
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  const handleChangeView = (mode) => {
    setViewMode(mode);
    setSelectedDocument(null);
    setSelectedEvent(null);
    setSelectedItem(null);
  };

  const handleSelectModule = (moduleId) => {
    setSelectedItem(moduleId);
    setSelectedDocument(null);
    setSelectedEvent(null);
  };

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc);
    setSelectedEvent(null);
    setSelectedItem(null);
  };

  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
    setSelectedDocument(null);
    setSelectedItem(null);
  };

  const getStatusLabel = (status) => {
    if (status === "completo") return "Completo";
    if (status === "parcial") return "Parcial";
    return "Pendente";
  };

  // Para timeline horizontal: índice da etapa atual
  const currentStageIndex =
    processSteps.findIndex((s) => s.state === "current") !== -1
      ? processSteps.findIndex((s) => s.state === "current")
      : 0;

  // Stats de exames (gauge)
  const examRequested = mockExamStats.requested;
  const examApproved = mockExamStats.approved;
  const examDelivered = mockExamStats.delivered;
  const examRejected = mockExamStats.rejected;

  const approvalRate =
    examRequested > 0
      ? Math.round((examApproved / examRequested) * 100)
      : 0;

  const gaugeDeg = Math.round((approvalRate / 100) * 180);

  // KPIs
  const k = kpiStatsMock;

  // Renderiza o painel da direita conforme a seleção
  const renderRightPanelContent = () => {
    // Se estiver na visão geral → painel não é mostrado (já tratamos no JSX)
    if (viewMode === "overview") {
      return null;
    }

    // 1) Documento selecionado
    if (selectedDocument) {
      return (
        <>
          <h3>Documento selecionado</h3>
          <div className="prontuarioSummaryCard">
            <p>Nome do documento</p>
            <h4>{selectedDocument.name}</h4>
            <span>
              Tipo: {selectedDocument.type}
              <br />
              Categoria: {selectedDocument.category}
              <br />
              Data: {selectedDocument.date}
            </span>
          </div>

          <div className="prontuarioSummaryCard">
            <p>Ações</p>
            <span className="smallText">
              Aqui você poderá:
              <br />
              • Visualizar o documento em modo tela cheia
              <br />
              • Fazer download em PDF
              <br />
              • Substituir por uma nova versão
            </span>
          </div>
        </>
      );
    }

    // 2) Evento da linha do tempo selecionado
    if (selectedEvent) {
      return (
        <>
          <h3>Evento da linha do tempo</h3>
          <div className="prontuarioSummaryCard">
            <p>Tipo de evento</p>
            <h4>{selectedEvent.title}</h4>
            <span>
              Data: {selectedEvent.date}
              <br />
              Categoria: {selectedEvent.type}
            </span>
          </div>
          <div className="prontuarioSummaryCard">
            <p>Detalhes</p>
            <span className="smallText">{selectedEvent.description}</span>
          </div>
        </>
      );
    }

    // 3) Módulo do prontuário selecionado (anamnese, exames, etc.)
    if (selectedItem) {
      const module = prontuarioModules.find((m) => m.id === selectedItem);
      if (!module) return null;

      return (
        <>
          <h3>{module.title}</h3>
          <div className="prontuarioSummaryCard">
            <p>Status</p>
            <span
              className={`moduleStatusBadge status-${module.status}`}
            >
              {getStatusLabel(module.status)}
            </span>
            <span
              className="smallText"
              style={{ marginTop: "0.5rem", display: "block" }}
            >
              {module.shortDescription}
            </span>
          </div>

          <div className="prontuarioSummaryCard">
            <p>Próximas ações sugeridas</p>
            <span className="smallText">
              Aqui você poderá configurar ações específicas para este módulo:
              <br />
              • Abrir formulário completo em tela cheia
              <br />
              • Ver histórico de versões/assinaturas
              <br />
              • Conferir última atualização registrada no sistema
            </span>
          </div>
        </>
      );
    }

    // 4) Estado padrão (não está na visão geral e nada foi selecionado)
    return (
      <>
        <h3>Resumo do prontuário</h3>

        <div className="prontuarioSummaryCard">
          <p>Total de cirurgias</p>
          <h2>{cirurgias.length}</h2>
          <span>Cirurgias registradas para a paciente</span>
        </div>

        <div className="prontuarioSummaryCard">
          <p>Última cirurgia</p>
          <h4>{cirurgiaPrincipal?.nome || "—"}</h4>
          <span>
            Data: {cirurgiaPrincipal?.dataCirurgia || "—"}
            <br />
            Início do pós:{" "}
            {cirurgiaPrincipal?.inicioPosOperatorio || "—"}
          </span>
        </div>

        <div className="prontuarioSummaryCard">
          <p>Próximos passos</p>
          <ul className="summaryList">
            <li>Revisão pós-operatória de 30 dias</li>
            <li>Atualizar fotos de acompanhamento</li>
            <li>Registrar novos exames, se houver</li>
          </ul>
        </div>

        <div className="prontuarioSummaryCard">
          <p>Documentos & mídia</p>
          <span className="smallText">
            Este painel pode futuramente integrar com:
            <br />
            • Documentos médicos (laudos, consentimentos)
            <br />
            • Fotos antes e depois
            <br />
            • Arquivos anexados no sistema
          </span>
        </div>
      </>
    );
  };

  return (
    <div className="prontuarioOverlay">
      {/* HEADER FULLSCREEN, ESTILO Mapa Cirúrgico */}
      <header className="prontuarioHeader">
        <h2>Prontuário do paciente</h2>
        <button
          type="button"
          className="closeProntuarioBtn"
          onClick={() => navigate(-1)}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </header>

      {/* CONTAINER EM 3 COLUNAS (ESQ / CENTRO / DIR) – na visão geral, ocupa só 2 colunas */}
      <div
        className={`prontuarioContainer ${
          viewMode === "overview" ? "overviewLayout" : ""
        }`}
      >
        {/* COLUNA ESQUERDA – RESUMO DO PACIENTE (compacto) */}
        <aside className="prontuarioSidebar">
          <div className="prontuarioProfile">
            <img
              src={paciente.foto}
              alt={paciente.nome}
              className="prontuarioFoto"
            />
            <h3>{paciente.nome}</h3>

            <span className="prontuarioAnamnese">
              Anamnese em: {paciente.dataAnamnese}
            </span>

            <div className="prontuarioSocialButtons">
              <button type="button" className="socialButton instagram">
                <i className="fa-brands fa-instagram" />
              </button>
              <button type="button" className="socialButton whatsapp icon-only">
                <i className="fa-brands fa-whatsapp" />
              </button>
            </div>
          </div>

          {/* INFORMAÇÕES GERAIS */}
          <div className="prontuarioBlock">
            <h4>Informações gerais</h4>

            <div className="infoLines">
              <div className="infoRow">
                <span className="infoLabel">Data de nascimento</span>
                <span className="infoValue">
                  {formatDataNascimento(paciente.dataNascimento)}
                </span>
              </div>

              <div className="infoRow">
                <span className="infoLabel">Altura / Peso / IMC</span>
                <span className="infoValue">
                  {paciente.altura && paciente.peso ? (
                    <>
                      {paciente.altura.toFixed(2)} m • {paciente.peso} kg • IMC{" "}
                      {imc || "—"}
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </div>

              <div className="infoRow">
                <span className="infoLabel">Situação</span>
                <span className="infoValue situacaoBadge">
                  {paciente.situacao || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* RESUMO CIRÚRGICO */}
          <div className="prontuarioBlock">
            <h4>Resumo cirúrgico</h4>

            <span className="infoSectionTitle">Procedimentos realizados</span>
            <div className="proceduresPills">
              {procedimentosUnicos.length === 0 ? (
                <span className="proceduresEmpty">
                  Nenhum procedimento registrado.
                </span>
              ) : (
                procedimentosUnicos.map((nome) => (
                  <span key={nome} className="procedurePill">
                    {nome}
                  </span>
                ))
              )}
            </div>

            {cirurgiaPrincipal && (
              <div className="cirurgiaInfoLines">
                <div className="infoRow">
                  <span className="infoLabel">Data da cirurgia</span>
                  <span className="infoValue">
                    {cirurgiaPrincipal.dataCirurgia || "—"}
                  </span>
                </div>
                <div className="infoRow">
                  <span className="infoLabel">
                    Início do pós-operatório
                  </span>
                  <span className="infoValue">
                    {cirurgiaPrincipal.inicioPosOperatorio || "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* COLUNA CENTRAL – ABAS + CONTEÚDO */}
        <main className="prontuarioMain">
          {/* Abas */}
          <div className="prontuarioTabs">
            <button
              type="button"
              className={viewMode === "overview" ? "active" : ""}
              onClick={() => handleChangeView("overview")}
            >
              Visão geral
            </button>
            <button
              type="button"
              className={viewMode === "checklist" ? "active" : ""}
              onClick={() => handleChangeView("checklist")}
            >
              Checklist
            </button>
            <button
              type="button"
              className={viewMode === "documents" ? "active" : ""}
              onClick={() => handleChangeView("documents")}
            >
              Documentos
            </button>
            <button
              type="button"
              className={viewMode === "timeline" ? "active" : ""}
              onClick={() => handleChangeView("timeline")}
            >
              Linha do tempo
            </button>
          </div>

          {/* Visão geral – banner + timeline horizontal + cards dinâmicos */}
          {viewMode === "overview" && (
            <div className="summaryContent">
              {/* Banner de status geral */}
              <section className="summaryCard statusBanner">
                <div className="statusBannerTop">
                  <div>
                    <span className="statusBannerLabel">Status atual</span>
                    <h3>{globalStatusMock.phase}</h3>
                    <span className="summarySubtitle">
                      {globalStatusMock.nextImportantDate}
                    </span>
                  </div>
                  <div className="statusChips">
                    <span className="riskChip risk-moderado">
                      Risco {globalStatusMock.riskLevel}
                    </span>
                    {globalStatusMock.criticalAlerts > 0 && (
                      <span className="alertChip">
                        {globalStatusMock.criticalAlerts} alerta(s)
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Timeline horizontal de etapas */}
              <section className="summaryCard processCard">
                <div className="summaryCardHeader">
                  <div>
                    <h3>Jornada da paciente</h3>
                    <span className="summarySubtitle">
                      Do primeiro contato ao pós-operatório.
                    </span>
                  </div>
                </div>

                <div className="processTimelineTrack">
                  {processSteps.map((step, index) => {
                    const isActive =
                      step.state === "done" || step.state === "current";
                    const connectorActive = index < currentStageIndex;

                    return (
                      <React.Fragment key={step.id}>
                        <div
                          className={`processStep ${
                            step.state
                          } ${isActive ? "is-active" : ""}`}
                        >
                          <div className="stepIconCircle">
                            <span className="stepIndex">
                              {index + 1}
                            </span>
                          </div>
                          <span className="stepLabel">
                            {step.label}
                          </span>
                        </div>
                        {index < processSteps.length - 1 && (
                          <div
                            className={`processConnector ${
                              connectorActive ? "active" : ""
                            }`}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </section>

              {/* Grid inferior de cards */}
              <div className="summaryBottomGrid">
                {/* Coluna esquerda: calendário + pós-op */}
                <div className="summaryCol">
                  {/* Card calendário */}
                  <section className="summaryCard calendarCard">
                    <div className="summaryCardHeader">
                      <div>
                        <h3>Agenda da paciente</h3>
                        <span className="summarySubtitle">
                          Próximos retornos e registros recentes.
                        </span>
                      </div>
                      <span className="summaryBadge">
                        {mockAppointments.length} eventos
                      </span>
                    </div>

                    <div className="calendarTimeline">
                      {mockAppointments.map((appt, index) => (
                        <div key={appt.id} className="calendarRow">
                          <div className="calendarTimeCol">
                            <span className="calendarTime">
                              {appt.time}
                            </span>
                            {index < mockAppointments.length - 1 && (
                              <div className="calendarTimeLine" />
                            )}
                          </div>
                          <div
                            className={`calendarEventCard ${appt.status}`}
                          >
                            <strong>{appt.title}</strong>
                            <span>{appt.room}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Card pós-operatório */}
                  <section className="summaryCard postopCard">
                    <div className="summaryCardHeader">
                      <div>
                        <h3>Pós-operatório</h3>
                        <span className="summarySubtitle">
                          Acompanhamento da recuperação da paciente.
                        </span>
                      </div>
                    </div>

                    {postopInfoMock.hasSurgery ? (
                      <div className="postopContent">
                        <div className="postopProgress">
                          <div className="postopCircle">
                            <span className="postopWeek">
                              Semana {postopInfoMock.currentWeek}
                            </span>
                            <span className="postopTotal">
                              de {postopInfoMock.totalWeeks}
                            </span>
                          </div>
                          <div className="postopBarWrapper">
                            <div className="postopBar">
                              <div
                                className="postopBarFill"
                                style={{
                                  width: `${
                                    (postopInfoMock.currentWeek /
                                      postopInfoMock.totalWeeks) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="postopNext">
                              Próximo retorno: {postopInfoMock.nextReturn}
                            </span>
                          </div>
                        </div>

                        {postopInfoMock.pending.length > 0 && (
                          <div className="postopPending">
                            <span>Pendências:</span>
                            <ul>
                              {postopInfoMock.pending.map((p, idx) => (
                                <li key={idx}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="placeholderText">
                        Nenhuma cirurgia registrada para esta paciente.
                      </p>
                    )}
                  </section>
                </div>

                {/* Coluna direita: exames + riscos + mídia + KPIs */}
                <div className="summaryCol">
                  {/* Card exames / gauge */}
                  <section className="summaryCard examsCard">
                    <div className="summaryCardHeader">
                      <div>
                        <h3>Exames pré-operatórios</h3>
                        <span className="summarySubtitle">
                          Progresso conforme conferência do médico.
                        </span>
                      </div>
                    </div>

                    <div className="examsGaugeWrapper">
                      <div
                        className="examsGauge"
                        style={{ "--gauge-deg": gaugeDeg }}
                      >
                        <div className="examsGaugeInner">
                          <span className="examsGaugeValue">
                            {approvalRate}%
                          </span>
                          <span className="examsGaugeLabel">
                            Exames aprovados
                          </span>
                        </div>
                      </div>

                      <div className="examsStats">
                        <div className="examsStatRow">
                          <span>Exames solicitados</span>
                          <strong>{examRequested}</strong>
                        </div>
                        <div className="examsStatRow">
                          <span>Exames entregues</span>
                          <strong>{examDelivered}</strong>
                        </div>
                        <div className="examsStatRow">
                          <span>Exames aprovados</span>
                          <strong>{examApproved}</strong>
                        </div>
                        <div className="examsStatRow">
                          <span>Exames recusados</span>
                          <strong>{examRejected}</strong>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Card riscos & alertas */}
                  <section className="summaryCard riskCard">
                    <div className="summaryCardHeader">
                      <div>
                        <h3>Riscos & alertas</h3>
                        <span className="summarySubtitle">
                          Informações críticas para o ato cirúrgico.
                        </span>
                      </div>
                    </div>
                    <p className="riskSummary">{riskInfoMock.summary}</p>
                    <div className="riskTags">
                      {riskInfoMock.comorbidities.map((c) => (
                        <span key={c} className="riskTag">
                          {c}
                        </span>
                      ))}
                    </div>
                    <div className="riskAllergy">
                      <span>Alergias:</span>
                      <strong>
                        {riskInfoMock.allergies.length > 0
                          ? riskInfoMock.allergies.join(", ")
                          : "Nenhuma registrada"}
                      </strong>
                    </div>
                  </section>

                  {/* Card mídia */}
                  <section className="summaryCard mediaCard">
                    <div className="summaryCardHeader">
                      <div>
                        <h3>Últimas imagens</h3>
                        <span className="summarySubtitle">
                          Pré e pós-operatório da paciente.
                        </span>
                      </div>
                    </div>
                    <div className="mediaGrid">
                      {mediaPreviewMock.map((m) => (
                        <div key={m.id} className="mediaThumb">
                          <div className="mediaThumbImg" />
                          <div className="mediaThumbInfo">
                            <span className="mediaThumbLabel">
                              {m.label}
                            </span>
                            <span className="mediaThumbDate">
                              {m.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Card KPIs */}
                  <section className="summaryCard kpiCard">
                    <div className="summaryCardHeader">
                      <div>
                        <h3>Resumo rápido</h3>
                        <span className="summarySubtitle">
                          Indicadores gerais do prontuário.
                        </span>
                      </div>
                    </div>
                    <div className="kpiRow">
                      <div className="kpiItem">
                        <span className="kpiLabel">
                          Formulários
                        </span>
                        <strong>
                          {k.formsCompleted}/{k.formsTotal}
                        </strong>
                      </div>
                      <div className="kpiItem">
                        <span className="kpiLabel">
                          Docs assinados
                        </span>
                        <strong>
                          {k.signedDocs}/{k.signedDocsTotal}
                        </strong>
                      </div>
                      <div className="kpiItem">
                        <span className="kpiLabel">
                          Retornos feitos
                        </span>
                        <strong>
                          {k.finishedVisits}/{k.totalVisits}
                        </strong>
                      </div>
                      <div className="kpiItem">
                        <span className="kpiLabel">
                          Dias pós-op
                        </span>
                        <strong>{k.daysSinceSurgery}</strong>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* Checklist – mesmos módulos em cards */}
          {viewMode === "checklist" && (
            <div className="overviewContent">
              <p className="placeholderText">
                Checklist dos módulos do prontuário: acompanhe o que já foi
                preenchido e o que ainda está pendente.
              </p>
              <div className="overviewGrid">
                {prontuarioModules.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    className={`overviewCard ${
                      selectedItem === mod.id ? "active" : ""
                    }`}
                    onClick={() => handleSelectModule(mod.id)}
                  >
                    <div className="overviewCardHeader">
                      <span className="overviewTitle">
                        {mod.title}
                      </span>
                      <span
                        className={`moduleStatusBadge status-${mod.status}`}
                      >
                        {getStatusLabel(mod.status)}
                      </span>
                    </div>
                    <p className="overviewDescription">
                      {mod.shortDescription}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documentos */}
          {viewMode === "documents" && (
            <div className="documentsContent">
              <p className="placeholderText">
                Aqui você terá acesso a todos os documentos da paciente:
                termos, pedidos, laudos e anexos.
              </p>
              <div className="documentsList">
                {mockDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    className={`documentItem ${
                      selectedDocument?.id === doc.id ? "active" : ""
                    }`}
                    onClick={() => handleSelectDocument(doc)}
                  >
                    <div className="documentMain">
                      <span className="documentName">{doc.name}</span>
                      <span className="documentMeta">
                        {doc.category} • {doc.type} • {doc.date}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Linha do tempo */}
          {viewMode === "timeline" && (
            <div className="timelineTabContent">
              <p className="placeholderText">
                Linha do tempo com eventos clínicos relevantes da paciente.
              </p>
              <div className="timelineList">
                {mockTimelineEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`timelineItem clickable ${
                      selectedEvent?.id === ev.id ? "active" : ""
                    }`}
                    onClick={() => handleSelectEvent(ev)}
                  >
                    <div className={`timelineTag ${ev.tag}`}>
                      {ev.type}
                    </div>
                    <div className="timelineContent">
                      <span className="timelineDate">{ev.date}</span>
                      <p>
                        <strong>{ev.title}</strong> — {ev.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* COLUNA DIREITA – PAINEL CONTEXTUAL (não é renderizado na visão geral) */}
        {viewMode !== "overview" && (
          <aside className="prontuarioPanel">
            {renderRightPanelContent()}
          </aside>
        )}
      </div>
    </div>
  );
}