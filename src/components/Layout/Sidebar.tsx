import React from 'react';
import {
  LayoutDashboard, CheckSquare,
  Calendar, Archive, BarChart2,
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

  const items: { id: Page; label: string; icon: React.ReactNode; category?: TaskCategory }[] = [
    { id: 'dashboard',  label: t.nav.dashboard,  icon: <LayoutDashboard size={18} /> },
    { id: 'tasks',      label: t.nav.tasks,       icon: <CheckSquare size={18} /> },
    { id: 'calendar',   label: t.nav.calendar,    icon: <Calendar size={18} /> },
    { id: 'analytics',  label: t.nav.analytics,   icon: <BarChart2 size={18} /> },
    { id: 'archive',    label: t.nav.archive,     icon: <Archive size={18} /> },
  ];

  const isActive = (item: typeof items[0]) =>
    currentPage === item.id && (!item.category || currentCategory === item.category);

  return (
    <aside className={`app-sidebar ${isOpen ? 'is-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <CheckSquare size={18} color="#fff" />
        </div>
        <div>
          <div className="sidebar-logo-name">Planify</div>
          <div className="sidebar-logo-sub">Task Manager</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {items.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${isActive(item) ? 'active' : ''}`}
            onClick={() => onNavigate(item.id, item.category)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};
