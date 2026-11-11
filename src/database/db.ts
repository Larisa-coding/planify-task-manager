import Dexie, { Table } from 'dexie';
import { Task } from '../types';

export class TaskManagerDB extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super('TaskManagerDB_v3');
    this.version(1).stores({
      tasks: 'id, title, status, priority, category, dueDate, createdAt, updatedAt, completedAt, isDeleted',
    });
  }
}

export const db = new TaskManagerDB();

// Clean start — data persists in IndexedDB until cache cleared
export const initializeDatabase = async () => {};
