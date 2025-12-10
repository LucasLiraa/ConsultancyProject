import React from "react";
import "../styles/postOperativeStyles/SidebarProgresso.css";

function SidebarProgresso({
  etapaAtual,
  setEtapaAtual,
  semanas,
  onAdicionarSemana,
  onExcluirSemana
}) {
  return (
    <aside className="sidebarProgresso">
      <ul>
        <li
          className={etapaAtual === "informacoes" ? "ativo" : ""}
          onClick={() => setEtapaAtual("informacoes")}
        >
          Informações
        </li>

        {semanas.map((semana) => (
          <li
            key={semana.id}
            className={etapaAtual === `semana-${semana.id}` ? "ativo" : ""}
            onClick={() => setEtapaAtual(`semana-${semana.id}`)}
          >
            Semana {semana.id}
            {semanas.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExcluirSemana(semana.id);
                }}
                className="excluirBtn"
              >
                ×
              </button>
            )}
          </li>
        ))}

        <li className="novo" onClick={onAdicionarSemana}>
          + Iniciar nova semana
        </li>

        {semanas.length >= 6 && (
          <li className="alta">
            Dar alta ao paciente
          </li>
        )}
      </ul>
    </aside>
  );
}

export default SidebarProgresso;