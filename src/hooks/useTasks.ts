import { useState, useEffect, useCallback } from 'react';
import { db } from '../database/db';
import { Task, TaskStatus, FilterOptions } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useTasks = (filters?: FilterOptions) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let all = await db.tasks.orderBy('createdAt').toArray();

      // Exclude soft-deleted (unless specifically requesting archived)
      all = all.filter(t => !t.isDeleted);

      if (filters?.status?.length) {
        all = all.filter(t => filters.status!.includes(t.status));
      }
      if (filters?.priority?.length) {
        all = all.filter(t => filters.priority!.includes(t.priority));
      }
      if (filters?.category?.length) {
        all = all.filter(t => filters.category!.includes(t.category));
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        all = all.filter(t =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.toLowerCase().includes(q))
        );
      }
      if (filters?.dueDate?.from) {
        all = all.filter(t => t.dueDate && t.dueDate >= filters.dueDate!.from!);
      }
      if (filters?.dueDate?.to) {
        all = all.filter(t => t.dueDate && t.dueDate <= filters.dueDate!.to!);
      }

      setTasks(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
    await db.tasks.update(id, { ...updates, updatedAt: new Date() });
    await loadTasks();
  };

  const deleteTask = async (id: string) => {
    // Soft delete
    await db.tasks.update(id, { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() });
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
    await db.tasks.update(id, updates);
    await loadTasks();
  };

  const restoreTask = async (id: string) => {
    await db.tasks.update(id, {
      isDeleted: false,
      deletedAt: undefined,
      status: 'new',
      updatedAt: new Date(),
    });
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
    });
    await load();
  };

  return { tasks, loading, permanentDelete, restore, refetch: load };
};
