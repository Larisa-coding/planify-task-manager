import { useEffect, useState } from 'react';
import {
  createTask as storeCreate,
  deleteTask as storeDelete,
  getTasks,
  permanentDeleteTask as storePermanentDelete,
  restoreTask as storeRestore,
  subscribe,
  TaskDraft,
  updateTask as storeUpdate,
  updateTaskStatus as storeStatus,
} from '../database/taskStore';
import { Task, TaskCategory, TaskStatus } from '../types';

const activeTasks = (category?: TaskCategory) =>
  getTasks().filter((task) => !task.isDeleted && (!category || task.category === category));

export const useTasks = (category?: TaskCategory) => {
  const [tasks, setTasks] = useState<Task[]>(() => activeTasks(category));

  useEffect(() => {
    setTasks(activeTasks(category));
    return subscribe(() => setTasks(activeTasks(category)));
  }, [category]);

  const createTask = (data: TaskDraft) => storeCreate(data);
  const updateTask = (id: string, updates: Partial<Task>) => storeUpdate(id, updates);
  const deleteTask = (id: string) => storeDelete(id);
  const permanentDeleteTask = (id: string) => storePermanentDelete(id);
  const updateTaskStatus = (id: string, status: TaskStatus) => storeStatus(id, status);
  const restoreTask = (id: string) => storeRestore(id);

  return {
    tasks,
    loading: false,
    error: null as string | null,
    createTask,
    updateTask,
    deleteTask,
    permanentDeleteTask,
    updateTaskStatus,
    restoreTask,
    refetch: () => setTasks(activeTasks(category)),
  };
};

export const useAllTasksForArchive = () => {
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());

  useEffect(() => subscribe(() => setTasks(getTasks())), []);

  return {
    tasks,
    loading: false,
    permanentDelete: storePermanentDelete,
    restore: storeRestore,
    refetch: () => setTasks(getTasks()),
  };
};
