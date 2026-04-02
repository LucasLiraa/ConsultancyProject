import React from "react";
import "../styles/budgetsStyles/SelecaoModulos.css";

const DEFAULT_MODULOS = [
  {
    id: "dados",
    label: "Dados iniciais",
    description: "Informações da paciente, cirurgia, tempo de sala e anestesia.",
    required: true,
  },
  {
    id: "orcamento",
    label: "Orçamento",
    description: "Honorários, prótese, aparelhos e demais itens principais.",
  },
  {
    id: "kit",
    label: "Kit e brindes",
    description: "Itens complementares incluídos ou cobrados à parte.",
  },
  {
    id: "hospital",
    label: "Hospital",
    description: "Opções hospitalares, valores e fluxo de pagamento.",
  },
  {
    id: "equipe",
    label: "Equipe cirúrgica",
    description: "Anestesista, instrumentadora e médico auxiliar.",
  },
  {
    id: "kit_malhas",
    label: "Kit cirúrgico e malhas",
    description: "Itens opcionais adicionais com descrição e valor.",
  },
  {
    id: "drenagens",
    label: "Drenagens",
    description: "Quantidade e valor total do pacote de drenagens.",
  },
  {
    id: "resumo",
    label: "Resumo financeiro",
    description: "Conferência consolidada dos valores antes da finalização.",
  },
  {
    id: "pagamento",
    label: "Forma de pagamento",
    description: "Entrada, parcelas, vencimento, validade e observações.",
  },
];

const normalizeSelected = (selected = [], modulos = []) => {
  const safeSelected = Array.isArray(selected) ? selected : [];
  const requiredIds = modulos.filter((item) => item.required).map((item) => item.id);
  return Array.from(new Set([...requiredIds, ...safeSelected]));
};

const SelecaoModulos = ({
  modulosDisponiveis = DEFAULT_MODULOS,
  selectedModulos = [],
  setSelectedModulos,
  onChange,
  title = "Selecione os módulos",
  subtitle = "Escolha as etapas que farão parte deste orçamento.",
}) => {
  const normalizedSelected = normalizeSelected(selectedModulos, modulosDisponiveis);

  const emitChange = (nextValue) => {
    if (typeof setSelectedModulos === "function") {
      setSelectedModulos(nextValue);
      return;
    }

    if (typeof onChange === "function") {
      onChange(nextValue);
      return;
    }

    console.error(
      "SelecaoModulos: passe `setSelectedModulos` ou `onChange` para atualizar os módulos."
    );
  };

  const handleToggle = (moduloId, required) => {
    if (required) return;

    const isSelected = normalizedSelected.includes(moduloId);

    const next = isSelected
      ? normalizedSelected.filter((id) => id !== moduloId)
      : [...normalizedSelected, moduloId];

    emitChange(normalizeSelected(next, modulosDisponiveis));
  };

  return (
    <section className="modSel">
      <header className="modSel__header">
        <span className="modSel__eyebrow">Fluxo do orçamento</span>
        <h2 className="modSel__title">{title}</h2>
        <p className="modSel__subtitle">{subtitle}</p>
      </header>

      <fieldset className="modSel__fieldset">
        <legend className="modSel__legend">Módulos disponíveis</legend>

        <div className="modSel__grid">
          {modulosDisponiveis.map((modulo) => {
            const checked = normalizedSelected.includes(modulo.id);
            const disabled = !!modulo.required;
            const inputId = `modulo-${modulo.id}`;

            return (
              <label
                key={modulo.id}
                htmlFor={inputId}
                className={`modSel__card ${checked ? "is-selected" : ""} ${
                  disabled ? "is-required" : ""
                }`}
              >
                <input
                  id={inputId}
                  className="modSel__input"
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => handleToggle(modulo.id, disabled)}
                />

                <div className="modSel__check" aria-hidden="true">
                  <span className="modSel__checkDot" />
                </div>

                <div className="modSel__content">
                  <div className="modSel__topline">
                    <strong className="modSel__name">{modulo.label || modulo.title}</strong>

                    {disabled ? (
                      <span className="modSel__badge">Obrigatório</span>
                    ) : checked ? (
                      <span className="modSel__badge is-selected">Selecionado</span>
                    ) : (
                      <span className="modSel__badge is-neutral">Opcional</span>
                    )}
                  </div>

                  <p className="modSel__description">{modulo.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
};

export default SelecaoModulos;