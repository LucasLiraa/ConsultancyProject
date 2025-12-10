import React from "react";
import { supabase } from "../../../utils/supabaseClient"; // caminho a partir da pasta prontuarioOverview

// Configuração dos itens de checklist (fácil de trocar futuramente)
const CHECKLIST_ITEMS = [
  {
    id: "exames_entregues",
    label: "Exames entregues",
  },
  {
    id: "risco_cirurgico",
    label: "Risco cirúrgico",
  },
  {
    id: "liberacao_cardiologica",
    label: "Liberação cardiológica",
  },
  {
    id: "fotos_pre_cirurgicas",
    label: "Fotos pré-cirúrgicas",
  },
  {
    id: "consentimentos_assinados",
    label: "Assinatura de consentimentos",
  },
  {
    id: "cirurgia_paga",
    label: "Cirurgia paga / pendente",
  },
];

export default function PreOpChecklistCard({ paciente }) {
  const [localChecklist, setLocalChecklist] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Inicializa a partir do que veio do banco
  React.useEffect(() => {
    setLocalChecklist(paciente?.preopChecklist || {});
  }, [paciente?.preopChecklist, paciente?.id]);

  const totalItems = CHECKLIST_ITEMS.length;
  const doneCount = CHECKLIST_ITEMS.filter(
    (item) => localChecklist[item.id]
  ).length;

  const handleToggle = (itemId) => {
    setLocalChecklist((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleSave = async () => {
    if (!paciente?.id) return;

    try {
      setSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from("pacientes")
        .update({
          preop_checklist: localChecklist,
        })
        .eq("id", paciente.id);

      if (updateError) {
        console.error(updateError);
        setError("Não foi possível salvar o checklist pré-operatório.");
        return;
      }

      // Opcional: você pode atualizar o paciente no estado global depois, se quiser.
    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro ao salvar o checklist.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="summaryCard">
      <div className="summaryCardHeader">
        <div>
          <h3>Checklist pré-operatório</h3>
        </div>

        <span className="summaryStatusChip">
          {doneCount} de {totalItems} itens concluídos
        </span>
      </div>

      {error && (
        <div className="prontuarioError" style={{ marginBottom: "0.5rem" }}>
          {error}
        </div>
      )}

      <div className="preopChecklistGrid">
        {CHECKLIST_ITEMS.map((item) => {
          const checked = !!localChecklist[item.id];

          return (
            <button
              key={item.id}
              type="button"
              className={`preopItem ${checked ? "is-checked" : ""}`}
              onClick={() => handleToggle(item.id)}
            >
              <span className="preopCheckbox">
                {checked && <i className="fa-solid fa-check" />}
              </span>
              <span className="preopLabel">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="preopActions">
        <button
          type="button"
          className="preopSaveBtn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar checklist"}
        </button>
      </div>
    </section>
  );
}