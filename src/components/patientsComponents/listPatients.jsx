import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { FiSearch, FiTrash2, FiFilter, FiEdit3 } from "react-icons/fi";
import AddPatientButton from "./AddPatientButton";
import "../styles/patientsStyles/listPatients.css";

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroProcedimento, setFiltroProcedimento] = useState("");
  const [confirmarRemocao, setConfirmarRemocao] = useState(null);
  const [editarPaciente, setEditarPaciente] = useState(null);
  const [novoStatus, setNovoStatus] = useState("");
  const [novoProcedimento, setNovoProcedimento] = useState([]);
  const navigate = useNavigate();

  // 🔹 Busca inicial dos pacientes
  useEffect(() => {
    buscarPacientes();
  }, []);

  // 🔹 Busca pacientes + gera URLs públicas das fotos
  const buscarPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // ✅ Gera URL pública das fotos para exibir miniaturas
      const pacientesComFoto = data.map((paciente) => {
        if (paciente.foto) {
          const { data: publicUrlData } = supabase
            .storage
            .from("pacientes_fotos") // 🪣 nome exato do bucket
            .getPublicUrl(paciente.foto);

          return {
            ...paciente,
            foto: publicUrlData.publicUrl,
          };
        }
        return paciente;
      });

      setPacientes(pacientesComFoto || []);
    } catch (err) {
      console.error("Erro ao buscar pacientes:", err.message);
    }
  };

  // 🔹 Filtros dinâmicos
  const pacientesFiltrados = pacientes.filter((p) => {
    const nomeOk = p.nome?.toLowerCase().includes(filtroNome.toLowerCase());
    const statusOk = !filtroStatus || p.situacao === filtroStatus;
    const procOk =
      !filtroProcedimento || p.cirurgia_nome === filtroProcedimento;
    return nomeOk && statusOk && procOk;
  });

  // 🔹 Remover paciente
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

  // 🔹 Editar paciente (status e procedimento)
  const salvarEdicao = async () => {
    try {
      const payload = {
        situacao: novoStatus,
        cirurgia_nome: procedimentosSelecionados, // 👈 agora é um array
      };

      const { error } = await supabase
        .from("pacientes")
        .update(payload)
        .eq("id", editarPaciente.id);

      if (error) throw error;

      setPacientes(prev =>
        prev.map(p =>
          p.id === editarPaciente.id
            ? { ...p, ...payload }
            : p
        )
      );

      setEditarPaciente(null);
    } catch (err) {
      console.error("Erro ao editar paciente:", err.message);
    }
  };


  // 🆕 Estados para a nova UX
  const [procedimentoTemp, setProcedimentoTemp] = useState("");
  const [procedimentosSelecionados, setProcedimentosSelecionados] = useState([]);

  // Quando abrir o modal de edição, preenche os campos com dados atuais
  useEffect(() => {
    if (editarPaciente) {
      setNovoStatus(editarPaciente.situacao || "");
      setProcedimentosSelecionados(
        Array.isArray(editarPaciente.cirurgia_nome)
          ? editarPaciente.cirurgia_nome
          : (editarPaciente.cirurgia_nome ? [editarPaciente.cirurgia_nome] : [])
      );
      setProcedimentoTemp(""); // limpa o select temporário
    }
  }, [editarPaciente]);

  const handleAddProcedimento = () => {
    if (!procedimentoTemp) return;

    // evita duplicados (case sensitive simples; ajuste se quiser normalizar)
    if (procedimentosSelecionados.includes(procedimentoTemp)) return;

    setProcedimentosSelecionados(prev => [...prev, procedimentoTemp]);
    setProcedimentoTemp(""); // limpa o select após adicionar
  };

  const handleRemoveProcedimento = (proc) => {
    setProcedimentosSelecionados(prev => prev.filter(p => p !== proc));
  };

  return (
    <div className="pacientesContainer">
      {/* Botão para adicionar paciente */}
      <div className="bannerheaderPatients">
        <div className="bannerTitlePatients">
          <h1>Faça o cadastro e cuide de seus pacientes aqui!</h1>
        </div>
        <div className="bannerButtonPatients">
          <AddPatientButton atualizarPacientes={buscarPacientes} />
        </div>
      </div>


      {/* Cabeçalho com filtros e botão */}
      <div className="filtrosHeader">

        <div className="searchInput">
          <FiSearch className="icon" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
        </div>

        <div className="selects">
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="">Situação</option>
            <option value="Em avaliação">Em avaliação</option>
            <option value="Aguardando Contrato">Aguardando Contrato</option>
            <option value="Em fechamento">Em fechamento</option>
            <option value="Aguardando Cirurgia">Aguardando Cirurgia</option>
            <option value="Operado(a)">Operado(a)</option>
            <option value="Em pós-operatório">Em pós-operatório</option>
          </select>

          <select value={filtroProcedimento}
            onChange={(e) => setFiltroProcedimento(e.target.value)}
          >
            <option value="">Procedimento</option>
            <option value="Prótese de Mama">Prótese de Mama</option>
            <option value="Lipoescultura">Lipoescultura</option>
            <option value="Abdominoplastia">Abdominoplastia</option>
            <option value="Mamoplastia">Mamoplastia</option>
            <option value="Lipo HD">Lipo HD</option>
            <option value="Blefaroplastia">Blefaroplastia</option>
          </select>

          <button className="limparBtn" onClick={() => {
            setFiltroNome("");
            setFiltroStatus("");
            setFiltroProcedimento("");
              }}
            ><FiFilter /> Limpar
          </button>  
        </div>  

        {/* 🔹 Botão de adicionar paciente (lado direito do cabeçalho) */}
        
      </div>

      {/* Lista de pacientes */}
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

              <div
                className="acoes"
                onClick={(e) => e.stopPropagation()} // impede o clique de navegar
              >
                <button onClick={() => setEditarPaciente(p)}>
                  <FiEdit3 />
                </button>
                <button onClick={() => setConfirmarRemocao(p.id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmação */}
      {confirmarRemocao && (
        <div className="modalRemover">
          <div className="modalConteudo">
            <p>Tem certeza que deseja remover este paciente?</p>
            <div className="botoes">
              <button onClick={() => setConfirmarRemocao(null)}>Cancelar</button>
              <button className="danger" onClick={() => removerPaciente(confirmarRemocao)}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editarPaciente && (
        <div className="modalRemover">
          <div className="modalConteudo">
            <h3>Editar informações</h3>

            {/* Situação */}
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

            {/* Procedimentos */}
            <label>Procedimento</label>
            <div className="procedimentoRow">
              <select
                value={procedimentoTemp}
                onChange={(e) => setProcedimentoTemp(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Prótese de Mama">Prótese de Mama</option>
                <option value="Lipoescultura">Lipoescultura</option>
                <option value="Abdominoplastia">Abdominoplastia</option>
                <option value="Mamoplastia">Mamoplastia</option>
                <option value="Lipo HD">Lipo HD</option>
                <option value="Blefaroplastia">Blefaroplastia</option>
              </select>

              <button
                className="addProcBtn"
                onClick={handleAddProcedimento}
                disabled={!procedimentoTemp}
                title={procedimentoTemp ? "Adicionar procedimento" : "Selecione um procedimento"}
              >
                + Adicionar
              </button>
            </div>

            {/* Chips de selecionados */}
            <div className="chipsWrap">
              {procedimentosSelecionados.length === 0 ? (
                <small className="muted">Nenhum procedimento adicionado.</small>
              ) : (
                procedimentosSelecionados.map((proc) => (
                  <span key={proc} className="procedimentoChip">
                    {proc}
                    <button
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

            <div className="botoes">
              <button onClick={() => setEditarPaciente(null)}>Cancelar</button>
              <button
                className="danger"
                onClick={salvarEdicao}
                disabled={procedimentosSelecionados.length === 0}
                title={procedimentosSelecionados.length ? "Salvar" : "Adicione pelo menos um procedimento"}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}