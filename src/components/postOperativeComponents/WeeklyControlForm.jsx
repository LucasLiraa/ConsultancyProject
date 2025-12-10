<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/postOperativeStyles/weeklyControlForm.css";
import PostOperativeGalleryModal from "./PostOperativeGalleryModal";

// categorias de fotos
const PHOTO_CATEGORIES = [
  { key: "antes", label: "Fotos antes" },
  { key: "depois", label: "Fotos depois" },
  { key: "outros", label: "Outras fotos do pós" },
];

/**
 * Form que salva/atualiza um registro por semana.
 * Props:
 * - postOp: registro pacientes_pos
 * - semanaAtual: string (ex: "1", "2", ...)
 * - onSaved(): callback para recarregar semanas no Manager
 */
const WeeklyControlForm = ({ postOp, semanaAtual, onSaved }) => {
  const initialForm = {
    data_registro: "",

    edema: false,
    edema_obs: "",
    fibrose: false,
    fibrose_obs: "",
    seroma: false,
    seroma_obs: "",
    cicatrizacao: false,
    cicatrizacao_obs: "",
    drenagem: false,
    drenagem_obs: "",
    fita_silicone: false,
    fita_silicone_obs: "",
    oleo_rosa_mosqueta: false,
    oleo_rosa_mosqueta_obs: "",
    outros_check: false,
    outros_obs: "",

    curativos_informados: "",
    alimentacao: "",
    retorno_atividade_fisica: "",
    retorno_trabalho: "",
    atestado: "",
    liberada_dirigir: "",
    outras_observacoes: "",

    alta: false,
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // fotos
  const [existingPhotos, setExistingPhotos] = useState([]); // do banco
  const [pendingPhotos, setPendingPhotos] = useState([]); // ainda não enviadas
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  const postOpId = postOp?.id;

  // carregar dados existentes da semana
  useEffect(() => {
    const fetchWeek = async () => {
      if (!postOpId || !semanaAtual) return;

      const { data, error } = await supabase
        .from("pos_operatorio")
        .select("*")
        .eq("paciente_pos_id", postOpId)
        .eq("semana", String(semanaAtual))
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar semana:", error.message);
        return;
      }

      if (data) {
        setForm({
          data_registro: data.data_registro || "",

          edema: !!data.edema,
          edema_obs: data.edema_obs || "",
          fibrose: !!data.fibrose,
          fibrose_obs: data.fibrose_obs || "",
          seroma: !!data.seroma,
          seroma_obs: data.seroma_obs || "",
          cicatrizacao: !!data.cicatrizacao,
          cicatrizacao_obs: data.cicatrizacao_obs || "",
          drenagem: !!data.drenagem,
          drenagem_obs: data.drenagem_obs || "",
          fita_silicone: !!data.fita_silicone,
          fita_silicone_obs: data.fita_silicone_obs || "",
          oleo_rosa_mosqueta: !!data.oleo_rosa_mosqueta,
          oleo_rosa_mosqueta_obs: data.oleo_rosa_mosqueta_obs || "",
          outros_check: !!data.outros_check,
          outros_obs: data.outros_obs || "",

          curativos_informados: data.curativos_informados || "",
          alimentacao: data.alimentacao || "",
          retorno_atividade_fisica: data.retorno_atividade_fisica || "",
          retorno_trabalho: data.retorno_trabalho || "",
          atestado: data.atestado || "",
          liberada_dirigir: data.liberada_dirigir || "",
          outras_observacoes: data.outras_observacoes || "",

          alta: !!data.alta,
        });
      } else {
        setForm(initialForm);
      }
    };

    fetchWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postOpId, semanaAtual]);

  // carregar fotos já enviadas
  const loadPhotos = async () => {
    if (!postOpId || !semanaAtual) return;
    const { data, error } = await supabase
      .from("pos_fotos")
      .select("*")
      .eq("paciente_pos_id", postOpId)
      .eq("semana", String(semanaAtual))
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar fotos:", error.message);
      return;
    }
    setExistingPhotos(data || []);
  };

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postOpId, semanaAtual]);

  // cleanup dos object URLs gerados para preview
  useEffect(() => {
    return () => {
      pendingPhotos.forEach((p) => {
        if (p.previewUrl) {
          URL.revokeObjectURL(p.previewUrl);
        }
      });
    };
  }, [pendingPhotos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // selecionar arquivos de foto
  const handleFilesChange = (categoria, event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const mapped = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      return {
        id:
          categoria +
          "-" +
          file.name +
          "-" +
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2),
        file,
        categoria,
        nome: file.name.replace(/\.[^/.]+$/, ""), // sem extensão
        previewUrl,
      };
    });

    setPendingPhotos((prev) => [...prev, ...mapped]);

    // permite selecionar o mesmo arquivo de novo depois
    event.target.value = "";
  };

  const handlePhotoNameChange = (id, value) => {
    setPendingPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, nome: value } : p))
    );
  };

  const handleRemovePendingPhoto = (id) => {
    setPendingPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const slugify = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

  const handleUploadPhotos = async () => {
    if (!postOpId || !semanaAtual) {
      alert("Salve ou selecione o pós-operatório antes de enviar fotos.");
      return;
    }
    if (!pendingPhotos.length) return;

    setUploadingPhotos(true);

    try {
      for (const item of pendingPhotos) {
        const ext = item.file.name.split(".").pop() || "jpg";
        const base = item.nome?.trim() || "foto";
        const safeBase = slugify(base);
        const randomPart = Math.random().toString(36).slice(2, 8);
        const fileName = `${safeBase}-${randomPart}.${ext}`;

        const path = `${postOp.paciente_id || postOpId}/${String(
          semanaAtual
        )}/${item.categoria}/${fileName}`;

        // upload para o bucket "pos_fotos"
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("pos_fotos")
          .upload(path, item.file);

        if (uploadError) {
          console.error("Erro no upload do Storage:", uploadError);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("pos_fotos")
          .getPublicUrl(uploadData.path);

        const publicUrl = publicUrlData?.publicUrl || null;

        const { error: insertError } = await supabase.from("pos_fotos").insert([
          {
            paciente_pos_id: postOpId,
            paciente_id: postOp.paciente_id,
            semana: String(semanaAtual),
            categoria: item.categoria, // antes / depois / outros
            nome_exibicao: item.nome,
            path: uploadData.path,
            url_publica: publicUrl,
          },
        ]);

        if (insertError) {
          console.error("Erro ao inserir na tabela pos_fotos:", insertError);
          throw insertError;
        }
      }

      // limpar pending + previews
      pendingPhotos.forEach((p) => {
        if (p.previewUrl) {
          URL.revokeObjectURL(p.previewUrl);
        }
      });
      setPendingPhotos([]);

      await loadPhotos();
      alert("Fotos enviadas com sucesso!");
    } catch (err) {
      console.error("Erro ao enviar fotos:", err);
      alert("Erro ao enviar fotos: " + (err.message || String(err)));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (photo) => {
    if (!photo) return;
    const confirmDelete = window.confirm(
      "Deseja realmente excluir esta foto do pós-operatório?"
    );
    if (!confirmDelete) return;

    setDeletingPhotoId(photo.id);

    try {
      // remove do Storage
      if (photo.path) {
        const { error: storageError } = await supabase.storage
          .from("pos_fotos")
          .remove([photo.path]);

        if (storageError) {
          console.error("Erro ao remover arquivo do Storage:", storageError);
          // mesmo que falhe, tenta remover do banco para não travar o fluxo
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

      setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      console.error("Erro ao excluir foto:", err);
      alert("Erro ao excluir foto: " + (err.message || String(err)));
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!postOpId || !semanaAtual) return alert("Semana inválida.");

    setLoading(true);
    const weekStr = String(semanaAtual);

    try {
      // verifica se já existe
      const { data: existing } = await supabase
        .from("pos_operatorio")
        .select("id")
        .eq("paciente_pos_id", postOpId)
        .eq("semana", weekStr)
        .maybeSingle();

      const payload = {
        paciente_pos_id: postOpId,
        paciente_id: postOp.paciente_id,
        semana: weekStr,

        data_registro: form.data_registro || null,

        edema: form.edema,
        edema_obs: form.edema_obs || null,
        fibrose: form.fibrose,
        fibrose_obs: form.fibrose_obs || null,
        seroma: form.seroma,
        seroma_obs: form.seroma_obs || null,
        cicatrizacao: form.cicatrizacao,
        cicatrizacao_obs: form.cicatrizacao_obs || null,
        drenagem: form.drenagem,
        drenagem_obs: form.drenagem_obs || null,
        fita_silicone: form.fita_silicone,
        fita_silicone_obs: form.fita_silicone_obs || null,
        oleo_rosa_mosqueta: form.oleo_rosa_mosqueta,
        oleo_rosa_mosqueta_obs: form.oleo_rosa_mosqueta_obs || null,
        outros_check: form.outros_check,
        outros_obs: form.outros_obs || null,

        curativos_informados: form.curativos_informados || null,
        alimentacao: form.alimentacao || null,
        retorno_atividade_fisica: form.retorno_atividade_fisica || null,
        retorno_trabalho: form.retorno_trabalho || null,
        atestado: form.atestado || null,
        liberada_dirigir: form.liberada_dirigir || null,
        outras_observacoes: form.outras_observacoes || null,

        alta: form.alta,
        criado_em: new Date().toISOString(),
      };

      if (existing?.id) {
        const { error } = await supabase
          .from("pos_operatorio")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pos_operatorio")
          .insert([payload]);
        if (error) throw error;
      }

      alert("Semana salva com sucesso!");
      onSaved?.();
    } catch (err) {
      console.error("Erro ao salvar semana:", err.message || err);
      alert("Erro ao salvar semana: " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weeklyBox">
      <div className="weeklyHeader">
        <h3>Semana {semanaAtual}</h3>
        <div className="weeklyHeaderActions">
          <button
            className="btnPrimary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar semana"}
          </button>
        </div>
      </div>

      <form className="weeklyForm" onSubmit={handleSave}>
        {/* Data */}
        <label className="fullLabel">
          <div>Data</div>
          <input
            type="date"
            name="data_registro"
            value={form.data_registro || ""}
            onChange={handleChange}
          />
        </label>

        {/* Checklist */}
        <div className="checklistGroup">
          <h4>Checklist</h4>

          {/* Edema */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="edema"
              checked={form.edema}
              onChange={handleChange}
            />
            <span>Edema</span>
          </label>
          {form.edema && (
            <div className="obsRow">
              <textarea
                name="edema_obs"
                rows="2"
                placeholder="Observações sobre edema"
                value={form.edema_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Fibrose */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="fibrose"
              checked={form.fibrose}
              onChange={handleChange}
            />
            <span>Fibrose</span>
          </label>
          {form.fibrose && (
            <div className="obsRow">
              <textarea
                name="fibrose_obs"
                rows="2"
                placeholder="Observações sobre fibrose"
                value={form.fibrose_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Seroma */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="seroma"
              checked={form.seroma}
              onChange={handleChange}
            />
            <span>Seroma</span>
          </label>
          {form.seroma && (
            <div className="obsRow">
              <textarea
                name="seroma_obs"
                rows="2"
                placeholder="Observações sobre seroma"
                value={form.seroma_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Cicatrização */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="cicatrizacao"
              checked={form.cicatrizacao}
              onChange={handleChange}
            />
            <span>Cicatrização</span>
          </label>
          {form.cicatrizacao && (
            <div className="obsRow">
              <textarea
                name="cicatrizacao_obs"
                rows="2"
                placeholder="Observações sobre cicatrização"
                value={form.cicatrizacao_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Drenagem */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="drenagem"
              checked={form.drenagem}
              onChange={handleChange}
            />
            <span>Drenagem</span>
          </label>
          {form.drenagem && (
            <div className="obsRow">
              <textarea
                name="drenagem_obs"
                rows="2"
                placeholder="Observações sobre drenagem"
                value={form.drenagem_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Fita de silicone */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="fita_silicone"
              checked={form.fita_silicone}
              onChange={handleChange}
            />
            <span>Fita de silicone</span>
          </label>
          {form.fita_silicone && (
            <div className="obsRow">
              <textarea
                name="fita_silicone_obs"
                rows="2"
                placeholder="Observações sobre uso da fita de silicone"
                value={form.fita_silicone_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Óleo de rosa mosqueta */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="oleo_rosa_mosqueta"
              checked={form.oleo_rosa_mosqueta}
              onChange={handleChange}
            />
            <span>Óleo de rosa mosqueta</span>
          </label>
          {form.oleo_rosa_mosqueta && (
            <div className="obsRow">
              <textarea
                name="oleo_rosa_mosqueta_obs"
                rows="2"
                placeholder="Observações sobre uso do óleo de rosa mosqueta"
                value={form.oleo_rosa_mosqueta_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Outros */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="outros_check"
              checked={form.outros_check}
              onChange={handleChange}
            />
            <span>Outros</span>
          </label>
          {form.outros_check && (
            <div className="obsRow">
              <textarea
                name="outros_obs"
                rows="2"
                placeholder="Outros itens / observações"
                value={form.outros_obs}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {/* Campos adicionais */}
        <label className="fullLabel">
          <div>Curativos informados</div>
          <input
            name="curativos_informados"
            value={form.curativos_informados}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Alimentação (restrição alimentar)</div>
          <input
            name="alimentacao"
            value={form.alimentacao}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Retorno à atividade física</div>
          <input
            name="retorno_atividade_fisica"
            value={form.retorno_atividade_fisica}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Retorno ao trabalho</div>
          <input
            name="retorno_trabalho"
            value={form.retorno_trabalho}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Atestado</div>
          <input
            name="atestado"
            value={form.atestado}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Liberada para dirigir</div>
          <input
            name="liberada_dirigir"
            value={form.liberada_dirigir}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Outras observações</div>
          <textarea
            name="outras_observacoes"
            rows="4"
            value={form.outras_observacoes}
            onChange={handleChange}
          />
        </label>

        {/* FOTOS */}
        <div className="photosSection">
          <div className="photosHeader">
            <div>
              <h4>Fotos do pós-operatório</h4>
              <span className="photosHint">
                Selecione as fotos, renomeie como quiser e depois clique em
                &quot;Enviar fotos&quot;.
              </span>
            </div>

            <div className="photosHeaderActions">
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setShowGallery(true)}
              >
                Ver galeria completa
              </button>
            </div>
          </div>

          <div className="photosInputs">
            {PHOTO_CATEGORIES.map((cat) => (
              <div key={cat.key} className="photosInputGroup">
                <div className="photosInputTitle">{cat.label}</div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFilesChange(cat.key, e)}
                />
              </div>
            ))}
          </div>

          {pendingPhotos.length > 0 && (
            <div className="photosPending">
              <div className="photosPendingHeader">
                <span>Arquivos para enviar</span>
                <button
                  type="button"
                  className="btnSecondary"
                  onClick={handleUploadPhotos}
                  disabled={uploadingPhotos}
                >
                  {uploadingPhotos ? "Enviando fotos..." : "Enviar fotos"}
                </button>
              </div>

              <div className="photosPendingList">
                {pendingPhotos.map((p) => (
                  <div key={p.id} className="photoRow">
                    <span className={`photoCategoryTag cat-${p.categoria}`}>
                      {p.categoria === "antes"
                        ? "Antes"
                        : p.categoria === "depois"
                        ? "Depois"
                        : "Outras"}
                    </span>

                    {p.previewUrl && (
                      <div className="photoPreview">
                        <img src={p.previewUrl} alt={p.nome || "Preview"} />
                      </div>
                    )}

                    <input
                      type="text"
                      value={p.nome}
                      onChange={(e) =>
                        handlePhotoNameChange(p.id, e.target.value)
                      }
                      placeholder="Nome para identificar a foto"
                    />
                    <button
                      type="button"
                      className="photoRemove"
                      onClick={() => handleRemovePendingPhoto(p.id)}
                    >
                      remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingPhotos.length > 0 && (
            <div className="photosExisting">
              <span className="photosExistingTitle">Fotos já enviadas</span>
              <div className="photosExistingGrid">
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className="photoThumb">
                    <a
                      href={photo.url_publica || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="photoThumbImageWrapper"
                    >
                      {photo.url_publica && (
                        <img
                          src={photo.url_publica}
                          alt={photo.nome_exibicao || "Foto pós-operatório"}
                        />
                      )}
                      <div
                        className={`photoCategoryTag small cat-${photo.categoria}`}
                      >
                        {photo.categoria === "antes"
                          ? "Antes"
                          : photo.categoria === "depois"
                          ? "Depois"
                          : "Outras"}
                      </div>
                    </a>
                    <div className="photoThumbFooter">
                      <div className="photoThumbName">
                        {photo.nome_exibicao || "Foto"}
                      </div>
                      <button
                        type="button"
                        className="photoDeleteBtn"
                        onClick={() => handleDeletePhoto(photo)}
                        disabled={deletingPhotoId === photo.id}
                      >
                        {deletingPhotoId === photo.id
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {Number(semanaAtual) >= 6 && (
          <label className="altaRow">
            <input
              type="checkbox"
              name="alta"
              checked={form.alta}
              onChange={handleChange}
            />
            <span>Paciente liberado (ALTA)</span>
          </label>
        )}
      </form>
     
     <PostOperativeGalleryModal
        open={showGallery}
        onClose={() => setShowGallery(false)}
        pacientePosId={postOpId}
        pacienteId={postOp?.paciente_id}
      />

    </div>

    
  );
};

=======
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/postOperativeStyles/weeklyControlForm.css";
import PostOperativeGalleryModal from "./PostOperativeGalleryModal";

// categorias de fotos
const PHOTO_CATEGORIES = [
  { key: "antes", label: "Fotos antes" },
  { key: "depois", label: "Fotos depois" },
  { key: "outros", label: "Outras fotos do pós" },
];

/**
 * Form que salva/atualiza um registro por semana.
 * Props:
 * - postOp: registro pacientes_pos
 * - semanaAtual: string (ex: "1", "2", ...)
 * - onSaved(): callback para recarregar semanas no Manager
 */
const WeeklyControlForm = ({ postOp, semanaAtual, onSaved }) => {
  const initialForm = {
    data_registro: "",

    edema: false,
    edema_obs: "",
    fibrose: false,
    fibrose_obs: "",
    seroma: false,
    seroma_obs: "",
    cicatrizacao: false,
    cicatrizacao_obs: "",
    drenagem: false,
    drenagem_obs: "",
    fita_silicone: false,
    fita_silicone_obs: "",
    oleo_rosa_mosqueta: false,
    oleo_rosa_mosqueta_obs: "",
    outros_check: false,
    outros_obs: "",

    curativos_informados: "",
    alimentacao: "",
    retorno_atividade_fisica: "",
    retorno_trabalho: "",
    atestado: "",
    liberada_dirigir: "",
    outras_observacoes: "",

    alta: false,
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // fotos
  const [existingPhotos, setExistingPhotos] = useState([]); // do banco
  const [pendingPhotos, setPendingPhotos] = useState([]); // ainda não enviadas
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  const postOpId = postOp?.id;

  // carregar dados existentes da semana
  useEffect(() => {
    const fetchWeek = async () => {
      if (!postOpId || !semanaAtual) return;

      const { data, error } = await supabase
        .from("pos_operatorio")
        .select("*")
        .eq("paciente_pos_id", postOpId)
        .eq("semana", String(semanaAtual))
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar semana:", error.message);
        return;
      }

      if (data) {
        setForm({
          data_registro: data.data_registro || "",

          edema: !!data.edema,
          edema_obs: data.edema_obs || "",
          fibrose: !!data.fibrose,
          fibrose_obs: data.fibrose_obs || "",
          seroma: !!data.seroma,
          seroma_obs: data.seroma_obs || "",
          cicatrizacao: !!data.cicatrizacao,
          cicatrizacao_obs: data.cicatrizacao_obs || "",
          drenagem: !!data.drenagem,
          drenagem_obs: data.drenagem_obs || "",
          fita_silicone: !!data.fita_silicone,
          fita_silicone_obs: data.fita_silicone_obs || "",
          oleo_rosa_mosqueta: !!data.oleo_rosa_mosqueta,
          oleo_rosa_mosqueta_obs: data.oleo_rosa_mosqueta_obs || "",
          outros_check: !!data.outros_check,
          outros_obs: data.outros_obs || "",

          curativos_informados: data.curativos_informados || "",
          alimentacao: data.alimentacao || "",
          retorno_atividade_fisica: data.retorno_atividade_fisica || "",
          retorno_trabalho: data.retorno_trabalho || "",
          atestado: data.atestado || "",
          liberada_dirigir: data.liberada_dirigir || "",
          outras_observacoes: data.outras_observacoes || "",

          alta: !!data.alta,
        });
      } else {
        setForm(initialForm);
      }
    };

    fetchWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postOpId, semanaAtual]);

  // carregar fotos já enviadas
  const loadPhotos = async () => {
    if (!postOpId || !semanaAtual) return;
    const { data, error } = await supabase
      .from("pos_fotos")
      .select("*")
      .eq("paciente_pos_id", postOpId)
      .eq("semana", String(semanaAtual))
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar fotos:", error.message);
      return;
    }
    setExistingPhotos(data || []);
  };

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postOpId, semanaAtual]);

  // cleanup dos object URLs gerados para preview
  useEffect(() => {
    return () => {
      pendingPhotos.forEach((p) => {
        if (p.previewUrl) {
          URL.revokeObjectURL(p.previewUrl);
        }
      });
    };
  }, [pendingPhotos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // selecionar arquivos de foto
  const handleFilesChange = (categoria, event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const mapped = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      return {
        id:
          categoria +
          "-" +
          file.name +
          "-" +
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2),
        file,
        categoria,
        nome: file.name.replace(/\.[^/.]+$/, ""), // sem extensão
        previewUrl,
      };
    });

    setPendingPhotos((prev) => [...prev, ...mapped]);

    // permite selecionar o mesmo arquivo de novo depois
    event.target.value = "";
  };

  const handlePhotoNameChange = (id, value) => {
    setPendingPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, nome: value } : p))
    );
  };

  const handleRemovePendingPhoto = (id) => {
    setPendingPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const slugify = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

  const handleUploadPhotos = async () => {
    if (!postOpId || !semanaAtual) {
      alert("Salve ou selecione o pós-operatório antes de enviar fotos.");
      return;
    }
    if (!pendingPhotos.length) return;

    setUploadingPhotos(true);

    try {
      for (const item of pendingPhotos) {
        const ext = item.file.name.split(".").pop() || "jpg";
        const base = item.nome?.trim() || "foto";
        const safeBase = slugify(base);
        const randomPart = Math.random().toString(36).slice(2, 8);
        const fileName = `${safeBase}-${randomPart}.${ext}`;

        const path = `${postOp.paciente_id || postOpId}/${String(
          semanaAtual
        )}/${item.categoria}/${fileName}`;

        // upload para o bucket "pos_fotos"
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("pos_fotos")
          .upload(path, item.file);

        if (uploadError) {
          console.error("Erro no upload do Storage:", uploadError);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("pos_fotos")
          .getPublicUrl(uploadData.path);

        const publicUrl = publicUrlData?.publicUrl || null;

        const { error: insertError } = await supabase.from("pos_fotos").insert([
          {
            paciente_pos_id: postOpId,
            paciente_id: postOp.paciente_id,
            semana: String(semanaAtual),
            categoria: item.categoria, // antes / depois / outros
            nome_exibicao: item.nome,
            path: uploadData.path,
            url_publica: publicUrl,
          },
        ]);

        if (insertError) {
          console.error("Erro ao inserir na tabela pos_fotos:", insertError);
          throw insertError;
        }
      }

      // limpar pending + previews
      pendingPhotos.forEach((p) => {
        if (p.previewUrl) {
          URL.revokeObjectURL(p.previewUrl);
        }
      });
      setPendingPhotos([]);

      await loadPhotos();
      alert("Fotos enviadas com sucesso!");
    } catch (err) {
      console.error("Erro ao enviar fotos:", err);
      alert("Erro ao enviar fotos: " + (err.message || String(err)));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (photo) => {
    if (!photo) return;
    const confirmDelete = window.confirm(
      "Deseja realmente excluir esta foto do pós-operatório?"
    );
    if (!confirmDelete) return;

    setDeletingPhotoId(photo.id);

    try {
      // remove do Storage
      if (photo.path) {
        const { error: storageError } = await supabase.storage
          .from("pos_fotos")
          .remove([photo.path]);

        if (storageError) {
          console.error("Erro ao remover arquivo do Storage:", storageError);
          // mesmo que falhe, tenta remover do banco para não travar o fluxo
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

      setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      console.error("Erro ao excluir foto:", err);
      alert("Erro ao excluir foto: " + (err.message || String(err)));
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!postOpId || !semanaAtual) return alert("Semana inválida.");

    setLoading(true);
    const weekStr = String(semanaAtual);

    try {
      // verifica se já existe
      const { data: existing } = await supabase
        .from("pos_operatorio")
        .select("id")
        .eq("paciente_pos_id", postOpId)
        .eq("semana", weekStr)
        .maybeSingle();

      const payload = {
        paciente_pos_id: postOpId,
        paciente_id: postOp.paciente_id,
        semana: weekStr,

        data_registro: form.data_registro || null,

        edema: form.edema,
        edema_obs: form.edema_obs || null,
        fibrose: form.fibrose,
        fibrose_obs: form.fibrose_obs || null,
        seroma: form.seroma,
        seroma_obs: form.seroma_obs || null,
        cicatrizacao: form.cicatrizacao,
        cicatrizacao_obs: form.cicatrizacao_obs || null,
        drenagem: form.drenagem,
        drenagem_obs: form.drenagem_obs || null,
        fita_silicone: form.fita_silicone,
        fita_silicone_obs: form.fita_silicone_obs || null,
        oleo_rosa_mosqueta: form.oleo_rosa_mosqueta,
        oleo_rosa_mosqueta_obs: form.oleo_rosa_mosqueta_obs || null,
        outros_check: form.outros_check,
        outros_obs: form.outros_obs || null,

        curativos_informados: form.curativos_informados || null,
        alimentacao: form.alimentacao || null,
        retorno_atividade_fisica: form.retorno_atividade_fisica || null,
        retorno_trabalho: form.retorno_trabalho || null,
        atestado: form.atestado || null,
        liberada_dirigir: form.liberada_dirigir || null,
        outras_observacoes: form.outras_observacoes || null,

        alta: form.alta,
        criado_em: new Date().toISOString(),
      };

      if (existing?.id) {
        const { error } = await supabase
          .from("pos_operatorio")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pos_operatorio")
          .insert([payload]);
        if (error) throw error;
      }

      alert("Semana salva com sucesso!");
      onSaved?.();
    } catch (err) {
      console.error("Erro ao salvar semana:", err.message || err);
      alert("Erro ao salvar semana: " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weeklyBox">
      <div className="weeklyHeader">
        <h3>Semana {semanaAtual}</h3>
        <div className="weeklyHeaderActions">
          <button
            className="btnPrimary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar semana"}
          </button>
        </div>
      </div>

      <form className="weeklyForm" onSubmit={handleSave}>
        {/* Data */}
        <label className="fullLabel">
          <div>Data</div>
          <input
            type="date"
            name="data_registro"
            value={form.data_registro || ""}
            onChange={handleChange}
          />
        </label>

        {/* Checklist */}
        <div className="checklistGroup">
          <h4>Checklist</h4>

          {/* Edema */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="edema"
              checked={form.edema}
              onChange={handleChange}
            />
            <span>Edema</span>
          </label>
          {form.edema && (
            <div className="obsRow">
              <textarea
                name="edema_obs"
                rows="2"
                placeholder="Observações sobre edema"
                value={form.edema_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Fibrose */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="fibrose"
              checked={form.fibrose}
              onChange={handleChange}
            />
            <span>Fibrose</span>
          </label>
          {form.fibrose && (
            <div className="obsRow">
              <textarea
                name="fibrose_obs"
                rows="2"
                placeholder="Observações sobre fibrose"
                value={form.fibrose_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Seroma */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="seroma"
              checked={form.seroma}
              onChange={handleChange}
            />
            <span>Seroma</span>
          </label>
          {form.seroma && (
            <div className="obsRow">
              <textarea
                name="seroma_obs"
                rows="2"
                placeholder="Observações sobre seroma"
                value={form.seroma_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Cicatrização */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="cicatrizacao"
              checked={form.cicatrizacao}
              onChange={handleChange}
            />
            <span>Cicatrização</span>
          </label>
          {form.cicatrizacao && (
            <div className="obsRow">
              <textarea
                name="cicatrizacao_obs"
                rows="2"
                placeholder="Observações sobre cicatrização"
                value={form.cicatrizacao_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Drenagem */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="drenagem"
              checked={form.drenagem}
              onChange={handleChange}
            />
            <span>Drenagem</span>
          </label>
          {form.drenagem && (
            <div className="obsRow">
              <textarea
                name="drenagem_obs"
                rows="2"
                placeholder="Observações sobre drenagem"
                value={form.drenagem_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Fita de silicone */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="fita_silicone"
              checked={form.fita_silicone}
              onChange={handleChange}
            />
            <span>Fita de silicone</span>
          </label>
          {form.fita_silicone && (
            <div className="obsRow">
              <textarea
                name="fita_silicone_obs"
                rows="2"
                placeholder="Observações sobre uso da fita de silicone"
                value={form.fita_silicone_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Óleo de rosa mosqueta */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="oleo_rosa_mosqueta"
              checked={form.oleo_rosa_mosqueta}
              onChange={handleChange}
            />
            <span>Óleo de rosa mosqueta</span>
          </label>
          {form.oleo_rosa_mosqueta && (
            <div className="obsRow">
              <textarea
                name="oleo_rosa_mosqueta_obs"
                rows="2"
                placeholder="Observações sobre uso do óleo de rosa mosqueta"
                value={form.oleo_rosa_mosqueta_obs}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Outros */}
          <label className="checkRow">
            <input
              type="checkbox"
              name="outros_check"
              checked={form.outros_check}
              onChange={handleChange}
            />
            <span>Outros</span>
          </label>
          {form.outros_check && (
            <div className="obsRow">
              <textarea
                name="outros_obs"
                rows="2"
                placeholder="Outros itens / observações"
                value={form.outros_obs}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {/* Campos adicionais */}
        <label className="fullLabel">
          <div>Curativos informados</div>
          <input
            name="curativos_informados"
            value={form.curativos_informados}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Alimentação (restrição alimentar)</div>
          <input
            name="alimentacao"
            value={form.alimentacao}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Retorno à atividade física</div>
          <input
            name="retorno_atividade_fisica"
            value={form.retorno_atividade_fisica}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Retorno ao trabalho</div>
          <input
            name="retorno_trabalho"
            value={form.retorno_trabalho}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Atestado</div>
          <input
            name="atestado"
            value={form.atestado}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Liberada para dirigir</div>
          <input
            name="liberada_dirigir"
            value={form.liberada_dirigir}
            onChange={handleChange}
          />
        </label>

        <label className="fullLabel">
          <div>Outras observações</div>
          <textarea
            name="outras_observacoes"
            rows="4"
            value={form.outras_observacoes}
            onChange={handleChange}
          />
        </label>

        {/* FOTOS */}
        <div className="photosSection">
          <div className="photosHeader">
            <div>
              <h4>Fotos do pós-operatório</h4>
              <span className="photosHint">
                Selecione as fotos, renomeie como quiser e depois clique em
                &quot;Enviar fotos&quot;.
              </span>
            </div>

            <div className="photosHeaderActions">
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setShowGallery(true)}
              >
                Ver galeria completa
              </button>
            </div>
          </div>

          <div className="photosInputs">
            {PHOTO_CATEGORIES.map((cat) => (
              <div key={cat.key} className="photosInputGroup">
                <div className="photosInputTitle">{cat.label}</div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFilesChange(cat.key, e)}
                />
              </div>
            ))}
          </div>

          {pendingPhotos.length > 0 && (
            <div className="photosPending">
              <div className="photosPendingHeader">
                <span>Arquivos para enviar</span>
                <button
                  type="button"
                  className="btnSecondary"
                  onClick={handleUploadPhotos}
                  disabled={uploadingPhotos}
                >
                  {uploadingPhotos ? "Enviando fotos..." : "Enviar fotos"}
                </button>
              </div>

              <div className="photosPendingList">
                {pendingPhotos.map((p) => (
                  <div key={p.id} className="photoRow">
                    <span className={`photoCategoryTag cat-${p.categoria}`}>
                      {p.categoria === "antes"
                        ? "Antes"
                        : p.categoria === "depois"
                        ? "Depois"
                        : "Outras"}
                    </span>

                    {p.previewUrl && (
                      <div className="photoPreview">
                        <img src={p.previewUrl} alt={p.nome || "Preview"} />
                      </div>
                    )}

                    <input
                      type="text"
                      value={p.nome}
                      onChange={(e) =>
                        handlePhotoNameChange(p.id, e.target.value)
                      }
                      placeholder="Nome para identificar a foto"
                    />
                    <button
                      type="button"
                      className="photoRemove"
                      onClick={() => handleRemovePendingPhoto(p.id)}
                    >
                      remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingPhotos.length > 0 && (
            <div className="photosExisting">
              <span className="photosExistingTitle">Fotos já enviadas</span>
              <div className="photosExistingGrid">
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className="photoThumb">
                    <a
                      href={photo.url_publica || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="photoThumbImageWrapper"
                    >
                      {photo.url_publica && (
                        <img
                          src={photo.url_publica}
                          alt={photo.nome_exibicao || "Foto pós-operatório"}
                        />
                      )}
                      <div
                        className={`photoCategoryTag small cat-${photo.categoria}`}
                      >
                        {photo.categoria === "antes"
                          ? "Antes"
                          : photo.categoria === "depois"
                          ? "Depois"
                          : "Outras"}
                      </div>
                    </a>
                    <div className="photoThumbFooter">
                      <div className="photoThumbName">
                        {photo.nome_exibicao || "Foto"}
                      </div>
                      <button
                        type="button"
                        className="photoDeleteBtn"
                        onClick={() => handleDeletePhoto(photo)}
                        disabled={deletingPhotoId === photo.id}
                      >
                        {deletingPhotoId === photo.id
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {Number(semanaAtual) >= 6 && (
          <label className="altaRow">
            <input
              type="checkbox"
              name="alta"
              checked={form.alta}
              onChange={handleChange}
            />
            <span>Paciente liberado (ALTA)</span>
          </label>
        )}
      </form>
     
     <PostOperativeGalleryModal
        open={showGallery}
        onClose={() => setShowGallery(false)}
        pacientePosId={postOpId}
        pacienteId={postOp?.paciente_id}
      />

    </div>

    
  );
};

>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
export default WeeklyControlForm;