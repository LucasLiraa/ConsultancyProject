import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/postOperativeStyles/surgeryInfoForm.css";

/**
 * Form de informações gerais.
 * - Se for novo: insere em pacientes_pos e retorna o registro via onSaved
 * - Se for edição: se receber postOp prop, atualiza (edit mode)
 */
const SurgeryInfoForm = ({ patient, postOp = null, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    nome: patient?.nome || "",
    cirurgia: postOp?.cirurgia || "",
    cirurgiao: postOp?.cirurgiao || "",
    auxiliar: postOp?.auxiliar || "",
    instrumentadoras: postOp?.instrumentadoras || "",
    tecnologia: postOp?.tecnologia || "",
    data_cirurgia: postOp?.data_cirurgia || "",
    dias_atestado: postOp?.dias_atestado || "",
    anestesia: postOp?.anestesia || "",
  });

  const [saving, setSaving] = useState(false);
  const editMode = !!postOp?.id;

  useEffect(() => {
    // Se mudar o paciente ou entrar/sair do modo edição, sincroniza o form.
    setForm({
      nome: patient?.nome || "",
      cirurgia: postOp?.cirurgia || "",
      cirurgiao: postOp?.cirurgiao || "",
      auxiliar: postOp?.auxiliar || "",
      instrumentadoras: postOp?.instrumentadoras || "",
      tecnologia: postOp?.tecnologia || "",
      data_cirurgia: postOp?.data_cirurgia || "",
      dias_atestado: postOp?.dias_atestado || "",
      anestesia: postOp?.anestesia || "",
    });
  }, [patient, postOp]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editMode) {
        const { error } = await supabase
          .from("pacientes_pos")
          .update({
            cirurgia: form.cirurgia,
            cirurgiao: form.cirurgiao,
            auxiliar: form.auxiliar,
            instrumentadoras: form.instrumentadoras,
            tecnologia: form.tecnologia,
            data_cirurgia: form.data_cirurgia,
            dias_atestado: form.dias_atestado,
            anestesia: form.anestesia,
          })
          .eq("id", postOp.id);

        if (error) throw error;

        const { data } = await supabase
          .from("pacientes_pos")
          .select("*")
          .eq("id", postOp.id)
          .single();

        onSaved?.(data);
      } else {
        const payload = {
          nome: form.nome,
          cirurgia: form.cirurgia,
          cirurgiao: form.cirurgiao,
          auxiliar: form.auxiliar,
          instrumentadoras: form.instrumentadoras,
          tecnologia: form.tecnologia,
          data_cirurgia: form.data_cirurgia,
          dias_atestado: form.dias_atestado,
          anestesia: form.anestesia,
          paciente_id: patient.id,
          data_pos: new Date().toISOString(),
          alta: false,
        };

        const { data, error } = await supabase
          .from("pacientes_pos")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        onSaved?.(data);
      }
    } catch (err) {
      console.error("Erro ao salvar informações gerais:", err.message || err);
      alert("Erro ao salvar: " + (err.message || String(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="surgeryFormBox">
      <div className="surgeryHeader">
        <h3>{editMode ? "Editar Informações" : "Informações Iniciais do Pós"}</h3>
        <div className="surgeryHeaderActions">
          <button type="button" className="btnGhost" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>

      <form className="surgeryForm" onSubmit={handleSubmit}>
        <div className="row">
          <label>Nome do paciente</label>
          <input
            name="nome"
            value={form.nome}
            disabled
            className="inputDisabled"
          />
        </div>

        <div className="row">
          <label>Cirurgia</label>
          <input
            name="cirurgia"
            value={form.cirurgia}
            onChange={handleChange}
            placeholder="Ex: Lipoaspiração + Abdominoplastia"
          />
        </div>

        <div className="grid2">
          <div className="row">
            <label>Cirurgião</label>
            <input
              name="cirurgiao"
              value={form.cirurgiao}
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <label>Auxiliar</label>
            <input
              name="auxiliar"
              value={form.auxiliar}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row">
          <label>Instrumentadoras</label>
          <input
            name="instrumentadoras"
            value={form.instrumentadoras}
            onChange={handleChange}
          />
        </div>

        <div className="grid2">
          <div className="row">
            <label>Tecnologia</label>
            <input
              name="tecnologia"
              value={form.tecnologia}
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <label>Anestesia</label>
            <input
              name="anestesia"
              value={form.anestesia}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid2">
          <div className="row">
            <label>Data da cirurgia</label>
            <input
              type="date"
              name="data_cirurgia"
              value={form.data_cirurgia || ""}
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <label>Dias de atestado</label>
            <input
              name="dias_atestado"
              value={form.dias_atestado}
              onChange={handleChange}
              placeholder="Ex: 10"
            />
          </div>
        </div>

        <div className="formActions">
          <button className="btnPrimary" disabled={saving}>
            {saving ? "Salvando..." : editMode ? "Atualizar" : "Salvar e iniciar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurgeryInfoForm;