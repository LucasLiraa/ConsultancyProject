import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import "../styles/patientsStyles/formsPatients.css";
import SurgicalIndicationCase from "./SurgicalIndicationCase";

export default function FormPatientModal({
  setModalAberto,            // controla fechar/abrir vindo de fora
  pacienteEditando,          // quando existir, preenche o form
  setPacienteEditando,       // para limpar após salvar/cancelar
  atualizarPacientes         // callback para recarregar a lista/página
}) {
  const [formStep, setFormStep] = useState(0);
  const [loading, setLoading] = useState(false);
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
    estadoCivil: "",
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

  // Preenche quando vier um paciente para edição
  useEffect(() => {
    if (pacienteEditando) {
      setFormData(prev => ({
        ...prev,
        ...pacienteEditando,
        objetivos: Array.isArray(pacienteEditando.objetivos)
          ? pacienteEditando.objetivos
          : (pacienteEditando.objetivos ? [pacienteEditando.objetivos] : [])
      }));
      setFormStep(0);
    }
  }, [pacienteEditando]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "objetivos") {
      setFormData(prev => ({
        ...prev,
        objetivos: checked
          ? [...prev.objetivos, value]
          : prev.objetivos.filter((item) => item !== value),
        outrosTexto: value === "outros" && !checked ? "" : prev.outrosTexto,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 🔹 Upload da foto do paciente para o Supabase Storage (corrigido)
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 🔧 Normaliza o nome do arquivo (remove acentos e espaços)
      const sanitizedFileName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/\s+/g, "_") // troca espaços por _
        .replace(/[^a-zA-Z0-9._-]/g, ""); // remove caracteres inválidos

      const fileName = `${Date.now()}-${sanitizedFileName}`;

      // Faz o upload pro bucket correto
      const { data, error } = await supabase.storage
        .from("pacientes_fotos") // ✅ nome exato do bucket
        .upload(`pacientes/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Salva apenas o caminho (sem URL pública)
      setFormData((prev) => ({
        ...prev,
        foto: data.path, // Exemplo: "pacientes/1730056192000-foto.jpeg"
      }));

      e.target.value = ""; // limpa o input
      console.log("✅ Upload concluído:", data.path);
    } catch (err) {
      console.error("Erro ao enviar imagem:", err.message);
      alert("Erro ao enviar a foto. Tente novamente.");
    }
  };

  // Salvar (insert/update)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (pacienteEditando?.id) {
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

      // Atualiza lista/tela que chamou o modal
      if (typeof atualizarPacientes === "function") {
        await atualizarPacientes();
      }

      // Fecha modal e limpa estado de edição
      setModalAberto(false);
      setPacienteEditando?.(null);
      resetarForm();
    } catch (error) {
      console.error("Erro ao salvar paciente:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetarForm = () => {
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
      estadoCivil: "",
      foto: "",
      acimaPeso: "",
      gorduraVisceral: "",
      formatoCorporal: "",
      busto: "",
      cintura: "",
      quadril: "",
      coxa: "",
      panturrilha: "",
      objetivos: [],
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
  };

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

  const renderStep = () => {
    switch (formStep) {
      case 0:
        return (
          <div className="formContent">
            <h3>Dados do Paciente</h3>
            <label>Nome Paciente:</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} />
            <label>Data da Anamnese:</label>
            <input type="date" name="data" value={formData.data} onChange={handleChange} />
            <label>Sexo do paciente:</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>
            <label>Altura:</label>
            <input type="text" name="altura" value={formData.altura} onChange={handleChange} />
            <label>Peso:</label>
            <input type="text" name="peso" value={formData.peso} onChange={handleChange} />
            <label>IMC:</label>
            <input type="text" name="imc" value={formData.imc} onChange={handleChange} />
            <label>Telefone:</label>
            <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} />
            <label>Email:</label>
            <input type="text" name="email" value={formData.email} onChange={handleChange} />
            <label>Profissão:</label>
            <input type="text" name="profissao" value={formData.profissao} onChange={handleChange} />
            <label htmlFor="foto">Foto do paciente:</label>
            <input
              type="file"
              id="foto"
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* 🔹 Pré-visualização da imagem */}
            {formData.foto && (
              <img
                src={
                  formData.foto.startsWith("http")
                    ? formData.foto
                    : `https://cxpqrvotoqazrybmzoac.supabase.co/storage/v1/object/public/pacientes_fotos/${formData.foto}`
                }
                alt="Pré-visualização da foto"
                className="preview-foto"
              />
            )}
          </div>
        );
      case 1:
        return (
          <div className="formContent">
            <h3>Biotipo Corporal e Medidas</h3>
            <label>Está acima do peso?</label>
            <select name="acimaPeso" value={formData.acimaPeso} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            <label>Gordura visceral?</label>
            <select name="gorduraVisceral" value={formData.gorduraVisceral} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            <label>Formato corporal percebido:</label>
            <select name="formatoCorporal" value={formData.formatoCorporal} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="trianguloPera">Triângulo (Pêra)</option>
              <option value="trianguloInvertido">Triângulo Invertido</option>
              <option value="retangulo">Retângulo</option>
              <option value="ampulheta">Ampulheta</option>
              <option value="ovalMaca">Oval (Maçã)</option>
            </select>
            <h4>Medidas</h4>
            <label>Busto:</label>
            <input type="text" name="busto" value={formData.busto} onChange={handleChange} />
            <label>Cintura:</label>
            <input type="text" name="cintura" value={formData.cintura} onChange={handleChange} />
            <label>Quadril:</label>
            <input type="text" name="quadril" value={formData.quadril} onChange={handleChange} />
            <label>Coxa:</label>
            <input type="text" name="coxa" value={formData.coxa} onChange={handleChange} />
            <label>Panturrilha:</label>
            <input type="text" name="panturrilha" value={formData.panturrilha} onChange={handleChange} />
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
            <select name="realizouCirurgia" value={formData.realizouCirurgia} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.realizouCirurgia === "sim" && (
              <div>
                <label>Qual cirurgia?</label>
                <input type="text" name="descricaoCirurgia" value={formData.descricaoCirurgia} onChange={handleChange} />
                <label>Houve complicações ou resultados indesejados?</label>
                <input type="text" name="complicacoes" value={formData.complicacoes} onChange={handleChange} />
                <label>Cicatrização anterior foi boa?</label>
                <select name="cicatrizacao" value={formData.cicatrizacao} onChange={handleChange}>
                  <option value="">Selecione...</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
                <label>Queloide?</label>
                <select name="queloide" value={formData.queloide} onChange={handleChange}>
                  <option value="">Selecione...</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
            )}

            <label>Possui alergias?</label>
            <select name="alergias" value={formData.alergias} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.alergias === "sim" && (
              <div>
                <label>Quais Alergias?</label>
                <input type="text" name="descricaoAlergia" value={formData.descricaoAlergia} onChange={handleChange} />
              </div>
            )}

            <label>Faz uso de medicamentos contínuos?</label>
            <select name="medicamentos" value={formData.medicamentos} onChange={handleChange}>
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
            <input type="text" name="condicoesMedicas" value={formData.condicoesMedicas} onChange={handleChange} />

            <label>Fuma?</label>
            <select name="fumante" value={formData.fumante} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.fumante === "sim" && (
              <div>
                <label>Quantos por dia?</label>
                <input type="text" name="fumanteQuantidade" value={formData.fumanteQuantidade} onChange={handleChange} />
              </div>
            )}
            {formData.fumante === "nao" && (
              <div>
                <label>Já fumou?</label>
                <select name="jaFumou" value={formData.jaFumou} onChange={handleChange}>
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
            <select name="assimetriaMamaria" value={formData.assimetriaMamaria} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>

            <label>Alterações posturais (escoliose, hiperlordose, etc)?</label>
            <select name="alteracoesPosturais" value={formData.alteracoesPosturais} onChange={handleChange}>
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
            {formData.alteracoesPosturais === "sim" && (
              <div>
                <label>Quais?</label>
                <input type="text" name="descricaoPosturais" value={formData.descricaoPosturais} onChange={handleChange} />
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="formContent">
            <h3>Expectativas do Paciente</h3>
            <label>Descreva suas expectativas:</label>
            <textarea name="expectativas" value={formData.expectativas} onChange={handleChange} />
          </div>
        );
      case 5:
        return (
          <div className="formContent">
            <h3>Anotações Gerais (para o médico)</h3>
            <label>QP (Queixa principal):</label>
            <textarea name="qp" value={formData.qp} onChange={handleChange} />
            <label>HPP (Histórico patológico pregresso):</label>
            <textarea name="hpp" value={formData.hpp} onChange={handleChange} />
            <label>Histórico de alergias/medicamentos:</label>
            <textarea
              name="historicoAlergiasMedicamentos"
              value={formData.historicoAlergiasMedicamentos}
              onChange={handleChange}
            />
            <label>Histórico cirúrgico:</label>
            <textarea name="historicoCirurgico" value={formData.historicoCirurgico} onChange={handleChange} />
            <label>Histórico ginecológico:</label>
            <textarea name="historicoGinecologico" value={formData.historicoGinecologico} onChange={handleChange} />
            <label>Qualidade da cicatriz:</label>
            <textarea name="qualidadeCicatriz" value={formData.qualidadeCicatriz} onChange={handleChange} />
            <label>Convênio:</label>
            <textarea name="convenio" value={formData.convenio} onChange={handleChange} />
            <label>Outras anotações</label>
            <textarea name="outrasAnotacoes" value={formData.outrasAnotacoes} onChange={handleChange} />
          </div>
        );
      case 6:
        return <SurgicalIndicationCase formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="containerNewPatient" onClick={() => setModalAberto(false)}>
      <div className="contentNewPatient" onClick={(e) => e.stopPropagation()}>
        {/* Menu lateral */}
        <div className="sidebarSteps">
          {[
            "Dados do Paciente",
            "Biotipo Corporal",
            "Objetivos",
            "Histórico Clínico",
            "Expectativas",
            "Anotações Gerais",
            "Indicação Cirúrgica",
          ].map((label, i) => (
            <div
              key={i}
              className={`sidebarStep ${formStep === i ? "active" : ""}`}
              onClick={() => setFormStep(i)}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="contentNewPatientBody">{renderStep()}</div>

          <div className="contentNewPatientButton">
            {formStep > 0 && (
              <button type="button" onClick={() => setFormStep((prev) => prev - 1)}>
                Voltar
              </button>
            )}
            {formStep < 6 && (
              <button type="button" onClick={() => setFormStep((prev) => prev + 1)}>
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
  );
}