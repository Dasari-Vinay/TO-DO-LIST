import { AlertTriangle, Calendar, Check, Flag, Pencil, Trash2 } from 'lucide-react';
import type { Task, TaskPriority } from '../types/task';
import { formatDueDate, isTaskOverdue } from '../utils/taskHelpers';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  busyId?: string | null;
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  High: 'text-red-600 dark:text-red-400 font-medium',
  Medium: 'text-amber-600 dark:text-amber-400 font-medium',
  Low: 'text-slate-500 dark:text-slate-400 font-medium',
};

export function TaskItem({ task, onToggleStatus, onEdit, onDelete, busyId }: TaskItemProps) {
  const isCompleted = task.status === 'Completed';
  const overdue = isTaskOverdue(task);
  const isBusy = busyId === task._id;

  return (
    <article
      className={`group rounded-xl border bg-white dark:bg-slate-900 p-4 transition-colors duration-150 ${
        overdue
          ? 'border-red-200 dark:border-red-900/60 hover:border-red-300 dark:hover:border-red-800'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion Checkbox with 40x40 touch target */}
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onToggleStatus(task)}
          aria-label={isCompleted ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
          aria-pressed={isCompleted}
          className="flex h-10 w-10 -ml-2 -mt-1.5 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0 disabled:opacity-50"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 group-hover:border-indigo-500'
            }`}
          >
            {isCompleted && <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />}
          </span>
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`font-display text-base font-semibold leading-snug break-words ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h3>

            {/* Row Actions */}
            <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit "${task.title}"`}
                title="Edit task"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
                aria-label={`Delete "${task.title}"`}
                title="Delete task"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-950/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={`mt-1 text-sm leading-relaxed break-words ${
                isCompleted
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Clean Unboxed Metadata Row (Zero-Pill Discipline) */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">{task.category}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <span className={`inline-flex items-center gap-1 ${PRIORITY_STYLES[task.priority]}`}>
              <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{task.priority} Priority</span>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <span
              className={`inline-flex items-center gap-1 font-mono tabular-nums ${
                overdue
                  ? 'text-red-600 dark:text-red-400 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {overdue ? (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>
                {overdue ? `Overdue (${formatDueDate(task.dueDate)})` : formatDueDate(task.dueDate)}
              </span>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
              ·
            </span>
            <span
              className={
                isCompleted
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }
            >
              {task.status}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
