import React from "react";
import "../styles/appointmentsStyles/WeekBar.css";

const WeekBar = ({ selectedDate, onSelectDate }) => {
const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const today = new Date();

// Domingo da semana atual
const startOfWeek = new Date(selectedDate);
startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

// Gerar array de 7 dias
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

return (
  <div className="weekBarContainer">
    <div className="weekBarHeader">
      <h3>Meu Calendário</h3>
    </div>

      <div className="weekDays">
        {days.map((d, idx) => (
          <button
            key={idx}
            className={`dayButton ${
              selectedDate.toDateString() === d.date.toDateString()
                ? "selected"
                : ""
            } ${d.isToday ? "today" : ""}`}
            onClick={() => onSelectDate(d.date)}
          >
            <span className="dayName">{d.name}</span>
            <span className="dayNumber">{d.number}</span>
          </button>
        ))}
      </div>
  </div>
  );
};

export default WeekBar;