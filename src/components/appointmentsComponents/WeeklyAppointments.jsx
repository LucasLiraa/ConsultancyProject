import React, { useEffect, useState } from 'react';
import '../styles/appointmentsStyles/WeeklyAppointments.css';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';

const WeeklyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'appointments'));
        const fetchedAppointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAppointments(fetchedAppointments);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar agendamentos.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (loading) {
    return <div>Carregando agendamentos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="weekly-appointments">
      <h2>Agendamentos da Semana</h2>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            <strong>{appointment.title}</strong> ({appointment.type})<br />
            <span>{formatDate(appointment.date)} - {appointment.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeeklyAppointments;
