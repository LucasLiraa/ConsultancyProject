import React from "react";

function PostOperativeStatus({ pacientes }) {
  const calcularStatus = (paciente) => {
    const semanas = paciente.semanas?.length || 0;
    if (semanas <= 2) return "início";
    if (semanas <= 4) return "meio";
    return "final";
  };

  const contarPorStatus = (status) =>
    pacientes.filter((p) => calcularStatus(p) === status).length;

  return (
    <div className="postOperativeStatus">
      <div className="postOperativeStatusCard">
        <h3>Pacientes no início do pós-operatório</h3>
        <div className="separator">|</div>
        <h1>{contarPorStatus("início")}</h1>
      </div>
      <div className="postOperativeStatusCard">
        <h3>Pacientes na metade do pós-operatório</h3>
        <div className="separator">|</div>
        <h1>{contarPorStatus("meio")}</h1>
      </div>
      <div className="postOperativeStatusCard">
        <h3>Pacientes no final do pós-operatório</h3>
        <div className="separator">|</div>
        <h1>{contarPorStatus("final")}</h1>
      </div>
    </div>
  );
}

export default PostOperativeStatus;