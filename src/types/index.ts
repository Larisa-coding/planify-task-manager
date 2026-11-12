export type TaskCategory = 'personal' | 'work' | 'wishes';

export type TaskStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

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
  estimatedHours?: number;
  actualHours?: number;
}
