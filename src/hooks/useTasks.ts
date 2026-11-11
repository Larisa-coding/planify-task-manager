import { useState, useEffect, useCallback } from 'react';
import { db } from '../database/db';
import { Task, TaskStatus, TaskCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Accepts primitive category string instead of a FilterOptions object
// so useCallback dependency is stable and doesn't re-create on every render
export const useTasks = (category?: TaskCategory) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let all = await db.tasks.orderBy('createdAt').toArray();
      // Exclude soft-deleted
      all = all.filter(t => t.isDeleted !== true);
      // Filter by category if provided
      if (category) {
        all = all.filter(t => t.category === category);
      }
      setTasks(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading tasks');
    } finally {
      setLoading(false);
    }
  }, [category]); // stable: only re-runs when category string changes

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = { ...data, id: uuidv4(), createdAt: new Date(), updatedAt: new Date() };
    await db.tasks.add(task);
    await loadTasks();
    return task;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await db.tasks.update(id, { ...updates, updatedAt: new Date() } as any);
    await loadTasks();
  };

  const deleteTask = async (id: string) => {
    await db.tasks.update(id, { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() } as any);
    await loadTasks();
  };

  const permanentDeleteTask = async (id: string) => {
    await db.tasks.delete(id);
    await loadTasks();
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const updates: Partial<Task> = { status, updatedAt: new Date() };
    if (status === 'completed') updates.completedAt = new Date();
    else updates.completedAt = undefined;
    await db.tasks.update(id, updates as any);
    await loadTasks();
  };

  const restoreTask = async (id: string) => {
    await db.tasks.update(id, {
      isDeleted: false,
      deletedAt: undefined,
      status: 'new',
      updatedAt: new Date(),
    } as any);
    await loadTasks();
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

  const permanentDelete = async (id: string) => {
    await db.tasks.delete(id);
    await load();
  };

  const restore = async (id: string) => {
    await db.tasks.update(id, {
      isDeleted: false,
      deletedAt: undefined,
      status: 'new',
      completedAt: undefined,
      updatedAt: new Date(),
    } as any);
    await load();
  };

  return { tasks, loading, permanentDelete, restore, refetch: load };
};
