import { Priority, Task, TaskCategory, TaskStatus } from '../types';
import { readLegacyIndexedDbTasks } from './db';

const KEY = 'planify_tasks_v2';
const LEGACY_KEY = 'planify_tasks_backup';
const IMPORTED_FLAG = 'planify_idb_imported_v1';

const CATEGORIES: TaskCategory[] = ['personal', 'work', 'wishes'];
const STATUSES: TaskStatus[] = ['new', 'in_progress', 'completed', 'cancelled'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

export type TaskDraft = {
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  tags?: string[];
  color?: string;
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: Date;
};

type Listener = () => void;

const listeners = new Set<Listener>();
let tasks: Task[] = [];

const toDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const asCategory = (value: unknown): TaskCategory =>
  CATEGORIES.includes(value as TaskCategory) ? (value as TaskCategory) : 'personal';

const asStatus = (value: unknown): TaskStatus =>
  STATUSES.includes(value as TaskStatus) ? (value as TaskStatus) : 'new';

const asPriority = (value: unknown): Priority =>
  PRIORITIES.includes(value as Priority) ? (value as Priority) : 'medium';

const asBool = (value: unknown): boolean => value === true || value === 1 || value === 'true';

export const normalizeTask = (raw: unknown): Task | null => {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== 'string' || !row.id) return null;
  if (typeof row.title !== 'string' || !row.title.trim()) return null;

  const createdAt = toDate(row.createdAt) ?? new Date();
  const tags = Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === 'string') : [];
  const estimated = typeof row.estimatedHours === 'number' && Number.isFinite(row.estimatedHours)
    ? row.estimatedHours
    : undefined;
  const actual = typeof row.actualHours === 'number' && Number.isFinite(row.actualHours)
    ? row.actualHours
    : undefined;

  return {
    id: row.id,
    title: row.title.trim(),
    description: typeof row.description === 'string' && row.description.trim() ? row.description.trim() : undefined,
    status: asStatus(row.status),
    priority: asPriority(row.priority),
    category: asCategory(row.category),
    dueDate: toDate(row.dueDate),
    createdAt,
    updatedAt: toDate(row.updatedAt) ?? createdAt,
    completedAt: toDate(row.completedAt),
    deletedAt: toDate(row.deletedAt),
    isDeleted: asBool(row.isDeleted),
    tags,
    color: typeof row.color === 'string' && row.color ? row.color : undefined,
    estimatedHours: estimated,
    actualHours: actual,
  };
};

const parseList = (raw: string | null): Task[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const next: Task[] = [];
    parsed.forEach((item) => {
      const task = normalizeTask(item);
      if (!task || seen.has(task.id)) return;
      seen.add(task.id);
      next.push(task);
    });
    return next;
  } catch {
    return [];
  }
};

function loadInitial(): Task[] {
  try {
    const primary = localStorage.getItem(KEY);
    if (primary !== null) return parseList(primary);
    return parseList(localStorage.getItem(LEGACY_KEY));
  } catch {
    return [];
  }
}

tasks = loadInitial();

const serialize = (task: Task) => ({
  ...task,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
  completedAt: task.completedAt ? task.completedAt.toISOString() : null,
  deletedAt: task.deletedAt ? task.deletedAt.toISOString() : null,
  dueDate: task.dueDate ? task.dueDate.toISOString() : null,
});

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks.map(serialize)));
  } catch {
  }
  listeners.forEach((listener) => listener());
};

const uid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getTasks = (): Task[] => tasks;

export const hasImmediateData = (): boolean => {
  try {
    if (localStorage.getItem(KEY) !== null) return parseList(localStorage.getItem(KEY)).length > 0;
    return parseList(localStorage.getItem(LEGACY_KEY)).length > 0;
  } catch {
    return tasks.length > 0;
  }
};

export const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const createTask = (draft: TaskDraft): Task => {
  const now = new Date();
  const task = normalizeTask({
    ...draft,
    id: uid(),
    title: draft.title.trim(),
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
    tags: draft.tags ?? [],
  });
  if (!task) throw new Error('Invalid task');
  tasks = [task, ...tasks];
  persist();
  return task;
};

export const updateTask = (id: string, updates: Partial<Task>) => {
  const now = new Date();
  let changed = false;
  tasks = tasks.map((task) => {
    if (task.id !== id) return task;
    changed = true;
    return normalizeTask({ ...task, ...updates, id: task.id, createdAt: task.createdAt, updatedAt: now }) ?? task;
  });
  if (changed) persist();
};

export const deleteTask = (id: string) => {
  const now = new Date();
  let changed = false;
  tasks = tasks.map((task) => {
    if (task.id !== id || task.isDeleted) return task;
    changed = true;
    return { ...task, isDeleted: true, deletedAt: now, updatedAt: now };
  });
  if (changed) persist();
};

export const permanentDeleteTask = (id: string) => {
  const next = tasks.filter((task) => task.id !== id);
  if (next.length === tasks.length) return;
  tasks = next;
  persist();
};

export const updateTaskStatus = (id: string, status: TaskStatus) => {
  const now = new Date();
  let changed = false;
  tasks = tasks.map((task) => {
    if (task.id !== id) return task;
    changed = true;
    return {
      ...task,
      status,
      updatedAt: now,
      completedAt: status === 'completed' ? now : undefined,
    };
  });
  if (changed) persist();
};

export const restoreTask = (id: string) => {
  const now = new Date();
  let changed = false;
  tasks = tasks.map((task) => {
    if (task.id !== id) return task;
    changed = true;
    return {
      ...task,
      isDeleted: false,
      deletedAt: undefined,
      status: 'new',
      completedAt: undefined,
      updatedAt: now,
    };
  });
  if (changed) persist();
};

const mergeIn = (incoming: Task[]) => {
  if (!incoming.length) return false;
  const map = new Map(tasks.map((task) => [task.id, task]));
  let changed = false;
  incoming.forEach((task) => {
    const prev = map.get(task.id);
    if (prev && task.updatedAt.getTime() < prev.updatedAt.getTime()) return;
    map.set(task.id, task);
    if (!prev || task.updatedAt.getTime() !== prev.updatedAt.getTime() || task.status !== prev.status || task.isDeleted !== prev.isDeleted || task.title !== prev.title) {
      changed = true;
    }
  });
  if (!changed) return false;
  tasks = Array.from(map.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return true;
};

let hydratePromise: Promise<void> | null = null;

export const hydrateFromIndexedDB = (): Promise<void> => {
  if (hydratePromise) return hydratePromise;
  hydratePromise = (async () => {
    try {
      if (localStorage.getItem(IMPORTED_FLAG) === '1') return;

      const legacy = parseList(localStorage.getItem(LEGACY_KEY));
      const idbResult = await readLegacyIndexedDbTasks();
      const idb = idbResult.rows
        .map((row) => normalizeTask(row))
        .filter((task): task is Task => task !== null);

      const fromLegacy = mergeIn(legacy);
      const fromIdb = mergeIn(idb);
      if (fromLegacy || fromIdb || localStorage.getItem(KEY) === null) persist();
      if (!idbResult.complete) return;
      localStorage.setItem(IMPORTED_FLAG, '1');
    } catch {
      hydratePromise = null;
    }
  })();
  return hydratePromise;
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== KEY) return;
    tasks = parseList(event.newValue);
    listeners.forEach((listener) => listener());
  });
}
