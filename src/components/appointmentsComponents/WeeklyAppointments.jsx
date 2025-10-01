import React, { useEffect, useState } from 'react';
import '../styles/appointmentsStyles/WeeklyAppointments.css';
import { supabase } from "../../utils/supabaseClient"; 

const typeColors = {
  "Consulta presencial": "#3b52d3",
  "Consulta online": "#3b52d3",
  "Cirúrgia": "navy",
  "Entrega de exames": "#8c3bd3ff",
  "Dúvidas presencial": "#c6962fff",
  "Dúvidas online": "#c6962fff",
  "Fechamento": "#2fc67dff",
  "Drenagem": "#c62f4bff",
  "Pós-operatório": "pink",
  "Drenagem + pós-operatório": "linear-gradient(90deg, pink, #c62f4bff)",
  "Procedimento facial": "gray"
};

const WeeklyAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();

  // Calcula o domingo da semana atual
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    return {
      name: weekDays[i],
      number: dayDate.getDate(),
      date: dayDate,
      isToday: dayDate.toDateString() === today.toDateString(),
    };
  });

  // Formata data YYYY-MM-DD para consulta no Supabase
  const formatKey = (date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("agendamentos")
          .select("*")
          .eq("date", formatKey(selectedDate));

        if (error) {
          console.error(error);
          setAppointments([]);
          return;
        }

        setAppointments(data.sort((a, b) => a.time.localeCompare(b.time)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDate]);

  return (
    <div className="weeklyBarContainer">
      <div className="weeklyBarHeader">
        <h3>Agendamentos</h3>
      </div>

      {/* Barra de dias da semana */}
      <div className="weeklyDays">
        {days.map((d, idx) => (
          <button
            key={idx}
            className={`dayButton ${
              selectedDate.toDateString() === d.date.toDateString()
                ? "selected"
                : ""
            } ${d.isToday ? "today" : ""}`}
            onClick={() => setSelectedDate(d.date)}
          >
            <span className="dayName">{d.name}</span>
            <span className="dayNumber">{d.number}</span>
          </button>
        ))}
      </div>

      {/* Lista de agendamentos */}
      <div className="weeklyDaysList">
        <p>24 de Setembro</p>
        <ul className="dayAgenda">
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <span className="time">{appointment.time}</span>
              <span
                className="typeDot"
                style={{ background: typeColors[appointment.type] || "gray" }}
              />
              <div className="info">
                <strong>{appointment.title}</strong>
                <span>{appointment.type}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeeklyAppointments;