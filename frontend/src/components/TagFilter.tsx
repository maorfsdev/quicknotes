import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TagFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TagFilter({ value, onChange }: TagFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the input - only call onChange after user stops typing for 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="filter-section">
      <div className="filter-row">
        <div className="filter-input">
          <label htmlFor="tagFilter" className="form-label">
            Search notes
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              id="tagFilter"
              className="form-input"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              placeholder="Search in titles, content, and tags (e.g., work, meeting, important)"
            />
            {localValue && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
