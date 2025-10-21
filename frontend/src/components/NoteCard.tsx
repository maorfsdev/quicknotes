// NoteCard component
import { Edit, Trash2, Calendar } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="note-card">
      <h3 className="note-title">{note.title}</h3>
      
      <div className="note-content">
        {note.content.length > 150 
          ? `${note.content.substring(0, 150)}...` 
          : note.content
        }
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="note-actions">
        <button onClick={onEdit} className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }}>
          <Edit size={12} />
          Edit
        </button>
        <button onClick={onDelete} className="btn btn-danger" style={{ fontSize: '12px', padding: '4px 8px' }}>
          <Trash2 size={12} />
          Delete
        </button>
      </div>

      <div className="note-meta">
        <Calendar size={12} style={{ marginRight: '4px' }} />
        Updated {formatDate(note.updatedAt)}
      </div>
    </div>
  );
}
