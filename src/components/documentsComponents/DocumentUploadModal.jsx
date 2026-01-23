import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import "./documentsInstancesOverlay.css";

function DocumentsInstancesOverlay({ open, status, onClose }) {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("document_instances")
        .select("id, document_title, patient_name, created_at")
        .eq("status", status)
        .order("created_at", { ascending: false });

      setDocs(data || []);
      setLoading(false);
    };

    load();
  }, [open, status]);

  if (!open) return null;

  return (
    <div className="docsOverlay">
      <div className="docsOverlayModal">
        <div className="docsOverlayHeader">
          <div className="docsOverlayTitle">
            {status === "signed"
              ? "Documentos completos"
              : "Documentos aguardando assinatura"}
          </div>

          <button className="docsOverlayClose" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="docsOverlayBody">
          {loading && <div>Carregando…</div>}

          {!loading && !docs.length && (
            <div className="empty">Nenhum documento encontrado</div>
          )}

          {docs.map((doc) => (
            <div key={doc.id} className="docsOverlayRow">
              <div className="docsOverlayMain">
                <div className="docsOverlayDoc">{doc.document_title}</div>
                <div className="docsOverlayPatient">
                  Paciente: {doc.patient_name}
                </div>
              </div>

              <div className="docsOverlayDate">
                {new Date(doc.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DocumentsInstancesOverlay;
