import React from 'react';
import {
  LayoutDashboard, CheckSquare, User, Briefcase,
  Star, Calendar, FileText, Archive, BarChart2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Page } from '../../App';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPage, onNavigate }) => {
  const { t } = useLanguage();

  const mainItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: <LayoutDashboard size={18} /> },
    { id: 'tasks',     label: t.nav.tasks,     icon: <CheckSquare size={18} /> },
    { id: 'calendar',  label: t.nav.calendar,  icon: <Calendar size={18} /> },
    { id: 'notes',     label: t.nav.notes,     icon: <FileText size={18} /> },
    { id: 'analytics', label: t.nav.analytics, icon: <BarChart2 size={18} /> },
    { id: 'archive',   label: t.nav.archive,   icon: <Archive size={18} /> },
  ];

  const categoryItems: { id: Page; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'personal', label: t.nav.personal, icon: <User size={16} />,      color: 'var(--accent-purple)' },
    { id: 'work',     label: t.nav.work,     icon: <Briefcase size={16} />, color: 'var(--accent-teal)' },
    { id: 'wishes',   label: t.nav.wishes,   icon: <Star size={16} />,      color: 'var(--accent-rose)' },
  ];

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

      {/* Navigation */}
      <nav className="sidebar-nav">
        {mainItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="sidebar-section-label">{t.tasks.categories_label}</div>

        {categoryItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            style={currentPage === item.id ? { color: item.color } as React.CSSProperties : undefined}
          >
            <span
              className="sidebar-item-icon"
              style={{ color: currentPage === item.id ? item.color : undefined }}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};
