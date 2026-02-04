import { supabase } from "../../utils/supabaseClient";

/**
 * Serviço central do módulo de Pós-Operatório.
 * Mantém toda a lógica de banco em um lugar só, para os componentes ficarem mais "UI".
 */

const sortWeeks = (weeks = []) =>
  [...weeks].sort((a, b) => Number(a.semana || 0) - Number(b.semana || 0));

export async function fetchActivePostOps() {
  const { data, error } = await supabase
    .from("pacientes_pos")
    .select("*")
    .eq("alta", false)
    .order("data_pos", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

export async function fetchPostOpByPatientId(pacienteId) {
  const { data, error } = await supabase
    .from("pacientes_pos")
    .select("*")
    .eq("paciente_id", pacienteId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export async function fetchWeeksByPostOpId(pacientePosId) {
  const { data, error } = await supabase
    .from("pos_operatorio")
    .select("*")
    .eq("paciente_pos_id", pacientePosId)
    .order("criado_em", { ascending: true });

  if (error) throw error;
  return sortWeeks(data || []);
}

export async function fetchMaxWeekNumber(pacientePosId) {
  const { data, error } = await supabase
    .from("pos_operatorio")
    .select("semana")
    .eq("paciente_pos_id", pacientePosId);

  if (error) throw error;

  const maxWeek = (data || [])
    .map((w) => Number(w.semana || 0))
    .reduce((acc, n) => Math.max(acc, n), 0);

  return maxWeek;
}

export async function createWeek({ pacientePosId, pacienteId, semana }) {
  const payload = {
    paciente_pos_id: pacientePosId,
    paciente_id: pacienteId,
    semana: String(semana),
    criado_em: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("pos_operatorio")
    .insert([payload])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function setAlta({ pacientePosId, alta }) {
  const { error } = await supabase
    .from("pacientes_pos")
    .update({ alta })
    .eq("id", pacientePosId);

  if (error) throw error;
  return true;
}