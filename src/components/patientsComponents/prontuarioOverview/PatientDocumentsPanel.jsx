import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/patientsStyles/patientDocumentsPanel.css";
import { supabase } from "../../../utils/supabaseClient";

const DOCS_TABLE = "paciente_documentos";
const DOCS_BUCKET = "paciente_documentos";

const CATEGORIES = [
  { key: "todas", label: "Todos", icon: "" },
  { key: "geral", label: "Geral", icon: "" },
  { key: "contratos", label: "Contratos", icon: "" },
  { key: "termos", label: "Termos", icon: "" },
  { key: "exames", label: "Exames", icon: "" },
  { key: "outros", label: "Outros", icon: "" },
];

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
};

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const fileIconByMime = (mime, name) => {
  const n = (name || "").toLowerCase();
  const m = (mime || "").toLowerCase();

  if (m.includes("pdf") || n.endsWith(".pdf")) return "📄";
  if (m.includes("word") || n.endsWith(".doc") || n.endsWith(".docx")) return "📝";
  if (m.includes("excel") || n.endsWith(".xls") || n.endsWith(".xlsx")) return "📊";
  if (m.includes("image") || n.match(/\.(png|jpg|jpeg|webp)$/)) return "🖼️";
  return "📎";
};

export default function PatientDocumentsPanel({ pacienteId }) {
  const fileInputRef = useRef(null);

  const [category, setCategory] = useState("todas");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // menu ...
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // preview modal upload
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    if (!pacienteId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(DOCS_TABLE)
        .select("id,paciente_id,titulo,categorias,nome_exibicao,path,url_publica,mime_type,tamanho_bytes,created_at")
        .eq("paciente_id", pacienteId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro fetch documentos:", error);
        return;
      }
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    const closeMenu = () => setMenuOpenId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  const countsByCategory = useMemo(() => {
    const base = { todas: items.length };
    for (const c of CATEGORIES) {
      if (c.key === "todas") continue;
      base[c.key] = items.filter((it) => (it.categorias || []).includes(c.key)).length;
    }
    return base;
  }, [items]);

  const filtered = useMemo(() => {
    if (category === "todas") return items;
    return items.filter((it) => (it.categorias || []).includes(category));
  }, [items, category]);

  const pickFiles = () => fileInputRef.current?.click();

  const onFilesSelected = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    setSelectedFiles(list);

    const nextDrafts = {};
    list.forEach((f, idx) => {
      nextDrafts[idx] = {
        titulo: f.name.replace(/\.[^/.]+$/, ""),
        categorias: category !== "todas" ? [category] : ["geral"],
      };
    });
    setDrafts(nextDrafts);
    setPreviewOpen(true);
  };

  const toggleDraftCategory = (fileIdx, catKey) => {
    setDrafts((prev) => {
      const cur = prev[fileIdx] || { titulo: "", categorias: [] };
      const has = (cur.categorias || []).includes(catKey);
      const nextCats = has ? cur.categorias.filter((c) => c !== catKey) : [...cur.categorias, catKey];
      return {
        ...prev,
        [fileIdx]: {
          ...cur,
          categorias: nextCats.length ? nextCats : ["geral"],
        },
      };
    });
  };

  const setDraftTitle = (fileIdx, value) => {
    setDrafts((prev) => ({
      ...prev,
      [fileIdx]: { ...(prev[fileIdx] || {}), titulo: value },
    }));
  };

  const buildPath = (file) => {
    const safe = file.name.replace(/\s+/g, "_");
    return `${pacienteId}/${Date.now()}-${safe}`;
  };

  const handleUploadConfirm = async () => {
    if (!pacienteId) return;
    if (!selectedFiles.length) return;

    setUploading(true);
    try {
      for (let idx = 0; idx < selectedFiles.length; idx++) {
        const file = selectedFiles[idx];
        const d = drafts[idx] || { titulo: "", categorias: ["geral"] };
        const path = buildPath(file);

        const { error: upErr } = await supabase.storage
          .from(DOCS_BUCKET)
          .upload(path, file, { upsert: false });

        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from(DOCS_BUCKET).getPublicUrl(path);
        const url_publica = pub?.publicUrl || null;

        const { error: insErr } = await supabase.from(DOCS_TABLE).insert({
          paciente_id: pacienteId,
          titulo: d.titulo || null,
          categorias: Array.isArray(d.categorias) && d.categorias.length ? d.categorias : ["geral"],
          nome_exibicao: file.name,
          path,
          url_publica,
          mime_type: file.type || null,
          tamanho_bytes: typeof file.size === "number" ? file.size : null,
        });

        if (insErr) throw insErr;
      }

      setPreviewOpen(false);
      setSelectedFiles([]);
      setDrafts({});
      await fetchItems();
    } catch (e) {
      console.error("Erro ao enviar documentos:", e);
      alert("Erro ao enviar documentos: " + (e?.message || String(e)));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;
    const ok = window.confirm("Deseja realmente excluir este documento?");
    if (!ok) return;

    setDeletingId(item.id);
    setMenuOpenId(null);

    try {
      if (item.path) {
        const { error: rmErr } = await supabase.storage.from(DOCS_BUCKET).remove([item.path]);
        if (rmErr) console.error("Erro remove storage:", rmErr);
      }

      const { error: dbErr } = await supabase.from(DOCS_TABLE).delete().eq("id", item.id);
      if (dbErr) throw dbErr;

      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch (e) {
      console.error("Erro ao excluir:", e);
      alert("Erro ao excluir: " + (e?.message || String(e)));
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpen = (item) => {
    if (!item?.url_publica) return;
    window.open(item.url_publica, "_blank", "noopener,noreferrer");
  };

  const stopClick = (e) => e.stopPropagation();

  return (
    <div className="patientDocsWrap">
      {/* TOP */}
      <div className="pdTop">
        <div className="pdHeaderRow">
          <div className="pdTitle">
            <h3>Documentos</h3>
            <p>Envie arquivos, categorize e abra/baixe com um clique.</p>
          </div>
        </div>

        <div className="pdCatsBar">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`pdCatBtn ${category === c.key ? "pdCatBtnActive" : ""}`}
              onClick={() => setCategory(c.key)}
            >
              <span className="pdCatIcon">{c.icon}</span>
              {c.label}
              <span className="pdCatCount">{countsByCategory[c.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MIDDLE */}
      <div className="pdMiddle">
        <div className="pdBox">
          {loading ? (
            <div className="pdState">Carregando documentos...</div>
          ) : filtered.length === 0 ? (
            <div className="pdState">
              Nenhum documento encontrado para <strong>{category}</strong>.
            </div>
          ) : (
            <div className="pdScroll">
              <div className="pdGrid">
                {filtered.map((it) => (
                  <div key={it.id} className="pdCard">
                    <div className="pdThumb" onClick={() => handleOpen(it)} role="button" tabIndex={0}>
                      <div className="pdFileIcon">
                        {fileIconByMime(it.mime_type, it.nome_exibicao)}
                      </div>

                      <button
                        type="button"
                        className="pdEllipsis"
                        title="Opções"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuOpenId((prev) => (prev === it.id ? null : it.id));
                        }}
                      >
                        …
                      </button>

                      {menuOpenId === it.id && (
                        <div
                          style={{
                            position: "absolute",
                            top: 54,
                            right: 10,
                            zIndex: 10,
                            background: "rgba(255,255,255,.96)",
                            border: "1px solid rgba(230,232,242,.9)",
                            borderRadius: 14,
                            padding: 6,
                            boxShadow: "0 18px 40px rgba(0,0,0,.18)",
                            minWidth: 170,
                          }}
                          onClick={stopClick}
                        >
                          <button
                            type="button"
                            style={{
                              width: "100%",
                              textAlign: "left",
                              border: "none",
                              background: "transparent",
                              padding: "10px 10px",
                              borderRadius: 10,
                              cursor: "pointer",
                              color: "#0f172a",
                              fontSize: 12,
                            }}
                            onClick={() => handleOpen(it)}
                          >
                            Abrir
                          </button>

                          <button
                            type="button"
                            style={{
                              width: "100%",
                              textAlign: "left",
                              border: "none",
                              background: "transparent",
                              padding: "10px 10px",
                              borderRadius: 10,
                              cursor: deletingId === it.id ? "default" : "pointer",
                              color: "#b91c1c",
                              fontSize: 12,
                              opacity: deletingId === it.id ? 0.6 : 1,
                            }}
                            disabled={deletingId === it.id}
                            onClick={() => handleDelete(it)}
                          >
                            {deletingId === it.id ? "Excluindo..." : "Excluir"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pdOverlay">
                      <p className="pdDocTitle">{it.titulo || it.nome_exibicao || "Sem título"}</p>
                      <div className="pdMeta">
                        <span>{formatDate(it.created_at)}</span>
                        {it.tamanho_bytes != null && <span>{formatSize(it.tamanho_bytes)}</span>}
                      </div>

                      <div className="pdChips">
                        {(it.categorias || []).map((c) => (
                          <span className="pdChip" key={`${it.id}-${c}`}>{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="pdBottom">
        <div
          className="pdDropzone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFilesSelected(e.dataTransfer.files);
          }}
          role="button"
          tabIndex={0}
        >
          <div className="pdDropLeft">
            <div className="pdDropIcon"></div>
            <div className="pdDropText">
              <strong>Arraste documentos aqui</strong>
              <span>ou clique para selecionar (abre preview antes de enviar)</span>
            </div>
          </div>

          <button
            type="button"
            className="pdDropBtn"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Selecionar arquivos
          </button>

          <input
            ref={fileInputRef}
            className="pdHiddenInput"
            type="file"
            multiple
            onChange={(e) => onFilesSelected(e.target.files)}
          />
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewOpen && (
        <div className="pdModalOverlay" onClick={() => setPreviewOpen(false)}>
          <div className="pdModal" onClick={stopClick}>
            <div className="pdModalHeader">
              <div>
                <h4>Pré-visualização</h4>
                <p>Renomeie e escolha categorias antes de enviar.</p>
              </div>
              <button className="pdClose" type="button" onClick={() => setPreviewOpen(false)}>
                ✕
              </button>
            </div>

            <div className="pdModalBody">
              <div className="pdPreviewList">
                {selectedFiles.map((file, idx) => {
                  const d = drafts[idx] || { titulo: "", categorias: ["geral"] };
                  const icon = fileIconByMime(file.type, file.name);

                  return (
                    <div className="pdPreviewRow" key={`${file.name}-${idx}`}>
                      <div className="pdPreviewIcon">
                        <div className="pdPreviewIconBox">{icon}</div>
                      </div>

                      <div className="pdPreviewFields">
                        <input
                          className="pdInput"
                          value={d.titulo || ""}
                          onChange={(e) => setDraftTitle(idx, e.target.value)}
                          placeholder="Título do documento"
                        />

                        <div className="pdCatsBar" style={{ marginTop: 0 }}>
                          {CATEGORIES.filter((c) => c.key !== "todas").map((c) => (
                            <button
                              key={`${idx}-${c.key}`}
                              type="button"
                              className={`pdCatBtn ${d.categorias?.includes(c.key) ? "pdCatBtnActive" : ""}`}
                              onClick={() => toggleDraftCategory(idx, c.key)}
                              style={{ padding: "7px 10px" }}
                            >
                              <span className="pdCatIcon" style={{ width: 22, height: 22, borderRadius: 10 }}>
                                {c.icon}
                              </span>
                              {c.label}
                            </button>
                          ))}
                        </div>

                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {file.name} • {formatSize(file.size)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pdModalFooter">
              <button className="pdBtnGhost" type="button" onClick={() => setPreviewOpen(false)} disabled={uploading}>
                Cancelar
              </button>
              <button className="pdBtnPrimary" type="button" onClick={handleUploadConfirm} disabled={uploading}>
                {uploading ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}