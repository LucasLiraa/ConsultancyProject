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
  const [reloadKey, setReloadKey] = useState(0); // incrementar para forçar reload no DaySchedule

  // Abre modal para criar novo (limpo)
  const handleNew = () => {
    setEditTarget(null);
    setAbrirModal(true);
  };

  // Editar puxando do painel de detalhes
  const handleEditFromPanel = (event) => {
    setEditTarget(event);
    setAbrirModal(true);
  };

  // Reagendar (painel): prompt -> atualiza DB -> dispara reload
  const handleRescheduleFromPanel = async (event) => {
    try {
      const newDate = prompt(
        "Nova data (AAAA-MM-DD):",
        event.date || selectedDate.toISOString().split("T")[0]
      );
      if (!newDate) return;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        alert("Formato de data inválido. Use AAAA-MM-DD.");
        return;
      }
      const newTime = prompt("Novo horário (HH:mm):", event.time || "");
      if (!newTime) return;
      if (!/^\d{2}:\d{2}$/.test(newTime)) {
        alert("Formato de horário inválido. Use HH:mm.");
        return;
      }

      const { error } = await supabase
        .from("agendamentos")
        .update({ date: newDate, time: newTime, updated_at: new Date() })
        .eq("id", event.id);

      if (error) throw error;

      // atualiza lista no DaySchedule via reloadKey
      setReloadKey((k) => k + 1);

      // se o painel está mostrando esse evento, atualiza nele também
      setEventoSelecionado({ ...event, date: newDate, time: newTime });
    } catch (err) {
      console.error("Erro ao reagendar:", err);
      alert("Erro ao reagendar. Veja console.");
    }
  };

  // Excluir (painel): confirma -> delete -> reload -> limpar painel
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

  return (
    <section className="sectionAppointments">
      <Topbar showSearch={true} />

      <div className="containerAppointments">
        {/* Coluna esquerda */}
        <div className="containerAppointmentsEsq">
          <div className="bannerheaderAppointments">
            <div className="bannerTitleAppointments">
              <h1>Faça seus agendamentos e cuide de seus pacientes aqui!</h1>
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
                  <strong>Data:</strong>{" "}
                  {new Date(eventoSelecionado.date).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
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
                  <button className="btn secondary" onClick={() => handleRescheduleFromPanel(eventoSelecionado)}>📅 Reagendar</button>
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
    </section>
  );
}

export default Appointments;