import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/postOperativeStyles/weeklyControlForm.css"; // reutiliza estilos base

const CATEGORY_LABELS = {
  antes: "Antes",
  depois: "Depois",
  outros: "Outras fotos",
};

const CATEGORY_ORDER = ["antes", "depois", "outros"];

const PostOperativeGalleryModal = ({
  open,
  onClose,
  pacientePosId,
  pacienteId,
}) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("antes");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // Carregar TODAS as fotos desse paciente_pos (todas as semanas)
  useEffect(() => {
    const fetchAllPhotos = async () => {
      if (!open || !pacientePosId) return;
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("pos_fotos")
          .select("*")
          .eq("paciente_pos_id", pacientePosId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Erro ao carregar galeria:", error.message);
          return;
        }

        setPhotos(data || []);
        // Resetar seleção quando abrir
        setCurrentCategory("antes");
        setCurrentIndex(0);
      } catch (err) {
        console.error("Erro ao carregar galeria:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPhotos();
  }, [open, pacientePosId]);

  // Fotos filtradas pela categoria atual
  const activePhotos = useMemo(
    () => photos.filter((p) => p.categoria === currentCategory),
    [photos, currentCategory]
  );

  // Foto atual
  const currentPhoto =
    activePhotos.length > 0
      ? activePhotos[Math.min(currentIndex, activePhotos.length - 1)]
      : null;

  // Ajustar índice se a categoria mudar ou o tamanho da lista mudar
  useEffect(() => {
    if (activePhotos.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= activePhotos.length) {
      setCurrentIndex(activePhotos.length - 1);
    }
  }, [activePhotos.length, currentIndex]);

  if (!open) return null;

  const hasPrev = activePhotos.length > 0 && currentIndex > 0;
  const hasNext =
    activePhotos.length > 0 && currentIndex < activePhotos.length - 1;

  const goPrev = () => {
    if (hasPrev) setCurrentIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (hasNext) setCurrentIndex((prev) => prev + 1);
  };

  const handleThumbClick = (idx) => {
    setCurrentIndex(idx);
  };

  const handleDelete = async (photo) => {
    if (!photo) return;

    const confirmDelete = window.confirm(
      "Deseja realmente excluir esta foto do pós-operatório?"
    );
    if (!confirmDelete) return;

    setDeletingId(photo.id);

    try {
      // remove do Storage
      if (photo.path) {
        const { error: storageError } = await supabase.storage
          .from("pos_fotos")
          .remove([photo.path]);

        if (storageError) {
          console.error("Erro ao remover arquivo do Storage:", storageError);
          // mesmo que falhe, tenta remover do banco
        }
      }

      // remove da tabela
      const { error: dbError } = await supabase
        .from("pos_fotos")
        .delete()
        .eq("id", photo.id);

      if (dbError) {
        console.error("Erro ao remover registro da tabela pos_fotos:", dbError);
        throw dbError;
      }

      // atualiza estado local
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      console.error("Erro ao excluir foto na galeria:", err);
      alert("Erro ao excluir foto: " + (err.message || String(err)));
    } finally {
      setDeletingId(null);
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains("galleryOverlay")) {
      onClose?.();
    }
  };

  return (
    <div className="galleryOverlay" onClick={handleBackgroundClick}>
      <div className="galleryModal">
        <button className="galleryClose" type="button" onClick={onClose}>
          ✕
        </button>

        <div className="galleryHeader">
          <div>
            <h3>Galeria de fotos do pós-operatório</h3>
            <p>
              Visualize todas as fotos por categoria. As semanas aparecem nos
              detalhes de cada foto.
            </p>
          </div>

          <div className="galleryCategoryTabs">
            {CATEGORY_ORDER.map((cat) => {
              const count = photos.filter((p) => p.categoria === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCurrentCategory(cat);
                    setCurrentIndex(0);
                  }}
                  className={`galleryTab ${
                    currentCategory === cat ? "active" : ""
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                  {count > 0 && (
                    <span className="galleryTabCount">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="galleryLoading">Carregando fotos...</div>
        ) : activePhotos.length === 0 ? (
          <div className="galleryEmpty">
            Nenhuma foto cadastrada na categoria{" "}
            <strong>{CATEGORY_LABELS[currentCategory]}</strong> ainda.
          </div>
        ) : (
          <>
            {/* Foto principal + setas */}
            <div className="galleryMain">
              <button
                type="button"
                className="galleryArrow left"
                onClick={goPrev}
                disabled={!hasPrev}
              >
                ‹
              </button>

              <div className="galleryMainImageWrapper">
                {currentPhoto?.url_publica && (
                  <img
                    src={currentPhoto.url_publica}
                    alt={currentPhoto.nome_exibicao || "Foto pós-operatório"}
                  />
                )}
              </div>

              <button
                type="button"
                className="galleryArrow right"
                onClick={goNext}
                disabled={!hasNext}
              >
                ›
              </button>
            </div>

            {/* Infos da foto atual */}
            <div className="galleryMeta">
              <div className="galleryMetaText">
                <div className="galleryMetaMain">
                  <span className="galleryBadge">
                    Semana {currentPhoto?.semana || "-"}
                  </span>
                  <span className="galleryPhotoName">
                    {currentPhoto?.nome_exibicao || "Foto"}
                  </span>
                </div>
                <div className="galleryMetaSub">
                  Categoria:{" "}
                  <strong>
                    {CATEGORY_LABELS[currentPhoto?.categoria] || "-"}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="galleryDeleteBtn"
                onClick={() => handleDelete(currentPhoto)}
                disabled={deletingId === currentPhoto?.id}
              >
                {deletingId === currentPhoto?.id
                  ? "Excluindo..."
                  : "Excluir foto"}
              </button>
            </div>

            {/* Thumbs da categoria */}
            <div className="galleryThumbStrip">
              {activePhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  className={`galleryThumb ${
                    idx === currentIndex ? "active" : ""
                  }`}
                  onClick={() => handleThumbClick(idx)}
                >
                  {photo.url_publica && (
                    <img
                      src={photo.url_publica}
                      alt={photo.nome_exibicao || "Foto pós"}
                    />
                  )}
                  <span className="galleryThumbWeek">
                    Sem {photo.semana || "-"}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostOperativeGalleryModal;