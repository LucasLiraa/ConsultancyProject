import React from "react";

function PostOperativeList({ pacientes = [], onSelecionar }) {
  return (
    <div className="postOperativeList">
      {pacientes.length === 0 && <p>Nenhum paciente encontrado.</p>}

      {pacientes.map((paciente) => (
        <div className="postOperativeListCard" key={paciente.cpf || paciente.id}>
          <div className="postOperativeListCardEsq">
            <div className="postOperativeListCardPhoto">
              <img
                src={
                  paciente.foto ||
                  "https://cdn-icons-png.flaticon.com/512/9706/9706583.png"
                }
                alt="foto paciente"
              />
            </div>
            <div className="postOperativeListCardInfos">
              <h4>{paciente.nome || "Nome não informado"}</h4>
              <p>
                <span>Cirurgias realizadas:</span>{" "}
                {Array.isArray(paciente.cirurgia)
                  ? paciente.cirurgia.join(", ")
                  : paciente.cirurgia || "Não informado"}
              </p>
              <p>
                <span>Data da cirurgia:</span>{" "}
                {paciente.dataCirurgia || "Não informado"} |{" "}
                <span>Último pós:</span>{" "}
                {paciente.semanas?.length
                  ? `Semana ${paciente.semanas.length}`
                  : "Nenhuma semana registrada"}
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