import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import { useLanguage } from '../../context/LanguageContext';
import { Note } from '../../types';

interface NoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

const NOTE_COLORS = ['', '#58a6ff', '#a371f7', '#ff6eb3', '#3fb950', '#d29922', '#f85149'];

export const NoteForm: React.FC<NoteFormProps> = ({ isOpen, onClose, note }) => {
  const { createNote, updateNote } = useNotes();
  const { t, language } = useLanguage();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color || '');
      setTags(note.tags || []);
    } else {
      setTitle(''); setContent(''); setColor(''); setTags([]);
    }
    setTagInput('');
  }, [isOpen, note]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        color: color || undefined,
        tags,
      };
      if (note) {
        await updateNote(note.id, payload);
      } else {
        await createNote(payload as any);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagInput('');
  };

  if (!isOpen) return null;

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block',
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ padding: 0 }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid var(--glass-border)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            {note ? t.notes.edit_note : t.notes.add_note}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>{t.notes.note_title}</label>
            <input
              className="glass-input"
              placeholder={t.notes.note_title_placeholder}
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={labelStyle}>{t.notes.content}</label>
            <textarea
              className="glass-input"
              placeholder={t.notes.content_placeholder}
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              style={{ resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Color */}
          <div>
            <label style={labelStyle}>{t.notes.color}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {NOTE_COLORS.map(c => (
                <button
                  key={c || 'none'}
                  onClick={() => setColor(c)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                    border: `2px solid ${color === c ? 'var(--text-primary)' : 'transparent'}`,
                    background: c || 'var(--glass-bg-card)',
                    outline: c === '' ? '1px solid var(--glass-border)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>{t.notes.tags}</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: tags.length > 0 ? 8 : 0 }}>
              <input
                className="glass-input"
                placeholder={language === 'ru' ? 'Добавить тег...' : 'Add a tag...'}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                style={{ flex: 1 }}
              />
              <button className="btn btn-ghost btn-icon" onClick={addTag} type="button">
                <Plus size={16} />
              </button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tags.map(tag => (
                  <span
                    key={tag}
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12,
                      background: 'var(--glass-bg-card)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                    }}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 10, padding: '16px 24px',
          borderTop: '1px solid var(--glass-border)', justifyContent: 'flex-end',
        }}>
          <button className="btn btn-ghost" onClick={onClose}>{t.notes.cancel}</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? '...' : t.notes.save}
          </button>
        </div>
      </div>
    </div>
  );
};
