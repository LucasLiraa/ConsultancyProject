import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/documentsStyles/documentsInstancesOverlay.css";

const INSTANCE_BUCKET = "document_instances";

function formatDateBR(iso) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
}

async function getSignedInstanceUrl(filePath) {
  const { data, error } = await supabase.storage
    .from(INSTANCE_BUCKET)
    .createSignedUrl(filePath, 60 * 10); // 10 min

  if (error) throw error;
  return data?.signedUrl || "";
}

function buildMailto({ patientName, documentTitle, dateStr, url }) {
  const subject = `Documento: ${documentTitle} - ${patientName}`;
  const body =
    `Olá!\n\n` +
    `Segue o documento preenchido:\n\n` +
    `Paciente: ${patientName}\n` +
    `Documento: ${documentTitle}\n` +
    `Data: ${dateStr}\n\n` +
    `Link para visualização (expira em alguns minutos):\n${url}\n\n` +
    `Atenciosamente.`;

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function DocumentsInstancesOverlay({
  open,
  status, // "awaiting_signature" | "signed"
  onClose,
  onSign, // callback opcional: (instanceRow) => void
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [docs, setDocs] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const title = useMemo(() => {
    if (status === "signed") return "Documentos completos";
    if (status === "awaiting_signature") return "Documentos aguardando assinatura";
    return "Documentos";
  }, [status]);

  const emptyText = useMemo(() => {
    if (status === "signed") return "Nenhum documento concluído ainda.";
    if (status === "awaiting_signature") return "Nenhum documento aguardando assinatura.";
    return "Nenhum documento encontrado.";
  }, [status]);

  async function loadDocs() {
    try {
      setLoading(true);
      setErr("");

      if (!status) {
        setDocs([]);
        return;
      }

      const { data, error } = await supabase
        .from("document_instances")
        .select("id, document_title, patient_name, created_at, status, filled_pdf_path")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocs(data || []);
    } catch (e) {
      setErr(e?.message || "Erro ao carregar documentos.");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, status]);

  // Fechar com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleView(doc) {
    try {
      setBusyId(doc.id);
      const url = await getSignedInstanceUrl(doc.filled_pdf_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert(e?.message || "Erro ao abrir documento.");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePrint(doc) {
    try {
      setBusyId(doc.id);
      const url = await getSignedInstanceUrl(doc.filled_pdf_path);

      const w = window.open(url, "_blank", "noopener,noreferrer");
      // Algumas vezes o PDF demora. Um timeout curto ajuda.
      setTimeout(() => {
        try {
          w?.focus();
          w?.print?.();
        } catch {}
      }, 800);
    } catch (e) {
      alert(e?.message || "Erro ao imprimir documento.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleEmail(doc) {
    try {
      setBusyId(doc.id);
      const url = await getSignedInstanceUrl(doc.filled_pdf_path);
      const dateStr = formatDateBR(doc.created_at);

      window.location.href = buildMailto({
        patientName: doc.patient_name,
        documentTitle: doc.document_title,
        dateStr,
        url,
      });
    } catch (e) {
      alert(e?.message || "Erro ao preparar e-mail.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(doc) {
    const ok = window.confirm(
      `Excluir este documento?\n\nPaciente: ${doc.patient_name}\nDocumento: ${doc.document_title}\n\nEssa ação não pode ser desfeita.`
    );
    if (!ok) return;

    try {
      setBusyId(doc.id);

      // 1) remove arquivo do storage (se quiser manter histórico, pode pular isso)
      if (doc.filled_pdf_path) {
        const { error: rmErr } = await supabase.storage
          .from(INSTANCE_BUCKET)
          .remove([doc.filled_pdf_path]);
        if (rmErr) throw rmErr;
      }

      // 2) remove registro
      const { error: delErr } = await supabase
        .from("document_instances")
        .delete()
        .eq("id", doc.id);

      if (delErr) throw delErr;

      // 3) atualiza lista
      setDocs((p) => p.filter((x) => x.id !== doc.id));
    } catch (e) {
      alert(e?.message || "Erro ao excluir documento.");
    } finally {
      setBusyId(null);
    }
  }

  if (!open) return null;

  return (
    <div className="docsOverlay" onMouseDown={onClose}>
      <div className="docsOverlayModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="docsOverlayHeader">
          <div>
            <div className="docsOverlayTitle">{title}</div>
            <div className="docsOverlaySub">
              {status === "signed"
                ? "Concluídos e assinados"
                : "Concluídos, aguardando assinatura"}
            </div>
          </div>

          <button className="docsOverlayClose" type="button" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="docsOverlayBody">
          {err ? <div className="docsOverlayError">{err}</div> : null}

          {loading ? (
            <div className="docsOverlayEmpty">Carregando…</div>
          ) : !docs.length ? (
            <div className="docsOverlayEmpty">{emptyText}</div>
          ) : (
            <div className="docsOverlayList">
              {docs.map((doc) => {
                const dateStr = formatDateBR(doc.created_at);
                const isBusy = busyId === doc.id;

                return (
                  <div key={doc.id} className="docsItem">
                    <div className="docsItemLeft">
                      <div className="docsItemTitle">{doc.document_title}</div>
                      <div className="docsItemMeta">
                        <span className="pill">{dateStr}</span>
                        <span className="dot">•</span>
                        <span className="muted">Paciente:</span>{" "}
                        <span className="strong">{doc.patient_name}</span>
                      </div>
                    </div>

                    <div className="docsItemActions">
                      <button
                        className="btn ghost"
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleView(doc)}
                      >
                        Visualizar
                      </button>

                      <button
                        className="btn ghost"
                        type="button"
                        disabled={isBusy}
                        onClick={() => handlePrint(doc)}
                      >
                        Imprimir
                      </button>

                      <button
                        className="btn ghost"
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleEmail(doc)}
                      >
                        Enviar e-mail
                      </button>

                      {status === "awaiting_signature" ? (
                        <button
                          className="btn primary"
                          type="button"
                          disabled={isBusy}
                          onClick={() => onSign?.(doc)}
                          title="Abrir fluxo de assinatura"
                        >
                          Ir para assinatura
                        </button>
                      ) : null}

                      <button
                        className="btn danger"
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(doc)}
                        title="Excluir documento"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}