import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/patientsStyles/PatientFinancePanel.css";
import FinanceEntryModal from "./situationForms/FinanceEntryModal";

const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(n || 0)
  );

function formatDateBR(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export default function PatientFinancePanel({ pacienteId, pacienteNome }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // menu 3 pontinhos
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

  const fetchRows = async () => {
    if (!pacienteId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("registros_financeiros")
      .select("*")
      .eq("paciente_id", pacienteId)
      .eq("tipo", "Entrada")
      .order("data_pagamento", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar financeiro do paciente:", error.message);
      setRows([]);
    } else {
      setRows(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  // fecha menu ao clicar fora
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      setMenuOpenId(null);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const resumo = useMemo(() => {
    const total = rows.reduce((acc, r) => acc + Number(r.valor_recebido || 0), 0);
    const ultimo = rows[0]?.data_pagamento ? formatDateBR(rows[0].data_pagamento) : "—";
    return { total, ultimo, qtd: rows.length };
  }, [rows]);

  const onAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
    setMenuOpenId(null);
  };

  const onDelete = async (row) => {
    setMenuOpenId(null);
    const ok = window.confirm("Deseja excluir este registro financeiro?");
    if (!ok) return;

    const { error } = await supabase
      .from("registros_financeiros")
      .delete()
      .eq("id", row.id);

    if (error) {
      console.error("Erro ao excluir registro financeiro:", error.message);
      return;
    }
    fetchRows();
  };

  return (
    <div className="pfPanel">
      {/* topo do painel escuro */}
      <div className="pfHeader">
        <div className="pfHeaderLeft">
          <h3>Financeiro</h3>
          <p className="pfSub">
            {resumo.qtd} registro(s) • Último: {resumo.ultimo} • Total: {fmtBRL(resumo.total)}
          </p>
        </div>

        <button className="pfAddBtn" type="button" onClick={onAdd}>
          Adicionar registro
        </button>
      </div>

      {/* lista */}
      <div className="pfList">
        {loading ? (
          <div className="pfEmpty">Carregando...</div>
        ) : rows.length === 0 ? (
          <div className="pfEmpty">Nenhum registro encontrado.</div>
        ) : (
          rows.map((r, idx) => {
            const title =
              r.descricao ||
              r.procedimento ||
              (r.subtipo ? `Pagamento • ${r.subtipo}` : "Pagamento");

            const status = r.status_pagamento || "—";
            const valor = Number(r.valor_recebido || 0);

            return (
              <div key={r.id} className="pfCard">
                {/* “linha” lateral tipo timeline */}
                <div className="pfRail">
                  <div className="pfDot" />
                  {idx !== rows.length - 1 ? <div className="pfLine" /> : <div className="pfLine ghost" />}
                </div>

                <div className="pfCardBody">
                  <div className="pfCardTop">
                    <div className="pfTitleWrap">
                      <div className="pfTitle">{title}</div>
                      <div className="pfMeta">
                        <span>{formatDateBR(r.data_pagamento)}</span>
                        {r.forma_pagamento ? (
                          <>
                            <span className="sep">•</span>
                            <span>{r.forma_pagamento}</span>
                          </>
                        ) : null}
                        {r.categoria ? (
                          <>
                            <span className="sep">•</span>
                            <span>{r.categoria}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="pfRight">
                      <div className="pfValue">{fmtBRL(valor)}</div>
                      <span className={`pfBadge ${String(status).toLowerCase()}`}>
                        {status}
                      </span>

                      {/* menu 3 pontinhos */}
                      <div className="pfMenuWrap" ref={menuOpenId === r.id ? menuRef : null}>
                        <button
                          type="button"
                          className="pfKebab"
                          onClick={() => setMenuOpenId((cur) => (cur === r.id ? null : r.id))}
                          aria-label="Opções"
                        >
                          ⋯
                        </button>

                        {menuOpenId === r.id && (
                          <div className="pfMenu">
                            <button type="button" onClick={() => onEdit(r)}>
                              Editar
                            </button>
                            <button type="button" className="danger" onClick={() => onDelete(r)}>
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {r.observacoes ? <div className="pfObs">{r.observacoes}</div> : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {modalOpen && (
        <FinanceEntryModal
          pacienteId={pacienteId}
          pacienteNome={pacienteNome}
          record={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchRows();
          }}
        />
      )}
    </div>
  );
}