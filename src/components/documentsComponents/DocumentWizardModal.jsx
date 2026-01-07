import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../utils/supabaseClient.js";
import { useDocumentInstance } from "../../hooks/useDocumentInstance.js";
import "../styles/documentsStyles/documentWizardModal.css";

const BUCKET = "document_templates";

function DocumentWizardModal({ open, document, patient, onBack, onClose }) {
  const [authUser, setAuthUser] = useState(null);

  const [step, setStep] = useState("preview"); // "preview" | "edit" | "sign"
  const [formValues, setFormValues] = useState({
    paciente_nome: "",
    data_documento: "",
    documento_nome: "",
  });

  const [patientSigned, setPatientSigned] = useState(false);
  const [doctorSigned, setDoctorSigned] = useState(false);

  // URL temporária pra exibir o documento do template
  const [templateUrl, setTemplateUrl] = useState("");
  const [templateUrlError, setTemplateUrlError] = useState("");

  const { instance, createInstance, updateInstance, saving, saved } = useDocumentInstance({
    templateId: document?.id,
    pacienteId: patient?.id,
    userId: authUser?.id,
  });

  // pega usuário logado
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setAuthUser(data?.user || null);
    };
    loadUser();
  }, []);

  // Preenche automaticamente quando abrir / mudar doc/paciente
  useEffect(() => {
    if (!open) return;

    setStep("preview");
    setPatientSigned(false);
    setDoctorSigned(false);

    setFormValues({
      paciente_nome: patient?.nome || "",
      data_documento: new Date().toLocaleDateString("pt-BR"),
      documento_nome: document?.title || "",
    });
  }, [open, patient, document]);

  // cria instância quando tiver tudo pronto
  useEffect(() => {
    if (!open || !document || !patient || !authUser) return;

    createInstance({
      paciente_nome: patient.nome,
      data_documento: new Date().toLocaleDateString("pt-BR"),
      documento_nome: document.title,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, document?.id, patient?.id, authUser?.id]);

  // auto-save
  useEffect(() => {
    if (!instance) return;
    updateInstance(formValues, step === "sign" ? "filled" : "draft");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, step, instance?.id]);

  // Carrega signed URL do arquivo do template
  useEffect(() => {
    const loadTemplateUrl = async () => {
      try {
        setTemplateUrl("");
        setTemplateUrlError("");

        if (!open || !document?.file_path) return;

        const { data, error } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(document.file_path, 60 * 10); // 10 min

        if (error) throw error;
        setTemplateUrl(data?.signedUrl || "");
      } catch (err) {
        console.error("template signedUrl error:", err);
        setTemplateUrlError(err?.message || "Erro ao abrir documento");
      }
    };

    loadTemplateUrl();
  }, [open, document?.file_path]);

  const values = useMemo(() => ({ ...formValues }), [formValues]);

  if (!open) return null;

  const canGoToSign = !!values.paciente_nome
  const canFinish = patientSigned && doctorSigned;

  const isPdf = (document?.mime_type || "").includes("pdf");

  return (
    <div className="docWizardOverlay">
      <div className="docWizardModal">
        {/* Header */}
        <div className="docWizardHeader">
          <div>
            <div className="docWizardTitle">{document?.title}</div>
            <div className="docWizardSubtitle">
              {step === "preview" && "Documento oficial • visualização + dados automáticos"}
              {step === "edit" && "Edição • ajuste os campos do documento"}
              {step === "sign" && "Assinatura • paciente e médico"}
            </div>
          </div>

          <button className="docWizardClose" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="docWizardBody">
          {step === "preview" && (
            <>
              <div className="docWizardNotice">
                Abaixo está o <strong>documento oficial</strong>. Em seguida você poderá editar campos e assinar.
              </div>

              {templateUrlError ? (
                <div className="documentsPatientsEmpty">{templateUrlError}</div>
              ) : !templateUrl ? (
                <div className="documentsPatientsEmpty">Carregando documento...</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {/* Documento oficial */}
                  {isPdf ? (
                    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e5e5" }}>
                      <iframe
                        title="Documento oficial"
                        src={templateUrl}
                        style={{ width: "100%", height: 520, border: "0" }}
                      />
                    </div>
                  ) : (
                    <div className="documentsPatientsEmpty">
                      Este tipo de arquivo não tem preview embutido aqui.{" "}
                      <a href={templateUrl} target="_blank" rel="noreferrer">
                        Abrir em nova aba
                      </a>
                    </div>
                  )}

                  {/* Mini resumo automático */}
                  <div className="docPreviewPaper mini">
                    <h2>{values.documento_nome || document?.title}</h2>
                    <p>
                      Paciente: <strong>{values.paciente_nome || "__________"}</strong>
                    </p>
                    <p>
                      Data: <strong>{values.data_documento}</strong>
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {step === "edit" && (
            <>
              <div className="docWizardNotice">
                Edite os campos abaixo. (O documento oficial permanece o mesmo; depois a gente liga “campos dentro do PDF”.)
              </div>

              <div className="docWizardEditGrid">
                <div className="docWizardField">
                  <label>Nome da paciente</label>
                  <input
                    value={formValues.paciente_nome}
                    onChange={(e) => setFormValues((p) => ({ ...p, paciente_nome: e.target.value }))}
                    placeholder="Ex: Maria Silva"
                  />
                </div>

                <div className="docWizardField">
                  <label>Data do documento</label>
                  <input
                    value={formValues.data_documento}
                    onChange={(e) => setFormValues((p) => ({ ...p, data_documento: e.target.value }))}
                    placeholder="dd/mm/aaaa"
                  />
                </div>

                <div className="docWizardField">
                  <label>Nome do documento</label>
                  <input
                    value={formValues.documento_nome}
                    onChange={(e) => setFormValues((p) => ({ ...p, documento_nome: e.target.value }))}
                    placeholder="Ex: Contrato - Honorários"
                  />
                </div>
              </div>

              {/* Preview pequeno */}
              <div className="docWizardPreviewMini">
                <div className="docWizardPreviewMiniTitle">Prévia</div>
                <div className="docPreviewPaper mini">
                  <h2>{values.documento_nome || document?.title}</h2>
                  <p>
                    Paciente: <strong>{values.paciente_nome || "__________"}</strong>
                  </p>
                  <p>
                    Data: <strong>{values.data_documento}</strong>
                  </p>
                </div>
              </div>
            </>
          )}

          {step === "sign" && (
            <>
              <div className="docWizardNotice">
                Confirme as assinaturas para finalizar. (Por enquanto: “assinar” simples.)
              </div>

              <div className="docWizardSignGrid">
                <div className={`docWizardSignCard ${patientSigned ? "signed" : ""}`}>
                  <div className="docWizardSignTitle">Assinatura da paciente</div>
                  <div className="docWizardSignName">{values.paciente_nome || "Paciente"}</div>

                  <button
                    type="button"
                    className="docWizardBtn primary small"
                    onClick={() => setPatientSigned(true)}
                    disabled={patientSigned}
                  >
                    {patientSigned ? "Assinado" : "Assinar"}
                  </button>
                </div>

                <div className={`docWizardSignCard ${doctorSigned ? "signed" : ""}`}>
                  <div className="docWizardSignTitle">Assinatura do médico</div>
                  <div className="docWizardSignName">Dr(a). (em breve)</div>

                  <button
                    type="button"
                    className="docWizardBtn primary small"
                    onClick={() => setDoctorSigned(true)}
                    disabled={doctorSigned}
                  >
                    {doctorSigned ? "Assinado" : "Assinar"}
                  </button>
                </div>
              </div>

              <div className="docWizardPreviewMini">
                <div className="docWizardPreviewMiniTitle">Status</div>
                <div className="docPreviewPaper mini">
                  <p>Paciente: {patientSigned ? "✅ Assinado" : "⏳ Pendente"}</p>
                  <p>Médico: {doctorSigned ? "✅ Assinado" : "⏳ Pendente"}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="docWizardFooter">
          <button
            className="docWizardBtn ghost"
            onClick={() => {
              if (step === "preview") return onBack?.();
              if (step === "edit") return setStep("preview");
              if (step === "sign") return setStep("edit");
            }}
          >
            Voltar
          </button>

          {step === "preview" && (
            <>
              <button className="docWizardBtn ghost" onClick={() => setStep("edit")}>
                Editar
              </button>

              <button
                className="docWizardBtn primary"
                onClick={() => setStep("sign")}
                disabled={!canGoToSign}
                title={!canGoToSign ? "Preencha o nome para continuar" : ""}
              >
                Continuar
              </button>
            </>
          )}

          {step === "edit" && (
            <>
              <button className="docWizardBtn ghost" onClick={() => setStep("preview")}>
                Ver documento
              </button>

              <button className="docWizardBtn primary" onClick={() => setStep("sign")} disabled={!canGoToSign}>
                Ir para assinatura
              </button>
            </>
          )}

          {step === "sign" && (
            <>
              <button className="docWizardBtn ghost" onClick={() => setStep("edit")}>
                Editar
              </button>

              <button
                className="docWizardBtn primary"
                disabled={!canFinish}
                onClick={() => {
                  alert("Documento finalizado! (mock)");
                  onClose?.();
                }}
              >
                Finalizar
              </button>
            </>
          )}

          {saving && <span className="docWizardSaving">Salvando…</span>}
          {saved && <span className="docWizardSaved">Salvo</span>}
        </div>
      </div>
    </div>
  );
}

export default DocumentWizardModal;