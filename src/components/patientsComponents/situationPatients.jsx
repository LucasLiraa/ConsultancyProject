<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from "react";
import "../styles/patientsStyles/situationPatients.css";
import { supabase } from "../../utils/supabaseClient";
import FinanceFormFull from "./situationForms/FinanceFormFull";
import FinanceFormResumo from "./situationForms/FinanceFormResumo";

const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(n || 0)
  );
const fmtDateBR = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
};

const SituationPatients = ({ pacienteId }) => {
  const [activeTab, setActiveTab] = useState("geral");
  const [showForm, setShowForm] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formKind, setFormKind] = useState(null); // "full" | "resumo"
  const [formMode, setFormMode] = useState("create"); // "create" | "view" | "edit"
  const [currentRecord, setCurrentRecord] = useState(null);

  const fetchRegistros = async () => {
    if (!pacienteId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("registros_pacientes")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("created_at", { ascending: true });
    if (!error) setRegistros(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  const financeiros = useMemo(
    () => registros.filter((r) => r.tipo === "financeiro"),
    [registros]
  );
  const initialFinance = useMemo(
    () => (financeiros.length > 0 ? financeiros[0] : null),
    [financeiros]
  );
  const hasFinance = financeiros.length > 0;

  const handleAddRecordClick = () => {
    setCurrentRecord(null);
    setFormMode("create");
    setFormKind(hasFinance ? "resumo" : "full");
    setShowForm(true);
  };

  const openForRecord = (record, mode) => {
    setCurrentRecord(record);
    setFormMode(mode);
    if (record.tipo === "financeiro") {
      setFormKind(initialFinance && record.id === initialFinance.id ? "full" : "resumo");
    } else {
      setFormKind("resumo");
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormMode("create");
    setFormKind(null);
    setCurrentRecord(null);
  };

  const handleDelete = async (record) => {
    if (!window.confirm("Deseja realmente excluir este registro?")) return;
    const { error } = await supabase
      .from("registros_pacientes")
      .delete()
      .eq("id", record.id)
      .eq("paciente_id", pacienteId);
    if (!error) setRegistros((prev) => prev.filter((r) => r.id !== record.id));
  };

  const filteredRecords =
    activeTab === "geral"
      ? registros
      : registros.filter((r) => r.tipo === activeTab);

  const handleSaved = async () => {
    await fetchRegistros();
    handleCloseForm();
  };

  return (
    <div className="patientSituation">
      <div className="containerSituationOptions">
        <button
          className={activeTab === "geral" ? "selected" : ""}
          onClick={() => setActiveTab("geral")}
        >
          Geral
        </button>
        <button
          className={activeTab === "financeiro" ? "selected" : ""}
          onClick={() => setActiveTab("financeiro")}
        >
          Financeiro
        </button>
        <button
          className={activeTab === "cirurgico" ? "selected" : ""}
          onClick={() => setActiveTab("cirurgico")}
        >
          Cirúrgico
        </button>
      </div>

      <div className="containerSituation">
        <div className="contentSituation">
          <div className="contentSituationRegisters listWrapper">
            {loading ? (
              <p>Carregando registros...</p>
            ) : filteredRecords.length === 0 ? (
              <p>Nenhum registro encontrado.</p>
            ) : (
              filteredRecords.map((r) => (
                <div key={r.id} className="recordItem">
                  <div className="recordHeader">
                    <div className="recordHeaderLeft">
                      <h3>{r.tipo?.toUpperCase()}</h3>
                      <p>{r.descricao_pagamento || r.observacoes || "—"}</p>

                      <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>
                        {typeof r.valor_contrato === "number" && (
                          <div>Contrato: {fmtBRL(r.valor_contrato)}</div>
                        )}
                        {typeof r.valor_honorario === "number" && (
                          <div>Honorário: {fmtBRL(r.valor_honorario)}</div>
                        )}
                        {typeof r.valor_hospital === "number" && (
                          <div>
                            Hospital: {fmtBRL(r.valor_hospital)}{" "}
                            {r.responsavel_pagamento_hospital && (
                              <em>• {r.responsavel_pagamento_hospital}</em>
                            )}
                          </div>
                        )}
                        {typeof r.valor_anestesista === "number" && (
                          <div>
                            Anestesista: {fmtBRL(r.valor_anestesista)}{" "}
                            {r.responsavel_pagamento_anestesista && (
                              <em>• {r.responsavel_pagamento_anestesista}</em>
                            )}
                          </div>
                        )}
                        {r.outros_pagamentos_json && Array.isArray(r.outros_pagamentos_json) && r.outros_pagamentos_json.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            Outros:
                            <ul style={{ margin: "4px 0 0 16px" }}>
                              {r.outros_pagamentos_json.map((o, idx) => (
                                <li key={idx}>
                                  {o.titulo || "Outro"}: {fmtBRL(o.valor)}{" "}
                                  {o.responsavel && <em>• {o.responsavel}</em>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {typeof r.valor_pago_agora === "number" && r.valor_pago_agora > 0 && (
                          <div>Pago neste registro: {fmtBRL(r.valor_pago_agora)}</div>
                        )}
                        {typeof r.valor_recebido === "number" && (
                          <div>Recebido acumulado: {fmtBRL(r.valor_recebido)}</div>
                        )}
                        {typeof r.valor_a_receber === "number" && (
                          <div>A receber: {fmtBRL(r.valor_a_receber)}</div>
                        )}
                        {r.data_pagamento && <div>Data pagamento: {fmtDateBR(r.data_pagamento)}</div>}
                      </div>
                    </div>

                    <div>
                      <button onClick={() => openForRecord(r, "view")}>Visualizar</button>
                      <button onClick={() => openForRecord(r, "edit")} style={{ marginLeft: 8 }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(r)} style={{ marginLeft: 8 }}>
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="recordDetails">
                    <div>
                      {r.nota_fiscal_url && (
                        <>
                          <a href={r.nota_fiscal_url} target="_blank" rel="noreferrer">
                            Nota fiscal
                          </a>
                          <br />
                        </>
                      )}
                      {r.comprovante_url && (
                        <a href={r.comprovante_url} target="_blank" rel="noreferrer">
                          Comprovante
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="contentSituationButton" onClick={handleAddRecordClick}>
            Adicionar registro
          </button>

          {showForm && (
            <div className="containerSituationForm">
              <div className="contentSituationFormButtons" role="dialog" aria-modal="true">
                <div className="contentSituationForm">
                  {formKind === "full" ? (
                    <FinanceFormFull
                      pacienteId={pacienteId}
                      mode={formMode}
                      record={currentRecord}
                      onCancel={handleCloseForm}
                      onSaved={handleSaved}
                    />
                  ) : (
                    <FinanceFormResumo
                      pacienteId={pacienteId}
                      mode={formMode}
                      record={currentRecord}
                      initialFinance={initialFinance}
                      registros={registros}
                      onCancel={handleCloseForm}
                      onSaved={handleSaved}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

=======
import React, { useEffect, useMemo, useState } from "react";
import "../styles/patientsStyles/situationPatients.css";
import { supabase } from "../../utils/supabaseClient";
import FinanceFormFull from "./situationForms/FinanceFormFull";
import FinanceFormResumo from "./situationForms/FinanceFormResumo";

const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(n || 0)
  );
const fmtDateBR = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
};

const SituationPatients = ({ pacienteId }) => {
  const [activeTab, setActiveTab] = useState("geral");
  const [showForm, setShowForm] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formKind, setFormKind] = useState(null); // "full" | "resumo"
  const [formMode, setFormMode] = useState("create"); // "create" | "view" | "edit"
  const [currentRecord, setCurrentRecord] = useState(null);

  const fetchRegistros = async () => {
    if (!pacienteId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("registros_pacientes")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("created_at", { ascending: true });
    if (!error) setRegistros(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  const financeiros = useMemo(
    () => registros.filter((r) => r.tipo === "financeiro"),
    [registros]
  );
  const initialFinance = useMemo(
    () => (financeiros.length > 0 ? financeiros[0] : null),
    [financeiros]
  );
  const hasFinance = financeiros.length > 0;

  const handleAddRecordClick = () => {
    setCurrentRecord(null);
    setFormMode("create");
    setFormKind(hasFinance ? "resumo" : "full");
    setShowForm(true);
  };

  const openForRecord = (record, mode) => {
    setCurrentRecord(record);
    setFormMode(mode);
    if (record.tipo === "financeiro") {
      setFormKind(initialFinance && record.id === initialFinance.id ? "full" : "resumo");
    } else {
      setFormKind("resumo");
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormMode("create");
    setFormKind(null);
    setCurrentRecord(null);
  };

  const handleDelete = async (record) => {
    if (!window.confirm("Deseja realmente excluir este registro?")) return;
    const { error } = await supabase
      .from("registros_pacientes")
      .delete()
      .eq("id", record.id)
      .eq("paciente_id", pacienteId);
    if (!error) setRegistros((prev) => prev.filter((r) => r.id !== record.id));
  };

  const filteredRecords =
    activeTab === "geral"
      ? registros
      : registros.filter((r) => r.tipo === activeTab);

  const handleSaved = async () => {
    await fetchRegistros();
    handleCloseForm();
  };

  return (
    <div className="patientSituation">
      <div className="containerSituationOptions">
        <button
          className={activeTab === "geral" ? "selected" : ""}
          onClick={() => setActiveTab("geral")}
        >
          Geral
        </button>
        <button
          className={activeTab === "financeiro" ? "selected" : ""}
          onClick={() => setActiveTab("financeiro")}
        >
          Financeiro
        </button>
        <button
          className={activeTab === "cirurgico" ? "selected" : ""}
          onClick={() => setActiveTab("cirurgico")}
        >
          Cirúrgico
        </button>
      </div>

      <div className="containerSituation">
        <div className="contentSituation">
          <div className="contentSituationRegisters listWrapper">
            {loading ? (
              <p>Carregando registros...</p>
            ) : filteredRecords.length === 0 ? (
              <p>Nenhum registro encontrado.</p>
            ) : (
              filteredRecords.map((r) => (
                <div key={r.id} className="recordItem">
                  <div className="recordHeader">
                    <div className="recordHeaderLeft">
                      <h3>{r.tipo?.toUpperCase()}</h3>
                      <p>{r.descricao_pagamento || r.observacoes || "—"}</p>

                      <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>
                        {typeof r.valor_contrato === "number" && (
                          <div>Contrato: {fmtBRL(r.valor_contrato)}</div>
                        )}
                        {typeof r.valor_honorario === "number" && (
                          <div>Honorário: {fmtBRL(r.valor_honorario)}</div>
                        )}
                        {typeof r.valor_hospital === "number" && (
                          <div>
                            Hospital: {fmtBRL(r.valor_hospital)}{" "}
                            {r.responsavel_pagamento_hospital && (
                              <em>• {r.responsavel_pagamento_hospital}</em>
                            )}
                          </div>
                        )}
                        {typeof r.valor_anestesista === "number" && (
                          <div>
                            Anestesista: {fmtBRL(r.valor_anestesista)}{" "}
                            {r.responsavel_pagamento_anestesista && (
                              <em>• {r.responsavel_pagamento_anestesista}</em>
                            )}
                          </div>
                        )}
                        {r.outros_pagamentos_json && Array.isArray(r.outros_pagamentos_json) && r.outros_pagamentos_json.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            Outros:
                            <ul style={{ margin: "4px 0 0 16px" }}>
                              {r.outros_pagamentos_json.map((o, idx) => (
                                <li key={idx}>
                                  {o.titulo || "Outro"}: {fmtBRL(o.valor)}{" "}
                                  {o.responsavel && <em>• {o.responsavel}</em>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {typeof r.valor_pago_agora === "number" && r.valor_pago_agora > 0 && (
                          <div>Pago neste registro: {fmtBRL(r.valor_pago_agora)}</div>
                        )}
                        {typeof r.valor_recebido === "number" && (
                          <div>Recebido acumulado: {fmtBRL(r.valor_recebido)}</div>
                        )}
                        {typeof r.valor_a_receber === "number" && (
                          <div>A receber: {fmtBRL(r.valor_a_receber)}</div>
                        )}
                        {r.data_pagamento && <div>Data pagamento: {fmtDateBR(r.data_pagamento)}</div>}
                      </div>
                    </div>

                    <div>
                      <button onClick={() => openForRecord(r, "view")}>Visualizar</button>
                      <button onClick={() => openForRecord(r, "edit")} style={{ marginLeft: 8 }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(r)} style={{ marginLeft: 8 }}>
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="recordDetails">
                    <div>
                      {r.nota_fiscal_url && (
                        <>
                          <a href={r.nota_fiscal_url} target="_blank" rel="noreferrer">
                            Nota fiscal
                          </a>
                          <br />
                        </>
                      )}
                      {r.comprovante_url && (
                        <a href={r.comprovante_url} target="_blank" rel="noreferrer">
                          Comprovante
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="contentSituationButton" onClick={handleAddRecordClick}>
            Adicionar registro
          </button>

          {showForm && (
            <div className="containerSituationForm">
              <div className="contentSituationFormButtons" role="dialog" aria-modal="true">
                <div className="contentSituationForm">
                  {formKind === "full" ? (
                    <FinanceFormFull
                      pacienteId={pacienteId}
                      mode={formMode}
                      record={currentRecord}
                      onCancel={handleCloseForm}
                      onSaved={handleSaved}
                    />
                  ) : (
                    <FinanceFormResumo
                      pacienteId={pacienteId}
                      mode={formMode}
                      record={currentRecord}
                      initialFinance={initialFinance}
                      registros={registros}
                      onCancel={handleCloseForm}
                      onSaved={handleSaved}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
export default SituationPatients;