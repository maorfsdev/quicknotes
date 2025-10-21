import { useState, useEffect } from 'react';
import api from '../services/api';
import NoteCard from './NoteCard';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface NotesListProps {
  tagFilter: string; // Keep the same prop name for backward compatibility
  onEditNote: (note: Note) => void;
  onNoteDeleted: () => void;
  refreshTrigger?: number;
}

export default function NotesList({ 
  tagFilter, 
  onEditNote, 
  onNoteDeleted,
  refreshTrigger 
}: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      // Always use server-side filtering for Redis caching benefits
      const params = tagFilter ? { tags: tagFilter } : {};
      const response = await api.get('/notes', { params });
      setNotes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes when tagFilter or refreshTrigger changes (server-side with Redis caching)
  useEffect(() => {
    fetchNotes(); // Always use server-side filtering for Redis caching
  }, [tagFilter, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(note => note.id !== id));
      onNoteDeleted();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete note');
    }
  };

  if (loading) {
    return <div className="loading">Loading notes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <h3>No notes found</h3>
        <p>Create your first note to get started!</p>
      </div>
    );
  }

  if (notes.length === 0 && tagFilter.trim()) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3>No notes match your search</h3>
        <p>Try different search terms or create a new note.</p>
      </div>
    );
  }

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={() => onEditNote(note)}
          onDelete={() => handleDelete(note.id)}
        />
      ))}
    </div>
  );
}
