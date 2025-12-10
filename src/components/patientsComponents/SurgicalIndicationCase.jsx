import React from "react";
import "../styles/patientsStyles/formsPatients.css";

export default function SurgicalIndicationCase({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => {
        const current = prev.indicacaoCirurgica?.[name] || [];
        return {
          ...prev,
          indicacaoCirurgica: {
            ...prev.indicacaoCirurgica,
            [name]: checked
              ? [...current, value]
              : current.filter((item) => item !== value),
          },
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        indicacaoCirurgica: {
          ...prev.indicacaoCirurgica,
          [name]: value,
        },
      }));
    }
  };

  const renderCheckboxGroup = (titulo, name, opcoes) => (
    <div className="surgical-section">
      <h4>{titulo}</h4>
      {opcoes.map((opcao) => (
        <label key={opcao}>
          <input
            type="checkbox"
            name={name}
            value={opcao}
            checked={formData.indicacaoCirurgica?.[name]?.includes(opcao)}
            onChange={handleChange}
          />
          {opcao}
        </label>
      ))}
    </div>
  );

  return (
    <div className="formContent surgicalCase">
      <h3>Indicação Cirúrgica</h3>

      {renderCheckboxGroup("Mamas", "mamas", [
        "Mamoplastia Redutora",
        "Mamoplastia de Aumento",
        "Mastopexia com Prótese",
        "Mastopexia sem Prótese",
        "Mastopexia com Troca de Prótese",
        "Correção de Simetria Mamária",
        "Retirada de Prótese Mamária",
        "Troca de Prótese Mamária",
        "Gigantomastia",
      ])}

      {renderCheckboxGroup("Abdômen", "abdomen", [
        "Abdominoplastia",
        "Abdominoplastia com Correção de Diástase",
        "Lipoabdominoplastia (Dupla)",
        "Hérnia Umbilical",
        "Abdômen Invertido",
      ])}

      {renderCheckboxGroup("Lipoaspiração / Lipoescultura", "lipo", [
        "Lipoescultura Circunferencial",
        "Lipo de Monte de Vênus",
        "Lipo de Braço",
        "Lipo de Coxa e Joelhos",
        "Lipo de Culote",
        "Lipo Bananinha",
        "Lipo Costas Superiores",
        "Lipo Costas Inferiores",
        "Lipo Abdômen Superior",
        "Lipo Abdômen Inferior",
        "Lipo Flancos",
        "Lipo Torso (Torso plastia)",
      ])}

      {/* Lipo Áreas condicionais */}
      {formData.indicacaoCirurgica?.lipo?.includes("Lipoescultura Circunferencial") && (
        <>
          {renderCheckboxGroup("Lipoescultura - Áreas", "lipo_areas", [
            "Abdômen",
            "Coxas",
            "Culotes",
            "Flancos",
            "Braços",
            "Costas",
            "Papada",
          ])}
          {renderCheckboxGroup("Lipo HD Tecnologia", "lipo_hd", [
            "Laser",
            "Retraction",
            "MicroAre",
          ])}
        </>
      )}

      {renderCheckboxGroup("Área Íntima", "intima", ["Ninfoplastia"])}

      {renderCheckboxGroup("Braços", "bracos", ["Braquioplastia"])}

      {renderCheckboxGroup("Pernas e Glúteos", "pernas_gluteos", [
        "Lifting de Coxas",
        "Gluteoplastia (Prótese de Glúteo)",
        "Enxerto de Gordura (Lipoenxertia)",
      ])}

      <h4>Informações Complementares</h4>
      <label>Número de Cirurgias:</label>
      <select
        name="num_cirurgias"
        value={formData.indicacaoCirurgica?.num_cirurgias || ""}
        onChange={handleChange}
      >
        <option value="">Selecione...</option>
        <option value="Única">Única</option>
        <option value="Dupla">Dupla</option>
        <option value="Tripla">Tripla</option>
        <option value="Outros">Outros</option>
      </select>
      {formData.indicacaoCirurgica?.num_cirurgias === "Outros" && (
        <input
          type="text"
          name="num_cirurgias_outros"
          value={formData.indicacaoCirurgica?.num_cirurgias_outros || ""}
          onChange={handleChange}
          placeholder="Especifique..."
        />
      )}

      <label>Tempo Estimado de Cirurgia (horas):</label>
      <input
        type="number"
        name="tempo_cirurgia"
        value={formData.indicacaoCirurgica?.tempo_cirurgia || ""}
        onChange={handleChange}
      />

      <label>Tipo de Anestesia:</label>
      <select
        name="anestesia"
        value={formData.indicacaoCirurgica?.anestesia || ""}
        onChange={handleChange}
      >
        <option value="">Selecione...</option>
        <option value="Local">Local</option>
        <option value="Regional">Regional</option>
        <option value="Geral">Geral</option>
        <option value="Local com sedação">Local com sedação</option>
      </select>

      <h4>Prótese Mamária</h4>
      <label>Marca:</label>
      <select
        name="protese_marca"
        value={formData.indicacaoCirurgica?.protese_marca || ""}
        onChange={handleChange}
      >
        <option value="">Selecione...</option>
        <option value="Silimed">Silimed</option>
        <option value="Lifesil">Lifesil</option>
        <option value="Outras">Outras</option>
      </select>
      {formData.indicacaoCirurgica?.protese_marca === "Outras" && (
        <input
          type="text"
          name="protese_marca_outros"
          value={formData.indicacaoCirurgica?.protese_marca_outros || ""}
          onChange={handleChange}
          placeholder="Especifique..."
        />
      )}

      <label>Revestimento:</label>
      <select
        name="protese_revestimento"
        value={formData.indicacaoCirurgica?.protese_revestimento || ""}
        onChange={handleChange}
      >
        <option value="">Selecione...</option>
        <option value="Poliuretano">Poliuretano</option>
        <option value="Texturizada">Texturizada</option>
        <option value="Microtextura">Microtextura</option>
        <option value="Macrotextura">Macrotextura</option>
      </select>

      <label>Perfil:</label>
      <select
        name="protese_perfil"
        value={formData.indicacaoCirurgica?.protese_perfil || ""}
        onChange={handleChange}
      >
        <option value="">Selecione...</option>
        <option value="LO">LO</option>
        <option value="MD">MD</option>
        <option value="HI">HI</option>
        <option value="XH">XH</option>
      </select>

      <label>Volume (ml):</label>
      <input
        type="text"
        name="protese_volume"
        value={formData.indicacaoCirurgica?.protese_volume || ""}
        onChange={handleChange}
      />

      <h4>Equipe Cirúrgica</h4>
      <label>Médico Auxiliar?</label>
      <select
        name="tem_auxiliar"
        value={formData.indicacaoCirurgica?.tem_auxiliar || ""}
        onChange={handleChange}
      >
        <option value="">Selecione...</option>
        <option value="Sim">Sim</option>
        <option value="Não">Não</option>
      </select>
      {formData.indicacaoCirurgica?.tem_auxiliar === "Sim" && (
        <input
          type="text"
          name="auxiliar_nome"
          placeholder="Nome do médico auxiliar"
          value={formData.indicacaoCirurgica?.auxiliar_nome || ""}
          onChange={handleChange}
        />
      )}

      <label>Instrumentadoras (separe por vírgulas):</label>
      <input
        type="text"
        name="instrumentadoras"
        placeholder="Ex: Maria, Ana"
        value={formData.indicacaoCirurgica?.instrumentadoras || ""}
        onChange={handleChange}
      />

      {renderCheckboxGroup("Segurança e Suporte Intraoperatório", "seguranca", [
        "Sequel (bota pneumática)",
        "Taping Intraoperatório",
      ])}

      <label>Observações Importantes:</label>
      <textarea
        name="observacoes"
        value={formData.indicacaoCirurgica?.observacoes || ""}
        onChange={handleChange}
      />
    </div>
  );
}