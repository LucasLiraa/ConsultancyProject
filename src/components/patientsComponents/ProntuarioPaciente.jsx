import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/patientsStyles/ProntuarioPaciente.css";
import { supabase } from "../../utils/supabaseClient"; // ajuste o caminho se necessário
import ProntuarioOverview from "./prontuarioOverview/ProntuarioOverview";

// 🔹 Usa a mesma lógica de foto que você usa no Details
// 🔹 Monta a URL pública da foto, igual nas outras telas
const getFotoUrl = (fotoPath) => {
  if (!fotoPath) return "/profile-icon.jpg";

  // se já for URL completa (https://...), só retorna
  if (typeof fotoPath === "string" && fotoPath.startsWith("http")) {
    return fotoPath;
  }

  // aqui assume que veio o caminho interno do bucket
  const { data } = supabase.storage
    .from("pacientes_fotos") // 👉 use o MESMO bucket das outras telas
    .getPublicUrl(fotoPath);

  console.log("Prontuário - raw foto:", fotoPath, "→ publicUrl:", data?.publicUrl);

  return data?.publicUrl || "/profile-icon.jpg";
};

// 🔹 Data de nascimento + idade
const formatDataNascimento = (value) => {
  if (!value) return "—";

  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) return value;

  const hoje = new Date();
  let idade = hoje.getFullYear() - dateObj.getFullYear();
  const m = hoje.getMonth() - dateObj.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dateObj.getDate())) {
    idade--;
  }

  const dataFormatada = dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `${dataFormatada} (${idade} anos)`;
};

const formatDatePtBr = (value) => {
  if (!value) return "—";

  // se vier no formato de date do Supabase: "YYYY-MM-DD"
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  // fallback pra outros formatos (timestamp, etc.)
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR");
};

// 🔹 Primeira quarta-feira APÓS a data informada
const getFirstWednesdayAfter = (dateStr) => {
  if (!dateStr) return "";

  const parts = dateStr.split("-");
  if (parts.length !== 3) return "";

  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!year || !month || !day) return "";

  // aqui usamos new Date(ano, mes-1, dia) -> data local, sem UTC
  const date = new Date(year, month - 1, day);

  const weekday = date.getDay(); // 0 dom, 1 seg, 2 ter, 3 qua...
  let diff = 3 - weekday; // até quarta

  if (diff <= 0) diff += 7; // próxima quarta

  date.setDate(date.getDate() + diff);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`; // volta no formato pro <input type="date" />
};

const normalizeUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim();

  // se já começa com http ou https, mantém
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // senão, assume https
  return `https://${trimmed}`;
};

export default function PatientProntuario() {
  const navigate = useNavigate();
  const { id } = useParams();

  // 🔹 Paciente
  const [paciente, setPaciente] = React.useState(null);
  const [loadingPaciente, setLoadingPaciente] = React.useState(true);
  const [errorPaciente, setErrorPaciente] = React.useState(null);

  // Social links (instagram / whatsapp)
  const [editingInstagram, setEditingInstagram] = React.useState(false);
  const [editingWhatsapp, setEditingWhatsapp] = React.useState(false);
  const [tempInstagramUrl, setTempInstagramUrl] = React.useState("");
  const [tempWhatsappUrl, setTempWhatsappUrl] = React.useState("");
  const [savingSocial, setSavingSocial] = React.useState(null); // "instagram" | "whatsapp" | null
  const [errorSocial, setErrorSocial] = React.useState(null);

  // 🔹 Edição do resumo cirúrgico (esquerda)
  const [isEditingResumoCirurgico, setIsEditingResumoCirurgico] =
    React.useState(false);

  const [editResumo, setEditResumo] = React.useState({
    situacao: "",
    procedimentos: "",
    dataCirurgia: "",
    inicioPosOperatorio: "",
  });

  const [savingResumo, setSavingResumo] = React.useState(false);
  const [errorResumo, setErrorResumo] = React.useState(null);

  // 🔹 Abas do meio
  const [viewMode, setViewMode] = React.useState("overview");

  // 🔹 Buscar paciente
  React.useEffect(() => {
    const fetchPaciente = async () => {
      try {
        setLoadingPaciente(true);
        setErrorPaciente(null);

        const { data, error } = await supabase
          .from("pacientes")
          .select(
            `
            id,
            nome,
            data,
            sexo,
            altura,
            peso,
            imc,
            telefone,
            email,
            foto,
            situacao,
            indicacaocirurgica,
            cirurgia_nome,
            data_cirurgia,
            inicio_pos_operatorio,
            instagram_url,
            whatsapp_url,
            preop_checklist,

            "acimaPeso",
            "gorduraVisceral",
            "formatoCorporal",
            busto,
            cintura,
            quadril,
            coxa,
            panturrilha,
            qp,
            hpp,
            "historicoAlergiasMedicamentos",
            "historicoCirurgico",
            "historicoGinecologico",
            "qualidadeCicatriz",

            created_at
          `
          )
          .eq("id", id)
          .single();

        if (error) {
          console.error("Erro ao buscar paciente:", error);
          setErrorPaciente("Não foi possível carregar os dados da paciente.");
          return;
        }

        const pacienteFormatado = {
          id: data.id,
          nome: data.nome,
          dataNascimento: data.data,
          sexo: data.sexo,
          altura: data.altura,
          peso: data.peso,
          imc: data.imc,
          telefone: data.telefone,
          email: data.email,
          foto: getFotoUrl(data.foto),
          situacao: data.situacao,
          indicacaoCirurgicaJson: data.indicacaocirurgica,
          cirurgiaNomes: data.cirurgia_nome || [],
          dataCirurgia: data.data_cirurgia,
          inicioPosOperatorio: data.inicio_pos_operatorio,
          instagramUrl: data.instagram_url || null,
          whatsappUrl: data.whatsapp_url || null,
          preopChecklist: data.preop_checklist || {},

          acimaPeso: data.acimaPeso,
          gorduraVisceral: data.gorduraVisceral,
          formatoCorporal: data.formatoCorporal,
          medidas: {
            busto: data.busto,
            cintura: data.cintura,
            quadril: data.quadril,
            coxa: data.coxa,
            panturrilha: data.panturrilha,
          },
          historicosClinicos: {
            qp: data.qp,
            hpp: data.hpp,
            historicoAlergiasMedicamentos: data.historicoAlergiasMedicamentos,
            historicoCirurgico: data.historicoCirurgico,
            historicoGinecologico: data.historicoGinecologico,
            qualidadeCicatriz: data.qualidadeCicatriz,
          },

          dataAnamnese: data.created_at,
        };

        setPaciente(pacienteFormatado);

        setTempInstagramUrl(pacienteFormatado.instagramUrl || "");
        setTempWhatsappUrl(pacienteFormatado.whatsappUrl || "");
        setEditingInstagram(false);
        setEditingWhatsapp(false);

        // inicializa campos de edição
        const dataCirurgiaIso = pacienteFormatado.dataCirurgia || "";
        const inicioPosIso = pacienteFormatado.inicioPosOperatorio || "";

        setEditResumo({
          situacao: pacienteFormatado.situacao || "",
          procedimentos: (pacienteFormatado.cirurgiaNomes || []).join(", "),
          dataCirurgia: dataCirurgiaIso,
          inicioPosOperatorio:
            inicioPosIso ||
            (dataCirurgiaIso ? getFirstWednesdayAfter(dataCirurgiaIso) : ""),
        });
      } catch (err) {
        console.error("Erro inesperado ao buscar paciente:", err);
        setErrorPaciente("Ocorreu um erro inesperado ao carregar a paciente.");
      } finally {
        setLoadingPaciente(false);
      }
    };

    if (id) {
      fetchPaciente();
    }
  }, [id]);

  // 🔹 Resumo cirúrgico (visualização)
  const procedimentosUnicos =
    paciente?.cirurgiaNomes && paciente.cirurgiaNomes.length > 0
      ? [...new Set(paciente.cirurgiaNomes)]
      : [];

  const cirurgiaPrincipal =
    procedimentosUnicos.length > 0
      ? {
          nome: procedimentosUnicos[0],
          dataCirurgia: paciente?.dataCirurgia
            ? formatDatePtBr(paciente.dataCirurgia)
            : null,
          inicioPosOperatorio: paciente?.inicioPosOperatorio
            ? formatDatePtBr(paciente.inicioPosOperatorio)
            : null,
        }
      : null;

  // 🔹 Salvar resumo cirúrgico (situação, procedimentos, datas)
  const handleSaveResumoCirurgico = async () => {
    if (!paciente) return;

    try {
      setSavingResumo(true);
      setErrorResumo(null);

      const procedimentosArray = editResumo.procedimentos
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("pacientes")
        .update({
          situacao: editResumo.situacao || null,
          cirurgia_nome: procedimentosArray.length ? procedimentosArray : null,
          data_cirurgia: editResumo.dataCirurgia || null,
          inicio_pos_operatorio: editResumo.inicioPosOperatorio || null,
        })
        .eq("id", paciente.id);

      if (error) {
        console.error(error);
        setErrorResumo("Não foi possível salvar as alterações.");
        return;
      }

      // Atualiza estado local
      setPaciente((prev) =>
        prev
          ? {
              ...prev,
              situacao: editResumo.situacao,
              cirurgiaNomes: procedimentosArray,
              dataCirurgia: editResumo.dataCirurgia || null,
              inicioPosOperatorio: editResumo.inicioPosOperatorio || null,
            }
          : prev
      );

      setIsEditingResumoCirurgico(false);
    } catch (e) {
      console.error(e);
      setErrorResumo("Ocorreu um erro inesperado ao salvar.");
    } finally {
      setSavingResumo(false);
    }
  };

  const handleInstagramClick = () => {
    setErrorSocial(null);

    if (paciente?.instagramUrl) {
      // já tem link -> abre em nova aba
      window.open(paciente.instagramUrl, "_blank", "noopener,noreferrer");
    } else {
      // 1º clique -> abre campo de edição
      setEditingInstagram((prev) => !prev);
      setEditingWhatsapp(false);
    }
  };

  const handleWhatsappClick = () => {
    setErrorSocial(null);

    if (paciente?.whatsappUrl) {
      window.open(paciente.whatsappUrl, "_blank", "noopener,noreferrer");
    } else {
      setEditingWhatsapp((prev) => !prev);
      setEditingInstagram(false);
    }
  };

  const handleSaveInstagramUrl = async () => {
    if (!paciente) return;
    const clean = tempInstagramUrl.trim();
    const normalized = clean ? normalizeUrl(clean) : null;

    try {
      setSavingSocial("instagram");
      setErrorSocial(null);

      const { error } = await supabase
        .from("pacientes")
        .update({
          instagram_url: normalized,
        })
        .eq("id", paciente.id);

      if (error) {
        console.error(error);
        setErrorSocial("Não foi possível salvar o link do Instagram.");
        return;
      }

      setPaciente((prev) =>
        prev ? { ...prev, instagramUrl: normalized } : prev
      );
      setEditingInstagram(false);
    } catch (e) {
      console.error(e);
      setErrorSocial("Ocorreu um erro ao salvar o link do Instagram.");
    } finally {
      setSavingSocial(null);
    }
  };

  const handleSaveWhatsappUrl = async () => {
    if (!paciente) return;
    const clean = tempWhatsappUrl.trim();
    const normalized = clean ? normalizeUrl(clean) : null;

    try {
      setSavingSocial("whatsapp");
      setErrorSocial(null);

      const { error } = await supabase
        .from("pacientes")
        .update({
          whatsapp_url: normalized,
        })
        .eq("id", paciente.id);

      if (error) {
        console.error(error);
        setErrorSocial("Não foi possível salvar o link do WhatsApp.");
        return;
      }

      setPaciente((prev) =>
        prev ? { ...prev, whatsappUrl: normalized } : prev
      );
      setEditingWhatsapp(false);
    } catch (e) {
      console.error(e);
      setErrorSocial("Ocorreu um erro ao salvar o link do WhatsApp.");
    } finally {
      setSavingSocial(null);
    }
  };

  return (
    <div className="prontuarioOverlay">
      {/* HEADER FULLSCREEN */}
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

      <div className="prontuarioContainer">
        {/* COLUNA ESQUERDA – RESUMO DO PACIENTE */}
        <aside className="prontuarioSidebar">
          {loadingPaciente && (
            <div className="prontuarioLoading">Carregando paciente...</div>
          )}
          {errorPaciente && (
            <div className="prontuarioError">{errorPaciente}</div>
          )}

          <div className="prontuarioProfile">
            <img
              src={paciente?.foto || "/profile-icon.jpg"}
              alt={paciente?.nome || "Paciente"}
              className="prontuarioFoto"
            />
            <h3>{paciente?.nome || "Paciente sem nome"}</h3>

            <span className="prontuarioAnamnese">
              Anamnese em:{" "}
              {paciente?.dataAnamnese
                ? formatDatePtBr(paciente.dataAnamnese)
                : "—"}
            </span>

            <div className="prontuarioSocialButtons">
              <button
                type="button"
                className="socialButton instagram"
                onClick={handleInstagramClick}
              >
                <i className="fa-brands fa-instagram" />
                {!paciente?.instagramUrl && (
                  <span className="socialButtonLabel">Adicionar</span>
                )}
              </button>

              <button
                type="button"
                className="socialButton whatsapp icon-only"
                onClick={handleWhatsappClick}
              >
                <i className="fa-brands fa-whatsapp" />
                {!paciente?.whatsappUrl && (
                  <span className="socialButtonLabel">Adicionar</span>
                )}
              </button>
            </div>

            {errorSocial && (
              <div className="prontuarioError" style={{ marginTop: "0.4rem" }}>
                {errorSocial}
              </div>
            )}

            {editingInstagram && !paciente?.instagramUrl && (
              <div className="socialEditRow">
                <input
                  type="url"
                  className="socialInput"
                  placeholder="URL do perfil do Instagram"
                  value={tempInstagramUrl}
                  onChange={(e) => setTempInstagramUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="socialSaveBtn"
                  onClick={handleSaveInstagramUrl}
                  disabled={savingSocial === "instagram"}
                >
                  {savingSocial === "instagram" ? "Salvando..." : "Salvar"}
                </button>
              </div>
            )}

            {editingWhatsapp && !paciente?.whatsappUrl && (
              <div className="socialEditRow">
                <input
                  type="url"
                  className="socialInput"
                  placeholder="Link do WhatsApp (ex: https://wa.me/55...)"
                  value={tempWhatsappUrl}
                  onChange={(e) => setTempWhatsappUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="socialSaveBtn"
                  onClick={handleSaveWhatsappUrl}
                  disabled={savingSocial === "whatsapp"}
                >
                  {savingSocial === "whatsapp" ? "Salvando..." : "Salvar"}
                </button>
              </div>
            )}
          </div>

          {/* INFORMAÇÕES GERAIS */}
          <div className="prontuarioBlock">
            <h4>Informações gerais</h4>

            <div className="infoLines">
              <div className="infoRow">
                <span className="infoLabel">Data de nascimento</span>
                <span className="infoValue">
                  {paciente?.dataNascimento
                    ? formatDataNascimento(paciente.dataNascimento)
                    : "—"}
                </span>
              </div>

              <div className="infoRow">
                <span className="infoLabel">Altura / Peso / IMC</span>
                <span className="infoValue">
                  {paciente ? (
                    <>
                      {paciente.altura ? `${paciente.altura} m` : "—"} •{" "}
                      {paciente.peso ? `${paciente.peso} kg` : "—"} • IMC{" "}
                      {paciente.imc || "—"}
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </div>

              <div className="infoRow">
                <span className="infoLabel">Telefone</span>
                <span className="infoValue">
                  {paciente?.telefone || "—"}
                </span>
              </div>

              <div className="infoRow">
                <span className="infoLabel">E-mail</span>
                <span className="infoValue">
                  {paciente?.email || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* RESUMO CIRÚRGICO + EDIÇÃO */}
          <div className="prontuarioBlock">
            <div className="prontuarioBlockHeader">
              <h4>Resumo cirúrgico</h4>

              <button
                type="button"
                className="prontuarioEditBtn"
                onClick={() =>
                  setIsEditingResumoCirurgico((prev) => !prev)
                }
              >
                {isEditingResumoCirurgico ? "Cancelar" : "Editar"}
              </button>
            </div>

            {errorResumo && (
              <div
                className="prontuarioError"
                style={{ marginBottom: "0.5rem" }}
              >
                {errorResumo}
              </div>
            )}

            {isEditingResumoCirurgico ? (
              <>
                {/* Situação */}
                <div className="infoRow">
                  <span className="infoLabel">Situação</span>
                  <select
                    className="infoInput"
                    value={editResumo.situacao}
                    onChange={(e) =>
                      setEditResumo((prev) => ({
                        ...prev,
                        situacao: e.target.value,
                      }))
                    }
                  >
                    <option value="">Situação</option>
                    <option value="Em avaliação">Em avaliação</option>
                    <option value="Aguardando Contrato">Aguardando Contrato</option>
                    <option value="Em fechamento">Em fechamento</option>
                    <option value="Aguardando Cirurgia">Aguardando Cirurgia</option>
                    <option value="Operado(a)">Operado(a)</option>
                    <option value="Em pós-operatório">Em pós-operatório</option>
                  </select>
                </div>

                {/* Procedimentos realizados */}
                <div className="infoRow">
                  <span className="infoLabel">Procedimentos realizados</span>
                  <textarea
                    className="infoInput"
                    rows={2}
                    placeholder="Separe múltiplos procedimentos com vírgula"
                    value={editResumo.procedimentos}
                    onChange={(e) =>
                      setEditResumo((prev) => ({
                        ...prev,
                        procedimentos: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Data da cirurgia */}
                <div className="infoRow">
                  <span className="infoLabel">Data da cirurgia</span>
                  <input
                    type="date"
                    className="infoInput"
                    value={editResumo.dataCirurgia || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditResumo((prev) => ({
                        ...prev,
                        dataCirurgia: value,
                        inicioPosOperatorio:
                          prev.inicioPosOperatorio ||
                          getFirstWednesdayAfter(value),
                      }));
                    }}
                  />
                </div>

                {/* Início do pós-op */}
                <div className="infoRow">
                  <span className="infoLabel">
                    Início do pós-operatório
                  </span>
                  <input
                    type="date"
                    className="infoInput"
                    value={editResumo.inicioPosOperatorio || ""}
                    onChange={(e) =>
                      setEditResumo((prev) => ({
                        ...prev,
                        inicioPosOperatorio: e.target.value,
                      }))
                    }
                  />
                  <span
                    className="smallText"
                    style={{ marginTop: "0.25rem" }}
                  >
                    Calculado automaticamente como a primeira
                    quarta-feira após a cirurgia, mas você pode ajustar
                    se necessário.
                  </span>
                </div>

                <button
                  type="button"
                  className="prontuarioSaveBtn"
                  onClick={handleSaveResumoCirurgico}
                  disabled={savingResumo}
                >
                  {savingResumo ? "Salvando..." : "Salvar alterações"}
                </button>
              </>
            ) : (
              <>
                <span className="infoSectionTitle">
                  Procedimentos realizados
                </span>
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
                      <span className="infoLabel">Situação</span>
                      <span className="infoValue situacaoBadge">
                        {paciente?.situacao || "—"}
                      </span>
                    </div>

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
                        {cirurgiaPrincipal.inicioPosOperatorio ||
                          (editResumo.inicioPosOperatorio
                            ? formatDatePtBr(
                                editResumo.inicioPosOperatorio
                              )
                            : "—")}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        {/* COLUNA CENTRAL – abas: visão geral, checklist, documentos, etc. */}
        <main className="prontuarioMain">
          <div className="prontuarioTabs">
            <button
              type="button"
              className={viewMode === "overview" ? "active" : ""}
              onClick={() => setViewMode("overview")}
            >
              Visão geral
            </button>

            <button
              type="button"
              className={viewMode === "checklist" ? "active" : ""}
              onClick={() => setViewMode("checklist")}
            >
              Checklist
            </button>

            <button
              type="button"
              className={viewMode === "documents" ? "active" : ""}
              onClick={() => setViewMode("documents")}
            >
              Documentos
            </button>

            <button
              type="button"
              className={viewMode === "timeline" ? "active" : ""}
              onClick={() => setViewMode("timeline")}
            >
              Linha do tempo
            </button>
          </div>

          {viewMode === "overview" && (
            <ProntuarioOverview paciente={paciente} />
          )}

          {viewMode === "checklist" && (
            <div className="prontuarioUnderConstruction">
              <h3>Checklist do paciente</h3>
              <p>
                Em breve, esta área exibirá checklists pré e pós-operatórios,
                exames obrigatórios e pendências.
              </p>
            </div>
          )}

          {viewMode === "documents" && (
            <div className="prontuarioUnderConstruction">
              <h3>Documentos do paciente</h3>
              <p>
                Em breve, esta área listará contratos, consentimentos,
                laudos e anexos importantes da paciente.
              </p>
            </div>
          )}

          {viewMode === "timeline" && (
            <div className="prontuarioUnderConstruction">
              <h3>Linha do tempo detalhada</h3>
              <p>
                Em breve, você poderá visualizar uma linha do tempo completa
                com todos os registros clínicos, retornos e eventos.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}