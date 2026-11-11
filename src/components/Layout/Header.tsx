import React from 'react';
import { Menu, Sun, Moon, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Page } from '../../App';
import { TaskCategory } from '../../types';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: Page;
  currentCategory?: TaskCategory;
  onAddTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick, currentPage, currentCategory, onAddTask,
}) => {
  const { toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Build page title
  const baseTitles: Record<Page, string> = {
    dashboard: t.nav.dashboard,
    tasks:     t.nav.tasks,
    calendar:  t.nav.calendar,
    archive:   t.nav.archive,
    analytics: t.nav.analytics,
  };

  const categoryLabels: Record<TaskCategory, string> = {
    personal: t.categories.personal,
    work:     t.categories.work,
    wishes:   t.categories.wishes,
  };

  const pageTitle = currentPage === 'tasks' && currentCategory
    ? categoryLabels[currentCategory]
    : baseTitles[currentPage];

  const showAdd = ['tasks', 'dashboard'].includes(currentPage);

  return (
    <header className="app-header">
      <div className="header-left">
        <button onClick={onMenuClick} className="btn btn-ghost btn-icon header-menu-btn" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <h1 className="header-title">{pageTitle}</h1>
      </div>

      <div className="header-right">
        {showAdd && (
          <button onClick={onAddTask} className="btn btn-primary btn-sm" aria-label="Add task">
            <Plus size={15} />
            <span className="header-add-label">
              {language === 'ru' ? 'Задача' : 'Task'}
            </span>
          </button>
        )}

        <button onClick={toggleTheme} className="btn btn-ghost btn-icon" aria-label="Toggle theme">
          {isDark
            ? <Sun size={18} style={{ color: 'var(--accent-orange)' }} />
            : <Moon size={18} style={{ color: 'var(--accent-purple)' }} />}
        </button>

        <div className="toggle-switch" role="group" aria-label="Language">
          <button className={`toggle-option ${language === 'ru' ? 'active' : ''}`} onClick={() => setLanguage('ru')}>RU</button>
          <button className={`toggle-option ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
        </div>
      </div>
    </header>
  );
};
