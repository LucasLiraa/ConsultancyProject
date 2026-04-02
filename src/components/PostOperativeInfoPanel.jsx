import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/postOperativeStyles/weeklyControlForm.css";

/**
 * Painel de informações do pós (cadastro inicial)
 *
 * Props:
 * - postOp: registro de pacientes_pos (já carregado no Manager)
 * - onUpdated: callback chamado após update bem-sucedido
 */
const PostOperativeInfoPanel = ({ postOp, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Ajuste esses campos para bater com o schema real de pacientes_pos
  const [form, setForm] = useState({
    procedimento: postOp?.procedimento || "",
    cirurgiao: postOp?.cirurgiao || "",
    hospital: postOp?.hospital || "",
    data_cirurgia: postOp?.data_cirurgia || "",
    observacoes: postOp?.observacoes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!postOp?.id) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("pacientes_pos")
        .update({
          procedimento: form.procedimento || null,
          cirurgiao: form.cirurgiao || null,
          hospital: form.hospital || null,
          data_cirurgia: form.data_cirurgia || null,
          observacoes: form.observacoes || null,
        })
        .eq("id", postOp.id);

      if (error) throw error;

      setEditing(false);
      onUpdated?.();
    } catch (err) {
      console.error("Erro ao atualizar cadastro do pós:", err);
      alert(
        "Erro ao atualizar cadastro do pós-operatório: " +
          (err.message || String(err))
      );
    } finally {
      setSaving(false);
    }
  };

  if (!postOp) return null;

  return (
    <div className="postOpInfoPanel">
      <div className="postOpInfoHeader">
        <div>
          <h3>Dados do procedimento</h3>
          <span>Cadastro inicial deste pós-operatório</span>
        </div>
        <button
          type="button"
          className="btnSecondary"
          onClick={() => setEditing((prev) => !prev)}
        >
          {editing ? "Cancelar" : "Editar"}
        </button>
      </div>

      {!editing ? (
        <div className="postOpInfoGrid">
          <div className="postOpInfoItem">
            <span className="label">Procedimento</span>
            <span className="value">{postOp.procedimento || "-"}</span>
          </div>
          <div className="postOpInfoItem">
            <span className="label">Cirurgião</span>
            <span className="value">{postOp.cirurgiao || "-"}</span>
          </div>
          <div className="postOpInfoItem">
            <span className="label">Hospital</span>
            <span className="value">{postOp.hospital || "-"}</span>
          </div>
          <div className="postOpInfoItem">
            <span className="label">Data da cirurgia</span>
            <span className="value">
              {postOp.data_cirurgia || "-"}
            </span>
          </div>
          <div className="postOpInfoItem full">
            <span className="label">Observações</span>
            <span className="value">
              {postOp.observacoes || "Nenhuma observação cadastrada."}
            </span>
          </div>
        </div>
      ) : (
        <div className="postOpInfoGrid edit">
          <div className="postOpInfoItem">
            <span className="label">Procedimento</span>
            <input
              name="procedimento"
              value={form.procedimento}
              onChange={handleChange}
            />
          </div>
          <div className="postOpInfoItem">
            <span className="label">Cirurgião</span>
            <input
              name="cirurgiao"
              value={form.cirurgiao}
              onChange={handleChange}
            />
          </div>
          <div className="postOpInfoItem">
            <span className="label">Hospital</span>
            <input
              name="hospital"
              value={form.hospital}
              onChange={handleChange}
            />
          </div>
          <div className="postOpInfoItem">
            <span className="label">Data da cirurgia</span>
            <input
              type="date"
              name="data_cirurgia"
              value={form.data_cirurgia || ""}
              onChange={handleChange}
            />
          </div>
          <div className="postOpInfoItem full">
            <span className="label">Observações</span>
            <textarea
              name="observacoes"
              rows="3"
              value={form.observacoes}
              onChange={handleChange}
            />
          </div>
          <div className="postOpInfoActions">
            <button
              type="button"
              className="btnPrimary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostOperativeInfoPanel;