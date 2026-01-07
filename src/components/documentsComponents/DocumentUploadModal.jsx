import React, { useRef, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function DocumentUploadModal({ open, onClose, onUploaded }) {
  const fileInputRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Consentimentos");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function pickFile() {
    fileInputRef.current?.click();
  }

  function onFileSelected(f) {
    if (!f) return;
    setError("");

    // recomenda PDF
    const okTypes = ["application/pdf"];
    if (!okTypes.includes(f.type)) {
      setError("Por enquanto, faça upload em PDF.");
      return;
    }

    setFile(f);
    if (!title) {
      const base = (f.name || "").replace(/\.[^/.]+$/, "");
      setTitle(base);
    }
  }

  async function handleUpload() {
    try {
      setLoading(true);
      setError("");

      if (!file) throw new Error("Selecione um arquivo.");
      if (!title.trim()) throw new Error("Informe o título.");
      if (!category.trim()) throw new Error("Informe a categoria.");

      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const safeName = file.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9._-]+/g, "_");

      // pasta por categoria (opcional)
      const folder = category
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9_-]+/g, "_");

      const path = `${folder}/${Date.now()}_${safeName}`;

      // 1) Upload no Storage
      const { error: upErr } = await supabase.storage
        .from("document_templates")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (upErr) throw upErr;

      // 2) Salvar metadados na tabela
      const { data: row, error: insErr } = await supabase
        .from("document_templates")
        .insert({
          title: title.trim(),
          category: category.trim(),
          description: description.trim() || null,
          file_path: path,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          active: true,
        })
        .select()
        .single();

      if (insErr) throw insErr;

      onUploaded?.(row); // avisa a tela para atualizar lista
      onClose?.();
    } catch (e) {
      setError(e?.message || "Erro ao fazer upload.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="documentsModalOverlay" onMouseDown={onClose}>
      <div className="documentsModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="documentsModalHeader">
          <div className="documentsModalTitle">Novo documento</div>
          <button className="documentsModalClose" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="documentsModalBody">
          <div
            style={{
              border: `2px dashed ${dragOver ? "#999" : "#ddd"}`,
              borderRadius: 12,
              padding: 16,
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={pickFile}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFileSelected(e.dataTransfer.files?.[0]);
            }}
            title="Arraste um PDF aqui ou clique para selecionar"
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Arraste o PDF aqui ou clique para selecionar
            </div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              {file ? `Arquivo: ${file.name}` : "Somente PDF por enquanto"}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={(e) => onFileSelected(e.target.files?.[0])}
            />
          </div>

          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            <div className="docWizardField">
              <label>Título</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="docWizardField">
              <label>Categoria</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>

            <div className="docWizardField">
              <label>Descrição</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          {error ? <div style={{ marginTop: 12, color: "crimson" }}>{error}</div> : null}
        </div>

        <div className="documentsModalFooter">
          <button className="documentsModalBtn ghost" type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="documentsModalBtn primary" type="button" onClick={handleUpload} disabled={loading || !file}>
            {loading ? "Enviando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}