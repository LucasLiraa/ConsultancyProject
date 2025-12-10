import React, { useState, useEffect } from 'react';
import '../../styles/budgetsStyles/FormulariosStyles.css';

const procedimentosBase = [
  { nome: 'Lipoescultura', valor: 7000 },
  { nome: 'Abdominoplastia', valor: 3000 },
  { nome: 'Lipoabdominoplastia', valor: 9000 },
  { nome: 'Lipo por área', valor: 2500 },
  { nome: 'Lipo M', valor: 5500 },
  { nome: 'Prótese de Mama', valor: 5000 },
  { nome: 'Mastopexia', valor: 7500 },
  { nome: 'Mamoplastia', valor: 7500 },
  { nome: 'Gigantomastia', valor: 10000 },
  { nome: 'Ninfoplastia', valor: 4000 },
  { nome: 'Blefaroplastia', valor: 5500 },
  { nome: 'Botox', valor: 1000 },
  { nome: 'Clexane', valor: 350 },
  { nome: 'Instrumentação', valor: 650 },
  { nome: 'Sequel', valor: 500 },
  { nome: 'Kit Cirúrgico 1', valor: 600, observacao: '1-Cinta+placas+meia' },
  { nome: 'Kit Cirúrgico 2', valor: 250, observacao: '1-sutiã+meia' },
  { nome: 'Consultora', valor: 350 },
  { nome: '6 Seringas', valor: 0 },
  { nome: 'Flancoplastia', valor: 5000 },
  { nome: 'Torsoplastia', valor: 5000 },
  { nome: 'Hidrolipo', valor: 0 },
];

const FormularioCirurgia = ({ data, onChange }) => {
  const [procedimentos, setProcedimentos] = useState(
    Array.isArray(data) && data.length > 0
      ? data
      : [{ tipo: '', valor: '', observacoes: '' }]
  );


  useEffect(() => {
    onChange(procedimentos);
  }, []); // envia os dados iniciais caso já existam

  const handleProcedimentoChange = (index, field, value) => {
    const novosProcedimentos = [...procedimentos];
    novosProcedimentos[index][field] = value;

    if (field === 'tipo') {
      const encontrado = procedimentosBase.find(p => p.nome === value);
      if (encontrado) {
        novosProcedimentos[index].valor = encontrado.valor;
        novosProcedimentos[index].observacoes = encontrado.observacao || '';
      }
    }

    setProcedimentos(novosProcedimentos);
    onChange(novosProcedimentos);
  };

  const adicionarProcedimento = () => {
    const novos = [...procedimentos, { tipo: '', valor: '', observacoes: '' }];
    setProcedimentos(novos);
    onChange(novos);
  };

  const removerProcedimento = (index) => {
    const novos = procedimentos.filter((_, i) => i !== index);
    setProcedimentos(novos);
    onChange(novos);
  };

  const somaTotal = procedimentos.reduce((acc, p) => acc + Number(p.valor || 0), 0);

  return (
    <div className="formStep">
      <h2>Procedimentos Cirúrgicos</h2>

      {procedimentos.map((proc, index) => (
        <div key={index} className="procedimentoContainer">
          <label>
            Tipo de Cirurgia:
            <select
              value={proc.tipo}
              onChange={(e) => handleProcedimentoChange(index, 'tipo', e.target.value)}
            >
              <option value="">Selecione</option>
              {procedimentosBase.map((p, i) => (
                <option key={i} value={p.nome}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Valor (R$):
            <input
              type="number"
              value={proc.valor}
              onChange={(e) => handleProcedimentoChange(index, 'valor', e.target.value)}
            />
          </label>

          <label>
            Observações:
            <textarea
              value={proc.observacoes}
              onChange={(e) => handleProcedimentoChange(index, 'observacoes', e.target.value)}
              placeholder="Detalhes adicionais sobre o procedimento..."
              rows={3}
            />
          </label>

          {index > 0 && (
            <button className='buttonFormBudget'type="button" onClick={() => removerProcedimento(index)}>
              Remover
            </button>
          )}
        </div>
      ))}

      <button className='buttonFormBudget' type="button" onClick={adicionarProcedimento}>
        + Adicionar Procedimento
      </button>

      <div className="somaContainer">
        <h3>Resumo</h3>
        {procedimentos.map((p, i) => (
          <p key={i}>
            {p.tipo || 'Procedimento não definido'}: R$ {Number(p.valor || 0).toFixed(2)}
          </p>
        ))}
        <strong>Total: R$ {somaTotal.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default FormularioCirurgia;