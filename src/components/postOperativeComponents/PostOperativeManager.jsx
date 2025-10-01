import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/postOperativeStyles/postOperativeManager.css";

function PostOperativeManager({ paciente, onVoltar }) {
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [loadingRetornos, setLoadingRetornos] = useState(false);

  const [formData, setFormData] = useState({
    paciente_id: paciente?.id || null,
    pos_id: null,
    nome: paciente?.nome || "",
    cirurgia: paciente?.cirurgia || "",
    cirurgiao: "Dr. Paulo Vasconcelos",
    auxiliar: "",
    instrumentadoras: [""],
    tecnologia: "",
    data_cirurgia: "",
    data_pos: "",
    dias_atestado: "",
    anestesia: "",
  });

  const [retornos, setRetornos] = useState([]);
  const [semanaAtual, setSemanaAtual] = useState(1);

  // Atualiza formData ao mudar paciente, mas mantém pos_id se já existir para não perder dados carregados
  useEffect(() => {
    if (!paciente) return;

    setFormData((prev) => {
      if (prev.pos_id) return prev; // mantém dados carregados

      return {
        paciente_id: paciente.id,
        pos_id: null,
        nome: paciente.nome || "",
        cirurgia: paciente.cirurgia || "",
        cirurgiao: "Dr. Paulo Vasconcelos",
        auxiliar: "",
        instrumentadoras: [""],
        tecnologia: "",
        data_cirurgia: "",
        data_pos: "",
        dias_atestado: "",
        anestesia: "",
      };
    });

    setRetornos([]);
    setSemanaAtual(1);
    setActiveTab("info");
  }, [paciente]);

  // Busca o registro pacientes_pos para o paciente e atualiza formData
  useEffect(() => {
    const fetchPacientePos = async () => {
      if (!paciente?.id) return;

      try {
        const { data, error } = await supabase
          .from("pacientes_pos")
          .select("*")
          .eq("paciente_id", paciente.id)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar pacientes_pos:", error);
          return;
        }

        if (data) {
          setFormData((prev) => ({
            ...prev,
            pos_id: data.id,
            nome: paciente.nome || "",
            cirurgia: paciente.cirurgia || "",
            cirurgiao: data.cirurgiao || "Dr. Paulo Vasconcelos",
            auxiliar: data.auxiliar || "",
            instrumentadoras: data.instrumentadoras || [""],
            tecnologia: data.tecnologia || "",
            data_cirurgia: data.data_cirurgia || "",
            data_pos: data.data_pos || "",
            dias_atestado: data.dias_atestado || "",
            anestesia: data.anestesia || "",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            pos_id: null,
            nome: paciente.nome || "",
            cirurgia: paciente.cirurgia || "",
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar pacientes_pos:", err);
      }
    };

    fetchPacientePos();
  }, [paciente]);

  // Busca as semanas (retornos) sempre que pos_id mudar
  useEffect(() => {
    if (!formData.pos_id) {
      setRetornos([]);
      setSemanaAtual(1);
      return;
    }

    const fetchRetornos = async () => {
      setLoadingRetornos(true);
      try {
        const { data, error } = await supabase
          .from("pos_operatorio")
          .select("*")
          .eq("paciente_pos_id", formData.pos_id)
          .order("semana", { ascending: true });

        if (error) throw error;

        setRetornos(data || []);

        if (data && data.length > 0) {
          setSemanaAtual(data[data.length - 1].semana); // última semana
        } else {
          setSemanaAtual(1);
        }
      } catch (err) {
        console.error("Erro ao buscar retornos:", err);
      } finally {
        setLoadingRetornos(false);
      }
    };

    fetchRetornos();
  }, [formData.pos_id]);

  // Função para salvar informações iniciais (pacientes_pos)
  const salvarPaciente = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      if (formData.pos_id) {
        // Atualiza registro existente
        const { error } = await supabase
          .from("pacientes_pos")
          .update({
            cirurgia: formData.cirurgia,
            cirurgiao: formData.cirurgiao,
            auxiliar: formData.auxiliar,
            instrumentadoras: formData.instrumentadoras,
            tecnologia: formData.tecnologia,
            data_cirurgia: formData.data_cirurgia,
            data_pos: formData.data_pos || today,
            dias_atestado: formData.dias_atestado,
            anestesia: formData.anestesia,
          })
          .eq("id", formData.pos_id);

        if (error) throw error;

        // Recarrega semanas
        const { data, error: errRetornos } = await supabase
          .from("pos_operatorio")
          .select("*")
          .eq("paciente_pos_id", formData.pos_id)
          .order("semana", { ascending: true });

        if (errRetornos) throw errRetornos;

        setRetornos(data || []);
        if (data && data.length > 0) setSemanaAtual(data[data.length - 1].semana);
        setActiveTab("retornos");
      } else {
        // Insere novo registro pacientes_pos
        const payload = {
          paciente_id: formData.paciente_id,
          nome: formData.nome,
          cirurgia: formData.cirurgia,
          cirurgiao: formData.cirurgiao,
          auxiliar: formData.auxiliar,
          instrumentadoras: formData.instrumentadoras,
          tecnologia: formData.tecnologia,
          data_cirurgia: formData.data_cirurgia,
          data_pos: formData.data_pos || today,
          dias_atestado: formData.dias_atestado,
          anestesia: formData.anestesia,
        };

        const { data, error } = await supabase
          .from("pacientes_pos")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        const pacientePosId = data.id;

        // Cria semana 1 no pos_operatorio
        const { data: weekData, error: errWeek } = await supabase
          .from("pos_operatorio")
          .insert([
            {
              paciente_pos_id: pacientePosId,
              semana: 1,
              data_retorno: today,
            },
          ])
          .select()
          .single();

        if (errWeek) throw errWeek;

        setFormData((prev) => ({ ...prev, pos_id: pacientePosId }));
        setRetornos([weekData]);
        setSemanaAtual(1);
        setActiveTab("retornos");
      }

      alert("Informações salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar paciente:", err);
      alert("Erro ao salvar paciente. Veja console.");
    } finally {
      setLoading(false);
    }
  };

  // Cria próxima semana
  const criarProximaSemana = async () => {
    if (!formData.pos_id) return alert("Salve o paciente primeiro.");

    const proximaSemana = retornos.length === 0 ? 1 : retornos[retornos.length - 1].semana + 1;
    try {
      const { data, error } = await supabase
        .from("pos_operatorio")
        .insert([
          {
            paciente_pos_id: formData.pos_id,
            semana: proximaSemana,
            data_retorno: new Date().toISOString().split("T")[0],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setRetornos((prev) => [...prev, data].sort((a, b) => a.semana - b.semana));
      setSemanaAtual(proximaSemana);
    } catch (err) {
      console.error("Erro ao criar próxima semana:", err);
      alert("Erro ao criar próxima semana. Veja console.");
    }
  };

  // Salvar campo da semana (atualiza no banco e no estado local)
  const salvarCampoSemana = async (campo, valor) => {
    const retorno = retornos.find((r) => r.semana === semanaAtual);
    if (!retorno) return;

    const prevRetornos = [...retornos];
    const idx = retornos.findIndex((r) => r.id === retorno.id);

    const updated = [...retornos];
    updated[idx] = { ...updated[idx], [campo]: valor };
    setRetornos(updated);

    try {
      const { error } = await supabase
        .from("pos_operatorio")
        .update({ [campo]: valor })
        .eq("id", retorno.id);

      if (error) {
        setRetornos(prevRetornos);
        throw error;
      }
    } catch (err) {
      console.error("Erro ao salvar campo da semana:", err);
      alert("Erro ao salvar. Veja console.");
    }
  };

  // Salvar semana (recarrega dados para garantir sincronia)
  const salvarSemana = async () => {
    if (!formData.pos_id) return alert("Salve o paciente antes.");
    try {
      const { data, error } = await supabase
        .from("pos_operatorio")
        .select("*")
        .eq("paciente_pos_id", formData.pos_id)
        .order("semana", { ascending: true });

      if (error) throw error;

      setRetornos(data || []);
      if (data && data.length > 0) setSemanaAtual(data[data.length - 1].semana);
      alert(`Semana ${semanaAtual} salva.`);
    } catch (err) {
      console.error("Erro ao salvar semana:", err);
      alert("Erro ao salvar semana. Veja console.");
    }
  };

  // Dar alta após 6 semanas
  const darAlta = async () => {
    if (retornos.length < 6) {
      alert("Só é possível dar alta após 6 semanas.");
      return;
    }
    try {
      const { error } = await supabase
        .from("pacientes_pos")
        .update({ alta: true })
        .eq("id", formData.pos_id);
      if (error) throw error;
      alert("Paciente recebeu alta!");
      onVoltar();
    } catch (err) {
      console.error("Erro ao dar alta:", err);
    }
  };

  // Função para atualizar formData simples
  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Semana atual para renderizar
  const retornoAtual = retornos.find((r) => r.semana === semanaAtual) || null;

  // Checklist fixo
  const checklistFields = [
    { key: "edema", label: "Edema" },
    { key: "fibrose", label: "Fibrose" },
    { key: "seroma", label: "Seroma" },
    { key: "cicatrizacao", label: "Cicatrização" },
    { key: "drenagem", label: "Drenagem" },
    { key: "fita_silicone", label: "Fita de silicone" },
    { key: "oleo_rosa_mosqueta", label: "Óleo de rosa mosqueta" },
  ];

    return (
    <div className="postManagerOverlay">
      <div className="postManagerContainer">
        <div className="postManagerHeader">
          <h2>{formData.nome}</h2>
          <button onClick={onVoltar}>Voltar</button>
        </div>

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
            disabled={!formData.pos_id}
          >
            Retornos semanais
          </button>
        </div>

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
              <input
                type="text"
                value={formData.cirurgiao}
                onChange={(e) => handleChange("cirurgiao", e.target.value)}
              />

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
                    setFormData((prev) => {
                      const updated = [...prev.instrumentadoras];
                      updated[idx] = e.target.value;
                      return { ...prev, instrumentadoras: updated };
                    })
                  }
                />
              ))}
              <button
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    instrumentadoras: [...prev.instrumentadoras, ""],
                  }))
                }
              >
                + Adicionar
              </button>

              <label>Tecnologia utilizada</label>
              <select
                value={formData.tecnologia}
                onChange={(e) => handleChange("tecnologia", e.target.value)}
              >
                <option value="">Selecione.</option>
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

              <label>Data do Pós-Operatório</label>
              <input
                type="date"
                value={formData.data_pos}
                onChange={(e) => handleChange("data_pos", e.target.value)}
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
                <option value="">Selecione.</option>
                <option value="Peridural">Peridural</option>
                <option value="Geral">Geral</option>
                <option value="Geral com intubação">Geral com intubação</option>
                <option value="Sedação">Sedação</option>
                <option value="Bloqueio">Bloqueio</option>
                <option value="Local">Local</option>
              </select>

              <button
                className="primary"
                onClick={salvarPaciente}
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar informações"}
              </button>
            </div>
          )}

          {activeTab === "retornos" && (
            <div className="retornosTab">
              <h3>Retornos semanais</h3>

              {loadingRetornos ? (
                <p>Carregando dados...</p>
              ) : retornos.length === 0 ? (
                <div className="retornoEmpty">
                  <p>Nenhum retorno criado ainda.</p>
                  <button className="primary" onClick={criarProximaSemana}>
                    🚀 Iniciar Pós-operatório
                  </button>
                </div>
              ) : (
                <>
                  <div className="semanaNav">
                    <button
                      onClick={() => setSemanaAtual((prev) => Math.max(prev - 1, 1))}
                      disabled={semanaAtual <= 1}
                    >
                      ◀ Semana {semanaAtual - 1}
                    </button>

                    <span className="semanaAtualLabel">Semana {semanaAtual}</span>

                    <button
                      onClick={() =>
                        setSemanaAtual((prev) =>
                          retornos.find((r) => r.semana === prev + 1) ? prev + 1 : prev
                        )
                      }
                      disabled={!retornos.find((r) => r.semana === semanaAtual + 1)}
                    >
                      Semana {semanaAtual + 1} ▶
                    </button>
                  </div>

                  {retornoAtual ? (
                    <div className="retornoCard">
                      <h4>Semana {semanaAtual}</h4>

                      <label>Data do retorno</label>
                      <input
                        type="date"
                        value={retornoAtual.data_retorno || ""}
                        onChange={(e) =>
                          salvarCampoSemana("data_retorno", e.target.value)
                        }
                      />

                      <div className="checklistContainer">
                        <h5>Checklist</h5>
                        {checklistFields.map(({ key, label }) => (
                          <label key={key}>
                            <input
                              type="checkbox"
                              checked={!!retornoAtual[key]}
                              onChange={(e) =>
                                salvarCampoSemana(key, e.target.checked)
                              }
                            />
                            {label}
                          </label>
                        ))}
                      </div>

                                            <label>Curativos informados</label>
                      <textarea
                        value={retornoAtual.curativos || ""}
                        onChange={(e) =>
                          salvarCampoSemana("curativos", e.target.value)
                        }
                      />

                      <label>
                        <input
                          type="checkbox"
                          checked={!!retornoAtual.atestado}
                          onChange={(e) =>
                            salvarCampoSemana("atestado", e.target.checked)
                          }
                        />
                        Atestado
                      </label>

                      <label>Liberada para dirigir</label>
                      <input
                        type="text"
                        value={retornoAtual.liberada_dirigir || ""}
                        onChange={(e) =>
                          salvarCampoSemana("liberada_dirigir", e.target.value)
                        }
                      />

                      <label>
                        <input
                          type="checkbox"
                          checked={!!retornoAtual.foto_tirada}
                          onChange={(e) =>
                            salvarCampoSemana("foto_tirada", e.target.checked)
                          }
                        />
                        Fotos tiradas?
                      </label>

                      <label>Outras observações</label>
                      <textarea
                        value={retornoAtual.outras_observacoes || ""}
                        onChange={(e) =>
                          salvarCampoSemana("outras_observacoes", e.target.value)
                        }
                      />

                      <button className="primary" onClick={salvarSemana}>
                        💾 Salvar Semana {semanaAtual}
                      </button>

                      {semanaAtual === retornos.length && (
                        <button
                          className="primary"
                          onClick={criarProximaSemana}
                          style={{ marginTop: "1rem" }}
                        >
                          ➕ Iniciar próxima semana
                        </button>
                      )}

                      {retornos.length >= 6 && (
                        <button
                          className="danger"
                          onClick={darAlta}
                          style={{ marginTop: "1rem" }}
                        >
                          ✅ Dar alta
                        </button>
                      )}
                    </div>
                  ) : (
                    <p>Semana não encontrada.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostOperativeManager;