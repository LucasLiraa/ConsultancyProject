import { supabase } from "../../utils/supabaseClient";

const BUCKET = "pos_fotos";

const slugify = (str) =>
  (str || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .replace(/(^-|-$)/g, "");

export async function listPhotos({ pacientePosId, semana = null }) {
  let query = supabase
    .from("pos_fotos")
    .select("*")
    .eq("paciente_pos_id", pacientePosId)
    .order("created_at", { ascending: true });

  if (semana !== null && semana !== undefined) {
    query = query.eq("semana", String(semana));
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function uploadPhotos({
  pacientePosId,
  pacienteId,
  semana,
  items, // [{ file, categoria, nome }]
}) {
  for (const item of items) {
    const ext = item.file?.name?.split(".").pop() || "jpg";
    const base = (item.nome || "foto").trim() || "foto";
    const safeBase = slugify(base) || "foto";
    const randomPart = Math.random().toString(36).slice(2, 8);
    const fileName = `${safeBase}-${randomPart}.${ext}`;

    const path = `${pacienteId || pacientePosId}/${String(
      semana
    )}/${item.categoria}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, item.file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(uploadData.path);

    const publicUrl = publicUrlData?.publicUrl || null;

    const { error: insertError } = await supabase.from("pos_fotos").insert([
      {
        paciente_pos_id: pacientePosId,
        paciente_id: pacienteId,
        semana: String(semana),
        categoria: item.categoria,
        nome_exibicao: item.nome,
        path: uploadData.path,
        url_publica: publicUrl,
      },
    ]);

    if (insertError) throw insertError;
  }

  return true;
}

export async function deletePhoto({ id, path }) {
  // tenta remover arquivo (não bloqueia se falhar)
  if (path) {
    await supabase.storage.from(BUCKET).remove([path]);
  }

  const { error } = await supabase.from("pos_fotos").delete().eq("id", id);
  if (error) throw error;
  return true;
}