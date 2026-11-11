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
import { NotesList } from './components/Notes/NotesList';
import { NoteForm } from './components/Notes/NoteForm';
import ArchiveView from './components/Archive/ArchiveView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import { initializeDatabase } from './database/db';
import { Task, Note, TaskCategory } from './types';
import './App.css';

export type Page =
  | 'dashboard'
  | 'tasks'
  | 'personal'
  | 'work'
  | 'wishes'
  | 'calendar'
  | 'notes'
  | 'archive'
  | 'analytics';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<TaskCategory>('personal');

  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    initializeDatabase().finally(() => setIsLoading(false));
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleAddTask = (category?: TaskCategory) => {
    setEditingTask(null);
    setDefaultCategory(category || 'personal');
    setTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultCategory(task.category);
    setTaskFormOpen(true);
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteFormOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteFormOpen(true);
  };

  const getCategoryFromPage = (): TaskCategory | undefined => {
    if (currentPage === 'personal') return 'personal';
    if (currentPage === 'work') return 'work';
    if (currentPage === 'wishes') return 'wishes';
    return undefined;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} onAddTask={handleAddTask} />;
      case 'tasks':
      case 'personal':
      case 'work':
      case 'wishes':
        return <TaskList category={getCategoryFromPage()} onAddTask={handleAddTask} onEditTask={handleEditTask} />;
      case 'calendar':
        return <CalendarView onEditTask={handleEditTask} />;
      case 'notes':
        return <NotesList onAddNote={handleAddNote} onEditNote={handleEditNote} />;
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
      {/* Desktop sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main column */}
      <div className="app-main">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          currentPage={currentPage}
          onAddTask={() => handleAddTask(getCategoryFromPage())}
        />

        <main className="app-content">
          <div className="fade-in" key={currentPage}>
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} onAddTask={() => handleAddTask(getCategoryFromPage())} />

      {/* Modals */}
      <TaskForm
        isOpen={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setEditingTask(null); }}
        task={editingTask}
        defaultCategory={defaultCategory}
      />
      <NoteForm
        isOpen={noteFormOpen}
        onClose={() => { setNoteFormOpen(false); setEditingNote(null); }}
        note={editingNote}
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
