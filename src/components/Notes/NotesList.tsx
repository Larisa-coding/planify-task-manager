import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, FileText } from 'lucide-react';
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
  const { notes, loading, deleteNote } = useNotes();
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = notes.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(tag => tag.toLowerCase().includes(q))
    );
  });

  const formatDate = (d: Date) =>
    format(d, language === 'ru' ? 'd MMM yyyy' : 'MMM d, yyyy', {
      locale: language === 'ru' ? ru : undefined,
    });

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      await deleteNote(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--glass-border)', borderTopColor: 'var(--accent-purple)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (notes.length === 0) {
    return (
      <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={onAddNote}>
            <Plus size={14} /> {t.notes.add_note}
          </button>
        </div>
        <div style={{
          background: 'var(--glass-bg-card)',
          backdropFilter: 'blur(20px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
          border: '1px solid var(--glass-border)',
          borderRadius: 20,
          padding: '52px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(180,141,245,0.12)',
            border: '1px solid rgba(180,141,245,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--accent-purple)',
          }}>
            <FileText size={28} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            {language === 'ru' ? 'Заметок пока нет' : 'No notes yet'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
            {language === 'ru'
              ? 'Записывайте мысли, идеи и важные вещи. Они останутся здесь пока вы не удалите их.'
              : 'Write down thoughts, ideas and important things. They will stay here until you delete them.'}
          </p>
          <button className="btn btn-primary" onClick={onAddNote}>
            <Plus size={15} /> {t.notes.add_note}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
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

      {filtered.length === 0 && search ? (
        <div style={{
          background: 'var(--glass-bg-card)', borderRadius: 16, padding: 32,
          border: '1px solid var(--glass-border)', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {language === 'ru' ? 'Ничего не найдено по запросу' : 'Nothing found for'} «{search}»
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}>
          {filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              language={language}
              formatDate={formatDate}
              isConfirmingDelete={confirmDelete === note.id}
              onEdit={() => onEditNote(note)}
              onDelete={() => handleDelete(note.id)}
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
  isConfirmingDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note, language, formatDate, isConfirmingDelete, onEdit, onDelete,
}) => {
  const cardBg = note.color ? `${note.color}18` : 'var(--glass-bg-card)';
  const borderColor = note.color ? `${note.color}30` : 'var(--glass-border)';

  return (
    <div
      style={{
        background: cardBg,
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        border: `1px solid ${borderColor}`,
        borderRadius: 18,
        padding: '20px',
        transition: 'all 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 160,
      }}
      className="note-card"
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <h3
          style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', flex: 1, cursor: 'pointer', lineHeight: 1.3 }}
          onClick={onEdit}
        >
          {note.title}
        </h3>
        {/* Always visible actions */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button
            onClick={onEdit}
            style={{
              width: 28, height: 28, borderRadius: 8, border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg-card)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)',
            }}
            aria-label="Edit"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={onDelete}
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: `1px solid ${isConfirmingDelete ? 'var(--accent-red)' : 'var(--glass-border)'}`,
              background: isConfirmingDelete ? 'rgba(224,96,96,0.15)' : 'var(--glass-bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: isConfirmingDelete ? 'var(--accent-red)' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
            aria-label={isConfirmingDelete ? 'Confirm delete' : 'Delete'}
            title={isConfirmingDelete ? (language === 'ru' ? 'Нажмите ещё раз для подтверждения' : 'Click again to confirm') : ''}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <p
        className="line-clamp-2"
        style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, flex: 1, cursor: 'pointer' }}
        onClick={onEdit}
      >
        {note.content || (language === 'ru' ? 'Нет содержимого' : 'No content')}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {note.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20,
                background: 'var(--glass-bg-card)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-muted)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
          {formatDate(note.updatedAt)}
        </span>
      </div>

      {isConfirmingDelete && (
        <div style={{ fontSize: 11, color: 'var(--accent-red)', textAlign: 'center', marginTop: -4 }}>
          {language === 'ru' ? '⚠ Нажмите ещё раз для удаления' : '⚠ Click again to delete'}
        </div>
      )}
    </div>
  );
};
