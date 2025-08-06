import React, { useEffect, useState } from 'react';
import '../styles/appointmentsStyles/WeeklyAppointments.css'

const WeeklyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = () => {
      try {
        const storedAppointments = localStorage.getItem('appointments');
        if (storedAppointments) {
          const parsedAppointments = JSON.parse(storedAppointments);
          setAppointments(parsedAppointments);
        } else {
          setError('Nenhum agendamento encontrado.');
        }
      } catch (err) {
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