import { useState, useEffect, useMemo } from "react";
import "../styles/patientsStyles/formsPatients.css";

export default function FiltrosPacientes({ onFilter }) {
  const filtrosIniciais = {
    busca: "",
    status: "",
    procedimento: "",
    sexo: "",
    cidade: "",
    dataInicio: "",
    dataFim: "",
    ordenarPor: "nome_asc",
    somenteComCirurgia: false,
    somenteAtivos: false,
    somenteComPendencia: false,
  };

  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [mostrarAvancados, setMostrarAvancados] = useState(true);

  useEffect(() => {
    onFilter(filtros);
  }, [filtros, onFilter]);

  const handleChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleReset = () => {
    setFiltros(filtrosIniciais);
    onFilter(filtrosIniciais);
  };

  const totalFiltrosAtivos = useMemo(() => {
    return Object.entries(filtros).filter(([chave, valor]) => {
      if (chave === "ordenarPor") return valor !== "nome_asc";
      if (typeof valor === "boolean") return valor === true;
      return valor !== "";
    }).length;
  }, [filtros]);

  return (
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
            onClick={handleReset}
          >
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="patientsFilterQuickRow">
        <div className="patientsFilterField patientsFilterFieldSearch">
          <label>Buscar</label>
          <input
            type="text"
            placeholder="Nome, telefone, CPF ou procedimento"
            value={filtros.busca}
            onChange={(e) => handleChange("busca", e.target.value)}
          />
        </div>

        <div className="patientsFilterField">
          <label>Ordenar por</label>
          <select
            value={filtros.ordenarPor}
            onChange={(e) => handleChange("ordenarPor", e.target.value)}
          >
            <option value="nome_asc">Nome A-Z</option>
            <option value="nome_desc">Nome Z-A</option>
            <option value="cadastro_desc">Cadastro mais recente</option>
            <option value="cadastro_asc">Cadastro mais antigo</option>
            <option value="atualizacao_desc">Última atualização</option>
            <option value="status_asc">Status A-Z</option>
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
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="">Todas</option>
                <option value="Paciente novo">Paciente novo</option>
                <option value="Em atendimento">Em atendimento</option>
                <option value="Consulta agendada">Consulta agendada</option>
                <option value="Aguardando orçamento">Aguardando orçamento</option>
                <option value="Aguardando contrato">Aguardando contrato</option>
                <option value="Contrato enviado">Contrato enviado</option>
                <option value="Aguardando pagamento da entrada">Aguardando pagamento de entrada</option>
                <option value="Aguardando exames">Aguardando exames</option>
                <option value="Aguardando cirurgia">Aguardando cirurgia</option>
                <option value="Cirurgia agendada">Cirurgia agendada</option>
                <option value="Operado(a)">Operado(a)</option>
                <option value="Em pós-operatorio">Em pós-operatorio</option>
                <option value="Paciente em alta">Paciente em alta</option>
              </select>
            </div>

            <div className="patientsFilterField">
              <label>Procedimento</label>
              <select
                value={filtros.procedimento}
                onChange={(e) => handleChange("procedimento", e.target.value)}
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
                <option value="Cruroplastia">Cruroplastia (lifting de coxas)</option>
                <option value="Braquioplastia">Braquioplastia (lifting de braços)</option>

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
                onChange={(e) => handleChange("sexo", e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>

            <div className="patientsFilterField">
              <label>Cidade</label>
              <input
                type="text"
                placeholder="Digite a cidade"
                value={filtros.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
              />
            </div>

            <div className="patientsFilterField">
              <label>Data inicial</label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => handleChange("dataInicio", e.target.value)}
              />
            </div>

            <div className="patientsFilterField">
              <label>Data final</label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => handleChange("dataFim", e.target.value)}
              />
            </div>
          </div>

          <div className="patientsFilterChecks">
            <label className="patientsCheckItem">
              <input
                type="checkbox"
                checked={filtros.somenteComCirurgia}
                onChange={(e) =>
                  handleChange("somenteComCirurgia", e.target.checked)
                }
              />
              Somente com cirurgia marcada
            </label>

            <label className="patientsCheckItem">
              <input
                type="checkbox"
                checked={filtros.somenteAtivos}
                onChange={(e) =>
                  handleChange("somenteAtivos", e.target.checked)
                }
              />
              Somente pacientes ativos
            </label>

            <label className="patientsCheckItem">
              <input
                type="checkbox"
                checked={filtros.somenteComPendencia}
                onChange={(e) =>
                  handleChange("somenteComPendencia", e.target.checked)
                }
              />
              Somente com pendência
            </label>
          </div>
        </>
      )}
    </div>
  );
}