import React, { useMemo, useState, useEffect } from "react";
import "../styles/patientsStyles/PatientVisitsCalendar.css";
import { supabase } from "../../utils/supabaseClient";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function PatientVisitsCalendar({ pacienteId }) {
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  // dados reais
  const [appointments, setAppointments] = useState([]);
  const [visitsMap, setVisitsMap] = useState({});

  const [summaryText, setSummaryText] = useState("");
  const [showSummaryForm, setShowSummaryForm] = useState(false);

  // =========================
  // FETCH AGENDAMENTOS + RESUMOS
  // =========================
  const fetchData = async () => {
    if (!pacienteId) return;

    const { data, error } = await supabase
      .from("agendamentos")
      .select(`
        id,
        date,
        time,
        type,
        description,
        patient_visits (
          id,
          summary
        )
      `)
      .eq("patient_id", pacienteId);

    if (error) {
      console.error("Erro ao buscar agendamentos:", error);
      return;
    }

    setAppointments(data || []);

    const map = {};
    (data || []).forEach(a => {
      map[a.date] = {
        id: a.id,
        time: a.time,
        type: a.type,
        description: a.description,
        summary: a.patient_visits?.summary || null,
      };
    });

    setVisitsMap(map);
  };

  useEffect(() => {
    fetchData();
  }, [pacienteId]);

  const visitsDates = appointments.map(a => a.date);

  // =========================
  // CALENDÁRIO (INALTERADO)
  // =========================
  const { monthLabel, year, weeks } = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstWeekDay = firstDay.getDay();

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

    if (currentWeek.length) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    const monthLabel = firstDay.toLocaleDateString("pt-BR", { month: "long" });
    return { monthLabel, year, weeks };
  }, [currentYear, currentMonth]);

  const changeMonth = (delta) => {
    setCurrentMonth(prev => {
      let m = prev + delta;
      let y = currentYear;

      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }

      setCurrentYear(y);
      return m;
    });
  };

  const handleDayClick = (day) => {
    if (!day) return;

    const iso = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split("T")[0];

    if (visitsDates.includes(iso)) {
      setSelectedDate(iso);
      setShowSummaryForm(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedDate(null);
    setShowSummaryForm(false);
  };

  const selectedInfo = selectedDate ? visitsMap[selectedDate] : null;

  useEffect(() => {
    if (selectedInfo?.summary) {
      setSummaryText(selectedInfo.summary);
    } else {
      setSummaryText("");
    }
  }, [selectedInfo]);

    return (
    <>
      {/* CALENDÁRIO (INALTERADO) */}
      <div className="patientVisitsWrapper">
        <div className="patientVisitsCalendar">
          <div className="calendarHeaderPatient">
            <div>
              <h4>Últimas visitas ao consultório</h4>
              <span className="calendarMonth">
                {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} {year}
              </span>
            </div>

            <div className="calendarNav">
              <button className="calendarNavBtn" onClick={() => changeMonth(-1)}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button className="calendarNavBtn" onClick={() => changeMonth(1)}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="calendarGridPatient">
            {weekDays.map((d, i) => (
              <div key={i} className="calendarWeekday">{d}</div>
            ))}

            {weeks.map((week, w) =>
              week.map((day, d) => {
                if (!day) {
                  return <div key={`${w}-${d}`} className="calendarDay empty" />;
                }

                const iso = new Date(year, currentMonth, day)
                  .toISOString()
                  .split("T")[0];

                const hasVisit = visitsDates.includes(iso);
                const isSelected = selectedDate === iso;

                return (
                  <button
                    key={`${w}-${d}`}
                    className={`calendarDay ${hasVisit ? "has-visit" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => handleDayClick(day)}
                    disabled={!hasVisit}
                  >
                    {day}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* OVERLAY MÉDICO */}
      {selectedDate && (
        <div className="visitsOverlayBackdrop" onClick={handleCloseDetails}>
          <aside
            className="patientVisitsDetailsOverlay"
            onClick={e => e.stopPropagation()}
          >

            {selectedInfo ? (
              <>
                {/* HEADER DA VISITA */}
                <div className="visitHeaderCard">
                  <div>
                    <h2>{selectedInfo.type}</h2>
                    <span className="visitMeta">
                      {selectedInfo.time?.slice(0, 5)} •{" "}
                      {new Date(selectedDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <button
                    className="closeDetailsBtn"
                    onClick={handleCloseDetails}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                {/* DESCRIÇÃO */}
                {selectedInfo.description && (
                  <div className="visitSection">
                    <h3>Descrição</h3>
                    <p>{selectedInfo.description}</p>
                  </div>
                )}

                {/* EVOLUÇÃO / RESUMO */}
                <div className="visitSection">
                  <h3>Evolução / Resumo clínico</h3>

                  {showSummaryForm ? (
                    <>
                      <textarea
                        value={summaryText}
                        onChange={(e) => setSummaryText(e.target.value)}
                        placeholder="Descreva a evolução clínica, conduta, observações..."
                        rows={6}
                        className="summaryTextarea"
                      />

                      <div className="visitActions">
                        <button
                          className="primaryBtn"
                          onClick={async () => {
                            await supabase.from("patient_visits").upsert({
                              patient_id: pacienteId,
                              appointment_id: selectedInfo.id,
                              summary: summaryText,
                            });

                            setShowSummaryForm(false);
                            fetchData();
                          }}
                        >
                          Salvar resumo
                        </button>
                      </div>
                    </>
                  ) : selectedInfo.summary ? (
                    <>
                      <div className="clinicalBox">
                        {selectedInfo.summary}
                      </div>

                      <div className="visitActions">
                        <button
                          className="primaryBtn"
                          onClick={() => setShowSummaryForm(true)}
                        >
                          ✏️ Editar resumo
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="visitActions">
                      <button
                        className="primaryBtn"
                        onClick={() => setShowSummaryForm(true)}
                      >
                        ➕ Adicionar resumo da consulta
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p>Nenhuma informação registrada.</p>
            )}
          </aside>
        </div>
      )}
    </>
  );
}