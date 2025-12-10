<<<<<<< HEAD
import React, { useState } from 'react';
import '../styles/budgetsStyles/FormulariosStyles.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PrevisualizacaoOrcamento = ({ formData, modulosSelecionados, onVoltar }) => {
  const [camposFinais, setCamposFinais] = useState({
    paciente: '',
    dataConsulta: '',
    previsaoCirurgia: '',
    tempoSala: '',
    tipoAnestesia: '',
    drenagem10: '',
    drenagem5: '',
    formaPagamento: '',
    entrada: '',
    parcelas: '',
    inicioParcelas: '',
    observacoes: '',
    consultora: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCamposFinais((prev) => ({ ...prev, [name]: value }));
  };

  const gerarPDF = async () => {
    const elemento = document.getElementById('area-pdf');
    if (!elemento) return;

    const canvas = await html2canvas(elemento, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;

        if (heightLeft > 0) {
        pdf.addPage();
        }
    }

    pdf.save(`orcamento-${camposFinais.paciente || 'paciente'}.pdf`);
    };


  return (
    <>
      <div className="resumoOrcamento" id="area-pdf">
        <h2>Resumo do Orçamento</h2>

        <div className="linhaFormulario">
          <label>Paciente:
            <input type="text" name="paciente" value={camposFinais.paciente} onChange={handleChange} />
          </label>
          <label>Data da Consulta:
            <input type="date" name="dataConsulta" value={camposFinais.dataConsulta} onChange={handleChange} />
          </label>
          <label>Previsão para Cirurgia:
            <input type="date" name="previsaoCirurgia" value={camposFinais.previsaoCirurgia} onChange={handleChange} />
          </label>
        </div>

        <div className="linhaFormulario">
          <label>Tipo de Anestesia:
            <input type="text" name="tipoAnestesia" value={camposFinais.tipoAnestesia} onChange={handleChange} />
          </label>
          <label>Tempo de Sala:
            <input type="text" name="tempoSala" value={camposFinais.tempoSala} onChange={handleChange} />
          </label>
        </div>

        <h3>Dados Preenchidos</h3>

        {Object.keys(formData).length === 0 ? (
        <p style={{ color: 'gray' }}>Nenhum dado preenchido.</p>
        ) : (
        Object.entries(formData).map(([modulo, dados]) => (
            <div key={modulo} className="resumoBloco">
            <h4>{modulo.charAt(0).toUpperCase() + modulo.slice(1)}</h4>
            <ul>
                {typeof dados === 'object' && dados !== null ? (
                Object.entries(dados).map(([chave, valor]) => (
                    <li key={chave + 1}>
                    <strong>{chave}:</strong>{' '}
                    {typeof valor === 'object' && valor !== null ? (
                        <ul style={{ marginTop: '4px' }}>
                        {Object.entries(valor).map(([subKey, subVal]) => (
                            <li key={subKey}>
                            {subKey} →{' '}
                            {typeof subVal === 'object' && subVal !== null ? (
                                <ul>
                                {Object.entries(subVal).map(([k, v]) => (
                                    <li key={k}>
                                    {k}: {v}
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                subVal?.toString()
                            )}
                            </li>
                        ))}
                        </ul>
                    ) : (
                        valor?.toString()
                    )}
                    </li>
                ))
                ) : (
                <li>{dados?.toString()}</li>
                )}
            </ul>
            </div>
        ))
        )}

        <h3>Forma de Pagamento</h3>
        <div className="linhaFormulario">
          <label>
            <select name="formaPagamento" value={camposFinais.formaPagamento} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="À vista (PIX)">À vista (PIX)</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Financiado">Financiado</option>
              <option value="Boleto">Boleto</option>
            </select>
          </label>
          <div className="linhaFormulario">
            <label>Valor de Entrada:
                <input
                type="text"
                name="entrada"
                value={camposFinais.entrada}
                onChange={handleChange}
                placeholder="Entrada R$"
                />
            </label>

            <label>Número de Parcelas:
                <input
                type="number"
                name="parcelas"
                value={camposFinais.parcelas}
                onChange={handleChange}
                placeholder="Parcelas"
                />
            </label>

            <label>Início das Parcelas:
                <input
                type="date"
                name="inicioParcelas"
                value={camposFinais.inicioParcelas}
                onChange={handleChange}
                />
            </label>
            </div>
        </div>

        <div className="linhaFormulario">
          <label>Consultora:
            <input type="text" name="consultora" value={camposFinais.consultora} onChange={handleChange} />
          </label>
          <label>Observações:
            <textarea name="observacoes" value={camposFinais.observacoes} onChange={handleChange} />
          </label>
        </div>
      </div>

      <div className="botoesNavegacao">
        <button onClick={onVoltar}>Voltar para edição</button>
        <button onClick={gerarPDF}>Salvar como PDF</button>
      </div>
    </>
  );
};

export default PrevisualizacaoOrcamento;
=======
import React, { useState } from 'react';
import '../styles/budgetsStyles/FormulariosStyles.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PrevisualizacaoOrcamento = ({ formData, modulosSelecionados, onVoltar }) => {
  const [camposFinais, setCamposFinais] = useState({
    paciente: '',
    dataConsulta: '',
    previsaoCirurgia: '',
    tempoSala: '',
    tipoAnestesia: '',
    drenagem10: '',
    drenagem5: '',
    formaPagamento: '',
    entrada: '',
    parcelas: '',
    inicioParcelas: '',
    observacoes: '',
    consultora: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCamposFinais((prev) => ({ ...prev, [name]: value }));
  };

  const gerarPDF = async () => {
    const elemento = document.getElementById('area-pdf');
    if (!elemento) return;

    const canvas = await html2canvas(elemento, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;

        if (heightLeft > 0) {
        pdf.addPage();
        }
    }

    pdf.save(`orcamento-${camposFinais.paciente || 'paciente'}.pdf`);
    };


  return (
    <>
      <div className="resumoOrcamento" id="area-pdf">
        <h2>Resumo do Orçamento</h2>

        <div className="linhaFormulario">
          <label>Paciente:
            <input type="text" name="paciente" value={camposFinais.paciente} onChange={handleChange} />
          </label>
          <label>Data da Consulta:
            <input type="date" name="dataConsulta" value={camposFinais.dataConsulta} onChange={handleChange} />
          </label>
          <label>Previsão para Cirurgia:
            <input type="date" name="previsaoCirurgia" value={camposFinais.previsaoCirurgia} onChange={handleChange} />
          </label>
        </div>

        <div className="linhaFormulario">
          <label>Tipo de Anestesia:
            <input type="text" name="tipoAnestesia" value={camposFinais.tipoAnestesia} onChange={handleChange} />
          </label>
          <label>Tempo de Sala:
            <input type="text" name="tempoSala" value={camposFinais.tempoSala} onChange={handleChange} />
          </label>
        </div>

        <h3>Dados Preenchidos</h3>

        {Object.keys(formData).length === 0 ? (
        <p style={{ color: 'gray' }}>Nenhum dado preenchido.</p>
        ) : (
        Object.entries(formData).map(([modulo, dados]) => (
            <div key={modulo} className="resumoBloco">
            <h4>{modulo.charAt(0).toUpperCase() + modulo.slice(1)}</h4>
            <ul>
                {typeof dados === 'object' && dados !== null ? (
                Object.entries(dados).map(([chave, valor]) => (
                    <li key={chave + 1}>
                    <strong>{chave}:</strong>{' '}
                    {typeof valor === 'object' && valor !== null ? (
                        <ul style={{ marginTop: '4px' }}>
                        {Object.entries(valor).map(([subKey, subVal]) => (
                            <li key={subKey}>
                            {subKey} →{' '}
                            {typeof subVal === 'object' && subVal !== null ? (
                                <ul>
                                {Object.entries(subVal).map(([k, v]) => (
                                    <li key={k}>
                                    {k}: {v}
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                subVal?.toString()
                            )}
                            </li>
                        ))}
                        </ul>
                    ) : (
                        valor?.toString()
                    )}
                    </li>
                ))
                ) : (
                <li>{dados?.toString()}</li>
                )}
            </ul>
            </div>
        ))
        )}

        <h3>Forma de Pagamento</h3>
        <div className="linhaFormulario">
          <label>
            <select name="formaPagamento" value={camposFinais.formaPagamento} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="À vista (PIX)">À vista (PIX)</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Financiado">Financiado</option>
              <option value="Boleto">Boleto</option>
            </select>
          </label>
          <div className="linhaFormulario">
            <label>Valor de Entrada:
                <input
                type="text"
                name="entrada"
                value={camposFinais.entrada}
                onChange={handleChange}
                placeholder="Entrada R$"
                />
            </label>

            <label>Número de Parcelas:
                <input
                type="number"
                name="parcelas"
                value={camposFinais.parcelas}
                onChange={handleChange}
                placeholder="Parcelas"
                />
            </label>

            <label>Início das Parcelas:
                <input
                type="date"
                name="inicioParcelas"
                value={camposFinais.inicioParcelas}
                onChange={handleChange}
                />
            </label>
            </div>
        </div>

        <div className="linhaFormulario">
          <label>Consultora:
            <input type="text" name="consultora" value={camposFinais.consultora} onChange={handleChange} />
          </label>
          <label>Observações:
            <textarea name="observacoes" value={camposFinais.observacoes} onChange={handleChange} />
          </label>
        </div>
      </div>

      <div className="botoesNavegacao">
        <button onClick={onVoltar}>Voltar para edição</button>
        <button onClick={gerarPDF}>Salvar como PDF</button>
      </div>
    </>
  );
};

export default PrevisualizacaoOrcamento;
>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
