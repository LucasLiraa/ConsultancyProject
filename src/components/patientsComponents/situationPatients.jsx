import React, { useState, useEffect } from 'react';
import '../styles/patientsStyles/situationPatients.css';

const TabComponent = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [showForm, setShowForm] = useState(false);
  const [recordType, setRecordType] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [showDetailsIndex, setShowDetailsIndex] = useState(null);

  const [registros, setRegistros] = useState(() => {
    const saved = localStorage.getItem('registros');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('registros', JSON.stringify(registros));
  }, [registros]);

  const [formData, setFormData] = useState({
    titulo: '',
    data: '',
    valor: '',
    formaPagamento: '',
    tipoPagamento: '',
    descricao: '',
  });

  const handleAddRecordClick = () => {
    setShowForm(true);
    setRecordType('');
    setEditIndex(null);
    setFormData({
      titulo: '',
      data: '',
      valor: '',
      formaPagamento: '',
      tipoPagamento: '',
      descricao: '',
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setRecordType('');
    setEditIndex(null);
    setFormData({
      titulo: '',
      data: '',
      valor: '',
      formaPagamento: '',
      tipoPagamento: '',
      descricao: '',
    });
  };

  const handleEdit = (index) => {
    const record = registros[index];
    setFormData({
      titulo: record.titulo || '',
      data: record.data || '',
      valor: record.valor || '',
      formaPagamento: record.formaPagamento || '',
      tipoPagamento: record.tipoPagamento || '',
      descricao: record.descricao || '',
    });
    setRecordType(record.tipo);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updated = [...registros];
    updated.splice(index, 1);
    setRegistros(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      tipo: recordType,
      ...formData,
    };
    if (editIndex !== null) {
      const updated = [...registros];
      updated[editIndex] = newRecord;
      setRegistros(updated);
    } else {
      setRegistros([...registros, newRecord]);
    }
    handleCloseForm();
  };

  const renderFormFields = () => (
    <>
  <span className='contentSituationFormSpan'>
    <label className='contentSituationFormLabel'>Título</label>
    <input
      type="text"
      value={formData.titulo}
      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
      required
    />
  </span>
  <span className='contentSituationFormSpan'>
    <label className='contentSituationFormLabel'>Data</label>
    <input
      type="date"
      value={formData.data}
      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
      required
    />
  </span>

  {recordType === 'financeiro' && (
    <>
      <span className='contentSituationFormSpan'>
        <label className='contentSituationFormLabel'>Valor do pagamento</label>
        <input
          type="number"
          value={formData.valor}
          onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
          required
        />
      </span>
      <span className='contentSituationFormSpan'>
        <label className='contentSituationFormLabel'>Forma de pagamento</label>
        <select
          value={formData.formaPagamento}
          onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
          required
        >
          <option value="">Selecione</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="boleto">Boleto</option>
          <option value="pix">Pix</option>
          <option value="debito">Cartão de Débito</option>
          <option value="credito">Cartão de Crédito</option>
        </select>
      </span>
      <span className='contentSituationFormSpan'>
        <label className='contentSituationFormLabel'>Tipo do pagamento</label>
        <select
          value={formData.tipoPagamento}
          onChange={(e) => setFormData({ ...formData, tipoPagamento: e.target.value })}
          required
        >
          <option value="">Selecione</option>
          <option value="hospital">Hospital</option>
          <option value="honorario">Honorário</option>
          <option value="protese">Prótese</option>
          <option value="outros">Outros</option>
        </select>
      </span>
    </>
    )}
    <span className='contentSituationFormSpan'>
      <label className='contentSituationFormLabel'>Descrição</label>
      <textarea
        value={formData.descricao}
        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
      />
    </span>
    <span className='contentSituationFormSpan'>
      <label className='contentSituationFormLabel'>Nota Fiscal?</label>
      <select
        value={formData.temNotaFiscal}
        onChange={(e) => setFormData({ ...formData, temNotaFiscal: e.target.value })}
        required
      >
        <option value="">Selecione</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
      </select>
    </span>
    {formData.temNotaFiscal === 'sim' && (
      <span className='contentSituationFormSpan'>
        <label className='contentSituationFormLabel'>Nota Fiscal</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFormData({ ...formData, comprovantePagamento: e.target.files[0] })}
        />
      </span>
    )}
    <span className='contentSituationFormSpan'>
      <label className='contentSituationFormLabel'>Comprovante de Pagamento</label>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => setFormData({ ...formData, comprovantePagamento: e.target.files[0] })}
      />
    </span>
  </>

  );

  const renderContent = () => {
    const filteredRecords = activeTab === 'tab1'
      ? registros
      : registros.filter(r => r.tipo === (activeTab === 'tab2' ? 'financeiro' : 'cirurgico'));

    return (
      <div className='contentSituation'>
        <div className='contentSituationRegisters listWrapper'>
          {filteredRecords.map((r, i) => (
            <div key={i} className='recordItem'>
              <div className='recordBullet' />
              <div className='recordMain'>
                <div className='recordHeader'>
                  <strong>{r.titulo}</strong>
                  <small>{r.data}</small>
                  {r.tipo === 'financeiro' && <small>R$ {r.valor}</small>}
                  <button onClick={() => setShowDetailsIndex(i)}>Ver mais</button>
                </div>
                {showDetailsIndex === i && (
                  <div className='recordDetails'>
                    <p><strong>Descrição:</strong> {r.descricao}</p>
                    {r.tipo === 'financeiro' && (
                      <>
                        <p><strong>Forma:</strong> {r.formaPagamento}</p>
                        <p><strong>Tipo:</strong> {r.tipoPagamento}</p>
                      </>
                    )}
                    <button onClick={() => handleEdit(i)}>Editar</button>
                    <button onClick={() => handleDelete(i)}>Excluir</button>
                    <button onClick={() => setShowDetailsIndex(null)}>Fechar</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className='contentSituationButton' onClick={handleAddRecordClick}>
          Adicionar registro
        </button>

        {showForm && (
          <div className="containerSituationForm">
            <div className="contentSituationFormButtons">
              <div className="contentSituationFormType">
                <button
                  className={recordType === 'financeiro' ? 'active' : ''}
                  onClick={() => setRecordType('financeiro')}
                  type="button"
                >
                  Registro Financeiro
                </button>
                <div>|</div>
                <button
                  className={recordType === 'cirurgico' ? 'active' : ''}
                  onClick={() => setRecordType('cirurgico')}
                  type="button"
                >
                  Registro Cirúrgico
                </button>
              </div>

              {recordType && (
                <form className="recordForm" onSubmit={handleSubmit}>
                  <div className="contentSituationForm">
                    {renderFormFields()}
                  </div>

                  <div className="formActions">
                    <button type="submit">Salvar</button>
                    <button type="button" onClick={handleCloseForm}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='patientSituation'>
      <div className='containerSituationOptions'>
        <button className={activeTab === 'tab1' ? 'selected' : ''} onClick={() => setActiveTab('tab1')}>
          Geral
        </button>
        <button className={activeTab === 'tab2' ? 'selected' : ''} onClick={() => setActiveTab('tab2')}>
          Financeiro
        </button>
        <button className={activeTab === 'tab3' ? 'selected' : ''} onClick={() => setActiveTab('tab3')}>
          Cirúrgico
        </button>
      </div>

      <div className='containerSituation'>
        {renderContent()}
      </div>
    </div>
  );
};

export default TabComponent;
