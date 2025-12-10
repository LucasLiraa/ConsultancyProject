<<<<<<< HEAD
import React, { useMemo, useState } from "react";
import "../styles/patientsStyles/PatientVisitsCalendar.css";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function PatientVisitsCalendar({ pacienteId }) {
  const today = new Date();

  // mês/ano navegáveis
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11

  // dia selecionado (para abrir o painel)
  const [selectedDate, setSelectedDate] = useState(null);

  // 🔹 por enquanto, só um dia de exemplo marcado (hoje)
  const exampleDateISO = today.toISOString().split("T")[0];
  const visitsDates = [exampleDateISO];
  const visitsInfo = {
    [exampleDateISO]:
      "Consulta de avaliação inicial. Registro da anamnese, fotos pré-operatórias e definição da conduta cirúrgica.",
  };

  const { monthLabel, year, weeks } = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstWeekDay = firstDay.getDay(); // 0-6 (domingo-sábado)

    const totalDays = lastDay.getDate();
    const weeks = [];
    let currentWeek = new Array(firstWeekDay).fill(null);

    for (let day = 1; day <= totalDays; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    const monthLabel = firstDay.toLocaleDateString("pt-BR", {
      month: "long",
    });

    return { monthLabel, year, weeks };
  }, [currentYear, currentMonth]);

  const changeMonth = (delta) => {
    setCurrentMonth((prev) => {
      let newMonth = prev + delta;
      let newYear = currentYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      }

      setCurrentYear(newYear);
      return newMonth;
    });
  };

  const handleDayClick = (day) => {
    if (!day) return;

    const iso = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split("T")[0];

    if (visitsDates.includes(iso)) {
      setSelectedDate(iso);
    }
  };

  const handleCloseDetails = () => {
    setSelectedDate(null);
  };

  const selectedInfo = selectedDate ? visitsInfo[selectedDate] : null;

  return (
    <>
      {/* card de calendário fixo ao lado das infos gerais */}
      <div className="patientVisitsWrapper">
        <div className="patientVisitsCalendar">
          <div className="calendarHeaderPatient">
            <div>
              <h4>Últimas visitas ao consultório</h4>
              <span className="calendarMonth">
                {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}{" "}
                {year}
              </span>
            </div>

            <div className="calendarNav">
              <button
                type="button"
                className="calendarNavBtn"
                onClick={() => changeMonth(-1)}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                type="button"
                className="calendarNavBtn"
                onClick={() => changeMonth(1)}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="calendarGridPatient">
            {weekDays.map((d, idx) => (
              <div key={idx} className="calendarWeekday">
                {d}
              </div>
            ))}

            {weeks.map((week, wIdx) =>
              week.map((day, dIdx) => {
                if (!day) {
                  return (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      className="calendarDay empty"
                    />
                  );
                }

                const iso = new Date(year, currentMonth, day)
                  .toISOString()
                  .split("T")[0];

                const hasVisit = visitsDates.includes(iso);
                const isSelected = selectedDate === iso;

                const classNames = [
                  "calendarDay",
                  hasVisit ? "has-visit" : "",
                  isSelected ? "selected" : "",
                ]
                  .join(" ")
                  .trim();

                return (
                  <button
                    key={`${wIdx}-${dIdx}`}
                    type="button"
                    className={classNames}
                    onClick={() => handleDayClick(day)}
                    disabled={!hasVisit}
                  >
                    {day}
                  </button>
                );
              })
            )}
          </div>

          <p className="calendarHint">
            {/** Por enquanto apenas um dia de exemplo está marcado. Em breve esses
            dados virão dos agendamentos do paciente.*/}
          </p>
        </div>
      </div>

      {/* painel lateral sobreposto */}
      {selectedDate && (
        <div
          className="visitsOverlayBackdrop"
          onClick={handleCloseDetails}
        >
          <aside
            className="patientVisitsDetailsOverlay"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detailsOverlayHeader">
              <h4>Informações do dia selecionado</h4>
              <button
                type="button"
                className="closeDetailsBtn"
                onClick={handleCloseDetails}
                aria-label="Fechar detalhes"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <p className="selectedDateLabel">
              {new Date(selectedDate).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>

            {selectedInfo ? (
              <p className="visitDescription">{selectedInfo}</p>
            ) : (
              <p className="visitDescription">
                Nenhuma informação registrada para este dia.
              </p>
            )}
          </aside>
        </div>
      )}
    </>
  );
=======
import React, { useMemo, useState } from "react";
import "../styles/patientsStyles/PatientVisitsCalendar.css";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function PatientVisitsCalendar({ pacienteId }) {
  const today = new Date();

  // mês/ano navegáveis
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11

  // dia selecionado (para abrir o painel)
  const [selectedDate, setSelectedDate] = useState(null);

  // 🔹 por enquanto, só um dia de exemplo marcado (hoje)
  const exampleDateISO = today.toISOString().split("T")[0];
  const visitsDates = [exampleDateISO];
  const visitsInfo = {
    [exampleDateISO]:
      "Consulta de avaliação inicial. Registro da anamnese, fotos pré-operatórias e definição da conduta cirúrgica.",
  };

  const { monthLabel, year, weeks } = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstWeekDay = firstDay.getDay(); // 0-6 (domingo-sábado)

    const totalDays = lastDay.getDate();
    const weeks = [];
    let currentWeek = new Array(firstWeekDay).fill(null);

    for (let day = 1; day <= totalDays; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    const monthLabel = firstDay.toLocaleDateString("pt-BR", {
      month: "long",
    });

    return { monthLabel, year, weeks };
  }, [currentYear, currentMonth]);

  const changeMonth = (delta) => {
    setCurrentMonth((prev) => {
      let newMonth = prev + delta;
      let newYear = currentYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      }

      setCurrentYear(newYear);
      return newMonth;
    });
  };

  const handleDayClick = (day) => {
    if (!day) return;

    const iso = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split("T")[0];

    if (visitsDates.includes(iso)) {
      setSelectedDate(iso);
    }
  };

  const handleCloseDetails = () => {
    setSelectedDate(null);
  };

  const selectedInfo = selectedDate ? visitsInfo[selectedDate] : null;

  return (
    <>
      {/* card de calendário fixo ao lado das infos gerais */}
      <div className="patientVisitsWrapper">
        <div className="patientVisitsCalendar">
          <div className="calendarHeaderPatient">
            <div>
              <h4>Últimas visitas ao consultório</h4>
              <span className="calendarMonth">
                {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}{" "}
                {year}
              </span>
            </div>

            <div className="calendarNav">
              <button
                type="button"
                className="calendarNavBtn"
                onClick={() => changeMonth(-1)}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                type="button"
                className="calendarNavBtn"
                onClick={() => changeMonth(1)}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="calendarGridPatient">
            {weekDays.map((d, idx) => (
              <div key={idx} className="calendarWeekday">
                {d}
              </div>
            ))}

            {weeks.map((week, wIdx) =>
              week.map((day, dIdx) => {
                if (!day) {
                  return (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      className="calendarDay empty"
                    />
                  );
                }

                const iso = new Date(year, currentMonth, day)
                  .toISOString()
                  .split("T")[0];

                const hasVisit = visitsDates.includes(iso);
                const isSelected = selectedDate === iso;

                const classNames = [
                  "calendarDay",
                  hasVisit ? "has-visit" : "",
                  isSelected ? "selected" : "",
                ]
                  .join(" ")
                  .trim();

                return (
                  <button
                    key={`${wIdx}-${dIdx}`}
                    type="button"
                    className={classNames}
                    onClick={() => handleDayClick(day)}
                    disabled={!hasVisit}
                  >
                    {day}
                  </button>
                );
              })
            )}
          </div>

          <p className="calendarHint">
            {/** Por enquanto apenas um dia de exemplo está marcado. Em breve esses
            dados virão dos agendamentos do paciente.*/}
          </p>
        </div>
      </div>

      {/* painel lateral sobreposto */}
      {selectedDate && (
        <div
          className="visitsOverlayBackdrop"
          onClick={handleCloseDetails}
        >
          <aside
            className="patientVisitsDetailsOverlay"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detailsOverlayHeader">
              <h4>Informações do dia selecionado</h4>
              <button
                type="button"
                className="closeDetailsBtn"
                onClick={handleCloseDetails}
                aria-label="Fechar detalhes"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <p className="selectedDateLabel">
              {new Date(selectedDate).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>

            {selectedInfo ? (
              <p className="visitDescription">{selectedInfo}</p>
            ) : (
              <p className="visitDescription">
                Nenhuma informação registrada para este dia.
              </p>
            )}
          </aside>
        </div>
      )}
    </>
  );
>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
}