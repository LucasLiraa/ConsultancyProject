import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

import PostOperativePatientSelector from "./PostOperativePatientSelector";
import SurgeryInfoForm from "./SurgeryInfoForm";
import PostOpSidebar from "./PostOpSidebar";
import WeeklyControlForm from "./WeeklyControlForm";
import PostOperativeGalleryModal from "./PostOperativeGalleryModal";

import "../styles/postOperativeStyles/postOperativeManager.css";

/**
 * Manager do Pós-operatório
 * - Coluna esquerda: lista de pós em andamento
 * - Coluna direita: fluxo (novo pós -> cirurgia -> semanas -> formulário)
 * - Galeria: modal real via Portal (por cima de tudo)
 */
const PostOperatoryManager = ({ onVoltar }) => {
  const [showSelector, setShowSelector] = useState(false);

  // paciente básico selecionado no selector (tabela pacientes)
  const [selectedPatient, setSelectedPatient] = useState(null); // { id, nome }

  // registro do pós (tabela pacientes_pos)
  const [selectedPostOp, setSelectedPostOp] = useState(null);

  // semanas (tabela pos_operatorio)
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null); // { semana: "1" } ou objeto semana

  // lista de pós ativos
  const [postsList, setPostsList] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // ✅ Galeria (modal real)
  const [galleryOpen, setGalleryOpen] = useState(false);

  const fetchPostsList = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from("pacientes_pos")
      .select("*")
      .eq("alta", false)
      .order("data_pos", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Erro ao carregar lista de pós:", error.message);
      setPostsList([]);
    } else {
      setPostsList(data || []);
    }
    setLoadingPosts(false);
  };

  useEffect(() => {
    fetchPostsList();
  }, []);

  // carrega semanas do selectedPostOp
  useEffect(() => {
    const fetchWeeks = async () => {
      if (!selectedPostOp?.id) {
        setWeeks([]);
        return;
      }

      const { data, error } = await supabase
        .from("pos_operatorio")
        .select("*")
        .eq("paciente_pos_id", selectedPostOp.id)
        .order("semana", { ascending: true });

      if (error) {
        console.error("Erro ao carregar semanas:", error.message);
        setWeeks([]);
      } else {
        setWeeks(data || []);
      }
    };

    fetchWeeks();
  }, [selectedPostOp?.id]);

  const handleOpenSelector = () => {
    setShowSelector(true);
    setSelectedPatient(null);
    setSelectedPostOp(null);
    setSelectedWeek(null);
  };

  const handlePatientSelected = async (patient) => {
    setSelectedPatient(patient);
    setShowSelector(false);

    const { data: postOp, error } = await supabase
      .from("pacientes_pos")
      .select("*")
      .eq("paciente_id", patient.id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar pacientes_pos:", error.message);
      return;
    }

    if (postOp) {
      setSelectedPostOp(postOp);

      const { data: weeksData, error: wErr } = await supabase
        .from("pos_operatorio")
        .select("semana")
        .eq("paciente_pos_id", postOp.id);

      if (wErr) {
        console.error("Erro ao buscar semanas:", wErr.message);
        setSelectedWeek({ semana: "1" });
        return;
      }

      const maxWeek = (weeksData || [])
        .map((w) => Number(w.semana || "0"))
        .reduce((acc, n) => Math.max(acc, n), 0);

      setSelectedWeek({ semana: String(Math.max(1, maxWeek)) });
    } else {
      // não tem pós ainda -> vai para SurgeryInfoForm
      setSelectedPostOp(null);
      setWeeks([]);
      setSelectedWeek(null);
    }
  };

  const handleSurgerySaved = async (postOpRecord) => {
    setSelectedPostOp(postOpRecord);

    // cria semana 1 automaticamente
    const payload = {
      paciente_pos_id: postOpRecord.id,
      paciente_id: postOpRecord.paciente_id,
      semana: "1",
      criado_em: new Date().toISOString(),
    };

    const { error: wkErr } = await supabase.from("pos_operatorio").insert([payload]);

    if (wkErr) {
      console.error("Erro ao criar semana 1 automaticamente:", wkErr.message);
    }

    const { data: updatedWeeks } = await supabase
      .from("pos_operatorio")
      .select("*")
      .eq("paciente_pos_id", postOpRecord.id)
      .order("semana", { ascending: true });

    setWeeks(updatedWeeks || []);
    setSelectedWeek({ semana: "1" });

    await fetchPostsList();
  };

  const handleCreateNextWeek = async () => {
    if (!selectedPostOp?.id) return;

    const maxWeek = (weeks || [])
      .map((w) => Number(w.semana || "0"))
      .reduce((acc, n) => Math.max(acc, n), 0);

    const next = Math.max(1, maxWeek + 1);

    const payload = {
      paciente_pos_id: selectedPostOp.id,
      paciente_id: selectedPostOp.paciente_id,
      semana: String(next),
      criado_em: new Date().toISOString(),
    };

    const { error } = await supabase.from("pos_operatorio").insert([payload]);
    if (error) {
      console.error("Erro ao criar nova semana:", error.message);
      return;
    }

    const { data: updated } = await supabase
      .from("pos_operatorio")
      .select("*")
      .eq("paciente_pos_id", selectedPostOp.id)
      .order("semana", { ascending: true });

    setWeeks(updated || []);
    setSelectedWeek({ semana: String(next) });
  };

  const handleSetAlta = async (value) => {
    if (!selectedPostOp?.id) return;

    const { error } = await supabase
      .from("pacientes_pos")
      .update({ alta: value })
      .eq("id", selectedPostOp.id);

    if (error) {
      console.error("Erro ao atualizar alta:", error.message);
      return;
    }

    await fetchPostsList();

    setSelectedPostOp(null);
    setSelectedPatient(null);
    setSelectedWeek(null);
    setWeeks([]);
  };

  const handleWeekSaved = async () => {
    if (!selectedPostOp?.id) return;

    const { data } = await supabase
      .from("pos_operatorio")
      .select("*")
      .eq("paciente_pos_id", selectedPostOp.id)
      .order("semana", { ascending: true });

    setWeeks(data || []);
  };

  const handleOpenPostFromList = async (postOp) => {
    setSelectedPostOp(postOp);
    setSelectedPatient({ id: postOp.paciente_id, nome: postOp.nome || "" });

    const { data: weeksData } = await supabase
      .from("pos_operatorio")
      .select("*")
      .eq("paciente_pos_id", postOp.id)
      .order("semana", { ascending: true });

    setWeeks(weeksData || []);

    const maxWeek = (weeksData || [])
      .map((w) => Number(w.semana || "0"))
      .reduce((a, b) => Math.max(a, b), 1);

    setSelectedWeek({ semana: String(maxWeek) });
  };

  return (
    <div className="managerRoot">
      {/* ✅ GALERIA: modal real por cima de tudo (Portal no componente) */}
      <PostOperativeGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        pacientePosId={selectedPostOp?.id}
      />

      {/* Header */}
      <div className="managerHeader">
        <div className="managerTitle">
          <h3>Pós-operatório</h3>
          <p>Gestão clínica • acompanhamento por semanas • registros e fotos</p>
        </div>

        <div className="managerHeaderActions">
          <button className="btnPrimary" onClick={handleOpenSelector}>
            Novo pós
          </button>
          <button className="btnGhost" onClick={() => onVoltar?.()}>
            Fechar
          </button>
        </div>
      </div>

      <div className="managerBody">
        {/* Coluna esquerda */}
        <aside className="postsList">
          <div className="postsListHeader">
            <div>
              <h4>Em andamento</h4>
              <span className="muted">{postsList.length} pacientes</span>
            </div>

            <button className="btnSmall" onClick={fetchPostsList}>
              Atualizar
            </button>
          </div>

          <div className="postsListContent">
            {loadingPosts ? (
              <p className="muted">Carregando...</p>
            ) : postsList.length === 0 ? (
              <p className="muted">Nenhum pós em andamento</p>
            ) : (
              postsList.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`postItem ${selectedPostOp?.id === p.id ? "active" : ""}`}
                  onClick={() => handleOpenPostFromList(p)}
                >
                  <div className="postTitle">{p.nome || "—"}</div>
                  <div className="postSub">{p.cirurgia || "—"}</div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Área principal */}
        <main className="managerMain">
          {/* Selector */}
          {showSelector && (
            <PostOperativePatientSelector
              onPatientSelected={handlePatientSelected}
              onClose={() => setShowSelector(false)}
            />
          )}

          {/* Novo pós (sem pacientes_pos ainda) */}
          {selectedPatient && !selectedPostOp && !showSelector && (
            <SurgeryInfoForm
              patient={selectedPatient}
              onSaved={handleSurgerySaved}
              onCancel={() => {
                setSelectedPatient(null);
                setShowSelector(true);
              }}
            />
          )}

          {/* Pós existente */}
          {selectedPostOp && !showSelector && (
            <div className="manageArea">
              <PostOpSidebar
                postOp={selectedPostOp}
                weeks={weeks}
                onSelectWeek={(w) => setSelectedWeek(w)}
                onNewWeek={handleCreateNextWeek}
                onAlta={handleSetAlta}
              />

              <div className="manageContent">
                {/* Barra de ações do pós (galeria etc.) */}
                <div className="manageTopActions">
                  <button className="btnGhost" onClick={() => setGalleryOpen(true)}>
                    Abrir galeria
                  </button>
                </div>

                {weeks.length === 0 ? (
                  <div className="placeholderBox">
                    <p>🕓 Aguardando início do pós-operatório.</p>
                    <button className="btnPrimary" onClick={handleCreateNextWeek}>
                      Iniciar Semana 1
                    </button>
                  </div>
                ) : selectedWeek?.semana ? (
                  <WeeklyControlForm
                    postOp={selectedPostOp}
                    semanaAtual={String(selectedWeek.semana)}
                    onSaved={handleWeekSaved}
                  />
                ) : (
                  <div className="placeholderBox">
                    <p>Selecione uma semana à esquerda</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estado inicial */}
          {!selectedPatient && !selectedPostOp && !showSelector && (
            <div className="placeholderBox">
              <p>
                Clique em <strong>Novo pós</strong> ou selecione um paciente em andamento na
                coluna à esquerda.
              </p>
              <button className="btnPrimary" onClick={handleOpenSelector}>
                Iniciar novo pós
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PostOperatoryManager;