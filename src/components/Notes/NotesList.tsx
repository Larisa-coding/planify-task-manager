import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, Archive } from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import { useLanguage } from '../../context/LanguageContext';
import { Note } from '../../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface NotesListProps {
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
}

export const NotesList: React.FC<NotesListProps> = ({ onAddNote, onEditNote }) => {
  const { notes, loading, deleteNote, archiveNote } = useNotes();
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = notes.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(tag => tag.toLowerCase().includes(q));
  });

  const formatDate = (d: Date) =>
    format(d, language === 'ru' ? 'd MMM yyyy' : 'MMM d, yyyy', { locale: language === 'ru' ? ru : undefined });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--glass-border)', borderTopColor: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="glass-input"
            placeholder={t.notes.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={onAddNote}>
          <Plus size={14} /> {t.notes.add_note}
        </button>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        {filtered.length} {language === 'ru' ? 'заметок' : 'notes'}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
            {search ? (language === 'ru' ? 'Ничего не найдено' : 'Nothing found') : t.notes.no_notes_subtitle}
          </p>
          {!search && (
            <button className="btn btn-primary" onClick={onAddNote}>
              <Plus size={15} /> {t.notes.add_note}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              language={language}
              formatDate={formatDate}
              onEdit={() => onEditNote(note)}
              onDelete={() => deleteNote(note.id)}
              onArchive={() => archiveNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  language: string;
  formatDate: (d: Date) => string;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, language, formatDate, onEdit, onDelete, onArchive }) => {
  const [hovered, setHovered] = useState(false);

  const accent = note.color || 'var(--accent-blue)';

  return (
    <div
      className="note-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderTopColor: accent,
        borderTopWidth: 3,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <h3
          style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1, cursor: 'pointer' }}
          onClick={onEdit}
        >
          {note.title}
        </h3>
        {hovered && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button className="btn btn-ghost btn-icon" onClick={onEdit} style={{ padding: 4 }}>
              <Edit2 size={13} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onArchive} style={{ padding: 4 }}>
              <Archive size={13} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button className="btn btn-danger btn-icon" onClick={onDelete} style={{ padding: 4 }}>
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      <p
        className="line-clamp-2"
        style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, cursor: 'pointer' }}
        onClick={onEdit}
      >
        {note.content || (language === 'ru' ? 'Нет содержимого' : 'No content')}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {note.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 20,
                background: 'var(--glass-bg-card)', border: '1px solid var(--glass-border)',
                color: 'var(--text-muted)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
          {formatDate(note.updatedAt)}
        </span>
      </div>
    </div>
  );
};
