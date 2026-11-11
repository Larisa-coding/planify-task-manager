import React, { useState, useMemo } from 'react';
import { RotateCcw, Trash2, Clock, Calendar, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useAllTasksForArchive } from '../../hooks/useTasks';
import { useNotes } from '../../hooks/useNotes';
import { useLanguage } from '../../context/LanguageContext';
import { Task } from '../../types';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ArchiveViewProps {
  onEditTask: (task: Task) => void;
}

type Tab = 'tasks' | 'notes';
type Filter = 'all' | 'completed' | 'deleted';

const categoryColors: Record<string, string> = {
  personal: 'var(--accent-purple)',
  work: 'var(--accent-blue)',
  wishes: 'var(--accent-pink)',
};

export default function ArchiveView({ onEditTask }: ArchiveViewProps) {
  const { tasks, loading: tasksLoading, permanentDelete: permDeleteTask, restore: restoreTask } = useAllTasksForArchive();
  const { notes, loading: notesLoading, permanentDelete: permDeleteNote, restoreNote } = useNotes(true);
  const { t, language } = useLanguage();

  const [tab, setTab] = useState<Tab>('tasks');
  const [filter, setFilter] = useState<Filter>('all');

  const archivedTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.status === 'new' || task.status === 'in_progress') return false; // active
      if (task.status === 'completed' && !task.isDeleted) {
        return filter === 'all' || filter === 'completed';
      }
      if (task.isDeleted) {
        return filter === 'all' || filter === 'deleted';
      }
      if (task.status === 'cancelled') {
        return filter === 'all' || filter === 'deleted';
      }
      return false;
    }).sort((a, b) => {
      const dateA = a.deletedAt || a.completedAt || a.updatedAt;
      const dateB = b.deletedAt || b.completedAt || b.updatedAt;
      return dateB.getTime() - dateA.getTime();
    });
  }, [tasks, filter]);

  const archivedNotes = useMemo(() => {
    return notes.filter(n => n.isDeleted || n.archived);
  }, [notes]);

  const formatDate = (d?: Date) => {
    if (!d) return '—';
    return format(d, language === 'ru' ? 'd MMM yyyy' : 'MMM d, yyyy', { locale: language === 'ru' ? ru : undefined });
  };

  const formatDuration = (task: Task): string => {
    if (!task.completedAt) return '—';
    const totalMinutes = differenceInMinutes(task.completedAt, task.createdAt);
    if (totalMinutes < 60) return `${totalMinutes} ${language === 'ru' ? 'мин' : 'min'}`;
    const hours = differenceInHours(task.completedAt, task.createdAt);
    if (hours < 24) return `${hours}${t.archive.hours}`;
    const days = Math.floor(hours / 24);
    return `${days} ${t.archive.days}`;
  };

  const filterButtons: { value: Filter; label: string }[] = [
    { value: 'all',       label: t.archive.filter_all },
    { value: 'completed', label: t.archive.filter_completed },
    { value: 'deleted',   label: t.archive.filter_deleted },
  ];

  return (
    <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          {t.archive.title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.archive.subtitle}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--glass-bg-card)', borderRadius: 12, padding: 4, border: '1px solid var(--glass-border)', width: 'fit-content' }}>
        {(['tasks', 'notes'] as Tab[]).map(tabId => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            style={{
              padding: '7px 20px', borderRadius: 9, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', border: 'none',
              background: tab === tabId ? 'var(--glass-bg-card-hover)' : 'transparent',
              color: tab === tabId ? 'var(--text-primary)' : 'var(--text-muted)',
              borderColor: tab === tabId ? 'var(--glass-border)' : 'transparent',
            }}
          >
            {tabId === 'tasks' ? t.archive.tasks_tab : t.archive.notes_tab}
          </button>
        ))}
      </div>

      {tab === 'tasks' && (
        <>
          {/* Filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {filterButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: filter === btn.value ? 'rgba(88,166,255,0.15)' : 'var(--glass-bg-card)',
                  border: `1px solid ${filter === btn.value ? 'var(--accent-blue)' : 'var(--glass-border)'}`,
                  color: filter === btn.value ? 'var(--accent-blue)' : 'var(--text-secondary)',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Task count */}
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {archivedTasks.length} {language === 'ru' ? 'задач' : 'tasks'}
          </div>

          {tasksLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--glass-border)', borderTopColor: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : archivedTasks.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t.archive.no_archived}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {archivedTasks.map(task => (
                <ArchiveTaskRow
                  key={task.id}
                  task={task}
                  language={language}
                  formatDate={formatDate}
                  formatDuration={formatDuration}
                  t={t}
                  onRestore={() => restoreTask(task.id)}
                  onDelete={() => permDeleteTask(task.id)}
                  onEdit={() => onEditTask(task)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'notes' && (
        <>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {archivedNotes.length} {language === 'ru' ? 'заметок' : 'notes'}
          </div>

          {notesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--glass-border)', borderTopColor: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : archivedNotes.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t.archive.no_archived}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {archivedNotes.map(note => (
                <div key={note.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--glass-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} style={{ color: note.color || 'var(--accent-blue)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{note.title}</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={11} /> {formatDate(note.createdAt)}
                      </span>
                      {note.isDeleted && (
                        <span style={{ fontSize: 11, color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Trash2 size={11} /> {formatDate(note.deletedAt)}
                        </span>
                      )}
                      {note.archived && (
                        <span style={{ fontSize: 11, color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          Archived {formatDate(note.archivedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-success btn-sm" onClick={() => restoreNote(note.id)} title={t.archive.restore}>
                      <RotateCcw size={13} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => permDeleteNote(note.id)} title={t.archive.delete_permanently}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface ArchiveTaskRowProps {
  task: Task;
  language: string;
  formatDate: (d?: Date) => string;
  formatDuration: (t: Task) => string;
  t: any;
  onRestore: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

function ArchiveTaskRow({ task, language, formatDate, formatDuration, t, onRestore, onDelete }: ArchiveTaskRowProps) {
  const isCompleted = task.status === 'completed' && !task.isDeleted;
  const isDeleted = task.isDeleted;
  const catColor = categoryColors[task.category] || 'var(--accent-blue)';

  return (
    <div
      className="glass-card"
      style={{
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        borderLeftWidth: 3,
        borderLeftColor: catColor,
        opacity: isDeleted ? 0.75 : 1,
      }}
    >
      {/* Status icon */}
      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--glass-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        {isCompleted
          ? <CheckCircle2 size={18} style={{ color: 'var(--accent-green)' }} />
          : <XCircle size={18} style={{ color: 'var(--accent-red)' }} />}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.7 : 1 }}>
          {task.title}
        </div>

        {task.description && (
          <p className="line-clamp-2" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
            {task.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {/* Created */}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={11} />
            {language === 'ru' ? 'Создано' : 'Created'}: {formatDate(task.createdAt)}
          </span>

          {/* Completed */}
          {isCompleted && task.completedAt && (
            <span style={{ fontSize: 11, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={11} />
              {language === 'ru' ? 'Выполнено' : 'Done'}: {formatDate(task.completedAt)}
            </span>
          )}

          {/* Deleted */}
          {isDeleted && task.deletedAt && (
            <span style={{ fontSize: 11, color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Trash2 size={11} />
              {language === 'ru' ? 'Удалено' : 'Deleted'}: {formatDate(task.deletedAt)}
            </span>
          )}

          {/* Duration */}
          {isCompleted && (
            <span style={{ fontSize: 11, color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />
              {t.archive.duration}: {formatDuration(task)}
            </span>
          )}

          {/* Category */}
          <span className={`badge badge-${task.category}`} style={{ fontSize: 10 }}>
            {t.categories[task.category]}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button className="btn btn-success btn-sm" onClick={onRestore} title={t.archive.restore}>
          <RotateCcw size={13} />
          <span style={{ display: 'none' }}>{t.archive.restore}</span>
        </button>
        <button className="btn btn-danger btn-sm" onClick={onDelete} title={t.archive.delete_permanently}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
