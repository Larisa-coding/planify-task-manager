import React, { useMemo } from 'react';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, User, Briefcase, Star, ArrowRight, Plus } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useLanguage } from '../../context/LanguageContext';
import { Page } from '../../App';
import { TaskCategory } from '../../types';
import { format, isAfter, isBefore, addDays, isToday, isTomorrow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onAddTask: (category?: TaskCategory) => void;
}

const categoryConfig = {
  personal: { label: { ru: 'Личное', en: 'Personal' }, color: 'var(--accent-purple)', icon: <User size={16} />, page: 'personal' as Page },
  work:     { label: { ru: 'Рабочее', en: 'Work' },    color: 'var(--accent-blue)',   icon: <Briefcase size={16} />, page: 'work' as Page },
  wishes:   { label: { ru: 'Желания', en: 'Wishes' },  color: 'var(--accent-pink)',   icon: <Star size={16} />, page: 'wishes' as Page },
};

function getGreeting(lang: 'ru' | 'en'): string {
  const h = new Date().getHours();
  if (lang === 'ru') {
    if (h >= 5 && h < 12) return 'Доброе утро';
    if (h >= 12 && h < 17) return 'Добрый день';
    if (h >= 17 && h < 22) return 'Добрый вечер';
    return 'Доброй ночи';
  } else {
    if (h >= 5 && h < 12) return 'Good morning';
    if (h >= 12 && h < 17) return 'Good afternoon';
    if (h >= 17 && h < 22) return 'Good evening';
    return 'Good night';
  }
}

function getDueDateLabel(date: Date, lang: 'ru' | 'en'): { text: string; color: string } {
  const now = new Date();
  if (isBefore(date, now)) return { text: lang === 'ru' ? 'Просрочено' : 'Overdue', color: 'var(--accent-red)' };
  if (isToday(date)) return { text: lang === 'ru' ? 'Сегодня' : 'Today', color: 'var(--accent-orange)' };
  if (isTomorrow(date)) return { text: lang === 'ru' ? 'Завтра' : 'Tomorrow', color: 'var(--accent-orange)' };
  return {
    text: format(date, lang === 'ru' ? 'd MMM' : 'MMM d', { locale: lang === 'ru' ? ru : undefined }),
    color: 'var(--text-secondary)',
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onAddTask }) => {
  const { tasks } = useTasks();
  const { language, t } = useLanguage();

  const stats = useMemo(() => {
    const active = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    const completed = tasks.filter(t => t.status === 'completed');
    const now = new Date();
    const overdue = active.filter(t => t.dueDate && isBefore(t.dueDate, now));
    const inProgress = active.filter(t => t.status === 'in_progress');
    const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

    const upcoming = active
      .filter(t => t.dueDate && isAfter(t.dueDate, now) && isBefore(t.dueDate, addDays(now, 4)))
      .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()));

    const byCategory = {
      personal: active.filter(t => t.category === 'personal').length,
      work: active.filter(t => t.category === 'work').length,
      wishes: active.filter(t => t.category === 'wishes').length,
    };

    const recent = [...tasks]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    return { active, completed, overdue, inProgress, completionRate, upcoming, byCategory, recent, total: tasks.length };
  }, [tasks]);

  const statCards = [
    {
      label: t.dashboard.total_tasks,
      value: stats.total,
      icon: <TrendingUp size={18} />,
      color: 'var(--accent-blue)',
    },
    {
      label: t.dashboard.completed,
      value: stats.completed.length,
      icon: <CheckCircle2 size={18} />,
      color: 'var(--accent-green)',
    },
    {
      label: t.dashboard.in_progress,
      value: stats.inProgress.length,
      icon: <Clock size={18} />,
      color: 'var(--accent-orange)',
    },
    {
      label: t.dashboard.overdue,
      value: stats.overdue.length,
      icon: <AlertCircle size={18} />,
      color: stats.overdue.length > 0 ? 'var(--accent-red)' : 'var(--text-muted)',
    },
  ];

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Greeting */}
      <div className="glass-card" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(88,166,255,0.12) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: 60,
          width: 120, height: 120,
          background: 'radial-gradient(circle, rgba(163,113,247,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>
          {getGreeting(language)} 👋
        </p>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {t.dashboard.subtitle}
        </h2>

        {/* Completion progress */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.dashboard.completion_rate}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-blue)' }}>{stats.completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {statCards.map(card => (
          <div key={card.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: `${card.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: card.color,
                }}
              >
                {card.icon}
              </div>
              <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {card.value}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Category cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {(Object.entries(categoryConfig) as [TaskCategory, typeof categoryConfig.personal][]).map(([key, cfg]) => (
          <button
            key={key}
            className="glass-card"
            onClick={() => onNavigate(cfg.page)}
            style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', border: 'none', width: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: `${cfg.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: cfg.color,
              }}>
                {cfg.icon}
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              {stats.byCategory[key]}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {cfg.label[language]}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom row: upcoming + recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Upcoming deadlines */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.dashboard.upcoming}</h3>
            <AlertCircle size={15} style={{ color: 'var(--accent-orange)' }} />
          </div>
          {stats.upcoming.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.dashboard.no_upcoming}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.upcoming.slice(0, 4).map(task => {
                const dl = getDueDateLabel(task.dueDate!, language);
                return (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </span>
                    <span style={{ fontSize: 11, color: dl.color, fontWeight: 600, flexShrink: 0 }}>{dl.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent tasks */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.dashboard.recent_tasks}</h3>
            <button
              onClick={() => onNavigate('tasks')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontSize: 12, fontWeight: 500 }}
            >
              {language === 'ru' ? 'Все →' : 'All →'}
            </button>
          </div>
          {stats.recent.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.dashboard.no_tasks}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recent.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: task.status === 'completed' ? 'var(--accent-green)'
                      : task.status === 'in_progress' ? 'var(--accent-blue)'
                      : 'var(--text-muted)',
                  }} />
                  <span style={{
                    fontSize: 13, color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-secondary)',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  }}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick add buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(Object.entries(categoryConfig) as [TaskCategory, typeof categoryConfig.personal][]).map(([key, cfg]) => (
          <button
            key={key}
            className="btn btn-ghost"
            onClick={() => onAddTask(key)}
            style={{ fontSize: 13 }}
          >
            <Plus size={14} style={{ color: cfg.color }} />
            {cfg.label[language]}
          </button>
        ))}
      </div>
    </div>
  );
};
