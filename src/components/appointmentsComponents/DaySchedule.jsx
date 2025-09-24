import { useEffect, useState } from 'react';
import '../styles/appointmentsStyles/DaySchedule.css';
import { supabase } from "../../utils/supabaseClient"; 

// Mapa de cores
const typeColors = {
  "Consulta presencial": "blue",
  "Consulta online": "blue",
  "Cirúrgia": "navy",
  "Entrega de exames": "purple",
  "Dúvidas presencial": "orange",
  "Dúvidas online": "orange",
  "Fechamento": "green",
  "Drenagem": "pink",
  "Pós-operatório": "darkred",
  "Drenagem + pós-operatório": "linear-gradient(90deg, pink, darkred)",
  "Procedimento facial": "gray"
};

// Gera horários
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

const DaySchedule = ({ selectedDate, events, setEvents }) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [instrumentadoras, setInstrumentadoras] = useState([""]);

  const [formData, setFormData] = useState({
    time: '',
    title: '',
    type: 'Consulta presencial',
    description: '',
    procedure: '',
    hospital: '',
    auxiliar: '',
    protese: '',
    kitCirurgico: '',
    tecnologia: '',
  });

  const dateKey = selectedDate.toISOString().split('T')[0];

  // Função para buscar eventos do dia
  const fetchEventsForDate = async () => {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('date', dateKey);

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return;
    }

    const dailyEvents = data.sort((a, b) => a.time.localeCompare(b.time));
    setEvents(dailyEvents);
  };

  useEffect(() => {
    fetchEventsForDate();
  }, [selectedDate]);

  const handleOpenForm = (event = null) => {
    setShowForm(true);
    setIsEditing(!!event);
    setEditId(event?.id || null);
    setInstrumentadoras(event?.instrumentadoras || [""]);
    setFormData(
      event
        ? { ...event }
        : {
            time: '',
            title: '',
            type: 'Consulta presencial',
            description: '',
            procedure: '',
            hospital: '',
            auxiliar: '',
            protese: '',
            kitCirurgico: '',
            tecnologia: '',
          }
    );
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditId(null);
    setIsEditing(false);
    setInstrumentadoras([""]);
    setFormData({
      time: '',
      title: '',
      type: 'Consulta presencial',
      description: '',
      procedure: '',
      hospital: '',
      auxiliar: '',
      protese: '',
      kitCirurgico: '',
      tecnologia: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.time || !formData.title) return alert('Preencha todos os campos obrigatórios.');

    const payload = {
      ...formData,
      date: dateKey,
      instrumentadoras,
      updated_at: new Date(),
    };

    try {
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
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchEventsForDate();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleReschedule = async (id, oldData) => {
    const newDate = prompt('Nova data (AAAA-MM-DD):', oldData.date);
    const newTime = prompt('Novo horário (HH:mm):', oldData.time);

    if (newDate && newTime) {
      try {
        const { error } = await supabase
          .from('agendamentos')
          .update({ ...oldData, date: newDate, time: newTime })
          .eq('id', id);

        if (error) throw error;
        await fetchEventsForDate();
      } catch (error) {
        console.error("Erro ao reagendar:", error);
      }
    }
  };

  const handleAddInstrumentadora = () => {
    setInstrumentadoras([...instrumentadoras, ""]);
  };

  const handleChangeInstrumentadora = (index, value) => {
    const updated = [...instrumentadoras];
    updated[index] = value;
    setInstrumentadoras(updated);
  };

  const formattedDate = selectedDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className='appointmentsDay'>
      <h3>Agendamentos para {formattedDate}</h3>

      {events.length === 0 && <p>Nenhum agendamento.</p>}

      {events.map((event) => (
        <div
          key={event.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '90%',
            alignItems: 'stretch',
            border: '1px solid #eee',
            borderRadius: '6px',
            marginBottom: '6px',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ padding: '8px 12px', flex: 1 }}>
            <strong>{event.time}</strong> - {event.title} ({event.type})
            {event.description && <p>Descrição: {event.description}</p>}
            <div>
              <button onClick={() => handleOpenForm(event)}>Editar</button>
              <button onClick={() => handleReschedule(event.id, event)}>Reagendar</button>
              <button onClick={() => handleDelete(event.id)} style={{ color: 'red' }}>Excluir</button>
            </div>
          </div>
          <div
            style={{
              width: '8px',
              borderTopRightRadius: '6px',
              borderBottomRightRadius: '6px',
              background: typeColors[event.type] || 'gray',
            }}
          ></div>
        </div>
      ))}

      {!showForm && (
        <div className="appointmentsDayButton">
          <button onClick={() => handleOpenForm()}>+ Novo Agendamento</button>
        </div>
      )}

      {showForm && (
        <div className='appointmentsForm'>
          <h4>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</h4>

          <label>Título:</label>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <label>Tipo:</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            {Object.keys(typeColors).map((t) => <option key={t}>{t}</option>)}
          </select>

          <label>Horário:</label>
          <select
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          >
            <option value="">Selecione um horário</option>
            {generateTimeSlots('06:00', '20:00', 30).map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>

          <label>Descrição:</label>
          <input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Campos extras só para Cirúrgia */}
          {formData.type === "Cirúrgia" && (
            <div className="cirurgiaFields">
              <label>Procedimento:</label>
              <input
                value={formData.procedure}
                onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
              />

              <label>Médico Auxiliar:</label>
              <input
                value={formData.auxiliar}
                onChange={(e) => setFormData({ ...formData, auxiliar: e.target.value })}
              />

              <label>Instrumentadora(s):</label>
              {instrumentadoras.map((inst, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Instrumentadora ${index + 1}`}
                  value={inst}
                  onChange={(e) => handleChangeInstrumentadora(index, e.target.value)}
                />
              ))}
              <button type="button" onClick={handleAddInstrumentadora}>
                + Adicionar Instrumentadora
              </button>

              <label>Hospital:</label>
              <input
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              />

              <label>Tecnologia:</label>
              <input
                value={formData.tecnologia}
                onChange={(e) => setFormData({ ...formData, tecnologia: e.target.value })}
              />

              <label>Prótese:</label>
              <input
                value={formData.protese}
                onChange={(e) => setFormData({ ...formData, protese: e.target.value })}
              />
            </div>
          )}

          <div>
            <button onClick={handleSubmit}>{isEditing ? 'Salvar' : 'Adicionar'}</button>
            <button onClick={handleCloseForm}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaySchedule;