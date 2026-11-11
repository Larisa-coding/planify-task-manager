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
    <header
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        height: 'var(--header-height)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px 0 calc(var(--sidebar-width) + 16px)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        borderBottom: '1px solid var(--glass-border)',
      }}
      className="lg:pl-[calc(var(--sidebar-width)+16px)]"
    >
      {/* Left: hamburger (mobile) + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-icon lg:hidden"
          style={{ padding: 7 }}
          aria-label="Open menu"
        >
          <Menu size={20} style={{ color: 'var(--text-secondary)' }} />
        </button>

        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Right: controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Add task button */}
        {showAddButton && (
          <button
            onClick={onAddTask}
            className="btn btn-primary btn-sm"
            aria-label="Add task"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">
              {language === 'ru' ? 'Задача' : 'Task'}
            </span>
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-icon"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun size={18} style={{ color: 'var(--accent-orange)' }} />
          ) : (
            <Moon size={18} style={{ color: 'var(--accent-purple)' }} />
          )}
        </button>

        {/* Language toggle */}
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
