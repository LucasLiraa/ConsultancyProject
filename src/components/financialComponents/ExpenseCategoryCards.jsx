<<<<<<< HEAD
import React from "react";
import { motion } from "framer-motion";

const ExpenseCategoryCards = ({ data = {} }) => {
  // Garantindo valores default para evitar erro quando o componente renderiza antes dos dados chegarem
  const {
    protese = 0,
    hospital = 0,
    equipamentos = 0,
    equipe = 0,
  } = data;

  const categorias = [
    { nome: "Próteses", valor: protese, cor: "#00BFA6" },
    { nome: "Hospitais", valor: hospital, cor: "#007AFF" },
    { nome: "Tecnologias", valor: equipamentos, cor: "#8B5CF6" },
    { nome: "Profissionais", valor: equipe, cor: "#FF6B6B" },
  ];

  return (
    <div className="expense-categories">
      {categorias.map((c, i) => (
        <motion.div
          key={i}
          className="expense-card"
          style={{ borderTop: `4px solid ${c.cor}` }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h4>{c.nome}</h4>
          <p>
            {c.valor !== undefined && c.valor !== null
              ? `R$ ${c.valor.toLocaleString("pt-BR")}`
              : "R$ 0,00"}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

=======
import React from "react";
import { motion } from "framer-motion";

const ExpenseCategoryCards = ({ data = {} }) => {
  // Garantindo valores default para evitar erro quando o componente renderiza antes dos dados chegarem
  const {
    protese = 0,
    hospital = 0,
    equipamentos = 0,
    equipe = 0,
  } = data;

  const categorias = [
    { nome: "Próteses", valor: protese, cor: "#00BFA6" },
    { nome: "Hospitais", valor: hospital, cor: "#007AFF" },
    { nome: "Tecnologias", valor: equipamentos, cor: "#8B5CF6" },
    { nome: "Profissionais", valor: equipe, cor: "#FF6B6B" },
  ];

  return (
    <div className="expense-categories">
      {categorias.map((c, i) => (
        <motion.div
          key={i}
          className="expense-card"
          style={{ borderTop: `4px solid ${c.cor}` }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <h4>{c.nome}</h4>
          <p>
            {c.valor !== undefined && c.valor !== null
              ? `R$ ${c.valor.toLocaleString("pt-BR")}`
              : "R$ 0,00"}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
export default ExpenseCategoryCards;