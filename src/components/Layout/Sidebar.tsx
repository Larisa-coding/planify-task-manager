import React from 'react';
import {
  LayoutDashboard, ListTodo,
  Calendar, Archive, BarChart2,
  User, Briefcase, Star,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Page } from '../../App';
import { TaskCategory } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  currentCategory?: TaskCategory;
  onNavigate: (page: Page, category?: TaskCategory) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen, currentPage, currentCategory, onNavigate,
}) => {
  const { t } = useLanguage();

  const items: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'calendar',  label: t.nav.calendar,  icon: <Calendar size={18} /> },
    { id: 'analytics', label: t.nav.analytics, icon: <BarChart2 size={18} /> },
    { id: 'archive',   label: t.nav.archive,   icon: <Archive size={18} /> },
  ];

  const categories: { id: TaskCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: t.nav.personal, icon: <User size={16} /> },
    { id: 'work',     label: t.nav.work,     icon: <Briefcase size={16} /> },
    { id: 'wishes',   label: t.nav.wishes,   icon: <Star size={16} /> },
  ];

  const tasksActive = currentPage === 'tasks' && !currentCategory;

  return (
    <aside className={`app-sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" aria-hidden="true">
          <ListTodo size={16} />
        </div>
        <div>
          <div className="sidebar-logo-name">Planify</div>
          <div className="sidebar-logo-sub">Task Manager</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={`sidebar-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <span className="sidebar-item-icon"><LayoutDashboard size={18} /></span>
          {t.nav.dashboard}
        </button>

        <button
          type="button"
          className={`sidebar-item ${tasksActive ? 'active' : ''}`}
          onClick={() => onNavigate('tasks')}
        >
          <span className="sidebar-item-icon"><ListTodo size={18} /></span>
          {t.nav.tasks}
        </button>

        <div className="sidebar-sub">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`sidebar-item ${currentPage === 'tasks' && currentCategory === cat.id ? 'active' : ''}`}
              onClick={() => onNavigate('tasks', cat.id)}
            >
              <span className="sidebar-item-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {items.map(item => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};
