import React, { useState } from "react";
import "../styles/appointmentsStyles/WeekBar.css";

const WeekBar = ({ selectedDate, onSelectDate }) => {
  const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
  const months = [
    "Jan", "FeV", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const [currentDate, setCurrentDate] = useState(selectedDate);

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Gerar 7 dias
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // Navegar semanas
  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
    onSelectDate(newDate);
  };

  // Alterar mês manualmente
  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    const newDate = new Date(currentDate);
    newDate.setMonth(newMonth);
    setCurrentDate(newDate);
    onSelectDate(newDate);
  };

  return (
    <div className="weekBarContainer">
      <div className="weekBarHeader">
        <h3>Calendário</h3>
        <div className="weekControls">
          <button onClick={() => changeWeek(-1)}>&lt;</button>
          <select
            className="monthSelector"
            value={currentDate.getMonth()}
            onChange={handleMonthChange}
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <button onClick={() => changeWeek(1)}>&gt;</button>
        </div>
      </div>

      <div className="weekDays">
        {days.map((day, idx) => {
          const isSelected =
            selectedDate.toDateString() === day.toDateString();
          return (
            <button
              key={idx}
              className={`dayButton ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectDate(day)}
            >
              <span className="dayName">
                {weekDays[day.getDay()]}
              </span>
              <span className="dayNumber">{day.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekBar;