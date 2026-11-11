import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Check, Trash2, ChevronDown, ChevronUp,
  Calendar, Clock, AlertTriangle, User, Briefcase, Star,
  Filter,
} from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useLanguage } from '../../context/LanguageContext';
import { Task, TaskCategory, Priority, TaskStatus } from '../../types';import { format, isBefore, isToday, isTomorrow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TaskListProps {
  category?: TaskCategory;
  onAddTask: (category?: TaskCategory) => void;
  onEditTask: (task: Task) => void;
}

const categoryColors: Record<TaskCategory, string> = {
  personal: 'var(--accent-purple)',
  work: 'var(--accent-teal)',
  wishes: 'var(--accent-rose)',
};

const categoryIcons: Record<TaskCategory, React.ReactNode> = {
  personal: <User size={13} />,
  work: <Briefcase size={13} />,
  wishes: <Star size={13} />,
};

const priorityOrder: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

type SortKey = 'createdAt' | 'dueDate' | 'priority' | 'title';

export const TaskList: React.FC<TaskListProps> = ({ category, onAddTask, onEditTask }) => {
  const { tasks, loading, updateTaskStatus, deleteTask } = useTasks(category);
  const { t, language } = useLanguage();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (filterStatus !== 'all') {
      list = list.filter(t => t.status === filterStatus);
    }

    list.sort((a, b) => {
      switch (sortKey) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return list;
  }, [tasks, search, filterStatus, sortKey]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getDueBadge = (task: Task) => {
    if (!task.dueDate) return null;
    const now = new Date();
    const isOverdue = isBefore(task.dueDate, now) && task.status !== 'completed';
    const color = isOverdue ? 'var(--accent-red)' : isToday(task.dueDate) ? 'var(--accent-orange)'
      : isTomorrow(task.dueDate) ? 'var(--accent-orange)' : 'var(--text-muted)';
    const icon = isOverdue ? <AlertTriangle size={11} /> : <Calendar size={11} />;
    const label = isOverdue
      ? (language === 'ru' ? 'Просрочено' : 'Overdue')
      : isToday(task.dueDate) ? (language === 'ru' ? 'Сегодня' : 'Today')
      : isTomorrow(task.dueDate) ? (language === 'ru' ? 'Завтра' : 'Tomorrow')
      : format(task.dueDate, language === 'ru' ? 'd MMM' : 'MMM d', { locale: language === 'ru' ? ru : undefined });

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color, fontWeight: 500 }}>
        {icon}{label}
      </span>
    );
  };

  const getPriorityDot = (p: Priority) => {
    const colors: Record<Priority, string> = {
      low: 'var(--accent-green)',
      medium: 'var(--accent-orange)',
      high: 'var(--accent-red)',
      urgent: 'var(--accent-red)',
    };
    return <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors[p], display: 'inline-block', flexShrink: 0 }} />;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--glass-border)', borderTopColor: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const statuses: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: language === 'ru' ? 'Все' : 'All' },
    { value: 'new', label: t.statuses.new },
    { value: 'in_progress', label: t.statuses.in_progress },
    { value: 'completed', label: t.statuses.completed },
  ];

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'createdAt', label: language === 'ru' ? 'По дате' : 'By date' },
    { value: 'dueDate',   label: language === 'ru' ? 'По дедлайну' : 'By deadline' },
    { value: 'priority',  label: language === 'ru' ? 'По приоритету' : 'By priority' },
    { value: 'title',     label: language === 'ru' ? 'По названию' : 'By title' },
  ];

  const catColor = category ? categoryColors[category] : 'var(--accent-blue)';

  return (
    <div style={{ maxWidth: 800, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="glass-input"
            placeholder={t.tasks.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        <button
          className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={14} />
        </button>

        <button className="btn btn-primary btn-sm" onClick={() => onAddTask(category)}>
          <Plus size={14} />
          {t.tasks.add_task}
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="glass-card" style={{ padding: '14px 16px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {statuses.map(s => (
              <button
                key={s.value}
                onClick={() => setFilterStatus(s.value)}
                style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit', border: '1px solid',
                  borderColor: filterStatus === s.value ? 'var(--accent-blue)' : 'var(--glass-border)',
                  background: filterStatus === s.value ? 'rgba(88,166,255,0.15)' : 'var(--glass-bg-card)',
                  color: filterStatus === s.value ? 'var(--accent-blue)' : 'var(--text-secondary)',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.tasks.sort}:</span>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              style={{
                background: 'var(--glass-bg-card)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', borderRadius: 8, padding: '4px 8px',
                fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
              }}
            >
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {filtered.length} {language === 'ru' ? 'задач' : 'tasks'}
        </span>
        {category && (
          <span style={{ fontSize: 12, color: catColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            {categoryIcons[category]}
            {t.categories[category]}
          </span>
        )}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
            {search ? (language === 'ru' ? 'Ничего не найдено' : 'Nothing found') : t.tasks.no_tasks_subtitle}
          </p>
          {!search && (
            <button className="btn btn-primary" onClick={() => onAddTask(category)}>
              <Plus size={15} /> {t.tasks.add_task}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(task => {
            const isExpanded = expanded.has(task.id);
            const isCompleted = task.status === 'completed';
            const color = category ? categoryColors[category] : categoryColors[task.category];

            const checklistDone = task.checklist?.filter(c => c.completed).length || 0;
            const checklistTotal = task.checklist?.length || 0;

            return (
              <div
                key={task.id}
                className={`task-item ${isCompleted ? 'completed' : ''}`}
                style={{ borderLeftColor: task.color || color, borderLeftWidth: 3 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Complete toggle */}
                  <button
                    onClick={() => updateTaskStatus(task.id, isCompleted ? 'new' : 'completed')}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      border: `1.5px solid ${isCompleted ? 'var(--accent-green)' : 'var(--glass-border-strong)'}`,
                      background: isCompleted ? 'var(--accent-green)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    aria-label="Toggle complete"
                  >
                    {isCompleted && <Check size={12} color="#fff" />}
                  </button>

                  {/* Title + meta */}
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onEditTask(task)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {getPriorityDot(task.priority)}
                      <span
                        className="task-title"
                        style={{
                          fontSize: 14, fontWeight: 500,
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                      {!category && (
                        <span style={{ fontSize: 11, color: categoryColors[task.category], display: 'flex', alignItems: 'center', gap: 3 }}>
                          {categoryIcons[task.category]}
                          {t.categories[task.category]}
                        </span>
                      )}
                      {getDueBadge(task)}
                      {checklistTotal > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={11} />{checklistDone}/{checklistTotal}
                        </span>
                      )}
                      {task.estimatedHours && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={11} />{task.estimatedHours}h
                        </span>
                      )}
                      {task.tags.map(tag => (
                        <span key={tag} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--glass-bg-card)', borderRadius: 20, padding: '1px 7px', border: '1px solid var(--glass-border)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {task.description || (task.checklist?.length || 0) > 0 ? (
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => toggleExpand(task.id)}
                        style={{ padding: 5 }}
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    ) : null}
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => deleteTask(task.id)}
                      style={{ padding: 5 }}
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                    {task.description && (
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: task.checklist?.length ? 10 : 0, lineHeight: 1.6 }}>
                        {task.description}
                      </p>
                    )}
                    {task.checklist && task.checklist.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {task.checklist.map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                              border: `1.5px solid ${item.completed ? 'var(--accent-green)' : 'var(--glass-border-strong)'}`,
                              background: item.completed ? 'var(--accent-green)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {item.completed && <Check size={10} color="#fff" />}
                            </div>
                            <span style={{ fontSize: 13, color: item.completed ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress bar for checklist */}
                {checklistTotal > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div className="progress-bar" style={{ height: 3 }}>
                      <div className="progress-fill" style={{ width: `${(checklistDone / checklistTotal) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
