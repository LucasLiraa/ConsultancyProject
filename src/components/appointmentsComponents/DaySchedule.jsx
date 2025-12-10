<<<<<<< HEAD
import { useEffect, useState } from 'react';
import '../styles/appointmentsStyles/DaySchedule.css';
import { supabase } from "../../utils/supabaseClient"; 

// cores por tipo
const typeColors = {
  "Consulta presencial": "blue",
  "Consulta online": "blue",
  "Cirurgia": "navy",
  "Entrega de exames": "purple",
  "Dúvidas presencial": "orange",
  "Dúvidas online": "orange",
  "Fechamento": "green",
  "Drenagem": "pink",
  "Pós-operatório": "darkred",
  "Drenagem + pós-operatório": "linear-gradient(90deg, pink, darkred)",
  "Procedimento facial": "gray"
};

const generateTimeSlots = (start, end, intervalMinutes) => {
  const slots = [];
  let [h, m] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  while (h < endH || (h === endH && m <= endM)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += intervalMinutes;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
  }
  return slots;
};

const DaySchedule = ({
  selectedDate,
  events,
  setEvents,
  abrirModal,
  setAbrirModal,
  onSelectEvent,
  editTarget,
  reloadKey,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    time: '',
    title: '',
    type: 'Consulta presencial',
    description: '',
    procedure: '',
    hospital: '',
    auxiliar: '',
    instrumentadora: [''],
    protese: '',
    tecnologia: '',
  });

  // data para DB sem timezone
  const dateKey = selectedDate.toLocaleDateString('en-CA'); 
  // exibição PT-BR
  const formattedDisplayDate = selectedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // fetch quando date ou reloadKey mudar
  const fetchEventsForDate = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('date', dateKey)
        .order('time', { ascending: true });

      if (error) throw error;
      // instrumentadora pode ser JSON string ou array — ajustar
      const normalized = (data || []).map((d) => ({
        ...d,
        instrumentadora: d.instrumentadora ? (typeof d.instrumentadora === 'string' ? JSON.parse(d.instrumentadora) : d.instrumentadora) : [],
      }));
      setEvents(normalized);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    }
  };

  useEffect(() => {
    fetchEventsForDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, reloadKey]);

  // quando editTarget for definido pelo pai, abrir modal preenchido
  useEffect(() => {
    if (editTarget) {
      setIsEditing(true);
      setEditId(editTarget.id || null);
      setFormData({
        ...editTarget,
        instrumentadora: editTarget.instrumentadora
          ? (Array.isArray(editTarget.instrumentadora) ? editTarget.instrumentadora : JSON.parse(editTarget.instrumentadora))
          : [''],
      });
      setAbrirModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTarget]);

  const handleOpenForm = (event = null) => {
    setIsEditing(!!event);
    setEditId(event?.id || null);
    setFormData(
      event
        ? {
            ...event,
            instrumentadora: event.instrumentadora
              ? (Array.isArray(event.instrumentadora) ? event.instrumentadora : JSON.parse(event.instrumentadora))
              : [''],
          }
        : {
            time: '',
            title: '',
            type: 'Consulta presencial',
            description: '',
            procedure: '',
            hospital: '',
            auxiliar: '',
            instrumentadora: [''],
            protese: '',
            tecnologia: '',
          }
    );
    setAbrirModal(true);
  };

  const handleCloseForm = () => {
    setAbrirModal(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({
      time: '',
      title: '',
      type: 'Consulta presencial',
      description: '',
      procedure: '',
      hospital: '',
      auxiliar: '',
      instrumentadora: [''],
      protese: '',
      tecnologia: '',
    });
  };

  const handleInstrumentadoraChange = (index, value) => {
    const updated = [...(formData.instrumentadora || [])];
    updated[index] = value;
    setFormData({ ...formData, instrumentadora: updated });
  };

  const handleAddInstrumentadora = () => {
    setFormData({ ...formData, instrumentadora: [...(formData.instrumentadora || []), ''] });
  };

  const handleSubmit = async () => {
    if (!formData.time || !formData.title) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const payload = {
        ...formData,
        date: dateKey,
        instrumentadora: JSON.stringify(formData.instrumentadora || []),
        updated_at: new Date(),
      };

      if (isEditing && editId) {
        const { error } = await supabase
          .from('agendamentos')
          .update(payload)
          .eq('id', editId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('agendamentos')
          .insert([{ ...payload, created_at: new Date() }]);

        if (error) throw error;
      }

      await fetchEventsForDate();
      handleCloseForm();
    } catch (err) {
      console.error("Erro ao salvar agendamento:", err);
      alert("Erro ao salvar. Veja console.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const ok = window.confirm('Confirma exclusão?');
      if (!ok) return;
      const { error } = await supabase.from('agendamentos').delete().eq('id', id);
      if (error) throw error;
      await fetchEventsForDate();
      // se estava sendo mostrado nos detalhes, deixar o pai limpar (pai deve reagir ao reloadKey)
      onSelectEvent && onSelectEvent(null);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir. Veja console.");
    }
  };

  const handleReschedule = async (id, oldData) => {
    const newDate = prompt('Nova data (AAAA-MM-DD):', oldData.date);
    const newTime = prompt('Novo horário (HH:mm):', oldData.time);
    if (!newDate || !newTime) return;
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ date: newDate, time: newTime, updated_at: new Date() })
        .eq('id', id);
      if (error) throw error;
      await fetchEventsForDate();
    } catch (err) {
      console.error("Erro ao reagendar:", err);
      alert("Erro ao reagendar. Veja console.");
    }
  };

  return (
    <div className='appointmentsDay'>
      <h3>Agendamentos para {formattedDisplayDate}</h3>

      {events.length === 0 && <p className="noEvents">Nenhum agendamento.</p>}

      <div className="appointmentsList">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="appointmentCard"
            /* não chame onSelectEvent no card inteiro, deixamos botão */
          >
            <div className="appointmentInfo">
              <div>
                <strong className="appointmentTime">{event.time}</strong>
                <h4 className="appointmentTitle">{event.title}</h4>
                {event.description && <p className="appointmentDescription">{event.description}</p>}
              </div>
              <span className="appointmentType" style={{ background: typeColors[event.type] || '#999' }}>
                {event.type}
              </span>
            </div>

            <div className="appointmentActions">
              <button onClick={() => onSelectEvent && onSelectEvent(event)}>Ver detalhes</button>
            </div>
          </div>
        ))}
      </div>

      {abrirModal && (
        <div className="appointmentsFormOverlay" onClick={handleCloseForm}>
          <div className="appointmentsForm" onClick={(e) => e.stopPropagation()}>
            <h4>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</h4>

            <label>Título:</label>
            <input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />

            <label>Tipo:</label>
            <select value={formData.type || 'Consulta presencial'} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              {Object.keys(typeColors).map((t) => <option key={t}>{t}</option>)}
            </select>

            <label>Horário:</label>
            <select value={formData.time || ''} onChange={(e) => setFormData({ ...formData, time: e.target.value })}>
              <option value="">Selecione um horário</option>
              {generateTimeSlots('06:00', '20:00', 30).map((time) => <option key={time} value={time}>{time}</option>)}
            </select>
      
            {(formData.type === 'Cirurgia' || formData.type === 'Cirúrgia') && (
              <>
                <label>Procedimento:</label>
                <input value={formData.procedure || ''} onChange={(e) => setFormData({ ...formData, procedure: e.target.value })} />

                <label>Médico Auxiliar:</label>
                <input value={formData.auxiliar || ''} onChange={(e) => setFormData({ ...formData, auxiliar: e.target.value })} />

                <label>Instrumentadora(s):</label>
                {(formData.instrumentadora || ['']).map((inst, i) => (
                  <input 
                    key={i}
                    value={inst}
                    onChange={(e) => handleInstrumentadoraChange(i, e.target.value)}
                    placeholder={`Instrumentadora ${i + 1}`}
                  />
                ))}
                <button type="button" onClick={handleAddInstrumentadora}>+ Adicionar Instrumentadora</button>

                <label>Hospital:</label>
                <input value={formData.hospital || ''} onChange={(e) => setFormData({ ...formData, hospital: e.target.value })} />

                <label>Tecnologia:</label>
                <input value={formData.tecnologia || ''} onChange={(e) => setFormData({ ...formData, tecnologia: e.target.value })} />

                <label>Prótese:</label>
                <input value={formData.protese || ''} onChange={(e) => setFormData({ ...formData, protese: e.target.value })} />
              </>
            )}

            <label>Descrição:</label>
            <input value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

            <div className="formActions">
              <button onClick={handleSubmit}>{isEditing ? 'Salvar' : 'Adicionar'}</button>
              <button onClick={handleCloseForm}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaySchedule;
=======
import { useEffect, useState } from 'react';
import '../styles/appointmentsStyles/DaySchedule.css';
import { supabase } from "../../utils/supabaseClient"; 

// cores por tipo
const typeColors = {
  "Consulta presencial": "blue",
  "Consulta online": "blue",
  "Cirurgia": "navy",
  "Entrega de exames": "purple",
  "Dúvidas presencial": "orange",
  "Dúvidas online": "orange",
  "Fechamento": "green",
  "Drenagem": "pink",
  "Pós-operatório": "darkred",
  "Drenagem + pós-operatório": "linear-gradient(90deg, pink, darkred)",
  "Procedimento facial": "gray"
};

const generateTimeSlots = (start, end, intervalMinutes) => {
  const slots = [];
  let [h, m] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  while (h < endH || (h === endH && m <= endM)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += intervalMinutes;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
  }
  return slots;
};

const DaySchedule = ({
  selectedDate,
  events,
  setEvents,
  abrirModal,
  setAbrirModal,
  onSelectEvent,
  editTarget,
  reloadKey,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    time: '',
    title: '',
    type: 'Consulta presencial',
    description: '',
    procedure: '',
    hospital: '',
    auxiliar: '',
    instrumentadora: [''],
    protese: '',
    tecnologia: '',
  });

  // data para DB sem timezone
  const dateKey = selectedDate.toLocaleDateString('en-CA'); 
  // exibição PT-BR
  const formattedDisplayDate = selectedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // fetch quando date ou reloadKey mudar
  const fetchEventsForDate = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('date', dateKey)
        .order('time', { ascending: true });

      if (error) throw error;
      // instrumentadora pode ser JSON string ou array — ajustar
      const normalized = (data || []).map((d) => ({
        ...d,
        instrumentadora: d.instrumentadora ? (typeof d.instrumentadora === 'string' ? JSON.parse(d.instrumentadora) : d.instrumentadora) : [],
      }));
      setEvents(normalized);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    }
  };

  useEffect(() => {
    fetchEventsForDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, reloadKey]);

  // quando editTarget for definido pelo pai, abrir modal preenchido
  useEffect(() => {
    if (editTarget) {
      setIsEditing(true);
      setEditId(editTarget.id || null);
      setFormData({
        ...editTarget,
        instrumentadora: editTarget.instrumentadora
          ? (Array.isArray(editTarget.instrumentadora) ? editTarget.instrumentadora : JSON.parse(editTarget.instrumentadora))
          : [''],
      });
      setAbrirModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTarget]);

  const handleOpenForm = (event = null) => {
    setIsEditing(!!event);
    setEditId(event?.id || null);
    setFormData(
      event
        ? {
            ...event,
            instrumentadora: event.instrumentadora
              ? (Array.isArray(event.instrumentadora) ? event.instrumentadora : JSON.parse(event.instrumentadora))
              : [''],
          }
        : {
            time: '',
            title: '',
            type: 'Consulta presencial',
            description: '',
            procedure: '',
            hospital: '',
            auxiliar: '',
            instrumentadora: [''],
            protese: '',
            tecnologia: '',
          }
    );
    setAbrirModal(true);
  };

  const handleCloseForm = () => {
    setAbrirModal(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({
      time: '',
      title: '',
      type: 'Consulta presencial',
      description: '',
      procedure: '',
      hospital: '',
      auxiliar: '',
      instrumentadora: [''],
      protese: '',
      tecnologia: '',
    });
  };

  const handleInstrumentadoraChange = (index, value) => {
    const updated = [...(formData.instrumentadora || [])];
    updated[index] = value;
    setFormData({ ...formData, instrumentadora: updated });
  };

  const handleAddInstrumentadora = () => {
    setFormData({ ...formData, instrumentadora: [...(formData.instrumentadora || []), ''] });
  };

  const handleSubmit = async () => {
    if (!formData.time || !formData.title) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const payload = {
        ...formData,
        date: dateKey,
        instrumentadora: JSON.stringify(formData.instrumentadora || []),
        updated_at: new Date(),
      };

      if (isEditing && editId) {
        const { error } = await supabase
          .from('agendamentos')
          .update(payload)
          .eq('id', editId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('agendamentos')
          .insert([{ ...payload, created_at: new Date() }]);

        if (error) throw error;
      }

      await fetchEventsForDate();
      handleCloseForm();
    } catch (err) {
      console.error("Erro ao salvar agendamento:", err);
      alert("Erro ao salvar. Veja console.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const ok = window.confirm('Confirma exclusão?');
      if (!ok) return;
      const { error } = await supabase.from('agendamentos').delete().eq('id', id);
      if (error) throw error;
      await fetchEventsForDate();
      // se estava sendo mostrado nos detalhes, deixar o pai limpar (pai deve reagir ao reloadKey)
      onSelectEvent && onSelectEvent(null);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir. Veja console.");
    }
  };

  const handleReschedule = async (id, oldData) => {
    const newDate = prompt('Nova data (AAAA-MM-DD):', oldData.date);
    const newTime = prompt('Novo horário (HH:mm):', oldData.time);
    if (!newDate || !newTime) return;
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ date: newDate, time: newTime, updated_at: new Date() })
        .eq('id', id);
      if (error) throw error;
      await fetchEventsForDate();
    } catch (err) {
      console.error("Erro ao reagendar:", err);
      alert("Erro ao reagendar. Veja console.");
    }
  };

  return (
    <div className='appointmentsDay'>
      <h3>Agendamentos para {formattedDisplayDate}</h3>

      {events.length === 0 && <p className="noEvents">Nenhum agendamento.</p>}

      <div className="appointmentsList">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="appointmentCard"
            /* não chame onSelectEvent no card inteiro, deixamos botão */
          >
            <div className="appointmentInfo">
              <div>
                <strong className="appointmentTime">{event.time}</strong>
                <h4 className="appointmentTitle">{event.title}</h4>
                {event.description && <p className="appointmentDescription">{event.description}</p>}
              </div>
              <span className="appointmentType" style={{ background: typeColors[event.type] || '#999' }}>
                {event.type}
              </span>
            </div>

            <div className="appointmentActions">
              <button onClick={() => onSelectEvent && onSelectEvent(event)}>Ver detalhes</button>
            </div>
          </div>
        ))}
      </div>

      {abrirModal && (
        <div className="appointmentsFormOverlay" onClick={handleCloseForm}>
          <div className="appointmentsForm" onClick={(e) => e.stopPropagation()}>
            <h4>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</h4>

            <label>Título:</label>
            <input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />

            <label>Tipo:</label>
            <select value={formData.type || 'Consulta presencial'} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              {Object.keys(typeColors).map((t) => <option key={t}>{t}</option>)}
            </select>

            <label>Horário:</label>
            <select value={formData.time || ''} onChange={(e) => setFormData({ ...formData, time: e.target.value })}>
              <option value="">Selecione um horário</option>
              {generateTimeSlots('06:00', '20:00', 30).map((time) => <option key={time} value={time}>{time}</option>)}
            </select>
      
            {(formData.type === 'Cirurgia' || formData.type === 'Cirúrgia') && (
              <>
                <label>Procedimento:</label>
                <input value={formData.procedure || ''} onChange={(e) => setFormData({ ...formData, procedure: e.target.value })} />

                <label>Médico Auxiliar:</label>
                <input value={formData.auxiliar || ''} onChange={(e) => setFormData({ ...formData, auxiliar: e.target.value })} />

                <label>Instrumentadora(s):</label>
                {(formData.instrumentadora || ['']).map((inst, i) => (
                  <input 
                    key={i}
                    value={inst}
                    onChange={(e) => handleInstrumentadoraChange(i, e.target.value)}
                    placeholder={`Instrumentadora ${i + 1}`}
                  />
                ))}
                <button type="button" onClick={handleAddInstrumentadora}>+ Adicionar Instrumentadora</button>

                <label>Hospital:</label>
                <input value={formData.hospital || ''} onChange={(e) => setFormData({ ...formData, hospital: e.target.value })} />

                <label>Tecnologia:</label>
                <input value={formData.tecnologia || ''} onChange={(e) => setFormData({ ...formData, tecnologia: e.target.value })} />

                <label>Prótese:</label>
                <input value={formData.protese || ''} onChange={(e) => setFormData({ ...formData, protese: e.target.value })} />
              </>
            )}

            <label>Descrição:</label>
            <input value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

            <div className="formActions">
              <button onClick={handleSubmit}>{isEditing ? 'Salvar' : 'Adicionar'}</button>
              <button onClick={handleCloseForm}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaySchedule;
>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
