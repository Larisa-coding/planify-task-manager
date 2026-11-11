import Dexie, { Table } from 'dexie';
import { Task } from '../types';

export class TaskManagerDB extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    // IMPORTANT: name is fixed — never change it or users lose all data
    super('PlanifyDB');

    this.version(1).stores({
      tasks: 'id, title, status, priority, category, dueDate, createdAt, updatedAt, completedAt, isDeleted',
    });

    // Migrate data from old DB names if they exist
    this.on('ready', async () => {
      await migrateFromOldDB('TaskManagerDB_v3', this);
      await migrateFromOldDB('TaskManagerDB_v2', this);
      await migrateFromOldDB('TaskManagerDB', this);
    });
  }
}

async function migrateFromOldDB(oldName: string, target: TaskManagerDB) {
  try {
    // Check if old DB exists by trying to open it
    const oldDb = new Dexie(oldName);
    oldDb.version(1).stores({ tasks: 'id' });
    oldDb.version(2).stores({ tasks: 'id' });

    const oldTasks = await oldDb.table('tasks').toArray().catch(() => []);
    if (oldTasks.length === 0) {
      await oldDb.close();
      return;
    }

    // Check how many are already in new DB to avoid duplicates
    const existingIds = new Set(
      (await target.tasks.toArray()).map(t => t.id)
    );

    const toMigrate = oldTasks.filter((t: any) => !existingIds.has(t.id));
    if (toMigrate.length > 0) {
      await target.tasks.bulkAdd(toMigrate as Task[]).catch(() => {});
      console.log(`Migrated ${toMigrate.length} tasks from ${oldName}`);
    }

    await oldDb.close();
  } catch {
    // Old DB doesn't exist — nothing to migrate
  }
}

export const db = new TaskManagerDB();

export const initializeDatabase = async () => {};
