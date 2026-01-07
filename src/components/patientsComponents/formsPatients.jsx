import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient"; // <-- novo import
import "../styles/patientsStyles/formsPatients.css";

export default function FormButton({
  pacienteEditando,
  setPacienteEditando,
  pacientes,
  atualizarPacientes,
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({
    nome: "",
    data: "",
    sexo: "",
    altura: "",
    peso: "",
    imc: "",
    telefone: "",
    email: "",
    profissao: "",
    foto: "",
    acimaPeso: "",
    gorduraVisceral: "",
    formatoCorporal: "",
    busto: "",
    cintura: "",
    quadril: "",
    coxa: "",
    panturrilha: "",
    objetivos: "",
    outrosTexto: "",
    realizouCirurgia: "",
    descricaoCirurgia: "",
    complicacoes: "",
    cicatrizacao: "",
    queloide: "",
    alergias: "",
    descricaoAlergia: "",
    medicamentos: "",
    descricaoMedicamentos: "",
    medicamentosControlados: "",
    condicoesMedicas: "",
    descricaoMedicamentosControlados: "",
    fumante: "",
    fumanteQuantidade: "",
    jaFumou: "",
    substanciasRecreativas: "",
    descricaoSubstancias: "",
    assimetriaMamaria: "",
    alteracoesPosturais: "",
    descricaoPosturais: "",
    expectativas: "",
    qp: "",
    hpp: "",
    historicoAlergiasMedicamentos: "",
    historicoCirurgico: "",
    historicoGinecologico: "",
    qualidadeCicatriz: "",
    convenio: "",
    indicacaoCirurgica: "",
    outrasAnotacoes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pacienteEditando) {
      setFormData({
        ...formData,
        ...pacienteEditando,
        objetivos: pacienteEditando.objetivos || [],
      });
      setModalAberto(true);
    }
  }, [pacienteEditando]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "objetivos") {
      setFormData((prev) => ({
        ...prev,
        objetivos: checked
          ? [...prev.objetivos, value]
          : prev.objetivos.filter((item) => item !== value),
        outrosTexto:
          value === "outros" && !checked ? "" : prev.outrosTexto,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 🔹 Upload da foto para Supabase Storage
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileName = `${crypto.randomUUID()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("pacientes_fotos")
        .upload(`pacientes/${fileName}`, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("pacientes_fotos")
        .getPublicUrl(`pacientes/${fileName}`);

      setFormData({ ...formData, foto: publicUrl.publicUrl });

      // limpa o input depois de salvar
      e.target.value = "";
    } catch (err) {
      console.error("Erro ao fazer upload da foto:", err.message);
    }
  };

  // 🔹 Salvar paciente no Supabase
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (pacienteEditando) {
        const { error } = await supabase
          .from("pacientes")
          .update(formData)
          .eq("id", pacienteEditando.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pacientes")
          .insert([formData]);

        if (error) throw error;
      }

      const novosPacientes = await fetchPacientes();
      atualizarPacientes(novosPacientes);

      setModalAberto(false);
      setFormStep(0);
      setFormData({
        nome: "",
        data: "",
        sexo: "",
        altura: "",
        peso: "",
        imc: "",
        telefone: "",
        email: "",
        profissao: "",
        foto: "",
        acimaPeso: "",
        gorduraVisceral: "",
        formatoCorporal: "",
        busto: "",
        cintura: "",
        quadril: "",
        coxa: "",
        panturrilha: "",
        objetivos: "",
        outrosTexto: "",
        realizouCirurgia: "",
        descricaoCirurgia: "",
        complicacoes: "",
        cicatrizacao: "",
        queloide: "",
        alergias: "",
        descricaoAlergia: "",
        medicamentos: "",
        descricaoMedicamentos: "",
        medicamentosControlados: "",
        descricaoMedicamentosControlados: "",
        condicoesMedicas: "",
        fumante: "",
        fumanteQuantidade: "",
        jaFumou: "",
        substanciasRecreativas: "",
        descricaoSubstancias: "",
        assimetriaMamaria: "",
        alteracoesPosturais: "",
        descricaoPosturais: "",
        expectativas: "",
        qp: "",
        hpp: "",
        historicoAlergiasMedicamentos: "",
        historicoCirurgico: "",
        historicoGinecologico: "",
        qualidadeCicatriz: "",
        convenio: "",
        indicacaoCirurgica: "",
        outrasAnotacoes: "",
      });
      setPacienteEditando(null);
    } catch (error) {
      console.error("Erro ao salvar paciente:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Buscar pacientes do Supabase
  async function fetchPacientes() {
    try {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error.message);
      return [];
    }
  }

  const opcoesObjetivos = [
    { value: "abdomen_definido", label: "Abdômen mais definido" },
    { value: "reducao_abdomen", label: "Redução de abdômen" },
    { value: "reducao_flancos", label: "Redução de flancos" },
    { value: "aumento_gluteos", label: "Aumento dos glúteos" },
    { value: "reducao_gluteos", label: "Redução dos glúteos" },
    { value: "reducao_coxas", label: "Redução da gordura das coxas" },
    { value: "aumento_coxas", label: "Aumento das coxas (enxertia)" },
    { value: "contorno_harmonico", label: "Contorno corporal mais harmônico" },
    { value: "lipo_hd", label: "Lipo HD" },
    { value: "aumento_mamas", label: "Aumento e firmeza das mamas" },
    { value: "reducao_mamas", label: "Redução das mamas" },
    { value: "mastopexia", label: "Mastopexia" },
    { value: "rejuvenescimento", label: "Rejuvenescimento facial" },
    { value: "cicatriz", label: "Correção de cicatriz" },
    { value: "outros", label: "Outros" },
  ];

  // 🔹 Renderização condicional (mantida igual ao seu código original)
  const renderStep = () => {
    switch (formStep) {
      case 0:
        return (        
          <div className="formContent">            
            <h3>Dados do Paciente</h3>
              <label>Nome Paciente:</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
              />          
              <label>Data da Anamnese:</label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleChange}
              />
              <label>Sexo do paciente:</label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
              <label>Altura:</label>
              <input
                type="text"
                name="altura"
                value={formData.altura}
                onChange={handleChange}
              />
              <label>Peso:</label>
              <input
                type="text"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
              />
              <label>IMC:</label>
              <input
                type="text"
                name="imc"
                value={formData.imc}
                onChange={handleChange}
              />
              <label>Telefone:</label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
              />
              <label>Email:</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <label>Profissão:</label>
              <input
                type="text"
                name="profissao"
                value={formData.profissao}
                onChange={handleChange}
              />
              <label>Foto:</label>
              <input
                type="file"
                onChange={handleFileChange}
              />
          </div>
        );
      case 1:
        return (
          <div className="formContent">            
            <h3>Biotipo Corporal e Medidas</h3>
              <label>Está acima do peso?</label>
              <select
                name="acimaPeso"
                value={formData.acimaPeso}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>   
              <label>Gordura visceral?</label>
              <select
                name="gorduraVisceral"
                value={formData.gorduraVisceral}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>  
              <label>Formato corporal percebido:</label>
              <select
                name="gorduraVisceral"
                value={formData.gorduraVisceral}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="trianguloPera">Triângulo (Pêra)</option>
                <option value="trainguloInvertido">Triângulo Invertido</option>
                <option value="retangulo">Retângulo</option>
                <option value="ampulheta">Ampulheta</option>
                <option value="ovalMaca">Oval (Maçã)</option>
              </select> 
              <h4>Medidas</h4>
              <label>Busto:</label>
              <input
                type="text"
                name="busto"
                value={formData.busto}
                onChange={handleChange}
              />
              <label>Cintura:</label>
              <input
                type="text"
                name="cintura"
                value={formData.cintura}
                onChange={handleChange}
              />   
              <label>Quadril:</label>
              <input
                type="text"
                name="quadril"
                value={formData.quadril}
                onChange={handleChange}
              />   
              <label>Coxa:</label>
              <input
                type="text"
                name="coxa"
                value={formData.coxa}
                onChange={handleChange}
              />   
              <label>Panturrilha:</label>
              <input
                type="text"
                name="panturrilha"
                value={formData.panturrilha}
                onChange={handleChange}
              />       
          </div>
        );
      case 2:
        return (
          <div className="formContent">
          <label>Queixas e Objetivos Cirúrgicos</label>
          {opcoesObjetivos.map((opcao) => (
            <div key={opcao.value} className="checkbox-wrapper">
              <label className="form-control">
                <input
                  type="checkbox"
                  name="objetivos"
                  value={opcao.value}
                  checked={formData.objetivos.includes(opcao.value)}
                  onChange={handleChange}
                />
                {opcao.label}
              </label>

              {/* Se "outros" estiver marcado, exibe input abaixo ocupando toda a largura */}
              {opcao.value === "outros" && formData.objetivos.includes("outros") && (
                <input
                  type="text"
                  name="outrosTexto"
                  value={formData.outrosTexto}
                  onChange={handleChange}
                  placeholder="Digite sua opção..."
                  className="outros-input"
                />
              )}
            </div>
          ))}
        </div>
        );
      case 3:
        return (
          <div className="formContent">
            <h3>Histórico Clínico e Cirúrgico</h3>
            <label>Já realizou alguma cirurgia?</label>
            <select
              name="realizouCirurgia"
              value={formData.realizouCirurgia}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.realizouCirurgia === "sim" && (
              <div>
                <label>Qual cirurgia?</label>
                <input
                  type="text"
                  name="descricaoCirurgia"
                  value={formData.descricaoCirurgia}
                  onChange={handleChange}
                />
                <label>Houve complicações ou resultados indesejados?</label>
                <input
                  type="text"
                  name="complicacoes"
                  value={formData.complicacoes}
                  onChange={handleChange}
                />
                <label>Cicatrização anterior foi boa?</label>
                <select
                  name="cicatrizacao"
                  value={formData.cicatrizacao}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
                <label>Queloide?</label>
                <select
                  name="queloide"
                  value={formData.queloide}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>               
              </div>
            )}

            <label>Possui alergias?</label>
            <select
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.alergias === "sim" && (
              <div>
                <label>Quais Alergias?</label>
                <input
                  type="text"
                  name="descricaoAlergia"
                  value={formData.descricaoAlergia}
                  onChange={handleChange}
                />
              </div>
            )}

            <label>Faz uso de medicamentos contínuos?</label>
            <select
              name="medicamentos"
              value={formData.medicamentos}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.medicamentos === "sim" && (
              <div>
                <label>Quais medicamentos?</label>
                <input
                  type="text"
                  name="descricaoMedicamentos"
                  value={formData.descricaoMedicamentos}
                  onChange={handleChange}
                />
              </div>
            )}

            <label>Usa medicamento controlado?</label>
            <select
              name="medicamentosControlados"
              value={formData.medicamentosControlados}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.medicamentosControlados === "sim" && (
              <div>
                <label>Quais medicamentos?</label>
                <input
                  type="text"
                  name="descricaoMedicamentosControlados"
                  value={formData.descricaoMedicamentosControlados}
                  onChange={handleChange}
                />
              </div>
            )}

            <label>Condições médicas atuais:</label>
            <input
              type="text"
              name="condicoesMedicas"
              value={formData.condicoesMedicas}
              onChange={handleChange}
            />

            <label>Fuma?</label>
            <select
              name="fumante"
              value={formData.fumante}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.fumante === "sim" && (
              <div>
                <label>Quantos por dia?</label>
                <input
                  type="text"
                  name="fumanteQuantidade"
                  value={formData.fumanteQuantidade}
                  onChange={handleChange}
                />
              </div>
            )}
            {formData.fumante === "nao" && (
              <div>
                <label>Já fumou?</label>
                <select
                  name="jaFumou"
                  value={formData.jaFumou}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
            )}

            <label>Usa substâncias recreativas? </label>
            <select
              name="substanciasRecreativas"
              value={formData.substanciasRecreativas}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.substanciasRecreativas === "sim" && (
              <div>
                <label>Quais substâncias?</label>
                <input
                  type="text"
                  name="descricaoSubstancias"
                  value={formData.descricaoSubstancias}
                  onChange={handleChange}
                />
              </div>
            )}

            <label>Possui assimetria mamária?</label>
            <select
              name="assimetriaMamaria"
              value={formData.assimetriaMamaria}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>

            <label>Alterações posturais (escoliose, hiperlordose, etc)?</label>
            <select
              name="alteracoesPosturais"
              value={formData.alteracoesPosturais}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.alteracoesPosturais === "sim" && (
              <div>
                <label>Quais?</label>
                <input
                  type="text"
                  name="descricaoPosturais"
                  value={formData.descricaoPosturais}
                  onChange={handleChange}
                />
              </div>
            )}
           
          </div>
        );
      case 4:
        return (
          <div className="formContent">            
            <h3>Expectativas do Paciente</h3>
              <label>Descreva suas expectativas com relação à forma corporal e estética desejada:</label>
              <textarea
                name="expectativas"
                value={formData.expectativas}
                onChange={handleChange}
              /> 
          </div>
        );
      case 5:
        return (
          <div className="formContent">            
            <h3>Anotações Gerais (para o médico)</h3>
              <label>QP (Queixa principal):</label>
              <textarea
                name="qp"
                value={formData.qp}
                onChange={handleChange}
              /> 
              <label>HPP (Histórico patológico pregresso):</label>
              <textarea
                name="hpp"
                value={formData.hpp}
                onChange={handleChange}
              /> 
              <label>Histórico de alergias/medicamentos:</label>
              <textarea
                name="historicoAlergiasMedicamentos"
                value={formData.historicoAlergiasMedicamentos}
                onChange={handleChange}
              /> 
              <label>Histórico cirúrgico:</label>
              <textarea
                name="historicoCirurgico"
                value={formData.historicoCirurgico}
                onChange={handleChange}
              /> 
              <label>Histórico ginecológico:</label>
              <textarea
                name="historicoGinecologico"
                value={formData.historicoGinecologico}
                onChange={handleChange}
              /> 
              <label>Qualidade da cicatriz:</label>
              <textarea
                name="qualidadeCicatriz"
                value={formData.qualidadeCicatriz}
                onChange={handleChange}
              /> 
              <label>Convênio:</label>
              <textarea
                name="convenio"
                value={formData.convenio}
                onChange={handleChange}
              /> 
              <label>Indicação Cirúrgica:</label>
              <textarea
                name="indicacaoCirurgica"
                value={formData.indicacaoCirurgica}
                onChange={handleChange}
              /> 
              <label>Outras anotações</label>
              <textarea
                name="outrasAnotacoes"
                value={formData.outrasAnotacoes}
                onChange={handleChange}
              /> 
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="contentButton">
        <button
          className="btn_newPatients"
          onClick={() => setModalAberto(true)}
        >
          Adicionar Paciente
        </button>
      </div>

      {modalAberto && (
        <div
          className="containerNewPatient"
          onClick={() => setModalAberto(false)}
        >
          <div
            className="contentNewPatient"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <div className="contentNewPatientBody">{renderStep()}</div>

              <div className="contentNewPatientButton">
                {formStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormStep((prev) => prev - 1)}
                  >
                    Voltar
                  </button>
                )}
                {formStep < 5 && (
                  <button
                    type="button"
                    onClick={() => setFormStep((prev) => prev + 1)}
                  >
                    Avançar
                  </button>
                )}
                <button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}