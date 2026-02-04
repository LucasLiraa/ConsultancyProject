import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { listPhotos, deletePhoto } from "./postOpMediaService";
import "../styles/postOperativeStyles/postOperativeGallery.css";

const CATEGORY_LABELS = {
  antes: "Antes",
  depois: "Depois",
  outros: "Outras fotos",
};

const CATEGORY_ORDER = ["antes", "depois", "outros"];
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const PostOperativeGalleryModal = ({ open, onClose, pacientePosId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("antes");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // zoom/rotate
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);

  // trava scroll do body quando abre
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const reloadPhotos = async () => {
    if (!pacientePosId) return;
    setLoading(true);
    try {
      const data = await listPhotos({ pacientePosId });
      setPhotos(data || []);
      setCurrentCategory("antes");
      setCurrentIndex(0);
      setZoom(1);
      setRot(0);
    } catch (err) {
      console.error("Erro ao carregar galeria:", err.message || err);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    reloadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pacientePosId]);

  const activePhotos = useMemo(
    () => photos.filter((p) => p.categoria === currentCategory),
    [photos, currentCategory]
  );

  const currentPhoto =
    activePhotos.length > 0
      ? activePhotos[Math.min(currentIndex, activePhotos.length - 1)]
      : null;

  useEffect(() => {
    if (activePhotos.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= activePhotos.length) {
      setCurrentIndex(activePhotos.length - 1);
    }
  }, [activePhotos.length, currentIndex]);

  useEffect(() => {
    setZoom(1);
    setRot(0);
  }, [currentCategory, currentIndex]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const hasPrev = activePhotos.length > 0 && currentIndex > 0;
  const hasNext = activePhotos.length > 0 && currentIndex < activePhotos.length - 1;

  const goPrev = () => hasPrev && setCurrentIndex((p) => p - 1);
  const goNext = () => hasNext && setCurrentIndex((p) => p + 1);

  const zoomIn = () => setZoom((z) => clamp(Number((z + 0.15).toFixed(2)), 1, 3));
  const zoomOut = () => setZoom((z) => clamp(Number((z - 0.15).toFixed(2)), 1, 3));
  const resetView = () => {
    setZoom(1);
    setRot(0);
  };
  const rotate = () => setRot((r) => (r + 90) % 360);

  const handleDelete = async (photo) => {
    if (!photo) return;
    const ok = window.confirm("Deseja excluir esta foto?");
    if (!ok) return;

    setDeletingId(photo.id);
    try {
      await deletePhoto({ id: photo.id, path: photo.path });
      await reloadPhotos();
    } catch (err) {
      console.error("Erro ao excluir foto:", err);
      alert("Erro ao excluir foto: " + (err.message || String(err)));
    } finally {
      setDeletingId(null);
    }
  };

  const modal = (
    <div className="poGalOverlay" onClick={onClose}>
      <div className="poGalModal" onClick={(e) => e.stopPropagation()}>
        <div className="poGalHeader">
          <h3>Galeria do Pós-Operatório</h3>
          <div className="poGalHeaderActions">
            <button className="poBtnGhost" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>

        <div className="poGalBody">
          <div className="poGalTabs">
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                className={`poGalTab ${currentCategory === cat ? "active" : ""}`}
                onClick={() => setCurrentCategory(cat)}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="muted">Carregando fotos...</p>
          ) : activePhotos.length === 0 ? (
            <p className="muted">Nenhuma foto nesta categoria.</p>
          ) : (
            <div className="poGalViewer">
              <div className="poGalTopbar">
                <div className="poGalNav">
                  <button className="poBtnSm" onClick={goPrev} disabled={!hasPrev}>
                    ◀
                  </button>
                  <span className="poGalCounter">
                    {currentIndex + 1} / {activePhotos.length}
                  </span>
                  <button className="poBtnSm" onClick={goNext} disabled={!hasNext}>
                    ▶
                  </button>
                </div>

                <div className="poGalTools">
                  <button className="poBtnSm" onClick={zoomOut} title="Diminuir zoom">
                    −
                  </button>
                  <button className="poBtnSm" onClick={zoomIn} title="Aumentar zoom">
                    +
                  </button>
                  <button className="poBtnSm" onClick={rotate} title="Girar">
                    ↻
                  </button>
                  <button className="poBtnGhost" onClick={resetView} title="Resetar">
                    Reset
                  </button>
                </div>
              </div>

              {currentPhoto && (
                <>
                  <div className="poGalStage">
                    <div
                      className="poGalStageBg"
                      style={{ backgroundImage: `url(${currentPhoto.url_publica})` }}
                    />
                    <div className="poGalImageWrap">
                      <img
                        className="poGalImage"
                        src={currentPhoto.url_publica}
                        alt={currentPhoto.nome_exibicao || "foto"}
                        style={{ transform: `scale(${zoom}) rotate(${rot}deg)` }}
                        draggable={false}
                      />
                    </div>
                  </div>

                  <div className="poGalFooter">
                    <div className="poGalMeta">
                      <strong>{currentPhoto.nome_exibicao || "Sem nome"}</strong>
                      <div className="muted">
                        Semana {currentPhoto.semana || "—"} •{" "}
                        {CATEGORY_LABELS[currentPhoto.categoria] || "—"}
                      </div>
                    </div>

                    <button
                      className="poBtnDanger"
                      onClick={() => handleDelete(currentPhoto)}
                      disabled={deletingId === currentPhoto.id}
                    >
                      {deletingId === currentPhoto.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ✅ PORTAL: joga pro body e vira overlay real
  return createPortal(modal, document.body);
};

export default PostOperativeGalleryModal;