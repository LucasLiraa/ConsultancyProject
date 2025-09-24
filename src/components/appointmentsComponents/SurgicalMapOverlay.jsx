import React, { useState, useMemo } from 'react';
import '../styles/appointmentsStyles/SurgicalMapOverlay.css';

const SurgicalMapOverlay = ({ events, onClose }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null); // Se não for usar, remova.

  const handleMonthChange = (delta) => {
    const newDate = new Date(currentYear, currentMonth + delta);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
    setSelectedDay(null);
  };

  const normalizeDate = (str) => new Date(str + 'T00:00:00');

  const filteredEvents = useMemo(() => {
    return events
      .map(event => ({
        ...event,
        dateObj: normalizeDate(event.date)
      }))
      .filter(event =>
        event.dateObj.getMonth() === currentMonth &&
        event.dateObj.getFullYear() === currentYear
      )
      .sort((a, b) => a.dateObj - b.dateObj);
  }, [events, currentMonth, currentYear]);

  const hasEvent = (date) => {
    return filteredEvents.some(event => {
      return (
        event.dateObj.getDate() === date.getDate() &&
        event.dateObj.getMonth() === date.getMonth() &&
        event.dateObj.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startWeekDay = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];

    for (let i = 0; i < startWeekDay; i++) {
      days.push(<div key={`empty-${i}`} className="day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const highlight = hasEvent(date);
      days.push(
        <div
          key={i}
          className={`day ${highlight ? 'highlight' : ''}`}
          onClick={() => setSelectedDay(date)}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="surgicalOverlay">
      <button className="closeButton" onClick={onClose}>X</button>

      <div className="surgicalMapContent">
        <div className="calendarSection">
          <div className="header">
            <button onClick={() => handleMonthChange(-1)}>{'<'}</button>
            <h2>{monthName}</h2>
            <button onClick={() => handleMonthChange(1)}>{'>'}</button>
          </div>
          <div className="calendarContainer">{renderCalendar()}</div>
        </div>

        <div className="listSection">
          <h3>Cirurgias do mês</h3>
          {filteredEvents.length === 0 && <p>Nenhuma cirurgia agendada.</p>}
          {filteredEvents
            .filter(event => event.type === 'Cirúrgia')
            .map((event, index) => (
              <div className="surgeryItem" key={index}>
                <p><strong>{event.title} - {event.dateObj.toLocaleDateString('pt-BR')}</strong></p>
                <p>Procedimento: {event.procedure || '—'}</p>
                <p>Hospital: {event.hospital || '—'}</p>

                {event.auxiliar && <p>Auxiliar: {event.auxiliar}</p>}
                {event.instrumentadora && <p>Instrumentadora: {event.instrumentadora}</p>}
                {event.protese === 'Sim' && <p>Prótese: Sim</p>}
                {event.kitCirurgico === 'Sim' && <p>Kit cirúrgico: Sim</p>}
                {event.tecnologia && <p>Tecnologia: {event.tecnologia}</p>}
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurgicalMapOverlay;
