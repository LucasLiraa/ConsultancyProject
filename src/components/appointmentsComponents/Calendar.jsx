import { useState, useEffect } from 'react';
import '../styles/appointmentsStyles/Calendar.css';

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getStartDayOfWeek = (year, month) => {
  return new Date(year, month, 1).getDay(); // 0 (Domingo) a 6 (Sábado)
};

const Calendar = ({ selectedDate, onSelectDate }) => {
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());

  // Atualiza o mês/ano se a data selecionada mudar externamente
  useEffect(() => {
    setCurrentYear(selectedDate.getFullYear());
    setCurrentMonth(selectedDate.getMonth());
  }, [selectedDate]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = getStartDayOfWeek(currentYear, currentMonth);

  const totalCells = 42;
  const calendarDays = [];

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentYear, currentMonth, i));
  }

  while (calendarDays.length < totalCells) {
    calendarDays.push(null);
  }

  const isSameDate = (d1, d2) =>
    d1?.toDateString() === d2?.toDateString();

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div className="appointmentsCalendar">
      <div className='calendar'>
        <div className='calendarHeader'>
          <button onClick={goToPreviousMonth}>&lt;</button>
          <h3>
            {new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={goToNextMonth}>&gt;</button>
        </div>

        <div className='calendarGrid'>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
            <div className='calendarDay' key={i}>{day}</div>
          ))}
          {calendarDays.map((date, idx) => (
            <button
              key={idx}
              onClick={() => date && onSelectDate(date)}
              style={{
                width: '100%',
                height: '40px',
                backgroundColor: isSameDate(date, selectedDate) ? 'var(--text-color)' : '#fff',
                color: isSameDate(date, selectedDate) ? '#fff' : '#000',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: date ? 'pointer' : 'default',
                opacity: date ? 1 : 0.3,
              }}
              disabled={!date}
            >
              {date ? date.getDate() : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar