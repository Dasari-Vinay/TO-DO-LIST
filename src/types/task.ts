export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'Completed';
export type TaskCategory = 'Work' | 'Personal' | 'Health' | 'Finance' | 'Study' | 'Errands';

export const TASK_PRIORITIES: readonly TaskPriority[] = ['High', 'Medium', 'Low'] as const;
export const TASK_STATUSES: readonly TaskStatus[] = ['Pending', 'Completed'] as const;
export const TASK_CATEGORIES: readonly TaskCategory[] = [
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Study',
  'Errands',
] as const;

export interface Task {
  _id: string;
  title: string;
  description: string;
  category: TaskCategory | string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  dueDate: string;
  status?: TaskStatus;
}

export type NavView = 'dashboard' | 'all' | 'today' | 'upcoming' | 'completed' | 'settings';

export type SortOption = 'dueDate_asc' | 'dueDate_desc' | 'priority_desc' | 'created_desc';

export type ThemeMode = 'light' | 'dark';

export interface UserPreferences {
  defaultCategory: TaskCategory;
  defaultPriority: TaskPriority;
  defaultSort: SortOption;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}
