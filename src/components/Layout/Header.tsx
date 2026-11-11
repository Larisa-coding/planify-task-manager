import React from 'react';
import { Menu, Sun, Moon, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Page } from '../../App';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: Page;
  onAddTask: () => void;
}

const pageTitlesRu: Record<Page, string> = {
  dashboard: 'Главная',
  tasks: 'Все задачи',
  personal: 'Личное',
  work: 'Рабочее',
  wishes: 'Желания',
  calendar: 'Календарь',
  notes: 'Заметки',
  archive: 'Архив',
  analytics: 'Аналитика',
};

const pageTitlesEn: Record<Page, string> = {
  dashboard: 'Dashboard',
  tasks: 'All Tasks',
  personal: 'Personal',
  work: 'Work',
  wishes: 'Wishes',
  calendar: 'Calendar',
  notes: 'Notes',
  archive: 'Archive',
  analytics: 'Analytics',
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick, currentPage, onAddTask }) => {
  const { toggleTheme, isDark } = useTheme();
  const { language, setLanguage } = useLanguage();

  const titles = language === 'ru' ? pageTitlesRu : pageTitlesEn;
  const pageTitle = titles[currentPage];

  const showAddButton = ['tasks', 'personal', 'work', 'wishes', 'dashboard'].includes(currentPage);

  return (
    <header className="app-header">
      {/* Left: hamburger (mobile only) + title */}
      <div className="header-left">
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-icon header-menu-btn"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <h1 className="header-title">{pageTitle}</h1>
      </div>

      {/* Right: controls */}
      <div className="header-right">
        {showAddButton && (
          <button onClick={onAddTask} className="btn btn-primary btn-sm" aria-label="Add task">
            <Plus size={15} />
            <span className="header-add-label">
              {language === 'ru' ? 'Задача' : 'Task'}
            </span>
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-icon"
          aria-label="Toggle theme"
        >
          {isDark
            ? <Sun size={18} style={{ color: 'var(--accent-orange)' }} />
            : <Moon size={18} style={{ color: 'var(--accent-purple)' }} />}
        </button>

        <div className="toggle-switch" role="group" aria-label="Language">
          <button
            className={`toggle-option ${language === 'ru' ? 'active' : ''}`}
            onClick={() => setLanguage('ru')}
            aria-pressed={language === 'ru'}
          >
            RU
          </button>
          <button
            className={`toggle-option ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
};
