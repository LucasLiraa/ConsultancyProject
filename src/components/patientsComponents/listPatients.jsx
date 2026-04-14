import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { FiSearch, FiTrash2, FiFilter, FiEdit3 } from "react-icons/fi";
import AddPatientButton from "./AddPatientButton";
import "../styles/patientsStyles/listPatients.css";

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [filtros, setFiltros] = useState({
    busca: "",
    status: "",
    procedimento: "",
    sexo: "",
    dataInicio: "",
    dataFim: "",
    ordenarPor: "cadastro_desc",
    somenteComCirurgia: false,
    somenteAtivos: false,
    somenteComPendencia: false,
  });
  const [mostrarAvancados, setMostrarAvancados] = useState(false);
  const [confirmarRemocao, setConfirmarRemocao] = useState(null);
  const [editarPaciente, setEditarPaciente] = useState(null);
  const [novoStatus, setNovoStatus] = useState("");
  const [procedimentoTemp, setProcedimentoTemp] = useState("");
  const [procedimentoManual, setProcedimentoManual] = useState("");
  const [procedimentosSelecionados, setProcedimentosSelecionados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    buscarPacientes();
  }, []);

  const buscarPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const pacientesComFoto = (data || []).map((paciente) => {
        if (paciente.foto) {
          const { data: publicUrlData } = supabase.storage
            .from("pacientes_fotos")
            .getPublicUrl(paciente.foto);

          return {
            ...paciente,
            foto: publicUrlData.publicUrl,
          };
        }
        return paciente;
      });

      setPacientes(pacientesComFoto);
    } catch (err) {
      console.error("Erro ao buscar pacientes:", err.message);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      status: "",
      procedimento: "",
      sexo: "",
      dataInicio: "",
      dataFim: "",
      ordenarPor: "cadastro_desc",
      somenteComCirurgia: false,
      somenteAtivos: false,
      somenteComPendencia: false,
    });
  };

  const totalFiltrosAtivos = Object.entries(filtros).filter(([chave, valor]) => {
    if (chave === "ordenarPor") return valor !== "cadastro_desc";
    if (typeof valor === "boolean") return valor === true;
    return valor !== "";
  }).length;

  const pacientesFiltrados = [...pacientes]
    .filter((p) => {
      const termoBusca = filtros.busca.trim().toLowerCase();

      const nome = p.nome?.toLowerCase() || "";
      const telefone = p.telefone?.toLowerCase() || "";
      const cpf = p.cpf?.toLowerCase() || "";
      const situacao = p.situacao?.toLowerCase() || "";

      const procedimentosTexto = Array.isArray(p.cirurgia_nome)
        ? p.cirurgia_nome.join(", ").toLowerCase()
        : (p.cirurgia_nome || "").toLowerCase();

      const buscaOk =
        !termoBusca ||
        nome.includes(termoBusca) ||
        telefone.includes(termoBusca) ||
        cpf.includes(termoBusca) ||
        procedimentosTexto.includes(termoBusca) ||
        situacao.includes(termoBusca);

      const statusOk = !filtros.status || p.situacao === filtros.status;

      const procOk =
        !filtros.procedimento ||
        (Array.isArray(p.cirurgia_nome)
          ? p.cirurgia_nome.includes(filtros.procedimento)
          : p.cirurgia_nome === filtros.procedimento);

      const sexoOk = !filtros.sexo || p.sexo === filtros.sexo;

      const dataCadastro = p.created_at ? new Date(p.created_at) : null;

      const dataInicioOk =
        !filtros.dataInicio ||
        (dataCadastro && dataCadastro >= new Date(`${filtros.dataInicio}T00:00:00`));

      const dataFimOk =
        !filtros.dataFim ||
        (dataCadastro && dataCadastro <= new Date(`${filtros.dataFim}T23:59:59`));

      const comCirurgiaOk =
        !filtros.somenteComCirurgia ||
        (Array.isArray(p.cirurgia_nome)
          ? p.cirurgia_nome.length > 0
          : !!p.cirurgia_nome);

      const ativoOk = !filtros.somenteAtivos || p.ativo === true;

      const pendenciaOk =
        !filtros.somenteComPendencia ||
        p.pendencia === true ||
        p.possui_pendencia === true ||
        p.status_pagamento === "Pendente";

      return (
        buscaOk &&
        statusOk &&
        procOk &&
        sexoOk &&
        dataInicioOk &&
        dataFimOk &&
        comCirurgiaOk &&
        ativoOk &&
        pendenciaOk
      );
    })
    .sort((a, b) => {
      switch (filtros.ordenarPor) {
        case "nome_asc":
          return (a.nome || "").localeCompare(b.nome || "");

        case "nome_desc":
          return (b.nome || "").localeCompare(a.nome || "");

        case "cadastro_asc":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);

        case "cadastro_desc":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);

        case "status_asc":
          return (a.situacao || "").localeCompare(b.situacao || "");

        case "status_desc":
          return (b.situacao || "").localeCompare(a.situacao || "");

        default:
          return 0;
      }
    });

  const removerPaciente = async (id) => {
    try {
      const { error } = await supabase.from("pacientes").delete().eq("id", id);
      if (error) throw error;

      setPacientes((prev) => prev.filter((p) => p.id !== id));
      setConfirmarRemocao(null);
    } catch (err) {
      console.error("Erro ao remover paciente:", err.message);
    }
  };

  const salvarEdicao = async () => {
    try {
      const payload = {
        situacao: novoStatus,
        cirurgia_nome: procedimentosSelecionados,
      };

      const { error } = await supabase
        .from("pacientes")
        .update(payload)
        .eq("id", editarPaciente.id);

      if (error) throw error;

      setPacientes((prev) =>
        prev.map((p) => (p.id === editarPaciente.id ? { ...p, ...payload } : p))
      );

      setEditarPaciente(null);
      setProcedimentoTemp("");
      setProcedimentoManual("");
      setProcedimentosSelecionados([]);
    } catch (err) {
      console.error("Erro ao editar paciente:", err.message);
    }
  };

  useEffect(() => {
    if (editarPaciente) {
      setNovoStatus(editarPaciente.situacao || "");
      setProcedimentosSelecionados(
        Array.isArray(editarPaciente.cirurgia_nome)
          ? editarPaciente.cirurgia_nome
          : editarPaciente.cirurgia_nome
          ? [editarPaciente.cirurgia_nome]
          : []
      );
      setProcedimentoTemp("");
      setProcedimentoManual("");
    }
  }, [editarPaciente]);

  const handleAddProcedimento = () => {
    if (!procedimentoTemp) return;

    const jaExiste = procedimentosSelecionados.some(
      (proc) => proc.toLowerCase() === procedimentoTemp.toLowerCase()
    );

    if (jaExiste) return;

    setProcedimentosSelecionados((prev) => [...prev, procedimentoTemp]);
    setProcedimentoTemp("");
  };

  const handleAddProcedimentoManual = () => {
    const valor = procedimentoManual.trim();

    if (!valor) return;

    const jaExiste = procedimentosSelecionados.some(
      (proc) => proc.toLowerCase() === valor.toLowerCase()
    );

    if (jaExiste) return;

    setProcedimentosSelecionados((prev) => [...prev, valor]);
    setProcedimentoManual("");
  };

  const handleRemoveProcedimento = (proc) => {
    setProcedimentosSelecionados((prev) => prev.filter((p) => p !== proc));
  };

  return (
    <div className="pacientesContainer">
      <div className="bannerheaderPatients">
        <div className="bannerTitlePatients">
          <h1>Faça o cadastro e cuide de seus pacientes aqui!</h1>
        </div>
        <div className="bannerButtonPatients">
          <AddPatientButton atualizarPacientes={buscarPacientes} />
        </div>
      </div>

      <div className="patientsFilterPanel">
        <div className="patientsFilterTop">
          <div className="patientsFilterTitleArea">
            <h3>Filtros de Pacientes</h3>
            <span className="patientsFilterBadge">
              {totalFiltrosAtivos} filtro{totalFiltrosAtivos !== 1 ? "s" : ""} ativo
              {totalFiltrosAtivos !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="patientsFilterActions">
            <button
              type="button"
              className="filterSecondaryButton"
              onClick={() => setMostrarAvancados((prev) => !prev)}
            >
              {mostrarAvancados ? "Ocultar filtros" : "Mostrar filtros"}
            </button>

            <button
              type="button"
              className="filterPrimaryButton"
              onClick={limparFiltros}
            >
              <FiFilter />
              Limpar filtros
            </button>
          </div>
        </div>

        <div className="patientsFilterQuickRow">
          <div className="patientsFilterField patientsFilterFieldSearch">
            <label>Buscar</label>
            <div className="filterInputIconWrap">
              <FiSearch className="filterInputIcon" />
              <input
                type="text"
                placeholder="Nome, telefone, CPF ou procedimento"
                value={filtros.busca}
                onChange={(e) => handleFiltroChange("busca", e.target.value)}
              />
            </div>
          </div>

          <div className="patientsFilterField">
            <label>Ordenar por</label>
            <select
              value={filtros.ordenarPor}
              onChange={(e) => handleFiltroChange("ordenarPor", e.target.value)}
            >
              <option value="cadastro_desc">Cadastro mais recente</option>
              <option value="cadastro_asc">Cadastro mais antigo</option>
              <option value="nome_asc">Nome A-Z</option>
              <option value="nome_desc">Nome Z-A</option>
              <option value="status_asc">Situação A-Z</option>
              <option value="status_desc">Situação Z-A</option>
            </select>
          </div>
        </div>

        {mostrarAvancados && (
          <>
            <div className="patientsFilterGrid">
              <div className="patientsFilterField">
                <label>Situação</label>
                <select
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange("status", e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="Em avaliação">Em avaliação</option>
                  <option value="Aguardando Contrato">Aguardando Contrato</option>
                  <option value="Em fechamento">Em fechamento</option>
                  <option value="Aguardando Cirurgia">Aguardando Cirurgia</option>
                  <option value="Operado(a)">Operado(a)</option>
                  <option value="Em pós-operatório">Em pós-operatório</option>
                </select>
              </div>

              <div className="patientsFilterField">
                <label>Procedimento</label>
                <select
                  value={filtros.procedimento}
                  onChange={(e) => handleFiltroChange("procedimento", e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Abdominoplastia">Abdominoplastia</option>
                  <option value="Lipoaspiração">Lipoaspiração</option>
                  <option value="Lipoescultura">Lipoescultura</option>
                  <option value="Lipo HD">Lipo HD</option>
                  <option value="Mamoplastia de aumento">Mamoplastia de aumento</option>
                  <option value="Mamoplastia redutora">Mamoplastia redutora</option>
                  <option value="Mastopexia">Mastopexia</option>
                  <option value="Mastopexia com prótese">Mastopexia com prótese</option>
                  <option value="Prótese de mama">Prótese de mama</option>
                  <option value="Ginecomastia">Ginecomastia</option>
                  <option value="Rinoplastia">Rinoplastia</option>
                  <option value="Rinoplastia funcional">Rinoplastia funcional</option>
                  <option value="Blefaroplastia">Blefaroplastia</option>
                  <option value="Otoplastia">Otoplastia</option>
                  <option value="Lifting facial">Lifting facial</option>
                  <option value="Mini lifting facial">Mini lifting facial</option>
                  <option value="Lifting de sobrancelha">Lifting de sobrancelha</option>
                  <option value="Mentoplastia">Mentoplastia</option>
                  <option value="Bichectomia">Bichectomia</option>
                  <option value="Gluteoplastia">Gluteoplastia</option>
                  <option value="Prótese de glúteo">Prótese de glúteo</option>
                  <option value="Enxerto de gordura glútea">Enxerto de gordura glútea</option>
                  <option value="Cruroplastia">Cruroplastia</option>
                  <option value="Braquioplastia">Braquioplastia</option>
                  <option value="Ninfoplastia">Ninfoplastia</option>
                  <option value="Himenoplastia">Himenoplastia</option>
                  <option value="Peeling químico">Peeling químico</option>
                  <option value="Laser facial">Laser facial</option>
                  <option value="Preenchimento facial">Preenchimento facial</option>
                  <option value="Botox">Botox</option>
                  <option value="Bioestimulador de colágeno">Bioestimulador de colágeno</option>
                  <option value="Skinbooster">Skinbooster</option>
                  <option value="Transplante capilar">Transplante capilar</option>
                  <option value="Microagulhamento">Microagulhamento</option>
                  <option value="Tratamento para celulite">Tratamento para celulite</option>
                  <option value="Tratamento para flacidez">Tratamento para flacidez</option>
                  <option value="Harmonização facial">Harmonização facial</option>
                </select>
              </div>

              <div className="patientsFilterField">
                <label>Sexo</label>
                <select
                  value={filtros.sexo}
                  onChange={(e) => handleFiltroChange("sexo", e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>

              <div className="patientsFilterField">
                <label>Data inicial</label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => handleFiltroChange("dataInicio", e.target.value)}
                />
              </div>

              <div className="patientsFilterField">
                <label>Data final</label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => handleFiltroChange("dataFim", e.target.value)}
                />
              </div>
            </div>

            <div className="patientsFilterChecks">
              <label className="patientsCheckItem">
                <input
                  type="checkbox"
                  checked={filtros.somenteComCirurgia}
                  onChange={(e) =>
                    handleFiltroChange("somenteComCirurgia", e.target.checked)
                  }
                />
                Somente com cirurgia
              </label>

              <label className="patientsCheckItem">
                <input
                  type="checkbox"
                  checked={filtros.somenteAtivos}
                  onChange={(e) =>
                    handleFiltroChange("somenteAtivos", e.target.checked)
                  }
                />
                Somente ativos
              </label>

              <label className="patientsCheckItem">
                <input
                  type="checkbox"
                  checked={filtros.somenteComPendencia}
                  onChange={(e) =>
                    handleFiltroChange("somenteComPendencia", e.target.checked)
                  }
                />
                Somente com pendência
              </label>
            </div>
          </>
        )}
      </div>

      <div className="pacientesGrid">
        {pacientesFiltrados.length === 0 ? (
          <p className="nenhum">Nenhum paciente encontrado.</p>
        ) : (
          pacientesFiltrados.map((p) => (
            <div
              key={p.id}
              className="pacienteCard"
              onClick={() => navigate(`/paciente/${p.id}`)}
            >
              <img
                src={p.foto || "/profile-icon.jpg"}
                alt={p.nome}
                className="pacienteFoto"
              />

              <div className="pacienteInfo">
                <h3>{p.nome}</h3>
                <p>{p.situacao || "Sem situação"}</p>
                <small>
                  {Array.isArray(p.cirurgia_nome)
                    ? p.cirurgia_nome.join(", ")
                    : p.cirurgia_nome || "Sem procedimento"}
                </small>
              </div>

              <div className="acoes" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => setEditarPaciente(p)}>
                  <FiEdit3 />
                </button>
                <button type="button" onClick={() => setConfirmarRemocao(p.id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {confirmarRemocao && (
        <div className="modalRemover">
          <div className="modalConteudo">
            <p>Tem certeza que deseja remover este paciente?</p>
            <div className="botoes">
              <button type="button" onClick={() => setConfirmarRemocao(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => removerPaciente(confirmarRemocao)}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {editarPaciente && (
        <div className="patientEditOverlay">
          <div className="patientEditModal">
            <div className="patientEditHeader">
              <div>
                <span className="patientEditTag">Edição rápida</span>
                <h3>Editar paciente</h3>
                <p>
                  Atualize a situação e os procedimentos de{" "}
                  <strong>{editarPaciente.nome}</strong>.
                </p>
              </div>

              <button
                type="button"
                className="patientEditClose"
                onClick={() => setEditarPaciente(null)}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <div className="patientEditBody">
              <div className="patientEditSection">
                <div className="patientEditSectionTitle">
                  <h4>Status atual</h4>
                  <span>Defina a etapa do paciente</span>
                </div>

                <div className="patientEditField">
                  <label>Situação</label>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Em avaliação">Em avaliação</option>
                    <option value="Aguardando Contrato">Aguardando Contrato</option>
                    <option value="Em fechamento">Em fechamento</option>
                    <option value="Aguardando Cirurgia">Aguardando Cirurgia</option>
                    <option value="Operado(a)">Operado(a)</option>
                    <option value="Em pós-operatório">Em pós-operatório</option>
                  </select>
                </div>
              </div>

              <div className="patientEditSection">
                <div className="patientEditSectionTitle">
                  <h4>Procedimentos</h4>
                  <span>
                    Selecione da lista ou adicione um procedimento manualmente
                  </span>
                </div>

                <div className="patientEditField">
                  <label>Adicionar pela lista</label>
                  <div className="procedimentoRow modern">
                    <select
                      value={procedimentoTemp}
                      onChange={(e) => setProcedimentoTemp(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      <option value="Abdominoplastia">Abdominoplastia</option>
                      <option value="Lipoaspiração">Lipoaspiração</option>
                      <option value="Lipoescultura">Lipoescultura</option>
                      <option value="Lipo HD">Lipo HD</option>
                      <option value="Mamoplastia de aumento">Mamoplastia de aumento</option>
                      <option value="Mamoplastia redutora">Mamoplastia redutora</option>
                      <option value="Mastopexia">Mastopexia</option>
                      <option value="Mastopexia com prótese">Mastopexia com prótese</option>
                      <option value="Prótese de mama">Prótese de mama</option>
                      <option value="Ginecomastia">Ginecomastia</option>
                      <option value="Rinoplastia">Rinoplastia</option>
                      <option value="Rinoplastia funcional">Rinoplastia funcional</option>
                      <option value="Blefaroplastia">Blefaroplastia</option>
                      <option value="Otoplastia">Otoplastia</option>
                      <option value="Lifting facial">Lifting facial</option>
                      <option value="Mini lifting facial">Mini lifting facial</option>
                      <option value="Lifting de sobrancelha">Lifting de sobrancelha</option>
                      <option value="Mentoplastia">Mentoplastia</option>
                      <option value="Bichectomia">Bichectomia</option>
                      <option value="Gluteoplastia">Gluteoplastia</option>
                      <option value="Prótese de glúteo">Prótese de glúteo</option>
                      <option value="Enxerto de gordura glútea">Enxerto de gordura glútea</option>
                      <option value="Cruroplastia">Cruroplastia</option>
                      <option value="Braquioplastia">Braquioplastia</option>
                      <option value="Ninfoplastia">Ninfoplastia</option>
                      <option value="Himenoplastia">Himenoplastia</option>
                      <option value="Peeling químico">Peeling químico</option>
                      <option value="Laser facial">Laser facial</option>
                      <option value="Preenchimento facial">Preenchimento facial</option>
                      <option value="Botox">Botox</option>
                      <option value="Bioestimulador de colágeno">Bioestimulador de colágeno</option>
                      <option value="Skinbooster">Skinbooster</option>
                      <option value="Transplante capilar">Transplante capilar</option>
                      <option value="Microagulhamento">Microagulhamento</option>
                      <option value="Tratamento para celulite">Tratamento para celulite</option>
                      <option value="Tratamento para flacidez">Tratamento para flacidez</option>
                      <option value="Harmonização facial">Harmonização facial</option>
                    </select>

                    <button
                      type="button"
                      className="addProcBtn"
                      onClick={handleAddProcedimento}
                      disabled={!procedimentoTemp}
                      title={
                        procedimentoTemp
                          ? "Adicionar procedimento"
                          : "Selecione um procedimento"
                      }
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>

                <div className="patientEditField">
                  <label>Adicionar manualmente</label>
                  <div className="procedimentoManualRow modern">
                    <input
                      type="text"
                      placeholder="Digite um procedimento que não está na lista"
                      value={procedimentoManual}
                      onChange={(e) => setProcedimentoManual(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddProcedimentoManual();
                        }
                      }}
                    />

                    <button
                      type="button"
                      className="addProcBtn secondary"
                      onClick={handleAddProcedimentoManual}
                      disabled={!procedimentoManual.trim()}
                      title={
                        procedimentoManual.trim()
                          ? "Adicionar procedimento manual"
                          : "Digite um procedimento"
                      }
                    >
                      + Manual
                    </button>
                  </div>
                </div>

                <div className="selectedProceduresBox">
                  <div className="selectedProceduresHeader">
                    <h5>Procedimentos selecionados</h5>
                    <span>
                      {procedimentosSelecionados.length} item
                      {procedimentosSelecionados.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="chipsWrap modern">
                    {procedimentosSelecionados.length === 0 ? (
                      <small className="muted">
                        Nenhum procedimento adicionado ainda.
                      </small>
                    ) : (
                      procedimentosSelecionados.map((proc) => (
                        <span key={proc} className="procedimentoChip modern">
                          {proc}
                          <button
                            type="button"
                            className="removeChipBtn"
                            onClick={() => handleRemoveProcedimento(proc)}
                            title="Remover"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="patientEditFooter">
              <button
                type="button"
                className="patientEditCancel"
                onClick={() => setEditarPaciente(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="patientEditSave"
                onClick={salvarEdicao}
                disabled={procedimentosSelecionados.length === 0}
                title={
                  procedimentosSelecionados.length
                    ? "Salvar alterações"
                    : "Adicione pelo menos um procedimento"
                }
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}