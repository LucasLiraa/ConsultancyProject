import React from "react";
import { supabase } from "../../../utils/supabaseClient"; // ajuste se precisar
import "../../styles/patientsStyles/ControleEntregaExames.css"; // opcional

const BUCKET = "exames_pacientes";

/**
 * Lista fixa baseada no PDF. :contentReference[oaicite:2]{index=2}
 */
const EXAMES = [
  {
    grupo: "Exames laboratoriais",
    items: [
      { key: "hemograma_completo", label: "Hemograma completo" },
      { key: "coagulograma", label: "Coagulograma" },
      { key: "glicemia_jejum", label: "Glicemia de jejum" },
      { key: "ureia", label: "Ureia" },
      { key: "creatinina", label: "Creatinina" },
      { key: "sodio", label: "Sódio" },
      { key: "potassio", label: "Potássio" },
      { key: "urina_tipo_1", label: "Urina tipo I" },
    ],
  },
  {
    grupo: "Exames sorológicos",
    items: [
      { key: "hiv_1_2", label: "HIV I e II" },
      { key: "hbsag", label: "HBsAg" },
      { key: "anti_hbc_total", label: "Anti-HBc total" },
      { key: "anti_hbs", label: "Anti-HBs" },
      { key: "anti_hcv", label: "Anti-HCV" },
      { key: "beta_hcg", label: "Beta-HCG (quando aplicável)" },
    ],
  },
  {
    grupo: "Exames de imagem",
    items: [
      { key: "us_parede_abdominal", label: "US parede abdominal" },
      { key: "us_mamas", label: "US de mamas" },
      { key: "mamografia", label: "Mamografia" },
      { key: "rx_torax", label: "RX de tórax" },
      { key: "us_doppler_mmii", label: "US Doppler MMII (venoso/arterial)" },
    ],
  },
  {
    grupo: "Avaliação cardiológica",
    items: [
      { key: "ecg_com_laudo", label: "ECG com laudo" },
      { key: "teste_ergometrico", label: "Teste ergométrico (se indicado)" },
      { key: "ecocardiograma", label: "Ecocardiograma (se indicado)" },
    ],
  },
];

const flattenKeys = () => EXAMES.flatMap((g) => g.items.map((i) => i.key));

const buildInitialState = () => {
  const state = {};
  for (const key of flattenKeys()) {
    state[key] = {
      entregue_em: "",
      observacao: "",
      arquivo_path: "",
      arquivo_url: "",
    };
  }
  return state;
};

const makePublicUrl = (path) => {
  if (!path) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
};

const safeFileName = (name) => (name || "arquivo").replace(/[^\w.\-() ]+/g, "_");

const buildUploadPath = ({ pacienteId, exameKey, fileName }) => {
  const safeName = safeFileName(fileName);
  const stamp = Date.now();
  return `paciente/${pacienteId}/${exameKey}/${stamp}_${safeName}`;
};

export default function ControleEntregaExames({ paciente }) {
  const pacienteId = paciente?.id;

  const [loading, setLoading] = React.useState(true);
  const [savingKey, setSavingKey] = React.useState(null);
  const [uploadingKey, setUploadingKey] = React.useState(null);
  const [deletingKey, setDeletingKey] = React.useState(null);
  const [error, setError] = React.useState(null);

  const [examesState, setExamesState] = React.useState(buildInitialState());

  // accordion: quais grupos estão abertos
  const [openGroups, setOpenGroups] = React.useState(() => {
    // começa fechado para reduzir poluição; você pode abrir o primeiro se quiser
    const initial = {};
    for (const g of EXAMES) initial[g.grupo] = false;
    return initial;
  });

  const total = flattenKeys().length;

  const entreguesCount = React.useMemo(() => {
    return Object.values(examesState).filter((e) => !!e.entregue_em).length;
  }, [examesState]);

  const groupProgress = React.useMemo(() => {
    const out = {};
    for (const g of EXAMES) {
      const keys = g.items.map((i) => i.key);
      const done = keys.filter((k) => !!examesState[k]?.entregue_em).length;
      out[g.grupo] = { done, total: keys.length };
    }
    return out;
  }, [examesState]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!pacienteId) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: err } = await supabase
          .from("paciente_exames_entregues")
          .select("exame_key, entregue_em, observacao, arquivo_path")
          .eq("paciente_id", pacienteId);

        if (err) {
          console.error(err);
          setError("Não foi possível carregar os exames entregues.");
          return;
        }

        setExamesState((prev) => {
          const next = { ...prev };
          for (const row of data || []) {
            if (!next[row.exame_key]) continue;
            next[row.exame_key] = {
              entregue_em: row.entregue_em || "",
              observacao: row.observacao || "",
              arquivo_path: row.arquivo_path || "",
              arquivo_url: row.arquivo_path ? makePublicUrl(row.arquivo_path) : "",
            };
          }
          return next;
        });
      } catch (e) {
        console.error(e);
        setError("Ocorreu um erro inesperado ao carregar.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pacienteId]);

  const setField = (key, field, value) => {
    setExamesState((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = async (exameKey) => {
    if (!pacienteId) return;

    try {
      setSavingKey(exameKey);
      setError(null);

      const payload = {
        paciente_id: pacienteId,
        exame_key: exameKey,
        entregue_em: examesState[exameKey]?.entregue_em || null,
        observacao: examesState[exameKey]?.observacao || null,
        arquivo_path: examesState[exameKey]?.arquivo_path || null,
      };

      const { error: err } = await supabase
        .from("paciente_exames_entregues")
        .upsert(payload, { onConflict: "paciente_id,exame_key" });

      if (err) {
        console.error(err);
        setError("Não foi possível salvar este exame.");
      }
    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro inesperado ao salvar.");
    } finally {
      setSavingKey(null);
    }
  };

  const uploadAndPersist = async ({ exameKey, file, replaceOldPath }) => {
    if (!pacienteId || !file) return;

    const newPath = buildUploadPath({
      pacienteId,
      exameKey,
      fileName: file.name,
    });

    // 1) upload
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(newPath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "application/octet-stream",
    });

    if (upErr) {
      throw upErr;
    }

    // 2) se era substituição, remove antigo (melhor esforço)
    if (replaceOldPath) {
      const { error: rmOldErr } = await supabase.storage.from(BUCKET).remove([replaceOldPath]);
      if (rmOldErr) {
        // não vou travar o fluxo por causa disso, mas loga
        console.warn("Falha ao remover arquivo antigo:", rmOldErr);
      }
    }

    // 3) atualiza state local
    const publicUrl = makePublicUrl(newPath);
    setExamesState((prev) => ({
      ...prev,
      [exameKey]: {
        ...prev[exameKey],
        arquivo_path: newPath,
        arquivo_url: publicUrl,
      },
    }));

    // 4) upsert no banco
    const { error: dbErr } = await supabase
    .from("paciente_exames_entregues")
    .upsert(
      {
        paciente_id: pacienteId,
        exame_key: exameKey,
        entregue_em: null,          // 👈 volta pendente
        observacao: examesState[exameKey]?.observacao || null, // ou null se quiser limpar
        arquivo_path: null,
      },
      { onConflict: "paciente_id,exame_key" }
    );

    if (dbErr) throw dbErr;
  };

  const handleUpload = async (exameKey, file) => {
    if (!file) return;
    try {
      setUploadingKey(exameKey);
      setError(null);
      await uploadAndPersist({ exameKey, file, replaceOldPath: null });
    } catch (e) {
      console.error(e);
      setError("Falha ao enviar o arquivo.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleReplaceFile = async (exameKey, file) => {
    if (!file) return;
    try {
      setUploadingKey(exameKey);
      setError(null);

      const oldPath = examesState[exameKey]?.arquivo_path || null;
      await uploadAndPersist({ exameKey, file, replaceOldPath: oldPath });
    } catch (e) {
      console.error(e);
      setError("Falha ao substituir o arquivo.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDeleteFile = async (exameKey) => {
    const path = examesState[exameKey]?.arquivo_path;
    if (!path || !pacienteId) return;

    try {
      setDeletingKey(exameKey);
      setError(null);

      // 1) remove do storage
      const { error: rmErr } = await supabase.storage.from(BUCKET).remove([path]);
      if (rmErr) {
        console.error(rmErr);
        setError("Não foi possível excluir o arquivo no storage.");
        return;
      }

      // 2) limpa no banco (mantém registro, só remove o arquivo)
      const { error: dbErr } = await supabase
        .from("paciente_exames_entregues")
        .upsert(
          {
            paciente_id: pacienteId,
            exame_key: exameKey,
            entregue_em: examesState[exameKey]?.entregue_em || null,
            observacao: examesState[exameKey]?.observacao || null,
            arquivo_path: null,
          },
          { onConflict: "paciente_id,exame_key" }
        );

      if (dbErr) {
        console.error(dbErr);
        setError("Arquivo excluído, mas não foi possível atualizar o registro.");
        return;
      }

      // 3) state local
      setExamesState((prev) => ({
        ...prev,
        [exameKey]: {
          ...prev[exameKey],
          entregue_em: "",     // 👈 pendente no front
          arquivo_path: "",
          arquivo_url: "",
          // observacao: "",    // opcional
        },
      }));
    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro ao excluir o arquivo.");
    } finally {
      setDeletingKey(null);
    }
  };

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const openAll = () => {
    const next = {};
    for (const g of EXAMES) next[g.grupo] = true;
    setOpenGroups(next);
  };

  const closeAll = () => {
    const next = {};
    for (const g of EXAMES) next[g.grupo] = false;
    setOpenGroups(next);
  };

  if (!pacienteId) {
    return (
      <div className="examesEntregaWrap">
        <div className="examesEntregaEmpty">Paciente não carregado.</div>
      </div>
    );
  }

  return (
    <div className="examesEntregaWrap">
      <div className="examesEntregaHeader">
        <div>
          <h3>Controle de entrega de exames</h3>
          <p className="examesEntregaSub">
            {entreguesCount}/{total} marcados como entregues
          </p>
        </div>

        <div className="examesEntregaHeaderRight">
          <div className="examesEntregaBadge">
            {entreguesCount === 0 && <span className="badge pending">Pendente</span>}
            {entreguesCount > 0 && entreguesCount < total && (
              <span className="badge partial">Parcial</span>
            )}
            {entreguesCount === total && <span className="badge done">Completo</span>}
          </div>

          <div className="examesEntregaTools">
            <button type="button" className="ghostBtn" onClick={openAll}>
              Abrir tudo
            </button>
            <button type="button" className="ghostBtn" onClick={closeAll}>
              Fechar tudo
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="examesEntregaLoading">Carregando…</div>}
      {error && <div className="examesEntregaError">{error}</div>}

      {!loading &&
        EXAMES.map((group) => {
          const prog = groupProgress[group.grupo];
          const isOpen = !!openGroups[group.grupo];

          return (
            <section className="accordionGroup" key={group.grupo}>
              <button
                type="button"
                className={`accordionHeader ${isOpen ? "open" : ""}`}
                onClick={() => toggleGroup(group.grupo)}
              >
                <div className="accordionTitle">
                  <strong>{group.grupo}</strong>
                  <span className="accordionMeta">
                    {prog?.done || 0}/{prog?.total || group.items.length} entregues
                  </span>
                </div>

                <span className="accordionChevron" aria-hidden="true">
                  {isOpen ? "▾" : "▸"}
                </span>
              </button>

              {isOpen && (
                <div className="accordionBody">
                  {group.items.map((item, idx) => {
                    const row = examesState[item.key] || {
                      entregue_em: "",
                      observacao: "",
                      arquivo_path: "",
                      arquivo_url: "",
                    };

                    const entregue = !!row.entregue_em;
                    const hasFile = !!row.arquivo_url;

                    return (
                      <div className="exameRowWrap" key={item.key}>
                        {/* separador visual entre exames */}
                        {idx !== 0 && <div className="exameDivider" />}

                        <div className="exameRowTop">
                          <div className="exameTitle">
                            <span className={`dot ${entregue ? "ok" : "no"}`} />
                            <span className="exameLabel">{item.label}</span>
                            {entregue ? (
                              <span className="status ok">Entregue</span>
                            ) : (
                              <span className="status no">Pendente</span>
                            )}
                          </div>

                          <div className="exameFileArea">
                            {hasFile ? (
                              <>
                                <a
                                  className="linkFile"
                                  href={row.arquivo_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Abrir arquivo"
                                >
                                  Ver arquivo
                                </a>

                                <label className="miniBtn">
                                  <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={(e) =>
                                      handleReplaceFile(item.key, e.target.files?.[0])
                                    }
                                    disabled={uploadingKey === item.key}
                                  />
                                  {uploadingKey === item.key ? "Substituindo..." : "Substituir"}
                                </label>

                                <button
                                  type="button"
                                  className="miniBtn danger"
                                  onClick={() => handleDeleteFile(item.key)}
                                  disabled={deletingKey === item.key}
                                  title="Excluir arquivo"
                                >
                                  {deletingKey === item.key ? "Excluindo..." : "Excluir"}
                                </button>
                              </>
                            ) : (
                              <label className="miniBtn">
                                <input
                                  type="file"
                                  accept=".pdf,image/*"
                                  onChange={(e) => handleUpload(item.key, e.target.files?.[0])}
                                  disabled={uploadingKey === item.key}
                                />
                                {uploadingKey === item.key ? "Enviando..." : "Anexar arquivo"}
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="exameGrid">
                          <label className="field">
                            <span>Data de entrega</span>
                            <input
                              type="date"
                              value={row.entregue_em || ""}
                              onChange={(e) =>
                                setField(item.key, "entregue_em", e.target.value)
                              }
                            />
                          </label>

                          <label className="field fieldObs">
                            <span>Observação</span>
                            <textarea
                              rows={2}
                              value={row.observacao || ""}
                              onChange={(e) =>
                                setField(item.key, "observacao", e.target.value)
                              }
                              placeholder="Ex.: pendente laudo, entregue impresso, etc."
                            />
                          </label>

                          <div className="field fieldSave">
                            <span>&nbsp;</span>
                            <button
                              type="button"
                              className="saveBtn"
                              onClick={() => handleSave(item.key)}
                              disabled={savingKey === item.key}
                            >
                              {savingKey === item.key ? "Salvando..." : "Salvar"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
    </div>
  );
}