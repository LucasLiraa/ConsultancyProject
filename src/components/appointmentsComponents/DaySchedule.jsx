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
import { db } from '../../utils/firebaseConfig';

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
  const [formData, setFormData] = useState({
    time: '',
    title: '',
    type: 'Consulta presencial',
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
    const q = query(collection(db, 'appointments'), where('date', '==', dateKey));
    const snapshot = await getDocs(q);
    const dailyEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // ordenar por horário
    dailyEvents.sort((a, b) => a.time.localeCompare(b.time));

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
        ? { ...event }
        : {
            time: '',
            title: '',
            type: 'Consulta presencial',
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
      type: 'Consulta presencial',
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

    const appointmentsRef = collection(db, 'appointments');

    try {
      if (isEditing && editId) {
        const docRef = doc(db, 'appointments', editId);
        await updateDoc(docRef, { ...formData, date: dateKey, updatedAt: new Date() });
      } else {
        await addDoc(appointmentsRef, { ...formData, date: dateKey, createdAt: new Date() });
      }

      await fetchEventsForDate();
      handleCloseForm();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'appointments', id));
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
        const docRef = doc(db, 'appointments', id);
        await updateDoc(docRef, { ...oldData, date: newDate, time: newTime });
        await fetchEventsForDate();
      } catch (error) {
        console.error("Erro ao reagendar:", error);
      }
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

      {!showForm && <div className="appointmentsDayButton"><button onClick={() => handleOpenForm()}>+ Novo Agendamento</button></div>}

      {showForm && (
        <div className='appointmentsForm'>
          <h4>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</h4>

          <label>Título:</label>
          <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />

          <label>Tipo:</label>
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
            {Object.keys(typeColors).map((t) => <option key={t}>{t}</option>)}
          </select>

          <label>Horário:</label>
          <select value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}>
            <option value="">Selecione um horário</option>
            {generateTimeSlots('06:00', '20:00', 30).map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>

          <label>Descrição:</label>
          <input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

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