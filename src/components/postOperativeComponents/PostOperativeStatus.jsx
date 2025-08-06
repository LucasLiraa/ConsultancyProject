import React, { useEffect, useState } from "react";

const PostOperativeStatus = () => {
  const [inicio, setInicio] = useState(0);
  const [meio, setMeio] = useState(0);
  const [fim, setFim] = useState(0);

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("pacientesPos") || "[]");

    let inicioCount = 0;
    let meioCount = 0;
    let fimCount = 0;

    dados.forEach((paciente) => {
      const semanaAtual = paciente.semanas.length;
      if (semanaAtual <= 2) inicioCount++;
      else if (semanaAtual <= 4) meioCount++;
      else fimCount++;
    });

    setInicio(inicioCount);
    setMeio(meioCount);
    setFim(fimCount);
  }, []);

  return (
    <div className="postOperativeStatus">
      <div className="postOperativeStatusCard">
        <h3>Pacientes no início do pós-operatório</h3>
        <div className="separator">|</div>
        <h1>{inicio}</h1>
      </div>
      <div className="postOperativeStatusCard">
        <h3>Pacientes na metade do pós-operatório</h3>
        <div className="separator">|</div>
        <h1>{meio}</h1>
      </div>
      <div className="postOperativeStatusCard">
        <h3>Pacientes no final do pós-operatório</h3>
        <div className="separator">|</div>
        <h1>{fim}</h1>
      </div>
    </div>
  );
};

export default PostOperativeStatus;