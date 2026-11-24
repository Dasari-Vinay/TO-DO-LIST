import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Task } from '../types/task';

interface DeleteConfirmModalProps {
  task: Task | null;
  onCancel: () => void;
  onConfirm: (task: Task) => Promise<void>;
}

export function DeleteConfirmModal({ task, onCancel, onConfirm }: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!task) return;
    setDeleting(false);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [task, deleting, onCancel]);

  if (!task) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(task);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[1px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <h2 id="delete-modal-title" className="font-display text-base font-semibold">
              Delete Task
            </h2>
          </div>
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            aria-label="Cancel deletion"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p id="delete-modal-desc" className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              "{task.title}"
            </span>
            ? This action permanently removes the task from MongoDB and cannot be undone.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={onCancel}
              className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-sm font-medium text-white transition-colors whitespace-nowrap"
            >
              {deleting ? 'Deleting...' : 'Delete Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
