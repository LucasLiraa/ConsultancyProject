import React, { useState } from "react";
import "../styles/postOperativeStyles/postOperativeDashboard.css";

function PostOperativeDashboard({ pacientes, onSelecionar }) {
  const [ativo, setAtivo] = useState(null);

  const calcularStatus = (paciente) => {
    const semanas = paciente.retorno_count || 0;
    if (semanas <= 2) return "inicio";
    if (semanas <= 4) return "meio";
    return "final";
  };

  const inicio = pacientes.filter((p) => calcularStatus(p) === "inicio");
  const meio = pacientes.filter((p) => calcularStatus(p) === "meio");
  const final = pacientes.filter((p) => calcularStatus(p) === "final");

  const sections = [
    { id: "inicio", titulo: "Iniciando", cor: "#F780FF", pacientes: inicio },
    { id: "meio", titulo: "Continuando", cor: "#9b59b6", pacientes: meio },
    { id: "final", titulo: "Finalizando", cor: "#4e6cf0", pacientes: final },
    { id: "todos", titulo: "Total", cor: "#4ef07a", pacientes },
  ];

  return (
    <div className="dashboardSplit">
      {/* Lado esquerdo - Resumos */}
      <aside className="resumeColumn">
        <div className="resumeHeader">
          <h2>Pacientes em acompanhamento</h2>
          <p>Listagem de pacientes que já iniciaram o pós-operatório</p>
        </div>

        {sections.map((s) => (
          <div
            key={s.id}
            className={`resumeCard ${ativo === s.id ? "active" : ""}`}
            style={{ borderLeft: `4px solid ${s.cor}` }}
            onClick={() => setAtivo(s.id)}
          >
            <h3>{s.pacientes.length}</h3>
            <p>{s.titulo}</p>
          </div>
        ))}
      </aside>

      {/* Lado direito - Lista */}
      <section className="listContainer">
        {ativo ? (
          <>
            <h2>{sections.find((s) => s.id === ativo)?.titulo}</h2>
            <div className="pacienteList">
              {sections
                .find((s) => s.id === ativo)
                ?.pacientes.map((p) => (
                  <div
                    key={p.id}
                    className="pacienteItem"
                    onClick={() => onSelecionar(p)}
                  >
                    <span className="nome">{p.nome}</span>
                    <span className="info">
                      {p.cirurgia} — Semana {p.retorno_count || 0}
                    </span>
                  </div>
                ))}
              {sections.find((s) => s.id === ativo)?.pacientes.length === 0 && (
                <p className="vazio">Nenhum paciente</p>
              )}
            </div>
          </>
        ) : (
          <p className="vazio">Selecione uma categoria à esquerda</p>
        )}
      </section>
    </div>
  );
}

export default PostOperativeDashboard;