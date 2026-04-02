import React from "react";

// Classifica o procedimento por tipo (lipo, mama, abdômen, glúteo ou outros)
const classifyProcedure = (rawName) => {
  const name = rawName || "";
  const normalized = name.toLowerCase();

  // Lipo (lipoaspiração, lipo lad, lipo hd etc.)
  if (normalized.includes("lipo")) {
    return {
      typeId: "lipo",
      typeLabel: "Lipoaspiração / Lipo",
      iconClass: "fa-solid fa-droplet",
      chipClass: "chip-lipo",
      tooltip: "Procedimentos de lipoaspiração e modelagem corporal.",
    };
  }

  // Mama (mamoplastia, mastopexia, prótese de silicone, etc.)
  if (
    normalized.includes("mamo") ||
    normalized.includes("mama") ||
    normalized.includes("mastopex") ||
    normalized.includes("silicone")
  ) {
    return {
      typeId: "mama",
      typeLabel: "Mama",
      iconClass: "fa-solid fa-heart",
      chipClass: "chip-mama",
      tooltip: "Procedimentos em mama: mamoplastia, prótese, mastopexia.",
    };
  }

  // Abdômen (abdominoplastia, mini abdômen etc.)
  if (
    normalized.includes("abdominoplast") ||
    normalized.includes("abdômen") ||
    normalized.includes("abdomen")
  ) {
    return {
      typeId: "abdomen",
      typeLabel: "Abdômen",
      iconClass: "fa-solid fa-ruler-horizontal",
      chipClass: "chip-abdomen",
      tooltip: "Procedimentos em abdômen e região abdominal.",
    };
  }

  // Glúteo (gluteoplastia, enxerto, etc.)
  if (
    normalized.includes("gluteo") ||
    normalized.includes("glúteo") ||
    normalized.includes("gluteoplast") ||
    normalized.includes("bumbum")
  ) {
    return {
      typeId: "gluteo",
      typeLabel: "Glúteo",
      iconClass: "fa-solid fa-arrow-trend-up",
      chipClass: "chip-gluteo",
      tooltip: "Procedimentos em glúteo e contorno posterior.",
    };
  }

  // Outros / genérico
  return {
    typeId: "outro",
    typeLabel: "Outro",
    iconClass: "fa-solid fa-star",
    chipClass: "chip-outro",
    tooltip: "Procedimento estético não categorizado.",
  };
};

export default function ProceduresCard({ paciente }) {
  const procedimentosUnicos = React.useMemo(() => {
    const arr = paciente?.cirurgiaNomes || [];
    const limpos = arr
      .map((s) => (s ? s.trim() : ""))
      .filter((s) => s.length > 0);
    return [...new Set(limpos)];
  }, [paciente?.cirurgiaNomes]);

  return (
    <section className="summaryCard">
      <div className="summaryCardHeader">
        <div>
          <h3>Procedimentos do paciente</h3>
        </div>

        <span className="summaryStatusChip">
          {procedimentosUnicos.length > 0
            ? `${procedimentosUnicos.length} procedimento(s)`
            : "Nenhum procedimento registrado"}
        </span>
      </div>

      {procedimentosUnicos.length === 0 ? (
        <p className="proceduresEmptyText">
          Ainda não há procedimentos cadastrados para esta paciente.
        </p>
      ) : (
        <div className="proceduresChipsRow">
          {procedimentosUnicos.map((proc) => {
            const meta = classifyProcedure(proc);
            return (
              <button
                key={proc}
                type="button"
                className={`procedureChip ${meta.chipClass}`}
                data-tooltip={meta.tooltip}
              >
                <span className="procedureChip-icon">
                  <i className={meta.iconClass} />
                </span>
                <span className="procedureChip-main">
                  <span className="procedureChip-name">{proc}</span>
                  <span className="procedureChip-type">{meta.typeLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}