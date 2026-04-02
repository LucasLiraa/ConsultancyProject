import React from "react";
import "../styles/postOperativeStyles/postOpSidebar.css";

/**
 * Sidebar com informações gerais (postOp) e lista de semanas.
 * Props:
 * - postOp: registro pacientes_pos
 * - weeks: array de semanas (pos_operatorio)
 * - onSelectWeek(weekObj)
 * - onNewWeek() -> criar próxima semana
 * - onAlta(boolean) -> marcar alta
 */
const PostOpSidebar = ({ postOp, weeks = [], onSelectWeek, onNewWeek, onAlta }) => {
  const lastWeek = weeks.length > 0 ? Number(weeks[weeks.length - 1].semana || "0") : 0;

  return (
    <aside className="sidebarBox">
      <div className="sidebarHeader">
        <h4>Informações</h4>
      </div>

      <div className="sidebarInfo">
        <div><strong>Nome:</strong> {postOp.nome}</div>
        <div><strong>Cirurgia:</strong> {postOp.cirurgia || "—"}</div>
        <div><strong>Cirurgião:</strong> {postOp.cirurgiao || "—"}</div>
        <div>
          <strong>Data:</strong>{" "}
          {postOp.data_cirurgia ? new Date(postOp.data_cirurgia).toLocaleDateString("pt-BR") : "—"}
        </div>
      </div>

      <div className="sidebarWeeks">
        <h5>Semanas</h5>
        <div className="weeksList">
          {weeks.length === 0 ? (
            <div className="muted">Nenhuma semana criada</div>
          ) : (
            weeks.map((w) => (
              <button key={w.id} className="weekBtn" onClick={() => onSelectWeek(w)}>
                Semana {w.semana}
              </button>
            ))
          )}
        </div>

        <div className="sidebarActions">
          <button className="btnPrimary full" onClick={onNewWeek}>+ Nova semana</button>
        </div>
      </div>

      <div className="sidebarFooter">
        {lastWeek >= 6 ? (
          <button
            className="btnDanger full"
            onClick={() => {
              if (window.confirm("Confirmar alta do paciente?")) {
                onAlta?.(true);
              }
            }}
          >
            Dar alta
          </button>
        ) : (
          <div className="muted">Alta disponível a partir da semana 6</div>
        )}
      </div>
    </aside>
  );
};

export default PostOpSidebar;