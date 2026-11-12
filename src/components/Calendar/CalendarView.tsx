import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import { useLanguage } from '../../context/LanguageContext';
import { Task } from '../../types';
import { isBefore, isToday } from 'date-fns';

interface CalendarViewProps {
  onEditTask: (task: Task) => void;
}

const categoryColors: Record<string, string> = {
  personal: 'var(--accent-purple)',
  work: 'var(--accent-teal)',
  wishes: 'var(--accent-rose)',
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
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

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
      const m = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
      return `${d.getDate()} ${m[d.getMonth()]}`;
    }
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${m[d.getMonth()]} ${d.getDate()}`;
  };

  const totalWithDeadline = Object.values(tasksByDate).flat().length;

  return (
    <div style={{ maxWidth: 900, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div className="glass-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="btn btn-ghost btn-icon" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', minWidth: 120, textAlign: 'center' }}>
              {monthName} {year}
            </span>
            <button className="btn btn-ghost btn-icon" onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'none' }} className="cal-deadline-count">
              {totalWithDeadline} {language === 'ru' ? 'дедл.' : 'deadlines'}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={goToday} style={{ fontSize: 12 }}>
              {t.calendar.today}
            </button>
          </div>
        </div>
      </div>

      <div className={`calendar-layout ${selectedDate ? 'has-panel' : ''}`}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
            {weekDays.map(d => (
              <div key={d} style={{
                textAlign: 'center', fontSize: 10, fontWeight: 700,
                color: 'var(--text-muted)', padding: '3px 0',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - startDow + 1;
              if (dayNum < 1 || dayNum > daysInMonth) {
                return <div key={i} style={{ minHeight: 60 }} />;
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
                  tabIndex={0}
                  aria-label={`${dayNum} ${monthName}`}
                  style={{ minHeight: 60, padding: '5px 4px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{
                      fontSize: 12, fontWeight: isTodayDate ? 700 : 500,
                      color: isTodayDate ? 'var(--accent-teal)' : 'var(--text-secondary)',
                      width: 20, height: 20, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isTodayDate ? 'rgba(94,196,184,0.15)' : 'transparent',
                    }}>
                      {dayNum}
                    </span>
                    {hasOverdue && <AlertTriangle size={9} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayTasks.slice(0, 2).map(task => (
                      <div key={task.id} style={{
                        fontSize: 9, lineHeight: 1.3, padding: '1px 4px', borderRadius: 3,
                        background: `${categoryColors[task.category] || 'var(--accent-purple)'}25`,
                        color: categoryColors[task.category] || 'var(--accent-purple)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        opacity: task.status === 'completed' ? 0.5 : 1,
                      }}>
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', paddingLeft: 4 }}>
                        +{dayTasks.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="glass-card calendar-day-panel" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {formatDateHeader(selectedDate)}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              {selectedTasks.length} {language === 'ru' ? 'задач' : 'tasks'}
            </p>

            {selectedTasks.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.calendar.no_tasks}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedTasks.map(task => {
                  const isOverdue = task.status !== 'completed' && isBefore(task.dueDate!, new Date());
                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      style={{
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        background: 'var(--glass-bg-card)', border: '1px solid var(--glass-border)',
                        borderLeftWidth: 3, borderLeftColor: categoryColors[task.category] || 'var(--accent-purple)',
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
