import React, { useEffect, useState, useMemo } from "react";
import "../styles/appointmentsStyles/SurgicalMapOverlay.css";
import { supabase } from "../../utils/supabaseClient";

const SurgicalMapOverlay = ({ onClose }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [surgeries, setSurgeries] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [loading, setLoading] = useState(true);

  // range mensal
  const monthRange = useMemo(() => {
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0);
    const fmt = (d) => d.toISOString().split("T")[0];
    return { start: fmt(start), end: fmt(end) };
  }, [currentMonth, currentYear]);

  // buscar cirurgias
  useEffect(() => {
    const fetchSurgeries = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("agendamentos")
          .select("*")
          .gte("date", monthRange.start)
          .lte("date", monthRange.end)
          .in("type", ["Cirurgia", "Cirúrgia"])
          .order("date", { ascending: true })
          .order("time", { ascending: true });

        if (error) throw error;

        const normalized = (data || []).map((d) => ({
          ...d,
          instrumentadora:
            d.instrumentadora && typeof d.instrumentadora === "string"
              ? JSON.parse(d.instrumentadora)
              : d.instrumentadora || [],
        }));

        setSurgeries(normalized);
      } catch (err) {
        console.error("Erro ao buscar cirurgias:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurgeries();
  }, [monthRange]);

  const handleMonthChange = (delta) => {
    const newDate = new Date(currentYear, currentMonth + delta);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
    setSelectedDay(null);
    setSelectedSurgery(null);
  };

  // dias com cirurgia
  const daysWithSurgeries = useMemo(() => {
    return new Set(surgeries.map((s) => s.date));
  }, [surgeries]);

  // filtragem
  const filteredSurgeries = useMemo(() => {
    if (!selectedDay) return surgeries;
    return surgeries.filter(
      (s) => s.date === selectedDay.toISOString().split("T")[0]
    );
  }, [surgeries, selectedDay]);

  const groupedByDay = useMemo(() => {
    const grouped = {};
    filteredSurgeries.forEach((s) => {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push(s);
    });
    return grouped;
  }, [filteredSurgeries]);

  // dashboard
  const total = surgeries.length;
  const nextSurgery = surgeries.find(
    (s) => new Date(s.date + "T" + s.time) > new Date()
  );
  const hospitalCount = {};
  const procedureCount = {};
  surgeries.forEach((s) => {
    if (s.hospital)
      hospitalCount[s.hospital] = (hospitalCount[s.hospital] || 0) + 1;
    if (s.procedure)
      procedureCount[s.procedure] = (procedureCount[s.procedure] || 0) + 1;
  });
  const topHospital = Object.entries(hospitalCount).sort((a, b) => b[1] - a[1])[0];
  const topProcedure = Object.entries(procedureCount).sort((a, b) => b[1] - a[1])[0];

  const renderCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startWeekDay = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < startWeekDay; i++) {
      days.push(<div key={`empty-${i}`} className="day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateKey = date.toISOString().split("T")[0];
      const hasSurgery = daysWithSurgeries.has(dateKey);
      const isSelected =
        selectedDay && selectedDay.toDateString() === date.toDateString();
      days.push(
        <div
          key={i}
          className={`day ${hasSurgery ? "highlight" : ""} ${
            isSelected ? "selected" : ""
          }`}
          onClick={() => {
            setSelectedDay(date);
            setSelectedSurgery(null);
          }}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="surgicalOverlay">
      <div className="surgicalHeader">
        <h2>Mapa de Cirurgias</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="surgicalContainer">
        {/* COLUNA ESQUERDA */}
        <div className="surgicalLeft">
          <h3>
            {selectedDay
              ? `Cirurgias de ${selectedDay.toLocaleDateString("pt-BR")}`
              : "Próximas Cirurgias"}
          </h3>
          {selectedDay && (
            <button className="backButton" onClick={() => setSelectedDay(null)}>
              ← Ver todas
            </button>
          )}

          {loading ? (
            <p>Carregando...</p>
          ) : Object.keys(groupedByDay).length === 0 ? (
            <p>Nenhuma cirurgia encontrada.</p>
          ) : (
            Object.entries(groupedByDay).map(([date, list]) => (
              <div key={date} className="surgeryDayGroup">
                {!selectedDay && (
                  <h4>
                    {new Date(date).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    })}
                  </h4>
                )}
                {list.map((s) => (
                  <div
                    className={`surgeryCard ${
                      selectedSurgery?.id === s.id ? "active" : ""
                    }`}
                    key={s.id}
                    onClick={() =>
                      setSelectedSurgery(
                        selectedSurgery?.id === s.id ? null : s
                      )
                    }
                  >
                    <div className="time">{s.time}</div>
                    <div className="details">
                      <strong>{s.title}</strong>
                      <p>{s.procedure}</p>
                      <span>{s.hospital}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* CALENDÁRIO */}
        <div className="surgicalCenter">
          <div className="calendarHeader">
            <button onClick={() => handleMonthChange(-1)}>‹</button>
            <h3>{monthName}</h3>
            <button onClick={() => handleMonthChange(1)}>›</button>
          </div>
          <div className="calendarGrid">{renderCalendar()}</div>
        </div>

        {/* DASHBOARD + DETALHES */}
        <div className="surgicalRight">
          <h3>Resumo do Mês</h3>
          <div className="summaryCard">
            <p>Total de cirurgias</p>
            <h2>{total}</h2>
          </div>
          {topHospital && (
            <div className="summaryCard">
              <p>Hospital com mais cirurgias</p>
              <h4>{topHospital[0]}</h4>
              <span>{topHospital[1]} no total</span>
            </div>
          )}
          {topProcedure && (
            <div className="summaryCard">
              <p>Procedimento mais realizado</p>
              <h4>{topProcedure[0]}</h4>
              <span>{topProcedure[1]} no total</span>
            </div>
          )}
          {nextSurgery && (
            <div className="summaryCard">
              <p>Próxima cirurgia</p>
              <h4>{nextSurgery.title}</h4>
              <span>
                {new Date(nextSurgery.date).toLocaleDateString("pt-BR")} às{" "}
                {nextSurgery.time}
              </span>
            </div>
          )}

          {/* PAINEL DE DETALHES */}
          {selectedSurgery && (
            <div className="detailsPanel">
              <div className="detailsHeader">
                <h3>Detalhes da Cirurgia</h3>
                <button onClick={() => setSelectedSurgery(null)}>✕</button>
              </div>
              <p><strong>Data:</strong> {new Date(selectedSurgery.date).toLocaleDateString("pt-BR")}</p>
              <p><strong>Horário:</strong> {selectedSurgery.time}</p>
              <p><strong>Procedimento:</strong> {selectedSurgery.procedure || "—"}</p>
              <p><strong>Hospital:</strong> {selectedSurgery.hospital || "—"}</p>
              {selectedSurgery.auxiliar && (
                <p><strong>Auxiliar:</strong> {selectedSurgery.auxiliar}</p>
              )}
              {Array.isArray(selectedSurgery.instrumentadora) &&
                selectedSurgery.instrumentadora.length > 0 && (
                  <p>
                    <strong>Instrumentadora(s):</strong>{" "}
                    {selectedSurgery.instrumentadora.join(", ")}
                  </p>
                )}
              {selectedSurgery.tecnologia && (
                <p><strong>Tecnologia:</strong> {selectedSurgery.tecnologia}</p>
              )}
              {selectedSurgery.protese && (
                <p><strong>Prótese:</strong> {selectedSurgery.protese}</p>
              )}
              {selectedSurgery.description && (
                <p><strong>Descrição:</strong> {selectedSurgery.description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurgicalMapOverlay;