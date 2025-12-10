import { useState, useEffect } from "react";
import '../styles/patientsStyles/btn_styles.css';

export default function FormButton({ pacienteEditando, setPacienteEditando, pacientes = [], atualizarPacientes }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    rg: "",
    sexo: "",
    estadoCivil: "",
    celular: "",
    procedimento: [],
    dataNascimento: "",
    dataContrato: "",
    dataCirurgia: "",
    profissao: "",
    status: "",
    foto: "",
  });
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState("");

  const gender = ["", "Feminino", "Masculino", "Outro"];
  const procedimentos = ["", "Prótese de Mama", "Lipoescultura", "Abdominoplastia", "Mamoplastia", "Lipo HD", "Blefaroplastia"];
  const statusList = ["", "Em avaliação", "Aguardando Contrato", "Em fechamento", "Aguardando Cirurgia", "Operado(a)", "Em pós-operatório"];

  useEffect(() => {
    if (pacienteEditando !== null && Array.isArray(pacientes) && pacientes[pacienteEditando]) {
      const paciente = pacientes[pacienteEditando];
      const pacienteComDatasISO = {
        ...paciente,
        dataNascimento: formatDateToIso(paciente.dataNascimento),
        dataContrato: formatDateToIso(paciente.dataContrato),
        dataCirurgia: formatDateToIso(paciente.dataCirurgia),
      };
      setFormData(pacienteComDatasISO);
      setFormStep(0);
      setModalAberto(true);
    }
  }, [pacienteEditando, pacientes]);

  const formatDateToPtBr = (date) => (date ? date.split("-").reverse().join("/") : "");
  const formatDateToIso = (date) => (date ? date.split("/").reverse().join("-") : "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isDateField = ["dataNascimento", "dataContrato", "dataCirurgia"].includes(name);
    const formattedValue = isDateField ? value : value;
    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, foto: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const isStepValid = () => {
    switch (formStep) {
      case 0:
        return formData.nome && formData.cpf && formData.rg;
      case 1:
        return formData.sexo && formData.dataNascimento && formData.celular;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dadosFormatados = {
      ...formData,
      dataNascimento: formatDateToPtBr(formData.dataNascimento),
      dataContrato: formatDateToPtBr(formData.dataContrato),
      dataCirurgia: formatDateToPtBr(formData.dataCirurgia),
      procedimento: formData.procedimento.join(", "),
    };

    let novosPacientes = [];

    if (pacienteEditando !== null && Array.isArray(pacientes)) {
      novosPacientes = pacientes.map((p, index) =>
        index === pacienteEditando ? dadosFormatados : p
      );
    } else if (Array.isArray(pacientes)) {
      novosPacientes = [...pacientes, dadosFormatados];
    } else {
      novosPacientes = [dadosFormatados];
    }

    atualizarPacientes(novosPacientes);
    setModalAberto(false);
    setFormStep(0);
    setFormData({
      nome: "",
      cpf: "",
      rg: "",
      sexo: "",
      estadoCivil: "",
      celular: "",
      procedimento: [],
      dataNascimento: "",
      dataContrato: "",
      dataCirurgia: "",
      profissao: "",
      status: "",
      foto: "",
    });
    setPacienteEditando(null);
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (isStepValid()) setFormStep((prev) => Math.min(prev + 1, 2));
  };

  const prevStep = (e) => {
    e.preventDefault();
    setFormStep((prev) => Math.max(prev - 1, 0));
  };

  const renderStep = () => {
    switch (formStep) {
      case 0:
        return (
          <div className="formContainer">
            <div className="formContentEsq">
              <img src={"formsImage.jpeg"} alt="formsImage" />
            </div>
            <div className="formContentDir">
              <div className="formContentDirText">
                <h4>Utilize este formulário para registrar os dados pessoais do paciente para seguir com os próximos passos.</h4>
              </div>
              <div className="formContent"><label>Nome</label><input type="text" name="nome" value={formData.nome} onChange={handleChange} required /></div>
              <div className="formRow">
                <div className="formContent"><label>CPF</label><input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required /></div>
                <div className="formContent"><label>RG</label><input type="text" name="rg" value={formData.rg} onChange={handleChange} required /></div>
              </div>
              <div className="formRow">
                <div className="formContent">
                  <label>Sexo</label>
                  <select name="sexo" value={formData.sexo} onChange={handleChange} required>
                    {gender.map((g, i) => <option key={i} value={g}>{g || "Selecione"}</option>)}
                  </select>
                </div>
                <div className="formContent">
                  <label>Data de Nascimento</label>
                  <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required />
                </div>
              </div>
              <div className="formContent"><label>Celular</label><input type="tel" name="celular" value={formData.celular} onChange={handleChange} required /></div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="formContainer">
            <div className="formContentEsq">
              <img src={"formsImage.jpeg"} alt="formsImage" />
            </div>
            <div className="formContentDir">
              <div className="formContentDirText">
                <h4>Utilize este formulário para registrar os dados pessoais do paciente para seguir com os próximos passos.</h4>
              </div>
              <div className="formContent"><label>Profissão</label><input type="text" name="profissao" value={formData.profissao} onChange={handleChange} /></div>
              <div className="formContent">
                <label>Procedimentos</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <select
                    value={procedimentoSelecionado}
                    onChange={(e) => setProcedimentoSelecionado(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {procedimentos
                      .filter((p) => !formData.procedimento.includes(p))
                      .map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (procedimentoSelecionado && !formData.procedimento.includes(procedimentoSelecionado)) {
                        setFormData((prev) => ({
                          ...prev,
                          procedimento: [...prev.procedimento, procedimentoSelecionado]
                        }));
                        setProcedimentoSelecionado("");
                      }
                    }}
                  >+</button>
                </div>
                <div style={{ marginTop: "10px" }}>
                  {formData.procedimento.map((p, index) => (
                    <span key={index} style={{ display: "inline-block", margin: "4px", background: "#eee", padding: "4px 8px", borderRadius: "12px" }}>
                      {p}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            procedimento: prev.procedimento.filter((item) => item !== p)
                          }));
                        }}
                        style={{ marginLeft: "6px", background: "transparent", border: "none", color: "red", cursor: "pointer" }}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="formContent"><label>Data de Contrato</label><input type="date" name="dataContrato" value={formData.dataContrato} onChange={handleChange} required /></div>
              <div className="formContent"><label>Data da Cirurgia</label><input type="date" name="dataCirurgia" value={formData.dataCirurgia} onChange={handleChange} required /></div>
              <div className="formContent"><label>Status</label><select name="status" value={formData.status} onChange={handleChange} required>
                {statusList.map((s, i) => <option key={i} value={s}>{s || "Selecione"}</option>)}
              </select></div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="formContainer">
            <div className="formContentEsq">
              <img src={"formsImage.jpeg"} alt="formsImage" />
            </div>
            <div className="formContentDir">
              <div className="formContentDirText">
                <h4>Utilize este formulário para registrar os dados pessoais do paciente para seguir com os próximos passos.</h4>
              </div>
              <div className="formContent"><label>Foto</label><input type="file" name="foto" accept="image/*" onChange={handleFileChange} /></div>
              <div className="formContentNewButtons">
                <button onClick={prevStep}>Voltar</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="contentButton">
      <button className="btn_newPatients" onClick={() => setModalAberto(true)}>Adicionar Paciente</button>

      {modalAberto && (
        <div
          className="containerNewPatient"
          onClick={(e) => {
            if (e.target.classList.contains("containerNewPatient")) {
              setModalAberto(false);
              setPacienteEditando(null);
            }
          }}
        >
          <div className="contentNewPatient">
            <form onSubmit={handleSubmit}>
              {renderStep()}
              <div className="contentNewPatientButton">
                {formStep > 0 && <button onClick={prevStep}>Voltar</button>}
                {formStep < 2 && <button onClick={nextStep}>Próximo</button>}
                {formStep === 2 && (
                  <button type="submit">
                    {pacienteEditando !== null ? "Salvar Alterações" : "Adicionar"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}