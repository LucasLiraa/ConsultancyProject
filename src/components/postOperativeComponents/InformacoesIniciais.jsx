import React from "react";
import "../styles/postOperativeStyles/InformacoesIniciais.css";

function InformacoesIniciais({ dados, setDados }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setDados((prev) => {
        const atualizado = checked
          ? [...prev.anestesia, value]
          : prev.anestesia.filter((a) => a !== value);
        return { ...prev, anestesia: atualizado };
      });
    } else {
      setDados((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="informacoesIniciais">
      <h2>Informações Iniciais</h2>

      <label>Nome do paciente:</label>
      <input
        type="text"
        name="nome"
        value={dados.nome}
        onChange={handleChange}
      />

      <label>Cirurgia realizada:</label>
      <input
        type="text"
        name="cirurgia"
        value={dados.cirurgia}
        onChange={handleChange}
      />

      <label>Data da cirurgia:</label>
      <input
        type="date"
        name="dataCirurgia"
        value={dados.dataCirurgia}
        onChange={handleChange}
      />

      <label>Cirurgião auxiliar (opcional):</label>
      <input
        type="text"
        name="auxiliar"
        value={dados.auxiliar}
        onChange={handleChange}
      />

      <label>Instrumentadora (opcional):</label>
      <input
        type="text"
        name="instrumentadora"
        value={dados.instrumentadora}
        onChange={handleChange}
      />

      <label>Dias de atestado:</label>
      <input
        type="number"
        name="diasAtestado"
        value={dados.diasAtestado}
        onChange={handleChange}
      />

      <fieldset>
        <legend>Anestesia:</legend>
        {[
          "Peridural",
          "Geral com intubação",
          "Geral",
          "Sedação",
          "Bloqueio",
          "Local"
        ].map((tipo) => (
          <label key={tipo}>
            <input
              type="checkbox"
              value={tipo}
              checked={dados.anestesia.includes(tipo)}
              onChange={handleChange}
            />
            {tipo}
          </label>
        ))}
      </fieldset>

      <label>Observações:</label>
      <textarea
        name="observacoes"
        value={dados.observacoes}
        onChange={handleChange}
      />
    </div>
  );
}

export default InformacoesIniciais;