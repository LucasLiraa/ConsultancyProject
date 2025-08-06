import React from "react";

function PostOperativeList({ onSelecionar }) {
  const pacientes = JSON.parse(localStorage.getItem("pacientesPos") || "[]");

  return (
    <div className="postOperativeList">
      {pacientes.map((paciente) => (
        <div className="postOperativeListCard" key={paciente.id}>
          <div className="postOperativeListCardEsq">
            <div className="postOperativeListCardPhoto">
              <img
                src={
                  paciente.foto ||
                  "https://cdn-icons-png.flaticon.com/512/9706/9706583.png"
                }
                alt="Foto do paciente"
              />
            </div>
            <div className="postOperativeListCardInfos">
              <h4>{paciente.nome}</h4>
              <p>
                <span>Cirurgias realizadas:</span>{" "}
                {Array.isArray(paciente.cirurgia)
                  ? paciente.cirurgia.join(", ")
                  : paciente.cirurgia}
              </p>
              <p>
                <span>Data da cirurgia:</span> {paciente.dataCirurgia} |{" "}
                <span>Último pós:</span>{" "}
                Semana {paciente.semanas?.length || 0}
              </p>
            </div>
          </div>
          <div className="postOperativeListCardButton">
            <button onClick={() => onSelecionar(paciente)}>
              Continuar pós-operatório{" "}
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostOperativeList;