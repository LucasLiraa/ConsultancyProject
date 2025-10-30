import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import PostOperativePatientSelector from "./PostOperativePatientSelector";
import SurgeryInfoForm from "./SurgeryInfoForm";
import PostOpSidebar from "./PostOpSidebar";
import WeeklyControlForm from "./WeeklyControlForm";
import "../styles/postOperativeStyles/postOperativeManager.css";

/**
 * Gerencia todo o fluxo do pós-operatório:
 * - lista de pós ativos
 * - novo pós (selector -> form -> semana 1 criada automaticamente)
 * - abrir pós existente (calcula próxima semana)
 */
const PostOperatoryManager = ({ onVoltar }) => {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // { id, nome }
  const [selectedPostOp, setSelectedPostOp] = useState(null); // registro pacientes_pos
  const [weeks, setWeeks] = useState([]); // semanas do pos_operatorio
  const [selectedWeek, setSelectedWeek] = useState(null); // objeto semana selecionada ou null
  const [postsList, setPostsList] = useState([]); // lista de pacientes_pos ativos (alta = false)
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Carrega lista de pós ativos (para a coluna / lista interna)
  const fetchPostsList = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from("pacientes_pos")
      .select("*")
      .eq("alta", false) // apenas ativos
      .order("data_pos", { ascending: false, nullsFirst: false });
    if (error) {
      console.error("Erro ao carregar lista de pós:", error.message);
    } else {
      setPostsList(data || []);
    }
    setLoadingPosts(false);
  };

  useEffect(() => {
    fetchPostsList();
  }, []);

  // Carrega semanas do selectedPostOp
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
        .order("created_at", { ascending: true }); // order arbitrary — we'll use semana
      if (error) {
        console.error("Erro ao carregar semanas:", error.message);
        setWeeks([]);
      } else {
        // garantir ordenação por número da semana (semana é text -> converte)
        const sorted = (data || []).sort((a, b) => {
          const na = Number(a.semana || "0");
          const nb = Number(b.semana || "0");
          return na - nb;
        });
        setWeeks(sorted);
      }
    };
    fetchWeeks();
  }, [selectedPostOp]);

  // Abre modal seletor
  const handleOpenSelector = () => {
    setShowSelector(true);
    setSelectedPatient(null);
    setSelectedPostOp(null);
    setSelectedWeek(null);
  };

  // Quando um paciente é selecionado no modal
  const handlePatientSelected = async (patient) => {
    console.log("Paciente selecionado (selector):", patient);
    setSelectedPatient(patient);
    setShowSelector(false);

    // Verifica se já existe pacientes_pos para esse paciente
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
      // já existe: abre gerenciamento e carrega semanas
      setSelectedPostOp(postOp);
      // semanas serão carregadas pelo useEffect que observa selectedPostOp
      // seleciona próxima semana automaticamente:
      // determinamos a próxima semana com base no fetch de semanas (aguardar fetch)
      // mas como fetchWeeks é assíncrono podemos calcular aqui também:
      const { data: weeksData } = await supabase
        .from("pos_operatorio")
        .select("semana")
        .eq("paciente_pos_id", postOp.id);

      const maxWeek = (weeksData || [])
        .map((w) => Number(w.semana || "0"))
        .reduce((acc, n) => Math.max(acc, n), 0);

      const nextWeekNum = maxWeek + 1;
      // criamos um objeto temporário para representar a próxima semana (não salva ainda)
      setSelectedWeek({ semana: String(nextWeekNum) });
    } else {
      // novo pós: abre formulário
      setSelectedPostOp(null);
      setSelectedWeek(null);
    }
  };

  // Quando salva o SurgeryInfoForm (novo pós criado)
  // Recebe postOpRecord (registro completo recém criado)
  const handleSurgerySaved = async (postOpRecord) => {
    console.log("Surgery info saved:", postOpRecord);
    // Definir selectedPostOp
    setSelectedPostOp(postOpRecord);
    // criar automaticamente a semana 1 (com campos vazios) e abrir ela
    const payload = {
      paciente_pos_id: postOpRecord.id,
      paciente_id: postOpRecord.paciente_id,
      semana: "1",
      criado_em: new Date().toISOString(),
    };
    const { data: weekData, error: wkErr } = await supabase
      .from("pos_operatorio")
      .insert([payload])
      .select()
      .maybeSingle();

    if (wkErr) {
      console.error("Erro ao criar semana 1 automaticamente:", wkErr.message);
    } else {
      // recarregar semanas e selecionar semana 1
      const { data } = await supabase
        .from("pos_operatorio")
        .select("*")
        .eq("paciente_pos_id", postOpRecord.id)
        .order("semana", { ascending: true });
      setWeeks(data || []);
      setSelectedWeek(weekData || { semana: "1" });
    }

    // atualizar lista principal (aparecerá nos ativos)
    await fetchPostsList();
  };

  // Criar nova semana explicitamente (clicando em "Nova Semana")
  const handleCreateNextWeek = async () => {
    if (!selectedPostOp?.id) return;
    // calcula próxima semana a partir das semanas atuais
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
    const { data, error } = await supabase
      .from("pos_operatorio")
      .insert([payload])
      .select()
      .maybeSingle();
    if (error) {
      console.error("Erro ao criar nova semana:", error.message);
      return;
    }
    // atualizar semanas e selecionar a criada
    const { data: updated } = await supabase
      .from("pos_operatorio")
      .select("*")
      .eq("paciente_pos_id", selectedPostOp.id)
      .order("semana", { ascending: true });
    setWeeks(updated || []);
    setSelectedWeek(data || { semana: String(next) });
  };

  // Ao marcar alta no WeeklyControlForm (ou no Sidebar), atualizamos pacientes_pos.alta = true
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
    // atualizar lista e fechar o pós (sumir da lista principal)
    await fetchPostsList();
    setSelectedPostOp(null);
    setSelectedPatient(null);
    setSelectedWeek(null);
  };

  // Ao salvar/atualizar semana pelo WeeklyControlForm, recarrega weeks
  const handleWeekSaved = async () => {
    if (!selectedPostOp?.id) return;
    const { data } = await supabase
      .from("pos_operatorio")
      .select("*")
      .eq("paciente_pos_id", selectedPostOp.id)
      .order("semana", { ascending: true });
    setWeeks(data || []);
  };

  // Seleciona um post da lista lateral (abrir gerenciamento para ele)
  const handleOpenPostFromList = async (postOp) => {
    setSelectedPostOp(postOp);
    setSelectedPatient({ id: postOp.paciente_id, nome: postOp.nome || "" });
    // carregar semanas e selecionar próxima semana automaticamente
    const { data: weeksData } = await supabase
      .from("pos_operatorio")
      .select("*")
      .eq("paciente_pos_id", postOp.id);
    const sorted = (weeksData || []).sort(
      (a, b) => Number(a.semana || "0") - Number(b.semana || "0")
    );
    setWeeks(sorted);
    const maxWeek = (sorted || []).map((w) => Number(w.semana || "0")).reduce((a,b) => Math.max(a,b), 0);
    const next = maxWeek + 1;
    setSelectedWeek({ semana: String(next) });
  };

  // Render
  return (
    <div className="managerRoot">
      <div className="managerHeader">
        <h3>Pós-Operatório</h3>
        <div>
          <button className="btnPrimary" onClick={handleOpenSelector}>
            Novo Pós-Operatório
          </button>
          <button className="btnGhost" onClick={() => { if(onVoltar) onVoltar(); }}>
            Fechar
          </button>
        </div>
      </div>

      <div className="managerBody">
        {/* coluna esquerda: lista de pós (ativos) */}
        <aside className="postsList">
          <div className="postsListHeader">
            <h4>Em andamento</h4>
            <button className="btnSmall" onClick={fetchPostsList}>
              Atualizar
            </button>
          </div>

          <div className="postsListContent">
            {loadingPosts ? (
              <p>Carregando...</p>
            ) : postsList.length === 0 ? (
              <p className="muted">Nenhum pós em andamento</p>
            ) : (
              postsList.map((p) => (
                <div
                  key={p.id}
                  className={`postItem ${selectedPostOp?.id === p.id ? "active" : ""}`}
                  onClick={() => handleOpenPostFromList(p)}
                >
                  <div className="postTitle">{p.nome || "—"}</div>
                  <div className="postSub">{p.cirurgia || "—"}</div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* painel principal */}
        <main className="managerMain">
          {/* Se o selector estiver aberto, renderiza overlay */}
          {showSelector && (
            <PostOperativePatientSelector
              onPatientSelected={handlePatientSelected}
              onClose={() => setShowSelector(false)}
            />
          )}

          {/* Se existe selectedPatient mas não tem selectedPostOp -> novo pós (preencher info) */}
          {selectedPatient && !selectedPostOp && !showSelector && (
            <SurgeryInfoForm
              patient={selectedPatient}
              onSaved={handleSurgerySaved}
              onCancel={() => { setSelectedPatient(null); setShowSelector(true); }}
            />
          )}

          {/* Se existe selectedPostOp -> gerenciar (sidebar + weekly form) */}
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

          {/* se nada selecionado */}
          {!selectedPatient && !selectedPostOp && !showSelector && (
            <div className="placeholderBox">
              <p>Use "Novo Pós-Operatório" para iniciar ou clique em um da lista à esquerda.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PostOperatoryManager;