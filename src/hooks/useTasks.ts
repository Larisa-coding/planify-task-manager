import { useState, useEffect, useCallback } from 'react';
import { db } from '../database/db';
import { Task, TaskStatus, TaskCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Global event bus: dispatch 'tasks-updated' after any write so all hooks reload
export const notifyTasksUpdated = () =>
  window.dispatchEvent(new CustomEvent('tasks-updated'));

export const useTasks = (category?: TaskCategory) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let all = await db.tasks.orderBy('createdAt').toArray();
      all = all.filter(t => t.isDeleted !== true);
      if (category) {
        all = all.filter(t => t.category === category);
      }
      setTasks(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading tasks');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Re-load whenever any component writes to the DB
  useEffect(() => {
    window.addEventListener('tasks-updated', loadTasks);
    return () => window.removeEventListener('tasks-updated', loadTasks);
  }, [loadTasks]);

  const createTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = { ...data, id: uuidv4(), createdAt: new Date(), updatedAt: new Date() };
    await db.tasks.add(task);
    notifyTasksUpdated();
    return task;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await db.tasks.update(id, { ...updates, updatedAt: new Date() } as any);
    notifyTasksUpdated();
  };

  const deleteTask = async (id: string) => {
    await db.tasks.update(id, { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() } as any);
    notifyTasksUpdated();
  };

  const permanentDeleteTask = async (id: string) => {
    await db.tasks.delete(id);
    notifyTasksUpdated();
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const updates: Partial<Task> = { status, updatedAt: new Date() };
    if (status === 'completed') updates.completedAt = new Date();
    else updates.completedAt = undefined;
    await db.tasks.update(id, updates as any);
    notifyTasksUpdated();
  };

  const restoreTask = async (id: string) => {
    await db.tasks.update(id, {
      isDeleted: false,
      deletedAt: undefined,
      status: 'new',
      updatedAt: new Date(),
    } as any);
    notifyTasksUpdated();
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    permanentDeleteTask,
    updateTaskStatus,
    restoreTask,
    refetch: loadTasks,
  };
};

/** Load all tasks including deleted/completed for archive */
export const useAllTasksForArchive = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await db.tasks.orderBy('createdAt').toArray();
    setTasks(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Also react to writes from TaskForm
  useEffect(() => {
    window.addEventListener('tasks-updated', load);
    return () => window.removeEventListener('tasks-updated', load);
  }, [load]);

  const permanentDelete = async (id: string) => {
    await db.tasks.delete(id);
    notifyTasksUpdated();
  };

  const restore = async (id: string) => {
    await db.tasks.update(id, {
      isDeleted: false,
      deletedAt: undefined,
      status: 'new',
      completedAt: undefined,
      updatedAt: new Date(),
    } as any);
    notifyTasksUpdated();
  };

  return { tasks, loading, permanentDelete, restore, refetch: load };
};
