import React, { useState, useEffect } from 'react';
import './styles/appointments.css';

import Topbar from "../components/topbar";
import WeekBar from '../components/appointmentsComponents/WeekBar';
import Calendar from '../components/appointmentsComponents/Calendar';
import DaySchedule from '../components/appointmentsComponents/DaySchedule';
import SurgicalMapOverlay from '../components/appointmentsComponents/SurgicalMapOverlay';

import { supabase } from "../utils/supabaseClient"; 

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showSurgeryMap, setShowSurgeryMap] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data, error } = await supabase
          .from('agendamentos')
          .select('*'); // pega todos os agendamentos

        if (error) {
          console.error('Erro ao buscar agendamentos:', error);
          return;
        }

        setEvents(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <section className='sectionAppointments'>
      <Topbar showSearch={true} />


      <div className="bannerheaderAppointments">
        <div className="bannerTitleAppointments">
          <h1>Faça seus agendamentos e cuide de seus pacientes aqui!</h1>
        </div>
        <div className="bannerButtonAppointments">
          <button>
            <i className="fa-solid fa-calendar-plus"></i>
            <p>Novo Agendamento</p>
          </button>
        </div>
      </div>
      
      <WeekBar selectedDate={selectedDate} onSelectDate={setSelectedDate} />


      {/*{showSurgeryMap && (
        <SurgicalMapOverlay
          events={events}
          onClose={() => setShowSurgeryMap(false)}
        />
      )}*/}

      {/*<div className="sectionContainerAppointments">
        {/* Esquerda → agenda do dia 
        <div className="sectionAppointmentsLeft">
          <DaySchedule 
            selectedDate={selectedDate} 
            events={events} 
            setEvents={setEvents} 
          />
        </div>*/}

        {/* Direita → calendário mensal + botão 
        <div className="sectionAppointmentsRight">
          <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <button
            className="surgeryMapButton"
            onClick={() => setShowSurgeryMap(true)}
          >
            Mapa Cirúrgico
          </button>
        </div>
      </div>*/}
    </section>
  );
};

export default Appointments;