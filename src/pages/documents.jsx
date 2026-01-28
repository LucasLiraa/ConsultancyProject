import React, { useMemo, useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient.js";
import DocumentWizardModal from "../components/documentsComponents/DocumentWizardModal.jsx";
import DocumentsInstancesOverlay from "../components/documentsComponents/DocumentsInstancesOverlay.jsx";
import "./styles/documents.css";

const BUCKET = "document_templates";

function slugifyFilename(name = "") {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\.]+/g, "")
    .replace(/\-+/g, "-")
    .toLowerCase();
}

function Documents() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docModalStep, setDocModalStep] = useState("intro"); // "intro" | "patient"
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState("");

  const [wizardOpen, setWizardOpen] = useState(false);

  // ======= TEMPLATES (SUPABASE) =======
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState("");

  // ======= UPLOAD MODAL =======
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadDragging, setUploadDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const [newDoc, setNewDoc] = useState({
    title: "",
    category: "Consentimentos",
    description: "",
    file: null,
  });

  // ======= INSTANCES OVERLAY =======
  const [instancesOpen, setInstancesOpen] = useState(false);
  const [instancesStatus, setInstancesStatus] = useState(null);

  // contadores
  const [awaitingCount, setAwaitingCount] = useState(0);
  const [signedCount, setSignedCount] = useState(0);

  const normalizedQ = query.trim().toLowerCase();

  const categories = useMemo(() => {
    const set = new Set((templates || []).map((t) => t.category).filter(Boolean));
    return ["Todas", ...Array.from(set)];
  }, [templates]);

  // Destaques: quando digita, mostra resultados como cards grandes
  const highlighted = useMemo(() => {
    if (!query.trim()) return (templates || []).slice(0, 3);

    return (templates || [])
      .filter((t) => {
        const text = `${t.title} ${t.description} ${t.category}`.toLowerCase();
        return text.includes(query.toLowerCase());
      })
      .slice(0, 3);
  }, [templates, query]);

  const filteredTemplates = useMemo(() => {
    let base = templates || [];
    if (category !== "Todas") base = base.filter((t) => t.category === category);

    if (normalizedQ) {
      base = base.filter((t) => {
        const text = `${t.title} ${t.description} ${t.category}`.toLowerCase();
        return text.includes(normalizedQ);
      });
    }

    return base;
  }, [templates, category, normalizedQ]);

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return patients;
    return (patients || []).filter((p) => p.nome?.toLowerCase().includes(q));
  }, [patients, patientQuery]);

  // ======= Load templates from Supabase table =======
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setTemplatesLoading(true);
        setTemplatesError("");

        const { data, error } = await supabase
          .from("document_templates")
          .select("id,title,category,description,file_path,mime_type,active,created_at")
          .eq("active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTemplates(data || []);
      } catch (err) {
        console.error("loadTemplates error:", err);
        setTemplatesError(err?.message || "Erro ao carregar modelos");
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const refreshTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("id,title,category,description,file_path,mime_type,active,created_at")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error("refreshTemplates error:", err);
    }
  };

  // ======= COUNTS (INSTANCES) =======
  const refreshCounts = useCallback(async () => {
    try {
      const { count: awaiting } = await supabase
        .from("document_instances")
        .select("*", { count: "exact", head: true })
        .eq("status", "awaiting_signature");

      const { count: signed } = await supabase
        .from("document_instances")
        .select("*", { count: "exact", head: true })
        .eq("status", "signed");

      setAwaitingCount(awaiting || 0);
      setSignedCount(signed || 0);
    } catch (err) {
      console.error("refreshCounts error:", err);
    }
  }, []);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  const openDocModal = (doc) => {
    setSelectedDoc(doc);
    setSelectedPatient(null);
    setPatientQuery("");
    setDocModalStep("intro");
    setDocModalOpen(true);
  };

  const closeAll = () => {
    setDocModalOpen(false);
    setWizardOpen(false);
    setSelectedDoc(null);
    setSelectedPatient(null);
    setPatientQuery("");
    setDocModalStep("intro");
  };

  // Carregar pacientes do Supabase quando entrar no step "patient"
  useEffect(() => {
    const shouldLoad = docModalOpen && docModalStep === "patient";
    if (!shouldLoad) return;

    const loadPatients = async () => {
      try {
        setPatientsLoading(true);
        setPatientsError("");

        const q = patientQuery.trim();
        let queryBuilder = supabase
          .from("pacientes")
          .select("id, nome")
          .order("nome", { ascending: true })
          .limit(30);

        if (q) queryBuilder = queryBuilder.ilike("nome", `%${q}%`);

        const { data, error } = await queryBuilder;
        if (error) throw error;

        setPatients(data || []);
      } catch (err) {
        setPatientsError(err?.message || "Erro ao buscar pacientes");
        setPatients([]);
      } finally {
        setPatientsLoading(false);
      }
    };

    loadPatients();
  }, [docModalOpen, docModalStep, patientQuery]);

  const confirmPatientAndOpenWizard = () => {
    if (!selectedPatient || !selectedDoc) return;
    setDocModalOpen(false);
    setWizardOpen(true);
  };

  // ======= Upload handlers =======
  const openUploadModal = () => {
    setUploadErr("");
    setNewDoc({ title: "", category: "Consentimentos", description: "", file: null });
    setUploadOpen(true);
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setUploadOpen(false);
    setUploadDragging(false);
    setUploadErr("");
  };

  const setPickedFile = (file) => {
    if (!file) return;

    // Aceite básico: PDF e DOC/DOCX (você pode restringir só PDF se preferir)
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(file.type)) {
      setUploadErr("Formato inválido. Use PDF ou DOC/DOCX.");
      return;
    }

    setUploadErr("");
    setNewDoc((p) => ({
      ...p,
      file,
      title: p.title || file.name.replace(/\.[^/.]+$/, ""),
    }));
  };

  const handleUpload = async () => {
    try {
      setUploadErr("");
      if (!newDoc.file) return setUploadErr("Selecione um arquivo.");
      if (!newDoc.title.trim()) return setUploadErr("Preencha o título.");
      if (!newDoc.category.trim()) return setUploadErr("Selecione a categoria.");

      setUploading(true);

      const file = newDoc.file;
      const safeName = slugifyFilename(file.name);
      const filePath = `templates/${Date.now()}-${safeName}`;

      // 1) Upload no Storage
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (upErr) throw upErr;

      // 2) Cria registro na tabela
      const { error: insErr } = await supabase.from("document_templates").insert({
        title: newDoc.title.trim(),
        category: newDoc.category.trim(),
        description: newDoc.description.trim() || null,
        file_path: filePath,
        mime_type: file.type,
        active: true,
      });

      if (insErr) throw insErr;

      // 3) Atualiza lista e fecha
      await refreshTemplates();
      closeUploadModal();
    } catch (err) {
      console.error("Upload error:", err);
      setUploadErr(err?.message || "Erro ao subir documento");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="sectionDocuments">
      <div className="documentsLayout">
        {/* LEFT */}
        <div className="documentsMain">
          {/* Header */}
          <div className="documentsHeader">
            <div className="documentsHeaderLeft">
              <h1 className="documentsTitle">Documentos do consultório</h1>
            </div>

            <div className="documentsHeaderRight">
              <div className="documentsSearch">
                <span className="documentsSearchIcon">⌕</span>
                <input
                  className="documentsSearchInput"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar documentos..."
                />
              </div>

              <button
                className="documentsNewBtn"
                type="button"
                onClick={openUploadModal}
                title="Upload de novos documentos"
              >
                Novo documento
              </button>
            </div>
          </div>

          {/* Highlights */}
          <div className="documentsSection">
            <div className="documentsSectionHeader">
              <div className="documentsSectionTitle">
                {normalizedQ ? "Resultados da busca" : "Destaques"}
              </div>
              <button className="documentsGhostBtn" type="button" onClick={() => {}}>
                Ver todos
              </button>
            </div>

            {templatesLoading ? (
              <div className="documentsPatientsEmpty">Carregando documentos...</div>
            ) : templatesError ? (
              <div className="documentsPatientsEmpty">{templatesError}</div>
            ) : (
              <div className="documentsHighlights">
                {(highlighted || []).map((doc, idx) => (
                  <button
                    key={doc.id}
                    type="button"
                    className={`documentsHighlightCard ${idx === 0 ? "isPrimary" : ""}`}
                    onClick={() => openDocModal(doc)}
                  >
                    <div className="documentsHighlightTop">
                      <div className="documentsDocIcon">📄</div>
                      <div className="documentsDocBadge">{doc.category}</div>
                    </div>

                    <div className="documentsHighlightBody">
                      <div className="documentsDocTitle">{doc.title}</div>
                      <div className="documentsDocDesc">{doc.description}</div>
                    </div>

                    <div className="documentsHighlightFooter">
                      <span className="documentsMiniHint">Clique para abrir opções</span>
                      <span className="documentsArrow">→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Templates */}
          <div className="documentsSection">
            <div className="documentsSectionHeader">
              <div className="documentsSectionTitle">Modelos de documentos</div>

              <div className="documentsFilters">
                <div className="documentsFilterLabel">Categoria:</div>
                <div className="documentsChips">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`documentsChip ${category === c ? "active" : ""}`}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="documentsList">
              {filteredTemplates.map((doc) => (
                <div
                  key={doc.id}
                  className="documentsListRow"
                  onClick={() => openDocModal(doc)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="documentsListIcon">📄</div>

                  <div className="documentsListMain">
                    <div className="documentsListTitle">{doc.title}</div>
                    <div className="documentsListDesc">{doc.description}</div>
                  </div>

                  <div className="documentsListCategory">{doc.category}</div>

                  <div className="documentsListActions">
                    <span className="documentsListHint">Abrir</span>
                    <span className="documentsListDots">⋯</span>
                  </div>
                </div>
              ))}

              {!templatesLoading && !filteredTemplates.length && (
                <div className="documentsPatientsEmpty">
                  Nenhum documento encontrado. Use “Novo documento” para subir um modelo.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="documentsSidebar">
          <div className="documentsSidebarInner">
            <div className="documentsSidebarTitle">Painel</div>

            <div className="documentsStatCard">
              <div className="documentsStatLabel">Documentos ativos</div>
              <div className="documentsStatValue">{templates?.length || 0}</div>
              <div className="documentsStatHint">Modelos disponíveis</div>
            </div>

            <div
              className="documentsStatCard clickable"
              role="button"
              tabIndex={0}
              onClick={() => {
                setInstancesStatus("awaiting_signature");
                setInstancesOpen(true);
              }}
            >
              <div className="documentsStatLabel">Documentos aguardando assinatura</div>
              <div className="documentsStatValue">{awaitingCount}</div>
              <div className="documentsStatHint">Pendentes</div>
            </div>

            <div
              className="documentsStatCard clickable"
              role="button"
              tabIndex={0}
              onClick={() => {
                setInstancesStatus("signed");
                setInstancesOpen(true);
              }}
            >
              <div className="documentsStatLabel">Documentos completos</div>
              <div className="documentsStatValue">{signedCount}</div>
              <div className="documentsStatHint">Assinados</div>
            </div>

            <div className="documentsSidebarPlaceholder">
              <div className="documentsPlaceholderTitle">Espaço reservado</div>
              <div className="documentsPlaceholderText">
                Aqui vamos decidir depois: estatísticas, atalhos, documentos recentes, etc.
              </div>
              <button className="documentsSidebarBtn" type="button" onClick={() => {}}>
                Configurar depois
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* OVERLAY: DOCUMENTOS PREENCHIDOS */}
      <DocumentsInstancesOverlay
        open={instancesOpen}
        status={instancesStatus}
        onClose={() => setInstancesOpen(false)}
        onSign={(instance) => {
          // Aqui você decide o que fazer:
          // Exemplo simples: fechar overlay e abrir um modal de assinatura
          setInstancesOpen(false);

          // Opção 1 (recomendada): abrir um "SignatureModal" próprio da instância
          // setSelectedInstance(instance);
          // setSignatureModalOpen(true);

          // Opção 2 (rápida): reabrir Wizard num modo "assinar instância"
          // (se você quiser eu adapto seu Wizard para receber instanceId)
        }}
      />


      {/* MODAL (intro + seleção paciente) */}
      {docModalOpen && (
        <div className="documentsModalOverlay" onMouseDown={closeAll}>
          <div className="documentsModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="documentsModalHeader">
              <div className="documentsModalTitle">{selectedDoc?.title || "Documento"}</div>
              <button className="documentsModalClose" type="button" onClick={closeAll}>
                ×
              </button>
            </div>

            <div className="documentsModalBody">
              {docModalStep === "intro" && (
                <div className="documentsModalIntro">
                  <div className="documentsModalIcon">📄</div>
                  <div className="documentsModalTextStrong">
                    Este documento poderá ser visualizado, preenchido e assinado aqui.
                  </div>
                  <div className="documentsModalTextSoft">
                    Próximo passo: seleção do paciente e preenchimento automático.
                  </div>
                </div>
              )}

              {docModalStep === "patient" && (
                <div className="documentsPatientStep">
                  <div className="documentsPatientHeader">
                    <div className="documentsPatientTitle">Selecione a paciente</div>

                    <div className="documentsPatientSearch">
                      <span className="documentsPatientSearchIcon">⌕</span>
                      <input
                        value={patientQuery}
                        onChange={(e) => setPatientQuery(e.target.value)}
                        placeholder="Buscar por nome..."
                      />
                    </div>
                  </div>

                  {patientsError ? <div className="documentsPatientsEmpty">{patientsError}</div> : null}

                  {patientsLoading ? (
                    <div className="documentsPatientsEmpty">Carregando pacientes...</div>
                  ) : (
                    <div className="documentsPatientsGrid">
                      {filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className={`documentsPatientCard ${selectedPatient?.id === p.id ? "active" : ""}`}
                          onClick={() => setSelectedPatient(p)}
                        >
                          <div className="documentsPatientName">{p.nome}</div>
                        </button>
                      ))}

                      {!filteredPatients.length && !patientsLoading && (
                        <div className="documentsPatientsEmpty">Nenhuma paciente encontrada.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="documentsModalFooter">
              <button className="documentsModalBtn ghost" type="button" onClick={closeAll}>
                Cancelar
              </button>

              {docModalStep === "intro" ? (
                <button className="documentsModalBtn primary" type="button" onClick={() => setDocModalStep("patient")}>
                  Continuar
                </button>
              ) : (
                <button
                  className="documentsModalBtn primary"
                  type="button"
                  disabled={!selectedPatient}
                  onClick={confirmPatientAndOpenWizard}
                >
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WIZARD */}
      <DocumentWizardModal
        open={wizardOpen}
        document={selectedDoc}
        patient={selectedPatient}
        onBack={() => {
          setWizardOpen(false);
          setDocModalOpen(true);
          setDocModalStep("patient");
        }}
        onClose={async () => {
          // fecha tudo + atualiza contadores (e overlay, quando abrir)
          closeAll();
          await refreshCounts();
        }}
      />

      {/* UPLOAD MODAL */}
      {uploadOpen && (
        <div className="documentsModalOverlay" onMouseDown={closeUploadModal}>
          <div className="documentsModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="documentsModalHeader">
              <div className="documentsModalTitle">Novo documento (upload)</div>
              <button className="documentsModalClose" type="button" onClick={closeUploadModal}>
                ×
              </button>
            </div>

            <div className="documentsModalBody">
              <div
                className="documentsUploadDrop"
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUploadDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUploadDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUploadDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUploadDragging(false);
                  const file = e.dataTransfer?.files?.[0];
                  setPickedFile(file);
                }}
                style={{
                  border: uploadDragging ? "2px dashed #999" : "2px dashed #ccc",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <div style={{ marginBottom: 10, fontWeight: 600 }}>Arraste o arquivo aqui (PDF ou DOC/DOCX)</div>

                <div className="filePicker">
                  <input
                    id="docUploadInput"
                    className="filePickerInput"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => setPickedFile(e.target.files?.[0])}
                  />

                  <label className="filePickerBtn" htmlFor="docUploadInput">
                    Escolher arquivo
                  </label>

                  <div className="filePickerName">
                    {newDoc.file ? newDoc.file.name : "Nenhum arquivo selecionado"}
                  </div>
                </div>

                <div style={{ marginTop: 10, opacity: 0.8 }}>
                  {newDoc.file ? `Selecionado: ${newDoc.file.name}` : "Nenhum arquivo selecionado"}
                </div>
              </div>

              <div className="docWizardEditGrid">
                <div className="docWizardField">
                  <label>Título</label>
                  <input
                    value={newDoc.title}
                    onChange={(e) => setNewDoc((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Ex: Consentimento - Lipoaspiração"
                  />
                </div>

                <div className="docWizardField">
                  <label>Categoria</label>
                  <input
                    value={newDoc.category}
                    onChange={(e) => setNewDoc((p) => ({ ...p, category: e.target.value }))}
                    placeholder="Ex: Consentimentos"
                  />
                </div>

                <div className="docWizardField" style={{ gridColumn: "1 / -1" }}>
                  <label>Descrição</label>
                  <input
                    value={newDoc.description}
                    onChange={(e) => setNewDoc((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Ex: Modelo oficial do consultório."
                  />
                </div>
              </div>

              {uploadErr && <div style={{ marginTop: 12, color: "#b00020", fontWeight: 600 }}>{uploadErr}</div>}
            </div>

            <div className="documentsModalFooter">
              <button className="documentsModalBtn ghost" type="button" onClick={closeUploadModal}>
                Cancelar
              </button>

              <button className="documentsModalBtn primary" type="button" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Enviando..." : "Subir documento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Documents;