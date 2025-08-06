import React, { useEffect, useState } from 'react';
import '../styles/patientsStyles/notePatients.css';

const PatientNotes = () => {
  const [notes, setNotes] = useState(() => {
    const storedNotes = localStorage.getItem('patientNotes');
    return storedNotes ? JSON.parse(storedNotes) : [];
  });

  const [noteText, setNoteText] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);

  const LOCAL_STORAGE_KEY = 'patientNotes';

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (noteText.trim()) {
      const newNote = {
        text: noteText,
        author: 'Dr. Paulo Vasconcelos', // Em breve será dinâmico via login
        date: new Date(),
        expanded: false,
      };
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setNoteText('');
    }
  };

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long' };
    return new Intl.DateTimeFormat('pt-BR', options).format(new Date(date));
  };

  const formatTime = (date) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('pt-BR', options).format(new Date(date));
  };

  const toggleExpand = (index) => {
    const updatedNotes = [...notes];
    updatedNotes[index].expanded = !updatedNotes[index].expanded;
    setNotes(updatedNotes);
  };

  const lastNote = notes[notes.length - 1];


  return (
    <div className="patientNotes">
      <div className="patientNotesTitle">
        <h4>Anotações da Paciente</h4>
        {notes.length > 0 && (
          <button onClick={() => setShowAllNotes(!showAllNotes)}>
            {showAllNotes ? 'Ocultar' : 'Ver todas'}
          </button>
        )}
      </div>

      <div className="containerPatientNotes">
        <textarea
          placeholder="Adicione uma anotação..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <button onClick={handleAddNote}>Adicionar anotação</button>
      </div>

      {lastNote && (
        <div className="contentPatientNotes">
          <h4>Última anotação</h4>
          <div className="contentPatientNotesUser">
            <div className="contentPatientNotesUserInfo">
              <img
                src={`${process.env.PUBLIC_URL}/profile-icon.jpg`}
                alt="User"
                className="contentPatientNotesImage"
              />
              <span>{lastNote.author}</span>
            </div>
            <p>
              {formatDate(lastNote.date)} às {formatTime(lastNote.date)}
            </p>
          </div>
        </div>
      )}

      {showAllNotes && (
        <div className="allNotesList">
          <h4>Histórico de Anotações</h4>
          <ul>
            {notes.map((note, index) => (
              <li key={index} className="noteItem">
                <div className="noteHeader">
                  <img
                    src={`${process.env.PUBLIC_URL}/profile-icon.jpg`}
                    alt="User"
                  />
                  <div>
                    <strong>{note.author}</strong>
                    <p>
                      {formatDate(note.date)} às {formatTime(note.date)}
                    </p>
                  </div>
                </div>
                
                <div className="noteContent">
                  <p className={note.expanded ? 'expandedText' : 'collapsedText'}>
                    {note.text}
                  </p>
                  {note.text.length > 60 && (
                    <button onClick={() => toggleExpand(index)} className="toggleButton">
                      {note.expanded ? 'Ver menos' : 'Ver mais'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PatientNotes;