import React, { useState, useMemo } from 'react';
import { RotateCcw, Trash2, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useAllTasksForArchive } from '../../hooks/useTasks';
import { useLanguage } from '../../context/LanguageContext';
import { Task } from '../../types';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ArchiveViewProps {
  onEditTask: (task: Task) => void;
}

type Filter = 'all' | 'completed' | 'deleted';

const categoryColors: Record<string, string> = {
  personal: 'var(--accent-purple)',
  work: 'var(--accent-teal)',
  wishes: 'var(--accent-rose)',
};

export default function ArchiveView({ onEditTask }: ArchiveViewProps) {
  const { tasks, loading, permanentDelete, restore } = useAllTasksForArchive();
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');

  const archived = useMemo(() => {
    const stamp = (task: Task) => {
      const date = task.deletedAt || task.completedAt || task.updatedAt;
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
    };
    return tasks.filter(task => {
      if (filter === 'deleted') return !!task.isDeleted;
      if (filter === 'completed') return !task.isDeleted && task.status === 'completed';
      return !!task.isDeleted || task.status === 'completed' || task.status === 'cancelled';
    }).sort((a, b) => stamp(b) - stamp(a));
  }, [tasks, filter]);

  const formatDate = (d?: Date) => {
    if (!d) return '—';
    return format(d, language === 'ru' ? 'd MMM yyyy' : 'MMM d, yyyy', {
      locale: language === 'ru' ? ru : undefined,
    });
  };

  const formatDuration = (task: Task): string => {
    if (!task.completedAt) return '—';
    const totalMin = differenceInMinutes(task.completedAt, task.createdAt);
    if (totalMin < 60) return `${totalMin} ${language === 'ru' ? 'мин' : 'min'}`;
    const hours = differenceInHours(task.completedAt, task.createdAt);
    if (hours < 24) return `${hours}${t.archive.hours}`;
    return `${Math.floor(hours / 24)} ${t.archive.days}`;
  };

  const filterButtons: { value: Filter; label: string }[] = [
    { value: 'all',       label: t.archive.filter_all },
    { value: 'completed', label: t.archive.filter_completed },
    { value: 'deleted',   label: t.archive.filter_deleted },
  ];

  return (
    <div style={{ maxWidth: 800, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          {t.archive.title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.archive.subtitle}</p>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {filterButtons.map(btn => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              background: filter === btn.value ? 'rgba(180,141,245,0.15)' : 'var(--glass-bg-card)',
              border: `1px solid ${filter === btn.value ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
              color: filter === btn.value ? 'var(--accent-purple)' : 'var(--text-secondary)',
            }}
          >
            {btn.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center' }}>
          {archived.length} {language === 'ru' ? 'задач' : 'tasks'}
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="app-spinner" />
        </div>
      ) : archived.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t.archive.no_archived}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {archived.map(task => (
            <ArchiveRow
              key={task.id}
              task={task}
              language={language}
              formatDate={formatDate}
              formatDuration={formatDuration}
              t={t}
              catColors={categoryColors}
              onRestore={() => restore(task.id)}
              onDelete={() => permanentDelete(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RowProps {
  task: Task;
  language: string;
  formatDate: (d?: Date) => string;
  formatDuration: (t: Task) => string;
  t: any;
  catColors: Record<string, string>;
  onRestore: () => void;
  onDelete: () => void;
}

function ArchiveRow({ task, language, formatDate, formatDuration, t, catColors, onRestore, onDelete }: RowProps) {
  const isCompleted = task.status === 'completed' && !task.isDeleted;
  const color = catColors[task.category] || 'var(--accent-purple)';

  return (
    <div className="glass-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14, borderLeftWidth: 3, borderLeftColor: color, opacity: task.isDeleted ? 0.75 : 1 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--glass-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        {isCompleted
          ? <CheckCircle2 size={18} style={{ color: 'var(--accent-green)' }} />
          : <XCircle size={18} style={{ color: 'var(--accent-red)' }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.7 : 1 }}>
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={11} />
            {language === 'ru' ? 'Создано' : 'Created'}: {formatDate(task.createdAt)}
          </span>
          {isCompleted && task.completedAt && (
            <span style={{ fontSize: 11, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={11} />
              {language === 'ru' ? 'Выполнено' : 'Done'}: {formatDate(task.completedAt)}
            </span>
          )}
          {task.isDeleted && task.deletedAt && (
            <span style={{ fontSize: 11, color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Trash2 size={11} />
              {language === 'ru' ? 'Удалено' : 'Deleted'}: {formatDate(task.deletedAt)}
            </span>
          )}
          {isCompleted && (
            <span style={{ fontSize: 11, color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />
              {t.archive.duration}: {formatDuration(task)}
            </span>
          )}
          <span className={`badge badge-${task.category}`} style={{ fontSize: 10 }}>
            {t.categories[task.category]}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button className="btn btn-success btn-sm" onClick={onRestore} title={t.archive.restore}>
          <RotateCcw size={13} />
        </button>
        <button className="btn btn-danger btn-sm" onClick={onDelete} title={t.archive.delete_permanently}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
