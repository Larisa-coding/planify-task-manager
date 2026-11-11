export type TaskCategory = 'personal' | 'work' | 'wishes';

export type TaskStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  deletedAt?: Date;
  isDeleted?: boolean;
  tags: string[];
  color?: string;
  checklist?: ChecklistItem[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  archived?: boolean;
  archivedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface FilterOptions {
  status?: TaskStatus[];
  priority?: Priority[];
  category?: TaskCategory[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  tags?: string[];
  search?: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  tasksByCategory: Record<TaskCategory, number>;
  completionRate: number;
  avgCompletionTimeHours: number;
}
