import React, { useState, useEffect } from "react";
// Importar o componente de manutenção
import MaintenanceMode from "../components/MaintenanceMode"; // Assumindo que o arquivo está na mesma pasta
import { supabase } from "../utils/supabaseClient"; 
import "./styles/invoices.css"; 

// Função auxiliar para formatar valores (R$)
const formatCurrency = (value) => {
    if (value === null || value === undefined) return "R$ 0,00";
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Nome da tabela no Supabase
const TABLE_NAME = "surgical_records"; 

const Invoices = () => {
  
  // 💡 Você pode adicionar uma variável de estado ou uma flag para gerenciar o modo de manutenção, 
  // mas por enquanto, vamos apenas renderizá-lo diretamente.
  
  // ⚠️ QUANDO O SITE ESTIVER PRONTO, SIMPLESMENTE REMOVA O 'return <MaintenanceMode />; ' ABAIXO
  // E COLOQUE SEU CÓDIGO NORMAL DE FATURAS.

  return <MaintenanceMode />;

  // -------------------------------------------------------------
  // CÓDIGO ORIGINAL QUE SERIA EXECUTADO DEPOIS (NÃO SERÁ LIDO)
  // -------------------------------------------------------------
  return (
    // Componente principal usando a classe .sectionInvoices
    <section className="sectionInvoices surgical-records-container">
      { /* Aqui iria o seu código de faturas/registros cirúrgicos */ }
    </section>
  );
};

export default Invoices;