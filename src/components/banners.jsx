import React, { useEffect, useState } from "react";
import "./styles/banners.css";

const Banners = ({ usuario }) => {
  const [dataHora, setDataHora] = useState(new Date());

  // Atualiza a cada minuto
  useEffect(() => {
    const intervalo = setInterval(() => {
      setDataHora(new Date());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  // Função para formatar a data
  const formatarDataHora = (data) => {
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Função para saudação
  const saudacao = () => {
    const hora = dataHora.getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="bannerheader">
      <div className="bannerCardHours">
        {formatarDataHora(dataHora)}
      </div>

      <div className="bannerCardTexts">
        {saudacao()}, Dr. Paulo!{usuario}
        <p>Visualize os procedimentos de hoje e organize seu dia com facilidade.</p>
      </div>
    </div>
  );
};

export default Banners;
