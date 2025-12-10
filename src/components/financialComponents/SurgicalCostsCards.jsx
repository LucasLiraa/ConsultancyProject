<<<<<<< HEAD
import React from "react";
import { motion } from "framer-motion";

const SurgicalCostsCards = ({ data }) => {
  const categorias = [
    { nome: "Hospital", valor: data.hospital },
    { nome: "Próteses", valor: data.protese },
    { nome: "Equipamentos", valor: data.equipamentos },
    { nome: "Equipe Cirúrgica", valor: data.equipe },
  ];

  return (
    <div className="surgical-costs">
      {categorias.map((c, i) => (
        <motion.div
          key={i}
          className="cost-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <h4>{c.nome}</h4>
          <p>R$ {c.valor.toLocaleString("pt-BR")}</p>
        </motion.div>
      ))}
    </div>
  );
};

=======
import React from "react";
import { motion } from "framer-motion";

const SurgicalCostsCards = ({ data }) => {
  const categorias = [
    { nome: "Hospital", valor: data.hospital },
    { nome: "Próteses", valor: data.protese },
    { nome: "Equipamentos", valor: data.equipamentos },
    { nome: "Equipe Cirúrgica", valor: data.equipe },
  ];

  return (
    <div className="surgical-costs">
      {categorias.map((c, i) => (
        <motion.div
          key={i}
          className="cost-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <h4>{c.nome}</h4>
          <p>R$ {c.valor.toLocaleString("pt-BR")}</p>
        </motion.div>
      ))}
    </div>
  );
};

>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
export default SurgicalCostsCards;