import React, { useEffect, useState } from 'react';
import { supabase } from "../../utils/supabaseClient"; // ajuste o caminho
import '../styles/patientsStyles/notePatients.css';

const PatientNotes = ({ pacienteId }) => {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [author, setAuthor] = useState('Dr. Paulo'); // valor padrão
  const [showAllNotes, setShowAllNotes] = useState(false);

  // 🔹 Buscar anotações do paciente no Supabase
  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("anotacoes")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("data_criacao", { ascending: true });

      if (error) {
        console.error("Erro ao carregar anotações:", error.message);
      } else {
        setNotes(data || []);
      }
    };

    if (pacienteId) fetchNotes();
  }, [pacienteId]);

  // 🔹 Adicionar anotação
  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    const { data, error } = await supabase
      .from("anotacoes")
      .insert([
        {
          paciente_id: pacienteId,
          autor: author,
          texto: noteText,
        },
      ])
      .select();

    if (error) {
      console.error("Erro ao salvar anotação:", error.message);
    } else {
      setNotes((prev) => [...prev, data[0]]);
      setNoteText('');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

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

      {/* Input para nova anotação */}
      <div className="containerPatientNotes">
        <textarea
          placeholder="Adicione uma anotação..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />

        <div className="contentPatientOptions">
          <select value={author} onChange={(e) => setAuthor(e.target.value)}>
            <option value="Dr. Paulo">Dr. Paulo Vasconcelos</option>
            <option value="Vanusa">Vanusa de Paula Araújo</option>
            <option value="Alane">Alane</option>
          </select>

          <button onClick={handleAddNote}>Adicionar anotação</button>
        </div>
      </div>

      {/* Última anotação */}
      {lastNote && (
        <div className="contentPatientNotes">
          <h4>Última anotação</h4>
          <div className="contentPatientNotesUser">
            <div className="contentPatientNotesUserInfo">
              <img src="/profile-icon.jpg" alt="User" className="contentPatientNotesImage" />
              <span>{lastNote.autor}</span>
            </div>
            <p>{formatDate(lastNote.data_criacao)} às {formatTime(lastNote.data_criacao)}</p>
          </div>
        </div>
      )}

      {/* Histórico */}
      {showAllNotes && (
        <div className="allNotesList">
          <h4>Histórico de Anotações</h4>
          <ul>
            {notes.map((note) => (
              <li key={note.id} className="noteItem">
                <div className="noteHeader">
                  <img src="/profile-icon.jpg" alt="User" />
                  <div>
                    <strong>{note.autor}</strong>
                    <p>{formatDate(note.data_criacao)} às {formatTime(note.data_criacao)}</p>
                  </div>
                </div>
                <div className="noteContent">
                  <p>{note.texto}</p>
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