import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotesList from '../components/NotesList';
import NoteEditor from '../components/NoteEditor';
import TagFilter from '../components/TagFilter';
import { Plus, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [tagFilter, setTagFilter] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowEditor(true);
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingNote(null);
  };

  const handleNoteSaved = () => {
    setShowEditor(false);
    setEditingNote(null);
    // Add a small delay to ensure backend cache is updated
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
    }, 100);
  };

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <a href="/" className="logo">QuickNotes</a>
            <nav className="nav">
              <span>Welcome, {user?.email}</span>
              <button onClick={logout} className="btn btn-secondary">
                <LogOut size={16} />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleCreateNote} className="btn btn-primary">
            <Plus size={16} />
            Create Note
          </button>
        </div>

        <TagFilter value={tagFilter} onChange={setTagFilter} />

        <NotesList 
          tagFilter={tagFilter} 
          onEditNote={handleEditNote}
          onNoteDeleted={handleCloseEditor}
          refreshTrigger={refreshTrigger}
        />

        {showEditor && (
          <NoteEditor
            note={editingNote}
            onClose={handleCloseEditor}
            onSave={handleNoteSaved}
          />
        )}
      </div>
    </div>
  );
}
