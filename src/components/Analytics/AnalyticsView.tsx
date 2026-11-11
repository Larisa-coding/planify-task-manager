import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, User, Briefcase, Star, Target } from 'lucide-react';
import { useAllTasksForArchive } from '../../hooks/useTasks';
import { useLanguage } from '../../context/LanguageContext';
import { TaskCategory, Priority } from '../../types';
import { differenceInHours, isBefore, startOfWeek, startOfMonth, isAfter } from 'date-fns';

const categoryColors: Record<TaskCategory, string> = {
  personal: 'var(--accent-purple)',
  work:     'var(--accent-blue)',
  wishes:   'var(--accent-pink)',
};

const categoryIcons: Record<TaskCategory, React.ReactNode> = {
  personal: <User size={14} />,
  work:     <Briefcase size={14} />,
  wishes:   <Star size={14} />,
};

const priorityColors: Record<Priority, string> = {
  low:    'var(--accent-green)',
  medium: 'var(--accent-orange)',
  high:   'var(--accent-red)',
  urgent: 'var(--accent-red)',
};

type Period = 'week' | 'month' | 'all';

export default function AnalyticsView() {
  const { tasks } = useAllTasksForArchive();
  const { t, language } = useLanguage();
  const [period, setPeriod] = React.useState<Period>('month');

  const stats = useMemo(() => {
    const now = new Date();

    // Filter by period
    const periodStart =
      period === 'week'  ? startOfWeek(now, { weekStartsOn: 1 }) :
      period === 'month' ? startOfMonth(now) : new Date(0);

    const inPeriod = tasks.filter(t => isAfter(t.createdAt, periodStart));
    const activeTasks = tasks.filter(t => !t.isDeleted && t.status !== 'cancelled');

    const completed = inPeriod.filter(t => t.status === 'completed');
    const deleted   = inPeriod.filter(t => t.isDeleted);
    const overdue   = activeTasks.filter(t => t.dueDate && isBefore(t.dueDate, now) && t.status !== 'completed');
    const total     = inPeriod.length;

    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    const overdueRate    = activeTasks.length > 0 ? Math.round((overdue.length / activeTasks.length) * 100) : 0;

    // Avg completion time (hours)
    const timesToComplete = completed
      .filter(t => t.completedAt)
      .map(t => differenceInHours(t.completedAt!, t.createdAt));
    const avgCompletionHours = timesToComplete.length > 0
      ? Math.round(timesToComplete.reduce((a, b) => a + b, 0) / timesToComplete.length)
      : 0;

    // By category (of all active + completed)
    const byCategory = (['personal', 'work', 'wishes'] as TaskCategory[]).map(cat => ({
      cat,
      total: activeTasks.filter(t => t.category === cat).length,
      completed: completed.filter(t => t.category === cat).length,
    }));

    const maxCatTotal = Math.max(...byCategory.map(c => c.total), 1);

    // By priority
    const byPriority = (['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => ({
      p,
      count: activeTasks.filter(t => t.priority === p).length,
    }));
    const maxPriCount = Math.max(...byPriority.map(c => c.count), 1);

    // Productivity score (0-100): weighted formula
    const score = Math.min(100, Math.round(
      completionRate * 0.5 +
      Math.max(0, 100 - overdueRate) * 0.3 +
      (completed.length > 0 ? 20 : 0)
    ));

    return {
      total, completed, deleted, overdue, activeTasks,
      completionRate, overdueRate, avgCompletionHours,
      byCategory, maxCatTotal,
      byPriority, maxPriCount,
      score,
    };
  }, [tasks, period]);

  const periods: { value: Period; label: string }[] = [
    { value: 'week',  label: t.analytics.this_week },
    { value: 'month', label: t.analytics.this_month },
    { value: 'all',   label: t.analytics.all_time },
  ];

  const formatHours = (h: number) => {
    if (h === 0) return '—';
    if (h < 24) return `${h}${language === 'ru' ? ' ч' : 'h'}`;
    return `${Math.round(h / 24)}${language === 'ru' ? ' дн' : 'd'}`;
  };

  const topCards = [
    {
      icon: <Target size={18} />,
      label: t.analytics.completion_rate,
      value: `${stats.completionRate}%`,
      color: 'var(--accent-blue)',
      sub: `${stats.completed.length} ${language === 'ru' ? 'выполнено' : 'completed'}`,
    },
    {
      icon: <CheckCircle2 size={18} />,
      label: t.analytics.total_completed,
      value: stats.completed.length,
      color: 'var(--accent-green)',
      sub: `${language === 'ru' ? 'из' : 'of'} ${stats.total} ${language === 'ru' ? 'задач' : 'tasks'}`,
    },
    {
      icon: <Clock size={18} />,
      label: t.analytics.avg_completion_time,
      value: formatHours(stats.avgCompletionHours),
      color: 'var(--accent-purple)',
      sub: language === 'ru' ? 'среднее время' : 'average time',
    },
    {
      icon: <AlertTriangle size={18} />,
      label: t.analytics.overdue_rate,
      value: `${stats.overdueRate}%`,
      color: stats.overdueRate > 20 ? 'var(--accent-red)' : 'var(--accent-orange)',
      sub: `${stats.overdue.length} ${language === 'ru' ? 'просрочено' : 'overdue'}`,
    },
  ];

  return (
    <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header + period selector */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{t.analytics.title}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.analytics.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--glass-bg-card)', borderRadius: 10, padding: 3, border: '1px solid var(--glass-border)' }}>
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              style={{
                padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                background: period === p.value ? 'var(--glass-bg-card-hover)' : 'transparent',
                color: period === p.value ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Productivity score */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            <TrendingUp size={15} style={{ display: 'inline', marginRight: 6 }} />
            {t.analytics.productivity_score}
          </span>
          <span style={{
            fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em',
            color: stats.score >= 70 ? 'var(--accent-green)' : stats.score >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)',
          }}>
            {stats.score}
          </span>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div
            className="progress-fill"
            style={{
              width: `${stats.score}%`,
              background: stats.score >= 70
                ? 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))'
                : stats.score >= 40
                ? 'linear-gradient(90deg, var(--accent-orange), var(--accent-blue))'
                : 'linear-gradient(90deg, var(--accent-red), var(--accent-orange))',
            }}
          />
        </div>
      </div>

      {/* Top stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {topCards.map(card => (
          <div key={card.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                {card.icon}
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{card.value}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>{card.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* By category */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>{t.analytics.tasks_by_category}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stats.byCategory.map(({ cat, total, completed }) => (
            <div key={cat}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: categoryColors[cat], fontSize: 13, fontWeight: 500 }}>
                  {categoryIcons[cat]}
                  {t.categories[cat]}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--accent-green)' }}>{completed} ✓</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{total} {language === 'ru' ? 'всего' : 'total'}</span>
                </div>
              </div>
              <div className="progress-bar">
                <div style={{
                  height: '100%', borderRadius: 100,
                  background: categoryColors[cat],
                  width: total > 0 ? `${(total / stats.maxCatTotal) * 100}%` : '0%',
                  transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By priority */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>{t.analytics.tasks_by_priority}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stats.byPriority.map(({ p, count }) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: priorityColors[p], minWidth: 60 }}>
                {t.priorities[p]}
              </span>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div style={{
                  height: '100%', borderRadius: 100,
                  background: priorityColors[p],
                  width: `${(count / stats.maxPriCount) * 100}%`,
                  transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 24, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active tasks count */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{t.analytics.active_tasks}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{language === 'ru' ? 'Не выполнены и не удалены' : 'Not completed or deleted'}</div>
        </div>
        <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-blue)', letterSpacing: '-0.03em' }}>
          {stats.activeTasks.filter(t => t.status !== 'completed').length}
        </span>
      </div>
    </div>
  );
}
