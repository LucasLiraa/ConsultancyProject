import React, { useMemo, useState } from "react";
import "../styles/postOperativeStyles/postOperativeDashboard.css";

function PostOperativeDashboard({ pacientes, onSelecionar }) {
  const [bucket, setBucket] = useState("todos");

  const calcularSemanas = (paciente) => {
    if (!paciente?.data_cirurgia) return 0;

    const cirurgiaDate = new Date(paciente.data_cirurgia);
    if (Number.isNaN(cirurgiaDate.getTime())) return 0;

    const hoje = new Date();
    const diffMs = hoje.getTime() - cirurgiaDate.getTime();
    const diffDias = diffMs / (1000 * 60 * 60 * 24);
    const semanas = Math.floor(diffDias / 7) + 1;

    return semanas < 0 ? 0 : semanas;
  };

  const status = (p) => {
    const s = calcularSemanas(p);
    if (s <= 2) return "inicio";
    if (s <= 4) return "meio";
    return "final";
  };

  const ativos = useMemo(() => {
    return (pacientes || []).filter((p) => p.status !== "finalizado");
  }, [pacientes]);

  const groups = useMemo(() => {
    const inicio = ativos.filter((p) => status(p) === "inicio");
    const meio = ativos.filter((p) => status(p) === "meio");
    const final = ativos.filter((p) => status(p) === "final");
    return { inicio, meio, final, todos: ativos };
  }, [ativos]);

  const cards = [
    { id: "inicio", title: "Início", sub: "Semanas 1–2", count: groups.inicio.length },
    { id: "meio", title: "Acompanhando", sub: "Semanas 3–4", count: groups.meio.length },
    { id: "final", title: "Finalizando", sub: "Semana 5+", count: groups.final.length },
    { id: "todos", title: "Total", sub: "Ativos", count: groups.todos.length },
  ];

  const list = groups[bucket] || [];

  return (
    <div className="podRoot">
      <div className="podCards">
        {cards.map((c) => (
          <button
            key={c.id}
            className={`podCard ${bucket === c.id ? "active" : ""}`}
            onClick={() => setBucket(c.id)}
          >
            <div className="podCardTop">
              <span className="podCardTitle">{c.title}</span>
              <span className="podCardCount">{c.count}</span>
            </div>
            <span className="podCardSub">{c.sub}</span>
          </button>
        ))}
      </div>

      <div className="podPanel">
        <div className="podPanelHeader">
          <h3>{cards.find((c) => c.id === bucket)?.title}</h3>
          <span className="podMeta">{list.length} pacientes</span>
        </div>

        <div className="podList">
          {list.length === 0 ? (
            <div className="podEmpty">
              <strong>Nenhum paciente aqui</strong>
              <span>Quando houver registros, eles aparecerão nesta lista.</span>
            </div>
          ) : (
            list.map((p) => {
              const semanas = calcularSemanas(p) || 1;
              return (
                <button
                  key={p.id}
                  className="podItem"
                  onClick={() => onSelecionar(p)}
                >
                  <div className="podItemMain">
                    <div className="podName">{p.nome || "—"}</div>
                    <div className="podSub">
                      {(p.cirurgia || p.procedimento || "Procedimento")} • Semana {semanas}
                    </div>
                  </div>
                  <span className="podPill">Abrir</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default PostOperativeDashboard;