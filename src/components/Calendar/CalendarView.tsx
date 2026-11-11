import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useLanguage } from '../../context/LanguageContext';
import { Task } from '../../types';
import { isBefore, isToday } from 'date-fns';

interface CalendarViewProps {
  onEditTask: (task: Task) => void;
}

const categoryColors: Record<string, string> = {
  personal: 'var(--accent-purple)',
  work: 'var(--accent-blue)',
  wishes: 'var(--accent-pink)',
};

export const CalendarView: React.FC<CalendarViewProps> = ({ onEditTask }) => {
  const { tasks } = useTasks();
  const { t, language } = useLanguage();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-based week: shift getDay() so Mon=0
  const startDow = (firstDay.getDay() + 6) % 7;

  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

  // Map tasks by date string
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks
      .filter(t => t.dueDate && t.status !== 'cancelled')
      .forEach(task => {
        const key = task.dueDate!.toISOString().slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(task);
      });
    return map;
  }, [tasks]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  const selectedKey = selectedDate ? selectedDate.toISOString().slice(0, 10) : null;
  const selectedTasks = selectedKey ? (tasksByDate[selectedKey] || []) : [];

  const monthName = t.calendar.months[month];
  const weekDays = t.calendar.week_days;

  const formatDateHeader = (d: Date) => {
    if (language === 'ru') {
      const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    }
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-ghost btn-icon" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', minWidth: 180, textAlign: 'center' }}>
            {monthName} {year}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={goToday}>
          <CalendarIcon size={14} /> {t.calendar.today}
        </button>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
          {Object.values(tasksByDate).flat().length} {language === 'ru' ? 'задач с дедлайном' : 'tasks with deadline'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '1fr 320px' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* Grid */}
        <div>
          {/* Week day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {weekDays.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - startDow + 1;
              if (dayNum < 1 || dayNum > daysInMonth) {
                return <div key={i} style={{ minHeight: 80 }} />;
              }

              const cellDate = new Date(year, month, dayNum);
              const key = cellDate.toISOString().slice(0, 10);
              const dayTasks = tasksByDate[key] || [];
              const isSelected = selectedKey === key;
              const isTodayDate = isToday(cellDate);
              const now = new Date();
              const hasOverdue = dayTasks.some(t => t.status !== 'completed' && isBefore(t.dueDate!, now));

              return (
                <div
                  key={i}
                  className={`calendar-cell ${isTodayDate ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(isSelected ? null : cellDate)}
                  role="button"
                  aria-label={`${dayNum} ${monthName}`}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 4,
                  }}>
                    <span style={{
                      fontSize: 13, fontWeight: isTodayDate ? 700 : 500,
                      color: isTodayDate ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      width: 22, height: 22, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isTodayDate ? 'rgba(88,166,255,0.15)' : 'transparent',
                    }}>
                      {dayNum}
                    </span>
                    {hasOverdue && <AlertTriangle size={11} style={{ color: 'var(--accent-red)' }} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayTasks.slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        style={{
                          fontSize: 10, lineHeight: 1.3, padding: '2px 5px', borderRadius: 4,
                          background: `${categoryColors[task.category]}20`,
                          color: categoryColors[task.category],
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          opacity: task.status === 'completed' ? 0.6 : 1,
                        }}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 5 }}>
                        +{dayTasks.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDate && (
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {formatDateHeader(selectedDate)}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              {selectedTasks.length} {language === 'ru' ? 'задач' : 'tasks'}
            </p>

            {selectedTasks.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.calendar.no_tasks}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedTasks.map(task => {
                  const isOverdue = task.status !== 'completed' && isBefore(task.dueDate!, new Date());
                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      style={{
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        background: 'var(--glass-bg-card)', border: '1px solid var(--glass-border)',
                        borderLeftWidth: 3, borderLeftColor: categoryColors[task.category],
                        transition: 'all 0.2s',
                        opacity: task.status === 'completed' ? 0.6 : 1,
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isOverdue && <AlertTriangle size={12} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />}
                        <span style={{
                          fontSize: 13, fontWeight: 500,
                          color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        }}>
                          {task.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <span className={`badge badge-${task.category}`} style={{ fontSize: 10 }}>
                          {t.categories[task.category]}
                        </span>
                        <span className={`badge badge-${task.priority}`} style={{ fontSize: 10 }}>
                          {t.priorities[task.priority]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
