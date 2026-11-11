import React, { useMemo } from 'react';
import { User, Briefcase, Star, Calendar, Plus } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useLanguage } from '../../context/LanguageContext';
import { Page } from '../../App';
import { TaskCategory } from '../../types';
import { isBefore, isAfter, addDays } from 'date-fns';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onAddTask: (category?: TaskCategory) => void;
}

// ── Donut chart (pure SVG, no deps) ──────────────────────────────────────────
interface DonutSlice { value: number; color: string; label: string }

function DonutChart({ slices, size = 120, thickness = 22 }: { slices: DonutSlice[]; size?: number; thickness?: number }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--glass-border-strong)" strokeWidth={thickness} />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="var(--text-muted)" fontSize="12">0</text>
      </svg>
    );
  }

  let offset = 0;
  const paths = slices.filter(s => s.value > 0).map((slice, i) => {
    const pct = slice.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const rotation = (offset / total) * 360 - 90;
    offset += slice.value;
    return (
      <circle
        key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={slice.color}
        strokeWidth={thickness}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={0}
        transform={`rotate(${rotation} ${cx} ${cy})`}
        strokeLinecap="butt"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--glass-border)" strokeWidth={thickness} />
      {paths}
      {/* Center number */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="700" fontFamily="Inter, sans-serif">
        {total}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="Inter, sans-serif">
        total
      </text>
    </svg>
  );
}

// ── Completion donut ──────────────────────────────────────────────────────────
function CompletionDonut({ done, total, size = 120, thickness = 22 }: { done: number; total: number; size?: number; thickness?: number }) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  const dash = pct * circumference;
  const pctLabel = total > 0 ? Math.round(pct * 100) : 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--glass-border)" strokeWidth={thickness} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--accent-green)"
        strokeWidth={thickness}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="butt"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="700" fontFamily="Inter, sans-serif">
        {pctLabel}%
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="Inter, sans-serif">
        done
      </text>
    </svg>
  );
}

function getGreeting(lang: 'ru' | 'en') {
  const h = new Date().getHours();
  if (lang === 'ru') {
    if (h >= 5 && h < 12) return 'Доброе утро';
    if (h >= 12 && h < 17) return 'Добрый день';
    if (h >= 17 && h < 22) return 'Добрый вечер';
    return 'Доброй ночи';
  }
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 22) return 'Good evening';
  return 'Good night';
}

const CAT_CONFIG = {
  personal: {
    label: { ru: 'Личное',   en: 'Personal' },
    sublabel: { ru: 'Личные задачи', en: 'Personal tasks' },
    color: 'var(--accent-purple)',
    colorRaw: 'rgba(180,141,245,',
    icon: <User size={22} />,
    page: 'personal' as Page,
    emoji: '🌿',
  },
  work: {
    label: { ru: 'Рабочее',  en: 'Work' },
    sublabel: { ru: 'Рабочие задачи', en: 'Work tasks' },
    color: 'var(--accent-teal)',
    colorRaw: 'rgba(94,196,184,',
    icon: <Briefcase size={22} />,
    page: 'work' as Page,
    emoji: '💼',
  },
  wishes: {
    label: { ru: 'Желания',  en: 'Wishes' },
    sublabel: { ru: 'Мечты и желания', en: 'Dreams & wishes' },
    color: 'var(--accent-rose)',
    colorRaw: 'rgba(245,137,176,',
    icon: <Star size={22} />,
    page: 'wishes' as Page,
    emoji: '✨',
  },
  calendar: {
    label: { ru: 'Календарь', en: 'Calendar' },
    sublabel: { ru: 'Дедлайны задач', en: 'Task deadlines' },
    color: 'var(--accent-orange)',
    colorRaw: 'rgba(224,160,96,',
    icon: <Calendar size={22} />,
    page: 'calendar' as Page,
    emoji: '📅',
  },
} as const;

type CatKey = 'personal' | 'work' | 'wishes';

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onAddTask }) => {
  const { tasks } = useTasks();
  const { language } = useLanguage();

  const stats = useMemo(() => {
    const active = tasks.filter(t => !t.isDeleted);
    const completed = active.filter(t => t.status === 'completed');
    const now = new Date();
    const upcoming = active
      .filter(t => t.dueDate && t.status !== 'completed' && isAfter(t.dueDate, now) && isBefore(t.dueDate, addDays(now, 4)))
      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());
    const overdue = active.filter(t => t.dueDate && t.status !== 'completed' && isBefore(t.dueDate, now));

    const byCategory: Record<CatKey, { total: number; completed: number }> = {
      personal: { total: active.filter(t => t.category === 'personal').length, completed: completed.filter(t => t.category === 'personal').length },
      work:     { total: active.filter(t => t.category === 'work').length,     completed: completed.filter(t => t.category === 'work').length },
      wishes:   { total: active.filter(t => t.category === 'wishes').length,   completed: completed.filter(t => t.category === 'wishes').length },
    };

    return { active, completed, upcoming, overdue, byCategory, total: active.length };
  }, [tasks]);

  const donutSlices: DonutSlice[] = [
    { value: stats.byCategory.personal.total - stats.byCategory.personal.completed, color: 'var(--accent-purple)', label: 'Personal' },
    { value: stats.byCategory.work.total - stats.byCategory.work.completed,         color: 'var(--accent-teal)',   label: 'Work' },
    { value: stats.byCategory.wishes.total - stats.byCategory.wishes.completed,     color: 'var(--accent-rose)',   label: 'Wishes' },
  ];

  const activeTotalForDonut = donutSlices.reduce((s, x) => s + x.value, 0);

  const formatDue = (d: Date) => {
    const now = new Date();
    if (isBefore(d, now)) return { label: language === 'ru' ? 'Просрочено' : 'Overdue', color: 'var(--accent-red)' };
    const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    if (diff === 0) return { label: language === 'ru' ? 'Сегодня' : 'Today', color: 'var(--accent-orange)' };
    if (diff === 1) return { label: language === 'ru' ? 'Завтра' : 'Tomorrow', color: 'var(--accent-orange)' };
    return { label: format(d, language === 'ru' ? 'd MMM' : 'MMM d', { locale: language === 'ru' ? ru : undefined }), color: 'var(--text-muted)' };
  };

  return (
    <div style={{ maxWidth: 860, width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Greeting */}
      <div style={{ paddingLeft: 4 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>{getGreeting(language)} 👋</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {language === 'ru' ? 'Что сегодня запланировано?' : "What's planned today?"}
        </h2>
      </div>

      {/* 4 big square tiles */}
      <div className="dashboard-tiles">
        {(['personal', 'work', 'wishes', 'calendar'] as const).map(key => {
          const cfg = CAT_CONFIG[key];
          const catStats = key !== 'calendar' ? stats.byCategory[key as CatKey] : null;
          const activeCat = catStats ? catStats.total - catStats.completed : null;
          const isAction = key !== 'calendar';

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => onNavigate(cfg.page)}
              onKeyDown={e => e.key === 'Enter' && onNavigate(cfg.page)}
              style={{
                background: 'var(--glass-bg-card)',
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                border: '1px solid var(--glass-border)',
                borderRadius: 20,
                padding: '20px 16px',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              className="dashboard-tile"
            >
              {/* Soft glow blob */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 120, height: 120,
                background: `radial-gradient(circle, ${cfg.colorRaw}0.18) 0%, transparent 70%)`,
                borderRadius: '50%', pointerEvents: 'none',
              }} />

              {/* Top row: icon + add button */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: `${cfg.colorRaw}0.14)`,
                  border: `1px solid ${cfg.colorRaw}0.22)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: cfg.color,
                }}>
                  {cfg.icon}
                </div>

                {isAction && (
                  <button
                    onClick={e => { e.stopPropagation(); onAddTask(key as TaskCategory); }}
                    style={{
                      width: 30, height: 30, borderRadius: 9,
                      background: `${cfg.colorRaw}0.14)`,
                      border: `1px solid ${cfg.colorRaw}0.22)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: cfg.color,
                    }}
                    aria-label={`Add ${key} task`}
                  >
                    <Plus size={15} />
                  </button>
                )}
              </div>

              {/* Bottom: label + count */}
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 2 }}>
                  {activeCat !== null ? activeCat : (stats.upcoming.length + stats.overdue.length)}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {cfg.label[language]}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {key === 'calendar'
                    ? (language === 'ru' ? `${stats.upcoming.length} скоро, ${stats.overdue.length} просрочено` : `${stats.upcoming.length} soon, ${stats.overdue.length} overdue`)
                    : (language === 'ru' ? `${catStats?.completed ?? 0} выполнено` : `${catStats?.completed ?? 0} completed`)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="dashboard-charts">

        {/* Category donut */}
        <div
          style={{
            background: 'var(--glass-bg-card)',
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
            border: '1px solid var(--glass-border)',
            borderRadius: 20,
            padding: '20px 24px',
          }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {language === 'ru' ? 'По категориям' : 'By category'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <DonutChart slices={donutSlices} size={110} thickness={18} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {(['personal', 'work', 'wishes'] as CatKey[]).map(cat => {
                const cfg = CAT_CONFIG[cat];
                const val = stats.byCategory[cat].total - stats.byCategory[cat].completed;
                const pct = activeTotalForDonut > 0 ? Math.round((val / activeTotalForDonut) * 100) : 0;
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{cfg.label[language]}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Completion donut */}
        <div
          style={{
            background: 'var(--glass-bg-card)',
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
            border: '1px solid var(--glass-border)',
            borderRadius: 20,
            padding: '20px 24px',
          }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {language === 'ru' ? 'Выполнение' : 'Completion'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <CompletionDonut done={stats.completed.length} total={stats.total} size={110} thickness={18} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{language === 'ru' ? 'Выполнено' : 'Completed'}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{stats.completed.length}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--glass-border-strong)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{language === 'ru' ? 'Активных' : 'Active'}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{stats.total - stats.completed.length}</span>
              </div>
              {stats.overdue.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-red)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--accent-red)', flex: 1 }}>{language === 'ru' ? 'Просрочено' : 'Overdue'}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-red)' }}>{stats.overdue.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming deadlines strip — only if there are any */}
      {stats.upcoming.length > 0 && (
        <div
          style={{
            background: 'var(--glass-bg-card)',
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
            border: '1px solid var(--glass-border)',
            borderRadius: 20,
            padding: '18px 22px',
          }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {language === 'ru' ? 'Скоро дедлайн' : 'Upcoming deadlines'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.upcoming.slice(0, 4).map(task => {
              const due = formatDue(task.dueDate!);
              const catCfg = CAT_CONFIG[task.category];
              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: catCfg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </span>
                  <span style={{ fontSize: 11, color: due.color, fontWeight: 600, flexShrink: 0 }}>{due.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.total === 0 && (
        <div style={{
          background: 'var(--glass-bg-card)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 20,
          padding: '36px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            {language === 'ru' ? 'Начните с первой задачи' : 'Start with your first task'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            {language === 'ru' ? 'Добавьте личное, рабочее задание или желание' : 'Add a personal, work task, or a wish'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(['personal', 'work', 'wishes'] as CatKey[]).map(cat => {
              const cfg = CAT_CONFIG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => onAddTask(cat)}
                  style={{
                    padding: '9px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
                    background: `${cfg.colorRaw}0.12)`,
                    border: `1px solid ${cfg.colorRaw}0.22)`,
                    color: cfg.color,
                  }}
                >
                  <Plus size={14} /> {cfg.label[language]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
