import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

import './styles/appointments.css';

import Topbar from "../components/topbar";
import WeekBar from '../components/appointmentsComponents/WeekBar';
import Calendar from '../components/appointmentsComponents/Calendar';
import DaySchedule from '../components/appointmentsComponents/DaySchedule';
import SurgicalMapOverlay from '../components/appointmentsComponents/SurgicalMapOverlay';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showSurgeryMap, setShowSurgeryMap] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      const snapshot = await getDocs(collection(db, 'appointments'));
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(events);
    };

    fetchAppointments();
  }, []);

  return (
    <section className='sectionAppointments'>
      <Topbar showSearch={true} />


      {showSurgeryMap && (
        <SurgicalMapOverlay
          events={events}
          onClose={() => setShowSurgeryMap(false)}
        />
      )}

      <div className="sectionContainerAppointments">
        <div className="sectionAppointmentsLeft">
          <WeekBar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <DaySchedule selectedDate={selectedDate} events={events} setEvents={setEvents} />
        </div>
        <div className="sectionAppointmentsRight">
          <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <button
            className="surgeryMapButton"
            onClick={() => setShowSurgeryMap(true)}
          >
            Mapa Cirúrgico
          </button>
        </div>
      </div>
    </section>
  );
};

export default Appointments;
