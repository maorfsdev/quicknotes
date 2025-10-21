import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Save } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

interface NoteEditorProps {
  note?: Note | null;
  onClose: () => void;
  onSave: () => void;
}

export default function NoteEditor({ note, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags.join(', '));
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const noteData = {
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      if (note) {
        await api.patch(`/notes/${note.id}`, noteData);
      } else {
        await api.post('/notes', noteData);
      }

      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {note ? 'Edit Note' : 'Create Note'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content
            </label>
            <textarea
              id="content"
              className="form-input form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              className="form-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, personal, important"
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Saving...' : (note ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
