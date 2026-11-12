import { Task } from '../types';

const DB_NAMES = ['PlanifyDB', 'TaskManagerDB_v3', 'TaskManagerDB_v2', 'TaskManagerDB'];

type ReadResult = { rows: unknown[]; complete: boolean };

function readDatabase(name: string, timeoutMs: number): Promise<ReadResult> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (rows: unknown[], complete: boolean) => {
      if (settled) return;
      settled = true;
      resolve({ rows, complete });
    };

    const timer = window.setTimeout(() => finish([], false), timeoutMs);

    try {
      const request = indexedDB.open(name);
      request.onerror = () => {
        window.clearTimeout(timer);
        finish([], true);
      };
      request.onblocked = () => {
        window.clearTimeout(timer);
        finish([], false);
      };
      request.onupgradeneeded = () => {
        // Database does not exist yet. Abort so we don't create an empty one.
        try { request.transaction?.abort(); } catch { /* ignore */ }
        window.clearTimeout(timer);
        finish([], true);
      };
      request.onsuccess = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('tasks')) {
          database.close();
          window.clearTimeout(timer);
          finish([], true);
          return;
        }
        try {
          const tx = database.transaction('tasks', 'readonly');
          const getAll = tx.objectStore('tasks').getAll();
          getAll.onsuccess = () => {
            database.close();
            window.clearTimeout(timer);
            finish(Array.isArray(getAll.result) ? getAll.result : [], true);
          };
          getAll.onerror = () => {
            database.close();
            window.clearTimeout(timer);
            finish([], false);
          };
        } catch {
          database.close();
          window.clearTimeout(timer);
          finish([], false);
        }
      };
    } catch {
      window.clearTimeout(timer);
      finish([], false);
    }
  });
}

/** One-time read of tasks left in IndexedDB. Never writes. */
export async function readLegacyIndexedDbTasks(): Promise<{ rows: unknown[]; complete: boolean }> {
  const batches = await Promise.all(DB_NAMES.map((name) => readDatabase(name, 1500)));
  return {
    rows: batches.flatMap((batch) => batch.rows),
    complete: batches.every((batch) => batch.complete),
  };
}

export type { Task };
