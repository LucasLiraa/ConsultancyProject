import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/patientsStyles/patientGalleryPanel.css";
import { supabase } from "../../../utils/supabaseClient";

const GALLERY_TABLE = "paciente_galeria_fotos";
const GALLERY_BUCKET = "paciente_galeria";

const CATEGORIES = [
  { key: "Todas", label: "Todas", icon: "" },
  { key: "Antes", label: "Antes", icon: "" },
  { key: "Depois", label: "Depois", icon: "" },
  { key: "Exames", label: "Exames", icon: "" },
  { key: "Outras imagens", label: "Outras imagens", icon: "" },
];

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
};

export default function PatientGalleryPanel({ pacienteId }) {
  const fileInputRef = useRef(null);

  const [category, setCategory] = useState("todas");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lightbox / carousel
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Zoom / rotation
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Preview modal (upload)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [drafts, setDrafts] = useState({}); // { [idx]: { titulo, categorias } }
  const [uploading, setUploading] = useState(false);

  // menu dos 3 pontinhos
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };
  const zoomIn = () => setZoom((z) => clamp(Number((z + 0.2).toFixed(2)), 1, 4));
  const zoomOut = () => setZoom((z) => clamp(Number((z - 0.2).toFixed(2)), 1, 4));
  const rotateLeft = () => setRotation((r) => (r - 90) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);

  const fetchItems = async () => {
    if (!pacienteId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(GALLERY_TABLE)
        .select("id,paciente_id,titulo,categorias,nome_exibicao,path,url_publica,created_at")
        .eq("paciente_id", pacienteId)
        .order("created_at", { ascending: true }); // ordem de upload

      if (error) {
        console.error("Erro fetch galeria:", error);
        return;
      }

      setItems(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // fecha menu ao clicar fora
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

  const gridClass = category === "todas" ? "pgGridLarge" : "pgGridSmall";

  const hasPrev = lightboxIndex > 0;
  const hasNext = lightboxIndex < filtered.length - 1;

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    resetView();
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = () => {
    if (!hasPrev) return;
    setLightboxIndex((p) => p - 1);
    resetView();
  };

  const goNext = () => {
    if (!hasNext) return;
    setLightboxIndex((p) => p + 1);
    resetView();
  };

  const pickFiles = () => fileInputRef.current?.click();

  const onFilesSelected = (files) => {
    const list = Array.from(files || []);
    if (list.length === 0) return;

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
      [fileIdx]: {
        ...(prev[fileIdx] || {}),
        titulo: value,
      },
    }));
  };

  const stopClick = (e) => e.stopPropagation();

  const onWheelZoom = (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    setZoom((z) => clamp(Number((z + dir * 0.12).toFixed(2)), 1, 4));
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

        // 1) storage upload
        const { error: upErr } = await supabase.storage
          .from(GALLERY_BUCKET)
          .upload(path, file, { upsert: false });

        if (upErr) throw upErr;

        // 2) url pública
        const { data: pub } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
        const url_publica = pub?.publicUrl || null;

        // 3) insert na tabela
        const { error: insErr } = await supabase.from(GALLERY_TABLE).insert({
          paciente_id: pacienteId,
          titulo: d.titulo || null,
          categorias: Array.isArray(d.categorias) && d.categorias.length ? d.categorias : ["geral"],
          nome_exibicao: file.name,
          path,
          url_publica,
        });

        if (insErr) throw insErr;
      }

      setPreviewOpen(false);
      setSelectedFiles([]);
      setDrafts({});
      await fetchItems();
    } catch (e) {
      console.error("Erro ao enviar imagens:", e);
      alert("Erro ao enviar imagens: " + (e?.message || String(e)));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;
    const ok = window.confirm("Deseja realmente excluir esta foto?");
    if (!ok) return;

    setDeletingId(item.id);
    setMenuOpenId(null);

    try {
      // remove do storage
      if (item.path) {
        const { error: rmErr } = await supabase.storage.from(GALLERY_BUCKET).remove([item.path]);
        if (rmErr) {
          // não trava: tenta remover do banco mesmo assim
          console.error("Erro remove storage:", rmErr);
        }
      }

      // remove do banco
      const { error: dbErr } = await supabase.from(GALLERY_TABLE).delete().eq("id", item.id);
      if (dbErr) throw dbErr;

      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch (e) {
      console.error("Erro ao excluir:", e);
      alert("Erro ao excluir: " + (e?.message || String(e)));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="patientGalleryWrap">
      {/* TOP */}
      <div className="pgTop">
        <div className="pgHeaderRow">
          <div className="pgTitle">
            <h3>Galeria do paciente</h3>
            <p>Filtre por categoria, navegue em grade e abra as fotos em tela cheia.</p>
          </div>
        </div>

        <div className="pgCatsBar">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`pgCatBtn ${category === c.key ? "pgCatBtnActive" : ""}`}
              onClick={() => setCategory(c.key)}
            >
              <span className="pgCatIcon">{c.icon}</span>
              {c.label}
              <span className="pgCatCount">{countsByCategory[c.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MIDDLE */}
      <div className="pgMiddle">
        <div className="pgGalleryBox">
          {loading ? (
            <div className="pgState">Carregando galeria...</div>
          ) : filtered.length === 0 ? (
            <div className="pgState">
              Nenhuma foto encontrada para <strong>{category}</strong>.
            </div>
          ) : (
            <div className="pgGalleryScroll">
              <div className={`pgGrid ${gridClass}`}>
                {filtered.map((it, idx) => (
                  <div key={it.id} className="pgCard" onClick={() => openLightbox(idx)}>
                    <img className="pgCardImage" src={it.url_publica} alt={it.titulo || "Foto"} />

                    <button
                      type="button"
                      className="pgEllipsis"
                      title="Opções"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpenId((prev) => (prev === it.id ? null : it.id));
                      }}
                    >
                      …
                    </button>

                    {/* menu simples */}
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
                          minWidth: 150,
                        }}
                        onClick={(e) => e.stopPropagation()}
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

                    {/* overlay blur */}
                    <div className="pgCardOverlay">
                      <div className="pgCardTitle">{it.titulo || it.nome_exibicao || "Sem título"}</div>
                      <div className="pgCardSub">
                        <span>{formatDate(it.created_at)}</span>
                      </div>
                      <div className="pgMiniChips">
                        {(it.categorias || []).map((cat) => (
                          <span className="pgMiniChip" key={`${it.id}-${cat}`}>
                            {cat}
                          </span>
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
      <div className="pgBottom">
        <div
          className="pgDropzone"
          onClick={pickFiles}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFilesSelected(e.dataTransfer.files);
          }}
          role="button"
          tabIndex={0}
        >
          <div className="pgDropLeft">
            <div className="pgDropIcon"></div>
            <div className="pgDropText">
              <strong>Arraste imagens aqui</strong>
              <span>ou clique para selecionar (abre preview antes de enviar)</span>
            </div>
          </div>

          <button
            type="button"
            className="pgDropBtn"
            onClick={(e) => {
              e.stopPropagation();
              pickFiles();
            }}
          >
            Selecionar imagens
          </button>

          <input
            ref={fileInputRef}
            className="pgHiddenInput"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFilesSelected(e.target.files)}
          />
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && filtered[lightboxIndex] && (
        <div className="pgLightboxOverlay" onClick={closeLightbox}>
          <div className="pgLightbox" onClick={stopClick} onWheel={onWheelZoom}>
            <div className="pgLightboxTop">
              <div className="pgLightboxTopLeft">
                <button className="pgCtrlBtn" type="button" onClick={zoomOut} disabled={zoom <= 1} title="Diminuir zoom">
                  −
                </button>
                <div className="pgZoomPill">{Math.round(zoom * 100)}%</div>
                <button className="pgCtrlBtn" type="button" onClick={zoomIn} disabled={zoom >= 4} title="Aumentar zoom">
                  +
                </button>

                <button className="pgCtrlBtn" type="button" onClick={resetView} title="Resetar">
                  ⟲
                </button>

                <button className="pgCtrlBtn" type="button" onClick={rotateLeft} title="Girar à esquerda">
                  ↺
                </button>
                <button className="pgCtrlBtn" type="button" onClick={rotateRight} title="Girar à direita">
                  ↻
                </button>
              </div>

              <div className="pgLightboxTopRight">
                <button className="pgCtrlBtn" type="button" onClick={closeLightbox} title="Fechar">
                  ✕
                </button>
              </div>
            </div>

            <div className="pgLightboxStage">
              <button type="button" className="pgNavBtn pgNavLeft" onClick={goPrev} disabled={!hasPrev} title="Anterior">
                ‹
              </button>

              <div className="pgLightboxImageWrap">
                <img
                  className="pgLightboxImage"
                  src={filtered[lightboxIndex].url_publica}
                  alt={filtered[lightboxIndex].titulo || "Foto"}
                  style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                  draggable={false}
                />
              </div>

              <button type="button" className="pgNavBtn pgNavRight" onClick={goNext} disabled={!hasNext} title="Próxima">
                ›
              </button>

              <div className="pgLightboxCaption">
                <div className="pgCapTitle">
                  {filtered[lightboxIndex].titulo || filtered[lightboxIndex].nome_exibicao || "Sem título"}
                </div>
                <div className="pgCapMeta">
                  <span>{formatDate(filtered[lightboxIndex].created_at)}</span>
                  {(filtered[lightboxIndex].categorias || []).map((c) => (
                    <span className="pgCapChip" key={`${filtered[lightboxIndex].id}-${c}`}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewOpen && (
        <div className="pgModalOverlay" onClick={() => setPreviewOpen(false)}>
          <div className="pgModal" onClick={stopClick}>
            <div className="pgModalHeader">
              <div>
                <h4>Pré-visualização</h4>
                <p>Defina título e categorias antes de enviar.</p>
              </div>
              <button className="pgClose" type="button" onClick={() => setPreviewOpen(false)}>
                ✕
              </button>
            </div>

            <div className="pgModalBody">
              <div className="pgPreviewGrid">
                {selectedFiles.map((file, idx) => {
                  const url = URL.createObjectURL(file);
                  const d = drafts[idx] || { titulo: "", categorias: ["geral"] };

                  return (
                    <div className="pgPreviewCard" key={`${file.name}-${idx}`}>
                      <div className="pgPreviewImg">
                        <img src={url} alt={file.name} />
                      </div>

                      <div className="pgPreviewFields">
                        <input
                          className="pgInput"
                          value={d.titulo || ""}
                          onChange={(e) => setDraftTitle(idx, e.target.value)}
                          placeholder="Título da foto"
                        />

                        <div className="pgCatsBar" style={{ marginTop: 0 }}>
                          {CATEGORIES.filter((c) => c.key !== "todas").map((c) => (
                            <button
                              key={`${idx}-${c.key}`}
                              type="button"
                              className={`pgCatBtn ${d.categorias?.includes(c.key) ? "pgCatBtnActive" : ""}`}
                              onClick={() => toggleDraftCategory(idx, c.key)}
                              style={{ padding: "7px 10px" }}
                            >
                              <span className="pgCatIcon" style={{ width: 22, height: 22, borderRadius: 10 }}>
                                {c.icon}
                              </span>
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pgModalFooter">
              <button className="pgBtnGhost" type="button" onClick={() => setPreviewOpen(false)} disabled={uploading}>
                Cancelar
              </button>
              <button className="pgBtnPrimary" type="button" onClick={handleUploadConfirm} disabled={uploading}>
                {uploading ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}