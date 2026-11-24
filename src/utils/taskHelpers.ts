import type { SortOption, Task, TaskPriority } from '../types/task';

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export function isTaskOverdue(task: Task, now = new Date()): boolean {
  if (task.status === 'Completed') {
    return false;
  }
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) {
    return false;
  }
  return due.getTime() < now.getTime();
}

export function isTaskDueToday(task: Task, now = new Date()): boolean {
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) {
    return false;
  }
  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate()
  );
}

export function isTaskUpcoming(task: Task, now = new Date()): boolean {
  if (task.status === 'Completed') {
    return false;
  }
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) {
    return false;
  }
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return due.getTime() >= startOfTomorrow.getTime();
}

export function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return 'No due date';
  }
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const timePart = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Today, ${timePart}`;
  }
  if (isTomorrow) {
    return `Tomorrow, ${timePart}`;
  }
  if (isYesterday) {
    return `Yesterday, ${timePart}`;
  }

  const datePart = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  return `${datePart}, ${timePart}`;
}

export function toLocalDateTimeInputValue(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date(Date.now() + 2 * 60 * 60 * 1000);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  const copy = [...tasks];
  copy.sort((a, b) => {
    switch (sortBy) {
      case 'dueDate_desc':
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      case 'priority_desc': {
        const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (diff !== 0) return diff;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      case 'created_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'dueDate_asc':
      default:
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  });
  return copy;
}
