<<<<<<< HEAD
import React, { useState } from "react";
import "../styles/postOperativeStyles/postOperativeDashboard.css";

function PostOperativeDashboard({ pacientes, onSelecionar }) {
  const [ativo, setAtivo] = useState(null);

  // calcula quantas semanas se passaram desde a data da cirurgia
  const calcularSemanas = (paciente) => {
    if (!paciente?.data_cirurgia) return 0;

    const cirurgiaDate = new Date(paciente.data_cirurgia);
    if (Number.isNaN(cirurgiaDate.getTime())) return 0;

    const hoje = new Date();
    const diffMs = hoje.getTime() - cirurgiaDate.getTime();
    const diffDias = diffMs / (1000 * 60 * 60 * 24);
    const semanas = Math.floor(diffDias / 7) + 1; // começa na semana 1

    return semanas < 0 ? 0 : semanas;
  };

  const calcularStatus = (paciente) => {
    const semanas = calcularSemanas(paciente);

    // 1ª e 2ª semana
    if (semanas <= 2) return "inicio";
    // 3ª e 4ª semana
    if (semanas <= 4) return "meio";
    // 5ª em diante
    return "final";
  };

  // se você quiser esconder pós já finalizados:
  const pacientesAtivos = pacientes.filter(
    (p) => p.status !== "finalizado" // considera a coluna status que você criou
  );

  const inicio = pacientesAtivos.filter(
    (p) => calcularStatus(p) === "inicio"
  );
  const meio = pacientesAtivos.filter((p) => calcularStatus(p) === "meio");
  const final = pacientesAtivos.filter((p) => calcularStatus(p) === "final");

  const sections = [
    { id: "inicio", titulo: "Iniciando", cor: "#F780FF", pacientes: inicio },
    { id: "meio", titulo: "Continuando", cor: "#9b59b6", pacientes: meio },
    { id: "final", titulo: "Finalizando", cor: "#4e6cf0", pacientes: final },
    { id: "todos", titulo: "Total", cor: "#4ef07a", pacientes: pacientesAtivos },
  ];

  const secAtiva = sections.find((s) => s.id === ativo);

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
            <h2>{secAtiva?.titulo}</h2>
            <div className="pacienteList">
              {secAtiva?.pacientes.map((p) => {
                const semanas = calcularSemanas(p);
                return (
                  <div
                    key={p.id}
                    className="pacienteItem"
                    onClick={() => onSelecionar(p)}
                  >
                    <span className="nome">{p.nome}</span>
                    <span className="info">
                      {p.cirurgia || p.procedimento || "Procedimento"} — Semana{" "}
                      {semanas}
                    </span>
                  </div>
                );
              })}
              {secAtiva?.pacientes.length === 0 && (
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

=======
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

>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
export default PostOperativeDashboard;