import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/patientsStyles/DocumentsManager.css";

export default function DocumentsManager({ pacienteId }) {
  const [arquivos, setArquivos] = useState([]);
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef(null);

  const bucket = "documentos_pacientes"; // 🔹 nome do bucket no Supabase Storage

  // 🔹 Busca arquivos vinculados ao paciente
  const listarArquivos = async () => {
    const { data, error } = await supabase
      .from("documentos_pacientes")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao listar documentos:", error);
      return;
    }

    setArquivos(data || []);
  };

  useEffect(() => {
    if (pacienteId) listarArquivos();
  }, [pacienteId]);

  // 🔹 Upload de múltiplos arquivos com nome sanitizado
  const uploadArquivos = async (fileList) => {
    if (!fileList?.length) return;

    for (const arquivo of fileList) {
      // 🔧 Sanitiza o nome do arquivo (remove acentos e caracteres inválidos)
      const safeFileName = arquivo.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/[^a-zA-Z0-9.\-_]/g, "_"); // substitui espaços e caracteres especiais

      const caminho = `${pacienteId}/${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(caminho, arquivo);

      if (uploadError) {
        console.error("Erro ao enviar arquivo:", uploadError.message);
        continue;
      }

      // Gera URL pública e salva metadado no banco
      const publicUrl = supabase.storage
        .from(bucket)
        .getPublicUrl(caminho).data.publicUrl;

      const { error: dbError } = await supabase
        .from("documentos_pacientes")
        .insert({
          paciente_id: pacienteId,
          nome_arquivo: safeFileName,
          url: publicUrl,
        });

      if (dbError) {
        console.error("Erro ao salvar metadados:", dbError.message);
      }
    }

    listarArquivos();
  };

  // 🔹 Excluir arquivo (remove do Storage e da tabela)
  const deletarArquivo = async (doc) => {
    if (!window.confirm(`Excluir o arquivo "${doc.nome_arquivo}"?`)) return;

    try {
      // Remove do Storage
      const fileName = doc.url.split("/").pop();
      const caminho = `${pacienteId}/${fileName}`;
      await supabase.storage.from(bucket).remove([caminho]);

      // Remove do banco
      const { error } = await supabase
        .from("documentos_pacientes")
        .delete()
        .eq("id", doc.id);

      if (error) console.error("Erro ao excluir do banco:", error.message);

      listarArquivos();
    } catch (err) {
      console.error("Erro ao excluir arquivo:", err);
    }
  };

  // 🔹 Eventos de arrastar e soltar
  const handleDrop = (e) => {
    e.preventDefault();
    setArrastando(false);
    if (e.dataTransfer.files.length > 0) {
      uploadArquivos(e.dataTransfer.files);
    }
  };

  return (
    <div
      className={`dropzone ${arrastando ? "dragover" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={handleDrop}
    >
      <div className="headerDocs">
        <h4>Arquivos / Documentos</h4>
        <button onClick={() => inputRef.current?.click()}>Adicionar</button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => uploadArquivos(e.target.files)}
      />

      {arquivos.length === 0 ? (
        <p className="semDocs">Arraste arquivos ou clique em “Adicionar”.</p>
      ) : (
        <div className="listaDocs">
          {arquivos.map((file) => (
            <div key={file.id} className="docItem">
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <i className="fa fa-file" /> {file.nome_arquivo}
              </a>
              <i
                className="fa fa-trash deleteIcon"
                title="Excluir"
                onClick={() => deletarArquivo(file)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}