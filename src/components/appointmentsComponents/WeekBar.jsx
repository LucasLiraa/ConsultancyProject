import '../styles/appointmentsStyles/WeekBar.css';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const getStartOfWeek = (date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};
const WeekBar = ({ onSelectDate }) => {
  const startOfWeek = getStartOfWeek(new Date());

  return (
    <div className="containerAppointmentsWeekBar">
      <div className="appointmentsWeekBar">
      {[...Array(7)].map((_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        return (
          <button key={i} onClick={() => onSelectDate(new Date(day))}>
            <div>{capitalize(day.toLocaleDateString('pt-BR', { weekday: 'long' }))}</div>
            <div>{day.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </button>
        );
      })}
    </div>
    </div>
  );
};

export default WeekBar;