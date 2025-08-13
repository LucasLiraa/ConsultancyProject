import React, { useEffect, useState } from 'react';
import '../styles/appointmentsStyles/WeeklyAppointments.css';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';

const typeColors = {
  "Consulta presencial": "blue",
  "Consulta online": "blue",
  "Cirúrgia": "navy",
  "Entrega de exames": "purple",
  "Dúvidas presencial": "orange",
  "Dúvidas online": "orange",
  "Fechamento": "green",
  "Drenagem": "darked",
  "Pós-operatório": "pink",
  "Drenagem + pós-operatório": "linear-gradient(90deg, pink, darkred)",
  "Procedimento facial": "gray"
};

const WeeklyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayKey = new Date().toISOString().split('T')[0]; // string YYYY-MM-DD

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const q = query(collection(db, 'appointments'), where('date', '==', todayKey));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        fetched.sort((a, b) => a.time.localeCompare(b.time));

        setAppointments(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [todayKey]);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) return <div>Carregando agendamentos...</div>;

  return (
    <div className="weekly-appointments">
      <h2>Agendamentos de Hoje</h2>
      {appointments.length === 0 && <p>Nenhum agendamento hoje.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {appointments.map((appointment) => (
          <li
            key={appointment.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'stretch',
              border: '1px solid #eee',
              borderRadius: '6px',
              marginBottom: '6px',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ padding: '8px 12px', flex: 1 }}>
              <strong>{appointment.title}</strong> ({appointment.type})<br />
              <span>{formatDate(appointment.date)} - {appointment.time}</span>
            </div>
            <div
              style={{
                width: '8px',
                borderTopRightRadius: '6px',
                borderBottomRightRadius: '6px',
                background: typeColors[appointment.type] || 'gray',
              }}
            ></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeeklyAppointments;