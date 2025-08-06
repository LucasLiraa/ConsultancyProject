import { useEffect, useState } from 'react';
import '../styles/appointmentsStyles/DaySchedule.css';

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { app } from '../../utils/firebaseConfig';

// Gera os horários de 30 em 30 minutos
const generateTimeSlots = (start, end, intervalMinutes) => {
  const slots = [];
  let [h, m] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  while (h < endH || (h === endH && m <= endM)) {
    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push(formatted);
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
  const [formData, setFormData] = useState({
    time: '',
    title: '',
    type: 'Consulta',
    description: '',
    procedure: '',
    hospital: '',
    auxiliar: '',
    instrumentadora: '',
    protese: '',
    kitCirurgico: '',
    tecnologia: '',
  });

  const dateKey = selectedDate.toISOString().split('T')[0];

  const fetchEventsForDate = async () => {
    const q = query(collection(app, 'appointments'), where('date', '==', dateKey));
    const snapshot = await getDocs(q);
    const dailyEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEvents(dailyEvents);
  };

  useEffect(() => {
    fetchEventsForDate();
  }, [selectedDate]);

  const handleOpenForm = (event = null) => {
    setShowForm(true);
    setIsEditing(!!event);
    setEditId(event?.id || null);
    setFormData(
      event
        ? {
            time: event.time,
            title: event.title,
            type: event.type || 'Consulta',
            description: event.description || '',
            procedure: event.procedure || '',
            hospital: event.hospital || '',
            auxiliar: event.auxiliar || '',
            instrumentadora: event.instrumentadora || '',
            protese: event.protese || '',
            kitCirurgico: event.kitCirurgico || '',
            tecnologia: event.tecnologia || '',
          }
        : {
            time: '',
            title: '',
            type: 'Consulta',
            description: '',
            procedure: '',
            hospital: '',
            auxiliar: '',
            instrumentadora: '',
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
    setFormData({
      time: '',
      title: '',
      type: 'Consulta',
      description: '',
      procedure: '',
      hospital: '',
      auxiliar: '',
      instrumentadora: '',
      protese: '',
      kitCirurgico: '',
      tecnologia: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.time || !formData.title) return alert('Preencha todos os campos obrigatórios.');

    const appointmentsRef = collection(app, 'appointments');

    try {
      if (isEditing && editId) {
        const docRef = doc(app, 'appointments', editId);
        await updateDoc(docRef, {
          ...formData,
          date: dateKey,
          updatedAt: new Date()
        });
      } else {
        await addDoc(appointmentsRef, {
          ...formData,
          date: dateKey,
          createdAt: new Date()
        });
      }

      await fetchEventsForDate();
      handleCloseForm();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      alert("Erro ao salvar o agendamento.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(app, 'appointments', id));
      await fetchEventsForDate();
    } catch (error) {
      console.error("Erro ao deletar agendamento:", error);
      alert("Erro ao excluir o agendamento.");
    }
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

      {events.map((event, idx) => (
        <div className='appointmentContent' key={event.id || idx}>
          <strong>{event.time}</strong> - {event.title} ({event.type})
          {event.description && <p>Descrição: {event.description}</p>}
          {event.type === 'Cirúrgia' && (
            <>
              <p>Procedimento: {event.procedure}</p>
              <p>Hospital: {event.hospital}</p>
              {event.auxiliar && <p>Auxiliar: {event.auxiliar}</p>}
              {event.instrumentadora && <p>Instrumentadora: {event.instrumentadora}</p>}
              {event.protese === 'Sim' && <p>Prótese: Sim</p>}
              {event.kitCirurgico === 'Sim' && <p>Kit cirúrgico: Sim</p>}
              {event.tecnologia && <p>Tecnologia: {event.tecnologia}</p>}
            </>
          )}
          <div>
            <button onClick={() => handleOpenForm(event)} style={{ marginRight: '5px' }}>
              Editar
            </button>
            <button onClick={() => handleDelete(event.id)} style={{ color: 'red' }}>
              Excluir
            </button>
          </div>
        </div>
      ))}

      <div className='appointmentsDayButton'>
        {!showForm && <button onClick={() => handleOpenForm()}>+ Novo Agendamento</button>}
      </div>

      {showForm && (
        <div className='appointmentsForm'>
          <h4>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</h4>

          <div>
            <label>Título: </label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label>Tipo: </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option>Consulta presencial</option>
              <option>Consulta online</option>
              <option>Cirúrgia</option>
              <option>Entrega de exames</option>
              <option>Dúvidas presencial</option>
              <option>Dúvidas online</option>
              <option>Fechamento</option>
              <option>Drenagem</option>
              <option>Pós-operatório</option>
              <option>Drenagem + pós-operatório</option>
              <option>Procedimento facial</option>
            </select>
          </div>

          {formData.type === 'Cirúrgia' && (
            <>
              <div>
                <label>Procedimento: </label>
                <input
                  type='text'
                  value={formData.procedure}
                  onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                />
              </div>
              <div>
                <label>Hospital: </label>
                <input
                  type='text'
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                />
              </div>
              <div>
                <label>Auxiliar (opcional): </label>
                <input
                  type='text'
                  value={formData.auxiliar}
                  onChange={(e) => setFormData({ ...formData, auxiliar: e.target.value })}
                />
              </div>
              <div>
                <label>Instrumentadora (opcional): </label>
                <input
                  type='text'
                  value={formData.instrumentadora}
                  onChange={(e) => setFormData({ ...formData, instrumentadora: e.target.value })}
                />
              </div>
              <div>
                <label>Prótese: </label>
                <select
                  value={formData.protese}
                  onChange={(e) => setFormData({ ...formData, protese: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
              <div>
                <label>Kit cirúrgico: </label>
                <select
                  value={formData.kitCirurgico}
                  onChange={(e) => setFormData({ ...formData, kitCirurgico: e.target.value })}
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
              <div>
                <label>Tecnologia (opcional): </label>
                <input
                  type='text'
                  value={formData.tecnologia}
                  onChange={(e) => setFormData({ ...formData, tecnologia: e.target.value })}
                />
              </div>
            </>
          )}

          <div>
            <label>Horário: </label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            >
              <option value=''>Selecione um horário</option>
              {generateTimeSlots('06:00', '20:00', 30).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Descrição (opcional): </label>
            <input
              type='text'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

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