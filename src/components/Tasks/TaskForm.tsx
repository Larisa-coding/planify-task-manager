import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useLanguage } from '../../context/LanguageContext';
import { Task, TaskCategory, TaskStatus, Priority, ChecklistItem } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  defaultCategory?: TaskCategory;
}

const COLORS = ['#b48df5', '#5ec4b8', '#f589b0', '#5cb87a', '#e0a060', '#e06060', '#7ab3f0', '#ffa657'];

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, task, defaultCategory = 'personal' }) => {
  const { createTask, updateTask } = useTasks();
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
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checkInput, setCheckInput] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [saving, setSaving] = useState(false);

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
      setChecklist(task.checklist || []);
      setEstimatedHours(task.estimatedHours?.toString() || '');
    } else {
      setTitle(''); setDescription(''); setCategory(defaultCategory);
      setStatus('new'); setPriority('medium'); setDueDate('');
      setTags([]); setColor(''); setChecklist([]); setEstimatedHours('');
    }
    setTagInput(''); setCheckInput('');
  }, [isOpen, task, defaultCategory]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tags,
        color: color || undefined,
        checklist,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        completedAt: status === 'completed' && !task?.completedAt ? new Date() : task?.completedAt,
      };
      if (task) {
        await updateTask(task.id, payload);
      } else {
        await createTask(payload as any);
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

  const addCheckItem = () => {
    const v = checkInput.trim();
    if (v) setChecklist([...checklist, { id: uuidv4(), text: v, completed: false, createdAt: new Date() }]);
    setCheckInput('');
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">

        {/* ── Header ── */}
        <div className="form-header">
          <h2 className="form-title">{task ? t.tasks.edit_task : t.tasks.add_task}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
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
              onKeyDown={e => e.key === 'Enter' && handleSave()}
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

          {/* Status + Priority — stack on mobile */}
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">{t.tasks.status}</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="glass-select"
              >
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">{t.tasks.priority}</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="glass-select"
              >
                {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Due date + Hours — stack on mobile */}
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">{t.tasks.due_date}</label>
              <input
                type="date"
                className="glass-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">{t.tasks.estimated_hours}</label>
              <input
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
              <button className="btn btn-ghost btn-icon" onClick={addTag} type="button">
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
                onClick={() => setColor('')}
                style={{
                  width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                  border: `2px solid ${!color ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                  background: 'var(--glass-bg-card)',
                }}
              />
              {COLORS.map(c => (
                <button
                  key={c}
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

          {/* Checklist */}
          <div className="form-field">
            <label className="form-label">{t.tasks.checklist}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="glass-input"
                placeholder={t.tasks.checklist_placeholder}
                value={checkInput}
                onChange={e => setCheckInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCheckItem(); }}}
                style={{ flex: 1 }}
              />
              <button className="btn btn-ghost btn-icon" onClick={addCheckItem} type="button">
                <Plus size={16} />
              </button>
            </div>
            {checklist.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {checklist.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                    background: 'var(--glass-bg-card)', borderRadius: 8, border: '1px solid var(--glass-border)',
                  }}>
                    <button
                      onClick={() => setChecklist(checklist.map(c => c.id === item.id ? { ...c, completed: !c.completed } : c))}
                      style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        border: `1.5px solid ${item.completed ? 'var(--accent-green)' : 'var(--glass-border-strong)'}`,
                        background: item.completed ? 'var(--accent-green)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}
                    >
                      {item.completed && <Check size={11} color="#fff" />}
                    </button>
                    <span style={{
                      flex: 1, fontSize: 13,
                      color: item.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                      textDecoration: item.completed ? 'line-through' : 'none',
                    }}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => setChecklist(checklist.filter(c => c.id !== item.id))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--accent-red)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="form-footer">
          <button className="btn btn-ghost" onClick={onClose}>{t.tasks.cancel}</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!title.trim() || saving}
          >
            {saving ? '...' : t.tasks.save}
          </button>
        </div>

      </div>
    </div>
  );
};
