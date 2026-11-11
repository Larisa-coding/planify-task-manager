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

const COLORS = ['#58a6ff', '#a371f7', '#ff6eb3', '#3fb950', '#d29922', '#f85149', '#79c0ff', '#ffa657'];

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

  const toggleCheck = (id: string) =>
    setChecklist(checklist.map(c => c.id === id ? { ...c, completed: !c.completed } : c));

  const removeCheck = (id: string) =>
    setChecklist(checklist.filter(c => c.id !== id));

  if (!isOpen) return null;

  const categories: { value: TaskCategory; label: string; color: string }[] = [
    { value: 'personal', label: t.categories.personal, color: 'var(--accent-purple)' },
    { value: 'work',     label: t.categories.work,     color: 'var(--accent-blue)' },
    { value: 'wishes',   label: t.categories.wishes,   color: 'var(--accent-pink)' },
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

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block',
  };

  const selectStyle: React.CSSProperties = {
    background: 'var(--glass-bg-card)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
    borderRadius: 10,
    padding: '9px 12px',
    width: '100%',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ padding: 0 }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--glass-border)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            {task ? t.tasks.edit_task : t.tasks.add_task}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>{t.tasks.task_title}</label>
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
          <div>
            <label style={labelStyle}>{t.tasks.description}</label>
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
          <div>
            <label style={labelStyle}>{t.tasks.category}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {categories.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                    background: category === c.value ? `${c.color}20` : 'var(--glass-bg-card)',
                    border: `1px solid ${category === c.value ? c.color : 'var(--glass-border)'}`,
                    color: category === c.value ? c.color : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status + Priority row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{t.tasks.status}</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} style={selectStyle}>
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.tasks.priority}</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)} style={selectStyle}>
                {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Due date + Estimated hours */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{t.tasks.due_date}</label>
              <input
                type="date"
                className="glass-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>{t.tasks.estimated_hours}</label>
              <input
                type="number"
                className="glass-input"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                min="0" step="0.5"
                placeholder="0"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>{t.tasks.tags}</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: tags.length > 0 ? 8 : 0 }}>
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

          {/* Color */}
          <div>
            <label style={labelStyle}>{language === 'ru' ? 'Цвет метки' : 'Label color'}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setColor('')}
                style={{
                  width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                  border: `2px solid ${!color ? 'var(--accent-blue)' : 'var(--glass-border)'}`,
                  background: 'var(--glass-bg-card)',
                }}
              />
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                    border: `2px solid ${color === c ? 'var(--text-primary)' : 'transparent'}`,
                    background: c,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label style={labelStyle}>{t.tasks.checklist}</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: checklist.length > 0 ? 8 : 0 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {checklist.map(item => (
                  <div
                    key={item.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                      background: 'var(--glass-bg-card)', borderRadius: 8, border: '1px solid var(--glass-border)' }}
                  >
                    <button
                      onClick={() => toggleCheck(item.id)}
                      style={{
                        width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${item.completed ? 'var(--accent-green)' : 'var(--glass-border-strong)'}`,
                        background: item.completed ? 'var(--accent-green)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      {item.completed && <Check size={11} color="#fff" />}
                    </button>
                    <span style={{ flex: 1, fontSize: 13, color: item.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                      textDecoration: item.completed ? 'line-through' : 'none' }}>
                      {item.text}
                    </span>
                    <button className="btn btn-ghost btn-icon" onClick={() => removeCheck(item.id)} style={{ padding: 4 }}>
                      <Trash2 size={13} style={{ color: 'var(--accent-red)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 10, padding: '16px 24px',
          borderTop: '1px solid var(--glass-border)',
          justifyContent: 'flex-end',
        }}>
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
