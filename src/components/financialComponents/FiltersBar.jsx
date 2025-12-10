import React from "react";
import { motion } from "framer-motion";

const FiltersBar = ({ periodo, setPeriodo }) => {
  const periodos = ["anual", "semestral", "trimestral", "mensal"];

  return (
    <motion.div
      className="filters-bar"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {periodos.map((p) => (
        <button
          key={p}
          className={periodo === p ? "ativo" : ""}
          onClick={() => setPeriodo(p)}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </motion.div>
  );
};

export default FiltersBar;