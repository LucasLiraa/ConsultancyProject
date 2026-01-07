import { useEffect, useState } from 'react';
import '../styles/appointmentsStyles/DaySchedule.css';
import { supabase } from "../../utils/supabaseClient"; 

// cores por tipo (INALTERADO)
const typeColors = {
  "Consulta presencial": "blue",
  "Consulta online": "blue",
  "Cirurgia": "navy",
  "Entrega de exames": "purple",
  "Dúvidas presencial": "orange",
  "Dúvidas online": "orange",
  "Fechamento": "green",
  "Drenagem": "pink",
  "Pós-operatório": "darkred",
  "Drenagem + pós-operatório": "linear-gradient(90deg, pink, darkred)",
  "Procedimento facial": "gray"
};

const generateTimeSlots = (start, end, intervalMinutes) => {
  const slots = [];
  let [h, m] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  while (h < endH || (h === endH && m <= endM)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += intervalMinutes;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
  }
  return slots;
};

const DaySchedule = ({
  selectedDate,
  events,
  setEvents,
  abrirModal,
  setAbrirModal,
  onSelectEvent,
  editTarget,
  reloadKey,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatients, setShowPatients] = useState(false);

  const [formData, setFormData] = useState({
    time: '',
    title: '',
    type: 'Consulta presencial',
    description: '',
    procedure: '',
    hospital: '',
    auxiliar: '',
    instrumentadora: [''], // MANTIDO
    protese: '',
    tecnologia: '',
    patient_id: null, // UUID
  });

  const dateKey = selectedDate.toLocaleDateString('en-CA'); 

  // =========================
  // PACIENTES
  // =========================
  useEffect(() => {
    supabase
      .from('pacientes')
      .select('id, nome')
      .then(({ data }) => setPatients(data || []));
  }, []);

  const handlePatientSearch = (e) => {
    const value = e.target.value;
    setPatientName(value);
    setShowPatients(true);

    setFilteredPatients(
      patients.filter(p =>
        p.nome.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handlePatientSelect = (patient) => {
    setPatientName(patient.nome);
    setFormData({ ...formData, patient_id: patient.id });
    setShowPatients(false);
  };

  const [usePatient, setUsePatient] = useState(false);

  // =========================
  // FETCH AGENDAMENTOS
  // =========================
  const fetchEventsForDate = async () => {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        pacientes (
          nome
        )
      `)
      .eq('date', dateKey)
      .order('time', { ascending: true });

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return;
    }

    setEvents(
      (data || []).map(d => ({
        ...d,
        instrumentadora: Array.isArray(d.instrumentadora)
          ? d.instrumentadora
          : [],
      }))
    );
  };

  useEffect(() => {
    fetchEventsForDate();
  }, [selectedDate, reloadKey]);

  // =========================
  // EDITAR
  // =========================
 useEffect(() => {
    if (editTarget) {
      const { pacientes, ...cleanTarget } = editTarget;

      setIsEditing(true);
      setEditId(editTarget.id);

      setFormData({
        ...cleanTarget,
        time: editTarget.time?.slice(0, 5) || '', // ✅ AQUI
        patient_id: editTarget.patient_id || null,
        instrumentadora: Array.isArray(editTarget.instrumentadora)
          ? editTarget.instrumentadora
          : [''],
      });

      setPatientName(editTarget.pacientes?.nome || '');
      setUsePatient(!!editTarget.patient_id);
      setAbrirModal(true);
    }
  }, [editTarget]);

  // =========================
  // SALVAR
  // =========================
  const safePatientId = usePatient ? formData.patient_id : null;

  const handleSubmit = async () => {
    if (!formData.time || !formData.title) {
      alert('Preencha horário e título');
      return;
    }

    const payload = {
      ...formData,
      patient_id: safePatientId,
      date: dateKey,
      instrumentadora: formData.instrumentadora.filter(
        i => i && i.trim() !== ''
      ),
      updated_at: new Date(),
    };

    const query = isEditing
      ? supabase.from('agendamentos').update(payload).eq('id', editId)
      : supabase.from('agendamentos').insert([{ ...payload, created_at: new Date() }]);

    const { error } = await query;

    if (error) {
      console.error(error);
      alert('Erro ao salvar');
      return;
    }

    fetchEventsForDate();
    handleCloseForm();

    
    onSelectEvent && onSelectEvent(null);

    await fetchEventsForDate();
    onSelectEvent && onSelectEvent(null);
    handleCloseForm();

  };

  

  const handleCloseForm = () => {
    setAbrirModal(false);
    setIsEditing(false);
    setEditId(null);
    setPatientName('');
    setFormData({
      time: '',
      title: '',
      type: 'Consulta presencial',
      description: '',
      procedure: '',
      hospital: '',
      auxiliar: '',
      instrumentadora: [''],
      protese: '',
      tecnologia: '',
      patient_id: null,
    });
  };

  const formattedDisplayDate = selectedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const [patientName, setPatientName] = useState('');

  return (
    <div className='appointmentsDay'>

      <h3>Agendamentos para {formattedDisplayDate}</h3>

      {events.length === 0 && <p className="noEvents">Nenhum agendamento.</p>}

      <div className="appointmentsList">
        {[...events]
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((event) => (
          <div 
            key={event.id} 
            className={`appointmentCard ${event.type === 'Cirurgia' ? 'isSurgery' : ''}`}
          >
            <div className="appointmentInfo">
              <div>
                <strong className="appointmentTime">
                  {event.time?.slice(0, 5)}
                </strong>


                <h4 className="appointmentTitle">
                  {event.pacientes?.nome
                  ? `${event.pacientes.nome} - ${event.title}`
                  : event.title}
                </h4>

                {event.description && (
                  <p className="appointmentDescription">
                    {event.description}
                  </p>
                )}
              </div>

              <span
                className="appointmentType"
                style={{ background: typeColors[event.type] || '#999' }}
              >
                {event.type}
              </span>
            </div>

            <div className="appointmentActions">
              <button onClick={() => onSelectEvent && onSelectEvent(event)}>
                Ver detalhes
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {abrirModal && (
        <div className="appointmentsFormOverlay" onClick={handleCloseForm}>
          <div className="appointmentsForm" onClick={e => e.stopPropagation()}>

            <div className="patientToggle">
              <span>Atrelar paciente</span>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={usePatient}
                  onChange={() => {
                    setUsePatient(!usePatient);
                    if (usePatient) {
                      setFormData({ ...formData, patient_id: null });
                      setPatientName('');
                      setShowPatients(false);
                    }
                  }}
                />
                <span className="slider"></span>
              </label>
            </div>

            {usePatient && (
              <div className="patientField">
                <input
                  type="text"
                  value={patientName}
                  onChange={handlePatientSearch}
                  placeholder="Digite o nome do paciente"
                  onFocus={() => setShowPatients(true)}
                />

                {showPatients && filteredPatients.length > 0 && (
                  <ul className="patientAutocomplete">
                    {filteredPatients.map((patient) => (
                      <li
                        key={patient.id}
                        onClick={() => {
                          setFormData({ ...formData, patient_id: patient.id });
                          setPatientName(patient.nome);
                          setShowPatients(false);
                        }}
                      >
                        {patient.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <label>Título</label>
            <input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />

            <label>Tipo</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              {Object.keys(typeColors).map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <label>Horário</label>
            <select
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
            >
              <option value="">Selecione</option>
              {generateTimeSlots('06:00', '20:00', 30).map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <label>Descrição:</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Descrição do agendamento"
          />

            {formData.type === 'Cirurgia' && (
              <>
                <label>Procedimento:</label>
                <input
                  value={formData.procedure || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, procedure: e.target.value })
                  }
                />

                <label>Médico Auxiliar:</label>
                <input
                  value={formData.auxiliar || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, auxiliar: e.target.value })
                  }
                />

                <label>Instrumentadora(s):</label>
                {formData.instrumentadora.map((inst, i) => (
                  <input
                    key={i}
                    value={inst}
                    onChange={(e) => {
                      const arr = [...formData.instrumentadora];
                      arr[i] = e.target.value;
                      setFormData({ ...formData, instrumentadora: arr });
                    }}
                    placeholder={`Instrumentadora ${i + 1}`}
                  />
                ))}

                <button
                  type="button"
                  className="addInstrumentadoraBtn"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      instrumentadora: [...formData.instrumentadora, ''],
                    })
                  }
                >
                  + Adicionar Instrumentadora
                </button>


                <label>Hospital:</label>
                <input
                  value={formData.hospital || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, hospital: e.target.value })
                  }
                />

                <label>Tecnologia:</label>
                <input
                  value={formData.tecnologia || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tecnologia: e.target.value })
                  }
                />

                <label>Prótese:</label>
                <input
                  value={formData.protese || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, protese: e.target.value })
                  }
                />
              </>
            )}

            <div className="formActions">
              <button onClick={handleSubmit}>
                {isEditing ? 'Salvar' : 'Adicionar'}
              </button>
              <button onClick={handleCloseForm}>Cancelar</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DaySchedule;