<<<<<<< HEAD
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
    // atualizar nome sempre que patient mudar
    setForm((f) => ({ ...f, nome: patient?.nome || f.nome }));
  }, [patient]);

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
        // refetch record to return up-to-date
        const { data } = await supabase
          .from("pacientes_pos")
          .select("*")
          .eq("id", postOp.id)
          .single();
        onSaved?.(data);
      } else {
        // inserir novo postOp
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
        // retorna o registro criado para o Manager (ele criará a semana 1)
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
          <button className="btnGhost" onClick={onCancel}>Cancelar</button>
        </div>
      </div>

      <form className="surgeryForm" onSubmit={handleSubmit}>
        <div className="row">
          <label>Nome do paciente</label>
          <input name="nome" value={form.nome} disabled className="inputDisabled" />
        </div>

        <div className="row">
          <label>Cirurgia</label>
          <input name="cirurgia" value={form.cirurgia} onChange={handleChange} />
        </div>

        <div className="rowGroup">
          <div className="col">
            <label>Cirurgião</label>
            <input name="cirurgiao" value={form.cirurgiao} onChange={handleChange} />
          </div>
          <div className="col">
            <label>Auxiliar</label>
            <input name="auxiliar" value={form.auxiliar} onChange={handleChange} />
          </div>
        </div>

        <div className="rowGroup">
          <div className="col">
            <label>Instrumentadora(s)</label>
            <input name="instrumentadoras" value={form.instrumentadoras} onChange={handleChange} />
          </div>
          <div className="col">
            <label>Tecnologia</label>
            <input name="tecnologia" value={form.tecnologia} onChange={handleChange} />
          </div>
        </div>

        <div className="rowGroup">
          <div className="col">
            <label>Data da cirurgia</label>
            <input type="date" name="data_cirurgia" value={form.data_cirurgia || ""} onChange={handleChange} />
          </div>
          <div className="col">
            <label>Dias de atestado</label>
            <input name="dias_atestado" value={form.dias_atestado} onChange={handleChange} />
          </div>
        </div>

        <div className="row">
          <label>Anestesia</label>
          <input name="anestesia" value={form.anestesia} onChange={handleChange} />
        </div>

        <div className="actionsRow">
          <button type="button" className="btnGhost" onClick={onCancel}>Fechar</button>
          <button type="submit" className="btnPrimary" disabled={saving}>
            {saving ? "Salvando..." : editMode ? "Salvar alterações" : "Criar Pós e iniciar Semana 1"}
          </button>
        </div>
      </form>
    </div>
  );
};

=======
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
    // atualizar nome sempre que patient mudar
    setForm((f) => ({ ...f, nome: patient?.nome || f.nome }));
  }, [patient]);

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
        // refetch record to return up-to-date
        const { data } = await supabase
          .from("pacientes_pos")
          .select("*")
          .eq("id", postOp.id)
          .single();
        onSaved?.(data);
      } else {
        // inserir novo postOp
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
        // retorna o registro criado para o Manager (ele criará a semana 1)
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
          <button className="btnGhost" onClick={onCancel}>Cancelar</button>
        </div>
      </div>

      <form className="surgeryForm" onSubmit={handleSubmit}>
        <div className="row">
          <label>Nome do paciente</label>
          <input name="nome" value={form.nome} disabled className="inputDisabled" />
        </div>

        <div className="row">
          <label>Cirurgia</label>
          <input name="cirurgia" value={form.cirurgia} onChange={handleChange} />
        </div>

        <div className="rowGroup">
          <div className="col">
            <label>Cirurgião</label>
            <input name="cirurgiao" value={form.cirurgiao} onChange={handleChange} />
          </div>
          <div className="col">
            <label>Auxiliar</label>
            <input name="auxiliar" value={form.auxiliar} onChange={handleChange} />
          </div>
        </div>

        <div className="rowGroup">
          <div className="col">
            <label>Instrumentadora(s)</label>
            <input name="instrumentadoras" value={form.instrumentadoras} onChange={handleChange} />
          </div>
          <div className="col">
            <label>Tecnologia</label>
            <input name="tecnologia" value={form.tecnologia} onChange={handleChange} />
          </div>
        </div>

        <div className="rowGroup">
          <div className="col">
            <label>Data da cirurgia</label>
            <input type="date" name="data_cirurgia" value={form.data_cirurgia || ""} onChange={handleChange} />
          </div>
          <div className="col">
            <label>Dias de atestado</label>
            <input name="dias_atestado" value={form.dias_atestado} onChange={handleChange} />
          </div>
        </div>

        <div className="row">
          <label>Anestesia</label>
          <input name="anestesia" value={form.anestesia} onChange={handleChange} />
        </div>

        <div className="actionsRow">
          <button type="button" className="btnGhost" onClick={onCancel}>Fechar</button>
          <button type="submit" className="btnPrimary" disabled={saving}>
            {saving ? "Salvando..." : editMode ? "Salvar alterações" : "Criar Pós e iniciar Semana 1"}
          </button>
        </div>
      </form>
    </div>
  );
};

>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
export default SurgeryInfoForm;