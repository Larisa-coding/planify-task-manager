import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
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

  // Task form
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<TaskCategory>('personal');

  // Note form
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

  // Determine category filter from page
  const getCategoryFromPage = (): TaskCategory | undefined => {
    if (currentPage === 'personal') return 'personal';
    if (currentPage === 'work') return 'work';
    if (currentPage === 'wishes') return 'wishes';
    return undefined;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onAddTask={handleAddTask}
          />
        );
      case 'tasks':
      case 'personal':
      case 'work':
      case 'wishes':
        return (
          <TaskList
            category={getCategoryFromPage()}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />
        );
      case 'calendar':
        return <CalendarView onEditTask={handleEditTask} />;
      case 'notes':
        return (
          <NotesList
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
          />
        );
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--gradient-bg)' }}
      >
        <div className="text-center fade-in">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent mx-auto mb-4"
            style={{
              borderColor: 'var(--accent-blue)',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Main layout */}
      <div
        className="flex flex-col"
        style={{
          marginLeft: window.innerWidth >= 1024 ? 'var(--sidebar-width)' : 0,
          minHeight: '100vh',
        }}
      >
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          currentPage={currentPage}
          onAddTask={() => handleAddTask(getCategoryFromPage())}
        />

        <main className="flex-1 p-4 md:p-6" style={{ paddingTop: 'calc(var(--header-height) + 1rem)' }}>
          <div className="fade-in" key={currentPage}>
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
