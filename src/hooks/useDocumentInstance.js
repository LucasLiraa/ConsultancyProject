import { useCallback, useRef, useState } from "react";
import { supabase } from "../utils/supabaseClient.js";

export function useDocumentInstance({ templateId, pacienteId, userId }) {
  const [instance, setInstance] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const debounceRef = useRef(null);

  // cria a instância (uma vez)
  const createInstance = useCallback(async (initialData) => {
    if (!templateId || !pacienteId || !userId) return null;

    const { data, error } = await supabase
      .from("document_instances")
      .insert({
        template_id: templateId,
        paciente_id: pacienteId,
        data: initialData,
        status: "draft",
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    setInstance(data);
    return data;
  }, [templateId, pacienteId, userId]);

  // autosave com debounce
  const updateInstance = useCallback((newData, status = "draft") => {
    if (!instance) return;

    setSaving(true);
    setSaved(false);

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from("document_instances")
        .update({
          data: newData,
          status,
          updated_at: new Date()
        })
        .eq("id", instance.id);

      if (!error) {
        setSaving(false);
        setSaved(true);
      }
    }, 800);
  }, [instance]);

  return {
    instance,
    createInstance,
    updateInstance,
    saving,
    saved
  };
}