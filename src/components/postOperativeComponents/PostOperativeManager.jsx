import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/postOperativeStyles/postOperativeManager.css";

function PostOperativeManager({ paciente, onVoltar }) {
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);

  // Estado com informações iniciais do paciente
  const [formData, setFormData] = useState({
    id: paciente?.id || null,
    nome: paciente?.nome || "",
    cirurgia: paciente?.cirurgia || "",
    cirurgiao: "Dr. Paulo Vasconcelos",
    auxiliar: "",
    instrumentadoras: [""],
    tecnologia: "",
    data_cirurgia: "",
    dias_atestado: 0,
    anestesia: "",
  });

  // Lista de retornos semanais
  const [retornos, setRetornos] = useState([]);

  useEffect(() => {
    if (paciente?.id) {
      fetchRetornos(paciente.id);
    }
  }, [paciente]);

  const fetchRetornos = async (pacienteId) => {
    const { data, error } = await supabase
      .from("pacientes_pos")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("semana", { ascending: true });

    if (!error && data) {
      setRetornos(data);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInstrumentadoraChange = (index, value) => {
    const updated = [...formData.instrumentadoras];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, instrumentadoras: updated }));
  };

  const addInstrumentadora = () => {
    setFormData((prev) => ({
      ...prev,
      instrumentadoras: [...prev.instrumentadoras, ""],
    }));
  };

  const salvarPaciente = async () => {
    setLoading(true);
    try {
      if (formData.id) {
        // Update
        const { error } = await supabase
          .from("pacientes_pos")
          .update({
            cirurgia: formData.cirurgia,
            cirurgiao: formData.cirurgiao,
            auxiliar: formData.auxiliar,
            instrumentadora: formData.instrumentadoras,
            tecnologia: formData.tecnologia,
            data_cirurgia: formData.data_cirurgia,
            dias_atestado: formData.dias_atestado,
            anestesia: formData.anestesia,
          })
          .eq("id", formData.id);

        if (error) throw error;
      } else {
        // Insert
        const { data, error } = await supabase
          .from("pacientes_pos")
          .insert([formData])
          .select();

        if (error) throw error;
        setFormData((prev) => ({ ...prev, id: data[0].id }));
      }
      alert("Paciente salvo com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar paciente:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarRetorno = async () => {
    if (!formData.id) {
      alert("Salve as informações iniciais primeiro.");
      return;
    }
    const semana = retornos.length + 1;
    const { data, error } = await supabase
      .from("pos_operatorio")
      .insert([
        {
          paciente_id: formData.id,
          semana,
          observacoes: "",
        },
      ])
      .select();

    if (!error && data) {
      setRetornos((prev) => [...prev, data[0]]);
    }
  };

  const salvarRetorno = async (index, value) => {
    const retorno = retornos[index];
    const { error } = await supabase
      .from("pos_operatorio")
      .update({ observacoes: value })
      .eq("id", retorno.id);

    if (!error) {
      const updated = [...retornos];
      updated[index].observacoes = value;
      setRetornos(updated);
    }
  };

  const darAlta = async () => {
    if (retornos.length < 6) {
      alert("Só é possível dar alta após 6 semanas.");
      return;
    }
    const { error } = await supabase
      .from("pacientes_pos")
      .update({ alta: true })
      .eq("id", formData.id);

    if (!error) {
      alert("Paciente recebeu alta!");
      onVoltar();
    }
  };

  return (
    <div className="postManagerOverlay">
      <div className="postManagerContainer">
        <div className="postManagerHeader">
          <h2>{formData.nome}</h2>
          <button onClick={onVoltar}>Voltar</button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={activeTab === "info" ? "active" : ""}
            onClick={() => setActiveTab("info")}
          >
            Informações iniciais
          </button>
          <button
            className={activeTab === "retornos" ? "active" : ""}
            onClick={() => setActiveTab("retornos")}
          >
            Retornos semanais
          </button>
        </div>

        {/* Tab Content */}
        <div className="tabContent">
          {activeTab === "info" && (
            <div className="infoTab">
              <label>Nome</label>
              <input type="text" value={formData.nome} disabled />

              <label>Cirurgia realizada</label>
              <input
                type="text"
                value={formData.cirurgia}
                onChange={(e) => handleChange("cirurgia", e.target.value)}
              />

              <label>Cirurgião</label>
              <input type="text" value={formData.cirurgiao} disabled />

              <label>Auxiliar</label>
              <input
                type="text"
                value={formData.auxiliar}
                onChange={(e) => handleChange("auxiliar", e.target.value)}
              />

              <label>Instrumentadoras</label>
              {formData.instrumentadoras.map((inst, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={inst}
                  onChange={(e) =>
                    handleInstrumentadoraChange(idx, e.target.value)
                  }
                />
              ))}
              <button onClick={addInstrumentadora}>+ Adicionar</button>

              <label>Tecnologia utilizada</label>
              <select
                value={formData.tecnologia}
                onChange={(e) => handleChange("tecnologia", e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Tecnologia A">Tecnologia A</option>
                <option value="Tecnologia B">Tecnologia B</option>
                <option value="Tecnologia C">Tecnologia C</option>
              </select>

              <label>Data da cirurgia</label>
              <input
                type="date"
                value={formData.data_cirurgia}
                onChange={(e) => handleChange("data_cirurgia", e.target.value)}
              />

              <label>Dias de atestado</label>
              <input
                type="number"
                value={formData.dias_atestado}
                onChange={(e) => handleChange("dias_atestado", e.target.value)}
              />

              <label>Anestesia</label>
              <select
                value={formData.anestesia}
                onChange={(e) => handleChange("anestesia", e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Peridural">Peridural</option>
                <option value="Geral">Geral</option>
                <option value="Geral com intubação">Geral com intubação</option>
                <option value="Sedação">Sedação</option>
                <option value="Bloqueio">Bloqueio</option>
                <option value="Local">Local</option>
              </select>

              <button className="primary" onClick={salvarPaciente} disabled={loading}>
                {loading ? "Salvando..." : "Salvar informações"}
              </button>
            </div>
          )}

          {activeTab === "retornos" && (
            <div className="retornosTab">
              <h3>Retornos semanais</h3>
              {retornos.map((r, idx) => (
                <div key={r.id} className="retornoCard">
                  <h4>Semana {r.semana}</h4>
                  <textarea
                    value={r.observacoes || ""}
                    onChange={(e) => salvarRetorno(idx, e.target.value)}
                  />
                </div>
              ))}
              <button onClick={adicionarRetorno}>+ Adicionar retorno</button>
              {retornos.length >= 6 && (
                <button className="danger" onClick={darAlta}>
                  Dar alta
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostOperativeManager;