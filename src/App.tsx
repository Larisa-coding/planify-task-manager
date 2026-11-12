import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { BottomNav } from './components/Layout/BottomNav';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TaskList } from './components/Tasks/TaskList';
import { TaskForm } from './components/Tasks/TaskForm';
import { CalendarView } from './components/Calendar/CalendarView';
import ArchiveView from './components/Archive/ArchiveView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import { hasImmediateData, hydrateFromIndexedDB } from './database/taskStore';
import { Task, TaskCategory } from './types';
import './App.css';

export type Page = 'dashboard' | 'tasks' | 'calendar' | 'archive' | 'analytics';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentCategory, setCurrentCategory] = useState<TaskCategory | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(() => !hasImmediateData());

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<TaskCategory>('personal');
  const ignoreAddUntil = React.useRef(0);

  useEffect(() => {
    hydrateFromIndexedDB().finally(() => setIsLoading(false));
  }, []);

  const handleNavigate = (page: Page, category?: TaskCategory) => {
    setCurrentPage(page);
    setCurrentCategory(category);
    setSidebarOpen(false);
  };

  const handleAddTask = (category?: TaskCategory) => {
    if (Date.now() < ignoreAddUntil.current) return;
    setEditingTask(null);
    setDefaultCategory(category || currentCategory || 'personal');
    setTaskFormOpen(true);
  };

  const handleCloseForm = () => {
    ignoreAddUntil.current = Date.now() + 700;
    setTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultCategory(task.category);
    setTaskFormOpen(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} onAddTask={handleAddTask} />;
      case 'tasks':
        return (
          <TaskList
            category={currentCategory}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />
        );
      case 'calendar':
        return <CalendarView onEditTask={handleEditTask} />;
      case 'archive':
        return <ArchiveView onEditTask={handleEditTask} />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <Dashboard onNavigate={handleNavigate} onAddTask={handleAddTask} />;
    }
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-spinner" />
      </div>
    );
  }

  return (
    <div className="app-root">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        currentCategory={currentCategory}
        onNavigate={handleNavigate}
      />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <div className="app-main">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          currentPage={currentPage}
          currentCategory={currentCategory}
          onAddTask={() => handleAddTask(currentCategory)}
        />

        <main className="app-content">
          <div className="fade-in" key={`${currentPage}-${currentCategory}`}>
            {renderPage()}
          </div>
        </main>
      </div>

      {!taskFormOpen && (
        <BottomNav
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onAddTask={() => handleAddTask(currentCategory)}
        />
      )}

      <TaskForm
        isOpen={taskFormOpen}
        onClose={handleCloseForm}
        task={editingTask}
        defaultCategory={defaultCategory}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
