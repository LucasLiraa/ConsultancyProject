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

// Mock de eventos da linha do tempo
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

  // Estado da área central / direita
  const [viewMode, setViewMode] = React.useState("overview"); // "overview" | "documents" | "timeline"
  const [selectedItem, setSelectedItem] = React.useState(null); // id dos módulos do prontuário
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  const handleChangeView = (mode) => {
    setViewMode(mode);
    // ao trocar de aba, não perder completamente a seleção de item,
    // mas limpar documento/evento pra evitar conflito visual
    setSelectedDocument(null);
    setSelectedEvent(null);
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

  // Renderiza o painel da direita conforme a seleção
  const renderRightPanelContent = () => {
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
            <span className="smallText" style={{ marginTop: "0.5rem", display: "block" }}>
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

    // 4) Estado padrão (nada selecionado): resumo geral
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
      {/* HEADER FULLSCREEN, ESTILO MAPA CIRÚRGICO */}
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

      {/* CONTAINER EM 3 COLUNAS (ESQ / CENTRO / DIR) */}
      <div className="prontuarioContainer">
        {/* COLUNA ESQUERDA – RESUMO DO PACIENTE */}
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
                Instagram
              </button>
              <button type="button" className="socialButton whatsapp">
                <i className="fa-brands fa-whatsapp" />
                WhatsApp
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

          {/* Conteúdo das abas */}
          {viewMode === "overview" && (
            <div className="overviewContent">
              <p className="placeholderText">
                Visão consolidada dos módulos do prontuário: anamnese, termos,
                exames, controles e medicações.
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
                      <span className="overviewTitle">{mod.title}</span>
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

        {/* COLUNA DIREITA – PAINEL CONTEXTUAL */}
        <aside className="prontuarioPanel">
          {renderRightPanelContent()}
        </aside>
      </div>
    </div>
  );
}