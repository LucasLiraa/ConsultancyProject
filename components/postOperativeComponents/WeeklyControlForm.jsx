import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/postOperativeStyles/weeklyControlForm.css";

/**
 * Form que salva/atualiza um registro por semana.
 * Props:
 * - postOp: registro pacientes_pos
 * - semanaAtual: string (ex: "1", "2", ...)
 * - onSaved(): callback para recarregar semanas no Manager
 */
const WeeklyControlForm = ({ postOp, semanaAtual, onSaved }) => {
  const [form, setForm] = useState({
    edema: "",
    fibrose: "",
    seroma: "",
    cicatrizacao: "",
    drenagem: "",
    curativos: "",
    alimentacao: "",
    retorno_trabalho: "",
    outras_observacoes: "",
    alta: false,
  });
  const [loading, setLoading] = useState(false);
  const postOpId = postOp?.id;

  // carregar dados existentes da semana
  useEffect(() => {
    const fetchWeek = async () => {
      if (!postOpId || !semanaAtual) return;
      const { data, error } = await supabase
        .from("pos_operatorio")
        .select("*")
        .eq("paciente_pos_id", postOpId)
        .eq("semana", String(semanaAtual))
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar semana:", error.message);
        return;
      }
      if (data) {
        setForm({
          edema: data.edema || "",
          fibrose: data.fibrose || "",
          seroma: data.seroma || "",
          cicatrizacao: data.cicatrizacao || "",
          drenagem: data.drenagem || "",
          curativos: data.curativos || "",
          alimentacao: data.alimentacao || "",
          retorno_trabalho: data.retorno_trabalho || "",
          outras_observacoes: data.outras_observacoes || "",
          alta: !!data.alta,
        });
      } else {
        setForm({
          edema: "",
          fibrose: "",
          seroma: "",
          cicatrizacao: "",
          drenagem: "",
          curativos: "",
          alimentacao: "",
          retorno_trabalho: "",
          outras_observacoes: "",
          alta: false,
        });
      }
    };
    fetchWeek();
  }, [postOpId, semanaAtual]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!postOpId || !semanaAtual) return alert("Semana inválida.");

    setLoading(true);
    const weekStr = String(semanaAtual);

    try {
      // verifica se já existe
      const { data: existing } = await supabase
        .from("pos_operatorio")
        .select("id")
        .eq("paciente_pos_id", postOpId)
        .eq("semana", weekStr)
        .maybeSingle();

      const payload = {
        paciente_pos_id: postOpId,
        paciente_id: postOp.paciente_id,
        semana: weekStr,
        edema: form.edema,
        fibrose: form.fibrose,
        seroma: form.seroma,
        cicatrizacao: form.cicatrizacao,
        drenagem: form.drenagem,
        curativos: form.curativos,
        alimentacao: form.alimentacao,
        retorno_trabalho: form.retorno_trabalho,
        outras_observacoes: form.outras_observacoes,
        alta: form.alta,
        criado_em: new Date().toISOString(),
      };

      if (existing?.id) {
        const { error } = await supabase
          .from("pos_operatorio")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pos_operatorio")
          .insert([payload]);
        if (error) throw error;
      }

      alert("Semana salva com sucesso!");
      onSaved?.();
    } catch (err) {
      console.error("Erro ao salvar semana:", err.message || err);
      alert("Erro ao salvar semana: " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weeklyBox">
      <div className="weeklyHeader">
        <h3>Semana {semanaAtual}</h3>
        <div className="weeklyHeaderActions">
          <button className="btnPrimary" onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar semana"}
          </button>
        </div>
      </div>

      <form className="weeklyForm" onSubmit={handleSave}>
        <div className="grid4">
          <label>
            <div>Edema</div>
            <input name="edema" value={form.edema} onChange={handleChange} />
          </label>
          <label>
            <div>Fibrose</div>
            <input name="fibrose" value={form.fibrose} onChange={handleChange} />
          </label>
          <label>
            <div>Seroma</div>
            <input name="seroma" value={form.seroma} onChange={handleChange} />
          </label>
          <label>
            <div>Cicatrização</div>
            <input name="cicatrizacao" value={form.cicatrizacao} onChange={handleChange} />
          </label>
        </div>

        <div className="grid4">
          <label>
            <div>Drenagem</div>
            <input name="drenagem" value={form.drenagem} onChange={handleChange} />
          </label>
          <label>
            <div>Curativos</div>
            <input name="curativos" value={form.curativos} onChange={handleChange} />
          </label>
          <label>
            <div>Alimentação</div>
            <input name="alimentacao" value={form.alimentacao} onChange={handleChange} />
          </label>
          <label>
            <div>Retorno ao trabalho</div>
            <input name="retorno_trabalho" value={form.retorno_trabalho} onChange={handleChange} />
          </label>
        </div>

        <label className="fullLabel">
          <div>Observações</div>
          <textarea name="outras_observacoes" rows="4" value={form.outras_observacoes} onChange={handleChange} />
        </label>

        {Number(semanaAtual) >= 6 && (
          <label className="altaRow">
            <input type="checkbox" name="alta" checked={form.alta} onChange={handleChange} />
            <span>Paciente liberado (ALTA)</span>
          </label>
        )}
      </form>
    </div>
  );
};

export default WeeklyControlForm;