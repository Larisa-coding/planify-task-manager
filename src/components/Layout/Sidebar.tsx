import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  User,
  Briefcase,
  Star,
  Calendar,
  FileText,
  Archive,
  BarChart2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Page } from '../../App';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const categoryColors: Record<string, string> = {
  personal: 'var(--accent-purple)',
  work:     'var(--accent-blue)',
  wishes:   'var(--accent-pink)',
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, onNavigate }) => {
  const { t } = useLanguage();

  const mainItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard',  label: t.nav.dashboard,  icon: <LayoutDashboard size={18} /> },
    { id: 'tasks',      label: t.nav.tasks,       icon: <CheckSquare size={18} /> },
    { id: 'calendar',   label: t.nav.calendar,    icon: <Calendar size={18} /> },
    { id: 'notes',      label: t.nav.notes,       icon: <FileText size={18} /> },
    { id: 'analytics',  label: t.nav.analytics,   icon: <BarChart2 size={18} /> },
    { id: 'archive',    label: t.nav.archive,     icon: <Archive size={18} /> },
  ];

  const categoryItems: { id: Page; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'personal', label: t.nav.personal, icon: <User size={16} />,      color: categoryColors.personal },
    { id: 'work',     label: t.nav.work,     icon: <Briefcase size={16} />, color: categoryColors.work },
    { id: 'wishes',   label: t.nav.wishes,   icon: <Star size={16} />,      color: categoryColors.wishes },
  ];

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 'var(--sidebar-width)',
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px) saturate(2)',
    WebkitBackdropFilter: 'blur(24px) saturate(2)',
    borderRight: '1px solid var(--glass-border)',
    transform: isOpen || window.innerWidth >= 1024 ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px 20px',
    marginBottom: 4,
  };

  return (
    <aside style={sidebarStyle} className="lg:translate-x-0">
      {/* Logo */}
      <div style={logoStyle}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckSquare size={18} color="#fff" />
        </div>
        <div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
            Planify
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Task Manager</div>
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mainItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
          >
            <span style={{ color: currentPage === item.id ? 'var(--accent-blue)' : 'var(--text-muted)', flexShrink: 0 }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}

        {/* Category section */}
        <div style={{ marginTop: 16, marginBottom: 4, paddingLeft: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t.tasks.categories_label}
          </span>
        </div>

        {categoryItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
          >
            <span style={{ color: currentPage === item.id ? item.color : 'var(--text-muted)', flexShrink: 0 }}>
              {item.icon}
            </span>
            <span style={{ color: currentPage === item.id ? item.color : undefined }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
