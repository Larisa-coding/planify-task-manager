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

export const initializeDatabase = async () => {
  try {
    const taskCount = await db.tasks.where('isDeleted').equals(0).count();

    if (taskCount === 0) {
      const now = new Date();
      await db.tasks.bulkAdd([
        {
          id: 'task-demo-1',
          title: 'Прочитать книгу «Атомные привычки»',
          description: 'Джеймс Клир — про формирование полезных привычек',
          status: 'in_progress',
          priority: 'medium',
          category: 'personal',
          dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: now,
          tags: ['книги', 'саморазвитие'],
          checklist: [
            { id: 'c1', text: 'Часть 1: Законы', completed: true, createdAt: now },
            { id: 'c2', text: 'Часть 2: Привычки в деталях', completed: false, createdAt: now },
          ],
        },
        {
          id: 'task-demo-2',
          title: 'Подготовить презентацию для клиента',
          description: 'Слайды с результатами Q4 и планы на следующий квартал',
          status: 'new',
          priority: 'high',
          category: 'work',
          dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: now,
          tags: ['презентация', 'клиент'],
        },
        {
          id: 'task-demo-3',
          title: 'Поехать в Японию 🇯🇵',
          description: 'Токио, Киото, Осака — минимум 2 недели',
          status: 'new',
          priority: 'low',
          category: 'wishes',
          createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: now,
          tags: ['путешествие', 'мечта'],
        },
        {
          id: 'task-demo-4',
          title: 'Запустить утреннюю зарядку',
          description: '15 минут каждое утро перед работой',
          status: 'completed',
          priority: 'medium',
          category: 'personal',
          createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          tags: ['здоровье', 'привычки'],
        },
      ]);

      await db.notes.add({
        id: 'note-demo-1',
        title: 'Идеи для side project',
        content: '1. Трекер привычек с геймификацией\n2. AI-помощник для планирования дня\n3. Приложение для заметок с голосовым вводом',
        color: '#6366f1',
        tags: ['идеи', 'проекты'],
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('Ошибка инициализации БД:', error);
  }
};
