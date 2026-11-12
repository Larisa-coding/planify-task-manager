import React from 'react';
import { LayoutDashboard, ListTodo, Calendar, Archive, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Page } from '../../App';
import { TaskCategory } from '../../types';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page, category?: TaskCategory) => void;
  onAddTask: () => void;
}

type NavEntry =
  | { type: 'page'; id: Page; label: string; icon: React.ReactNode }
  | { type: 'fab' };

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, onAddTask }) => {
  const { t } = useLanguage();

  const items: NavEntry[] = [
    { type: 'page', id: 'dashboard', label: t.nav.dashboard, icon: <LayoutDashboard size={22} /> },
    { type: 'page', id: 'tasks',     label: t.nav.tasks,     icon: <ListTodo size={22} /> },
    { type: 'fab' },
    { type: 'page', id: 'calendar',  label: t.nav.calendar,  icon: <Calendar size={22} /> },
    { type: 'page', id: 'archive',   label: t.nav.archive,   icon: <Archive size={22} /> },
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {items.map((item, i) => {
        if (item.type === 'fab') {
          return (
            <div key="fab" className="bottom-nav-fab-wrap">
              <button className="bottom-nav-fab" onClick={onAddTask} aria-label="Add task">
                <Plus size={24} />
              </button>
            </div>
          );
        }
        const active = currentPage === item.id;
        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={active ? 'page' : undefined}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
