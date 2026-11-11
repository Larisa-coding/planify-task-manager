import Dexie, { Table } from 'dexie';
import { Task, Note } from '../types';

export class TaskManagerDB extends Dexie {
  tasks!: Table<Task>;
  notes!: Table<Note>;

  constructor() {
    super('TaskManagerDB_v2');

    this.version(1).stores({
      tasks: 'id, title, status, priority, category, dueDate, createdAt, updatedAt, completedAt, isDeleted',
      notes: 'id, title, createdAt, updatedAt, archived, isDeleted',
    });
  }
}

export const db = new TaskManagerDB();

// No demo data — clean start, user's data persists in IndexedDB until cache is cleared
export const initializeDatabase = async () => {
  // Nothing to seed — app starts empty
};
