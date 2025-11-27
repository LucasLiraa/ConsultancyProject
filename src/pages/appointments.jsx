import React, { useState } from "react";
import "./styles/appointments.css";

import Topbar from "../components/topbar";
import WeekBar from "../components/appointmentsComponents/WeekBar";
import DaySchedule from "../components/appointmentsComponents/DaySchedule";
import SurgicalMapOverlay from "../components/appointmentsComponents/SurgicalMapOverlay";
import { supabase } from "../utils/supabaseClient";

function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [abrirModal, setAbrirModal] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [showSurgeryMap, setShowSurgeryMap] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showReschedulePopup, setShowReschedulePopup] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleNew = () => {
    setEditTarget(null);
    setAbrirModal(true);
  };

  const handleEditFromPanel = (event) => {
    setEditTarget(event);
    setAbrirModal(true);
  };

  // 🔹 Abre mini interface de reagendamento
  const openReschedulePopup = (event) => {
    setEventoSelecionado(event);
    setNewDate(event.date || selectedDate.toISOString().split("T")[0]);
    setNewTime(event.time || "");
    setShowReschedulePopup(true);
  };

  // 🔹 Reagendar (com popup)
  const handleRescheduleFromPanel = async () => {
    try {
      if (!newDate || !newTime) {
        alert("Preencha a nova data e horário.");
        return;
      }

      const { error } = await supabase
        .from("agendamentos")
        .update({ date: newDate, time: newTime, updated_at: new Date() })
        .eq("id", eventoSelecionado.id);

      if (error) throw error;

      // fecha popup e recarrega
      setShowReschedulePopup(false);
      setReloadKey((k) => k + 1);
      setEventoSelecionado({ ...eventoSelecionado, date: newDate, time: newTime });
    } catch (err) {
      console.error("Erro ao reagendar:", err);
      alert("Erro ao reagendar. Veja console.");
    }
  };

  const handleDeleteFromPanel = async (event) => {
    try {
      const ok = window.confirm("Tem certeza que deseja excluir este agendamento?");
      if (!ok) return;

      const { error } = await supabase.from("agendamentos").delete().eq("id", event.id);
      if (error) throw error;

      setReloadKey((k) => k + 1);
      setEventoSelecionado(null);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir. Veja console.");
    }
  };

  // 🔹 Corrige exibição de data (-1 dia)
  const formatDateBR = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section className="sectionAppointments">
      <div className="containerAppointments">
        {/* Coluna esquerda */}
        <div className="containerAppointmentsEsq">
          <div className="bannerheaderAppointments">
            <div className="bannerTitleAppointments">
              <h3>Faça seus agendamentos e cuide de seus pacientes aqui!</h3>
            </div>
            <div className="bannerButtonAppointments">
              <button onClick={handleNew}>
                <i className="fa-solid fa-calendar-plus"></i>
                <p>Novo Agendamento</p>
              </button>
            </div>
          </div>

          <WeekBar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

          <DaySchedule
            selectedDate={selectedDate}
            events={events}
            setEvents={setEvents}
            abrirModal={abrirModal}
            setAbrirModal={(v) => {
              setAbrirModal(v);
              if (!v) {
                setReloadKey((k) => k + 1);
                setEditTarget(null);
              }
            }}
            onSelectEvent={(evt) => setEventoSelecionado(evt)}
            editTarget={editTarget}
            reloadKey={reloadKey}
          />
        </div>

        {/* Coluna direita */}
        <div className="containerAppointmentsDir">
          <div className="contentAppointmentsDir">
            <button onClick={() => setShowSurgeryMap(true)}>
              <div>
                <h1>Mapa de cirurgias</h1>
              </div>
            </button>
          </div>

          <div className="contentAppointmentsDetailsDir">
            <h1>Detalhes do agendamento</h1>
            {eventoSelecionado ? (
              <div className="eventDetailsCard">
                <h2>{eventoSelecionado.title}</h2>
                <p>
                  <strong>Data:</strong> {formatDateBR(eventoSelecionado.date)}
                </p>
                <p><strong>Horário:</strong> {eventoSelecionado.time}</p>
                <p><strong>Tipo:</strong> {eventoSelecionado.type}</p>
                {eventoSelecionado.description && (
                  <p><strong>Descrição:</strong> {eventoSelecionado.description}</p>
                )}

                {(eventoSelecionado.type === "Cirúrgia" || eventoSelecionado.type === "Cirurgia") && (
                  <div className="surgeryDetails">
                    {eventoSelecionado.procedure && <p><strong>Procedimento:</strong> {eventoSelecionado.procedure}</p>}
                    {eventoSelecionado.auxiliar && <p><strong>Médico Auxiliar:</strong> {eventoSelecionado.auxiliar}</p>}
                    {eventoSelecionado.instrumentadora && eventoSelecionado.instrumentadora.length > 0 && (
                      <p><strong>Instrumentadora(s):</strong> {Array.isArray(eventoSelecionado.instrumentadora) ? eventoSelecionado.instrumentadora.join(", ") : eventoSelecionado.instrumentadora}</p>
                    )}
                    {eventoSelecionado.hospital && <p><strong>Hospital:</strong> {eventoSelecionado.hospital}</p>}
                    {eventoSelecionado.tecnologia && <p><strong>Tecnologia:</strong> {eventoSelecionado.tecnologia}</p>}
                    {eventoSelecionado.protese && <p><strong>Prótese:</strong> {eventoSelecionado.protese}</p>}
                  </div>
                )}

                <div className="eventActions">
                  <button className="btn secondary" onClick={() => handleEditFromPanel(eventoSelecionado)}>✏️ Editar</button>
                  <button className="btn secondary" onClick={() => openReschedulePopup(eventoSelecionado)}>📅 Reagendar</button>
                  <button className="btn danger" onClick={() => handleDeleteFromPanel(eventoSelecionado)}>🗑️ Excluir</button>
                </div>
              </div>
            ) : (
              <p className="noEventSelected">Nenhum agendamento selecionado.</p>
            )}
          </div>
        </div>
      </div>

      {showSurgeryMap && (
        <SurgicalMapOverlay
          events={events}
          onClose={() => setShowSurgeryMap(false)}
        />
      )}

      {/* 🔹 Popup de reagendamento */}
      {showReschedulePopup && (
        <div className="rescheduleOverlay">
          <div className="reschedulePopup">
            <h3>Reagendar</h3>
            <label>Nova data:</label>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />

            <label>Novo horário:</label>
            <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />

            <div className="rescheduleButtons">
              <button className="btn primary" onClick={handleRescheduleFromPanel}>Salvar</button>
              <button className="btn secondary" onClick={() => setShowReschedulePopup(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Appointments;