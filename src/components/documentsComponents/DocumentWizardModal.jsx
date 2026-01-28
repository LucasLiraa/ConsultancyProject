import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { PDFDocument } from "pdf-lib";
import "../styles/documentsStyles/documentWizardModal.css";

const TEMPLATE_BUCKET = "document_templates";
const INSTANCE_BUCKET = "document_instances";

/* =====================================================
   PDF HELPERS
===================================================== */

async function extractPdfFieldsFromUrl(url) {
  const res = await fetch(url);
  const bytes = await res.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();

  return form.getFields().map((f) => ({
    name: f.getName(),
    type:
      f.constructor.name === "PDFCheckBox"
        ? "checkbox"
        : "text",
  }));
}

async function generateFilledPreview(url, values) {
  const res = await fetch(url);
  const bytes = await res.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();

  Object.entries(values).forEach(([k, v]) => {
    try {
      const field = form.getField(k);
      if (field.constructor.name === "PDFCheckBox") {
        v ? field.check() : field.uncheck();
      } else {
        field.setText(String(v ?? ""));
      }
    } catch {}
  });

  const pdfBytes = await pdfDoc.save();
  return URL.createObjectURL(
    new Blob([pdfBytes], { type: "application/pdf" })
  );
}

async function generateFinalPdfBytes(url, values) {
  const res = await fetch(url);
  const bytes = await res.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();

  Object.entries(values).forEach(([k, v]) => {
    try {
      const field = form.getField(k);
      if (field.constructor.name === "PDFCheckBox") {
        v ? field.check() : field.uncheck();
      } else {
        field.setText(String(v ?? ""));
      }
    } catch {}
  });

  form.flatten(); // 🔒 trava o PDF
  return await pdfDoc.save();
}

/* =====================================================
   COMPONENT
===================================================== */

function DocumentWizardModal({ open, document, patient, onBack, onClose }) {
  const [templateUrl, setTemplateUrl] = useState("");
  const [pdfFields, setPdfFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [step, setStep] = useState("preview"); // preview | edit | sign
  const [loading, setLoading] = useState(false);

  const [patientSigned, setPatientSigned] = useState(false);
  const [doctorSigned, setDoctorSigned] = useState(false);

  /* =========================
     RESET
  ========================= */

  useEffect(() => {
    if (!open) return;

    setFormValues({});
    setPdfFields([]);
    setPreviewUrl("");
    setStep("preview");
    setPatientSigned(false);
    setDoctorSigned(false);
  }, [open]);

  /* =========================
     TEMPLATE URL
  ========================= */

  useEffect(() => {
    if (!open || !document) return;

    supabase.storage
      .from(TEMPLATE_BUCKET)
      .createSignedUrl(document.file_path, 600)
      .then(({ data }) => setTemplateUrl(data.signedUrl));
  }, [open, document]);

  /* =========================
     READ FIELDS
  ========================= */

  useEffect(() => {
    if (!templateUrl) return;

    extractPdfFieldsFromUrl(templateUrl).then((fields) => {
      setPdfFields(fields);

      const initial = {};
      fields.forEach((f) => {
        if (f.name.startsWith("paciente_")) {
          const key = f.name.replace("paciente_", "");
          if (patient?.[key]) initial[f.name] = patient[key];
        }
      });

      setFormValues(initial);
    });
  }, [templateUrl, patient]);

  /* =========================
     FINALIZE
  ========================= */

  async function finalizeDocument(status) {
    setLoading(true);

    const pdfBytes = await generateFinalPdfBytes(
      templateUrl,
      formValues
    );

    const path = `${patient.id}/${Date.now()}.pdf`;

    await supabase.storage
      .from(INSTANCE_BUCKET)
      .upload(path, pdfBytes, {
        contentType: "application/pdf",
      });

    await supabase.from("document_instances").insert({
      template_id: document.id,
      patient_id: patient.id,
      document_title: document.title,
      patient_name: patient.nome,
      status,
      filled_fields: formValues,
      filled_pdf_path: path,
      signed_at: status === "signed" ? new Date() : null,
    });

    setLoading(false);
    onClose();
  }

  if (!open) return null;

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="docWizardOverlay">
      <div className="docWizardModal">
        <header className="docWizardHeader">
          <div>
            <div className="docWizardTitle">{document.title}</div>
            <div className="docWizardSubtitle">
              {step === "preview" && "Visualização"}
              {step === "edit" && "Editar campos"}
              {step === "sign" && "Assinaturas"}
            </div>
          </div>
          <button
            className="modalCloseBtn"
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>

        <div className="docWizardBody">
          {step === "preview" && (
            <iframe
              src={previewUrl || templateUrl}
              title="PDF"
              style={{ width: "100%", height: 500 }}
            />
          )}

          {step === "edit" && (
            <div className="docWizardForm">
              {pdfFields.map((f) => (
                <div key={f.name} className="docWizardField">
                  <label>{f.name.replace(/_/g, " ")}</label>

                  {f.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={!!formValues[f.name]}
                      onChange={(e) =>
                        setFormValues((p) => ({
                          ...p,
                          [f.name]: e.target.checked,
                        }))
                      }
                    />
                  ) : (
                    <input
                      value={formValues[f.name] || ""}
                      onChange={(e) =>
                        setFormValues((p) => ({
                          ...p,
                          [f.name]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {step === "sign" && (
            <div className="docWizardSignGrid">
              <button onClick={() => setPatientSigned(true)}>
                {patientSigned ? "Paciente assinado" : "Assinar paciente"}
              </button>
              <button onClick={() => setDoctorSigned(true)}>
                {doctorSigned ? "Médico assinado" : "Assinar médico"}
              </button>
            </div>
          )}
        </div>

        <footer className="docWizardFooter">
          <button
            className="docWizardBtn ghost"
            type="button"
            onClick={() => {
              if (step === "preview" && !previewUrl) {
                return onBack?.();
              }

              if (step === "edit") {
                return setStep("preview");
              }

              if (step === "sign") {
                return setStep("preview");
              }

              return onBack?.();
            }}
          >
            Voltar
          </button>

          {step === "preview" && (
            <button className="docWizardBtn primary" onClick={() => setStep("edit")}>Editar</button>
          )}

          {step === "edit" && (
            <button className="docWizardBtn primary"
              onClick={async () => {
                const url = await generateFilledPreview(
                  templateUrl,
                  formValues
                );
                setPreviewUrl(url);
                setStep("preview");
              }}
            >
              Confirmar edição
            </button>
          )}

          {step === "preview" && previewUrl && (
            <>
              <button className="docWizardBtn primary"
                onClick={() =>
                  finalizeDocument("awaiting_signature")
                }
                disabled={loading}
              >
                Concluir
              </button>

              <button className="docWizardBtn primary" onClick={() => setStep("sign")}>
                Assinar
              </button>
            </>
          )}

          {step === "sign" && (
            <button
              disabled={!patientSigned || !doctorSigned}
              onClick={() => finalizeDocument("signed")}
            >
              Concluir e assinar
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default DocumentWizardModal;