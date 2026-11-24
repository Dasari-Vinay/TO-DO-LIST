import type { Task, TaskPayload } from '../types/task';

export class ApiError extends Error {
  details?: Record<string, string>;
  status: number;

  constructor(message: string, status: number, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : 'An unexpected server error occurred.';
    throw new ApiError(message, res.status, data.details);
  }
  return data as T;
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/tasks', {
    headers: { Accept: 'application/json' },
  });
  const data = await handleResponse<{ tasks: Task[] }>(res);
  return data.tasks;
}

export async function fetchTaskById(id: string): Promise<Task> {
  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await handleResponse<{ task: Task }>(res);
  return data.task;
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ task: Task }>(res);
  return data.task;
}

export async function updateTask(id: string, payload: Partial<TaskPayload>): Promise<Task> {
  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ task: Task }>(res);
  return data.task;
}

export async function deleteTask(id: string): Promise<string> {
  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  const data = await handleResponse<{ deletedId: string }>(res);
  return data.deletedId;
}

export async function clearCompletedTasks(): Promise<number> {
  const res = await fetch('/api/tasks/completed/clear', {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  const data = await handleResponse<{ deletedCount: number }>(res);
  return data.deletedCount;
}

export async function seedSampleTasks(): Promise<number> {
  const res = await fetch('/api/tasks/seed', {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });
  const data = await handleResponse<{ count: number }>(res);
  return data.count;
}
