import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { createTask, updateTask } from '../../database/taskStore';
import { useLanguage } from '../../context/LanguageContext';
import { Task, TaskCategory, TaskStatus, Priority } from '../../types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  defaultCategory?: TaskCategory;
}

const COLORS = ['#b48df5', '#5ec4b8', '#f589b0', '#5cb87a', '#e0a060', '#e06060', '#7ab3f0', '#ffa657'];

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, task, defaultCategory = 'personal' }) => {
  const { t, language } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>(defaultCategory);
  const [status, setStatus] = useState<TaskStatus>('new');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [color, setColor] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.toISOString().slice(0, 10) : '');
      setTags(task.tags || []);
      setColor(task.color || '');
      setEstimatedHours(task.estimatedHours?.toString() || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory(defaultCategory);
      setStatus('new');
      setPriority('medium');
      setDueDate('');
      setTags([]);
      setColor('');
      setEstimatedHours('');
    }
    setTagInput('');
  }, [isOpen, task, defaultCategory]);

  const handleSave = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const payload = {
      title: trimmed,
      description: description.trim() || undefined,
      category,
      status,
      priority,
      dueDate: dueDate ? new Date(`${dueDate}T12:00:00`) : undefined,
      tags,
      color: color || undefined,
      estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
      completedAt: status === 'completed' ? (task?.completedAt ?? new Date()) : undefined,
    };
    if (task) updateTask(task.id, payload);
    else createTask(payload);
    onClose();
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagInput('');
  };

  if (!isOpen) return null;

  const categories: { value: TaskCategory; label: string; color: string }[] = [
    { value: 'personal', label: t.categories.personal, color: 'var(--accent-purple)' },
    { value: 'work',     label: t.categories.work,     color: 'var(--accent-teal)' },
    { value: 'wishes',   label: t.categories.wishes,   color: 'var(--accent-rose)' },
  ];

  const statuses: { value: TaskStatus; label: string }[] = [
    { value: 'new',         label: t.statuses.new },
    { value: 'in_progress', label: t.statuses.in_progress },
    { value: 'completed',   label: t.statuses.completed },
    { value: 'cancelled',   label: t.statuses.cancelled },
  ];

  const priorities: { value: Priority; label: string }[] = [
    { value: 'low',    label: t.priorities.low },
    { value: 'medium', label: t.priorities.medium },
    { value: 'high',   label: t.priorities.high },
    { value: 'urgent', label: t.priorities.urgent },
  ];

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="modal-content" onSubmit={handleSave}>

        {/* Header */}
        <div className="form-header">
          <h2 className="form-title">{task ? t.tasks.edit_task : t.tasks.add_task}</h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="form-body">

          {/* Title */}
          <div className="form-field">
            <label className="form-label">{t.tasks.task_title}</label>
            <input
              className="glass-input"
              placeholder={t.tasks.task_title_placeholder}
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-field">
            <label className="form-label">{t.tasks.description}</label>
            <textarea
              className="glass-input"
              placeholder={t.tasks.description_placeholder}
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Category */}
          <div className="form-field">
            <label className="form-label">{t.tasks.category}</label>
            <div className="form-row-3">
              {categories.map(c => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className="category-btn"
                  style={{
                    background: category === c.value ? `${c.color}20` : 'var(--glass-bg-card)',
                    border: `1px solid ${category === c.value ? c.color : 'var(--glass-border)'}`,
                    color: category === c.value ? c.color : 'var(--text-secondary)',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status + Priority */}
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">{t.tasks.status}</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="glass-select">
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">{t.tasks.priority}</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="glass-select">
                {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Due date and hours are full width so the date field matches the other inputs */}
          <div className="form-row-date">
            <div className="form-field">
              <label className="form-label" htmlFor="task-due-date">{t.tasks.due_date}</label>
              <input
                id="task-due-date"
                type="date"
                className="glass-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="task-hours">{t.tasks.estimated_hours}</label>
              <input
                id="task-hours"
                type="number"
                className="glass-input"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                min="0"
                step="0.5"
                placeholder="0"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="form-field">
            <label className="form-label">{t.tasks.tags}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="glass-input"
                placeholder={t.tasks.tags_placeholder}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                style={{ flex: 1 }}
              />
              <button className="btn btn-ghost btn-icon" onClick={addTag} type="button" aria-label={t.tasks.tags}>
                <Plus size={16} />
              </button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
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

          {/* Color */}
          <div className="form-field">
            <label className="form-label">{language === 'ru' ? 'Цвет метки' : 'Label color'}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                aria-label={language === 'ru' ? 'Без цвета' : 'No color'}
                onClick={() => setColor('')}
                style={{
                  width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                  border: `2px solid ${!color ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                  background: 'var(--glass-bg-card)',
                }}
              />
              {COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  aria-label={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                    border: `2px solid ${color === c ? 'var(--text-primary)' : 'transparent'}`,
                    background: c,
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="form-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>{t.tasks.cancel}</button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!title.trim()}
          >
            {t.tasks.save}
          </button>
        </div>

      </form>
    </div>
  );
};
