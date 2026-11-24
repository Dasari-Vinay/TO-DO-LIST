import { useState } from 'react';
import { Download, Moon, RotateCcw, Sun, Trash2 } from 'lucide-react';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type SortOption,
  type Task,
  type TaskCategory,
  type TaskPriority,
  type ThemeMode,
  type UserPreferences,
} from '../types/task';

interface SettingsViewProps {
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (next: UserPreferences) => void;
  tasks: Task[];
  onClearCompleted: () => Promise<void>;
  onSeedSampleTasks: () => Promise<void>;
}

export function SettingsView({
  theme,
  onSetTheme,
  preferences,
  onUpdatePreferences,
  tasks,
  onClearCompleted,
  onSeedSampleTasks,
}: SettingsViewProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [busyAction, setBusyAction] = useState<'clear' | 'seed' | null>(null);

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  const handleExportJson = () => {
    const json = JSON.stringify(tasks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    setBusyAction('clear');
    try {
      await onClearCompleted();
      setConfirmClear(false);
    } finally {
      setBusyAction(null);
    }
  };

  const handleSeed = async () => {
    setBusyAction('seed');
    try {
      await onSeedSampleTasks();
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Customize workspace appearance, task defaults, and database utilities.
        </p>
      </div>

      {/* Appearance */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Appearance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Switch between light and dark color schemes across the workspace.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => onSetTheme('light')}
            className={`flex items-center justify-center gap-2.5 h-11 px-4 rounded-lg border text-sm font-medium transition-colors ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="h-4 w-4" aria-hidden="true" />
            <span>Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => onSetTheme('dark')}
            className={`flex items-center justify-center gap-2.5 h-11 px-4 rounded-lg border text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="h-4 w-4" aria-hidden="true" />
            <span>Dark Mode</span>
          </button>
        </div>
      </section>

      {/* Default Task Preferences */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Task Defaults
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pre-fill new task forms and configure default list sorting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="pref-category"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
            >
              Default Category
            </label>
            <select
              id="pref-category"
              value={preferences.defaultCategory}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  defaultCategory: e.target.value as TaskCategory,
                })
              }
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="pref-priority"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
            >
              Default Priority
            </label>
            <select
              id="pref-priority"
              value={preferences.defaultPriority}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  defaultPriority: e.target.value as TaskPriority,
                })
              }
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="pref-sort"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
            >
              Default Sort Order
            </label>
            <select
              id="pref-sort"
              value={preferences.defaultSort}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  defaultSort: e.target.value as SortOption,
                })
              }
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="dueDate_asc">Due Date (Earliest)</option>
              <option value="dueDate_desc">Due Date (Latest)</option>
              <option value="priority_desc">Priority (High to Low)</option>
              <option value="created_desc">Recently Created</option>
            </select>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Data Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Export tasks from MongoDB, clean up completed items, or load sample tasks.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Export */}
          <div className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Export All Tasks (JSON)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download all {tasks.length} tasks currently stored in the database.
              </p>
            </div>
            <button
              type="button"
              disabled={tasks.length === 0}
              onClick={handleExportJson}
              className="inline-flex h-10 items-center gap-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Seed sample tasks */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Add Sample Tasks
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Insert a fresh set of sample tasks across priorities and categories.
              </p>
            </div>
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={handleSeed}
              className="inline-flex h-10 items-center gap-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>{busyAction === 'seed' ? 'Adding...' : 'Add Sample Tasks'}</span>
            </button>
          </div>

          {/* Clear completed */}
          <div className="py-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Clear Completed Tasks
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Permanently remove {completedCount} completed{' '}
                {completedCount === 1 ? 'task' : 'tasks'} from MongoDB.
              </p>
            </div>

            {!confirmClear ? (
              <button
                type="button"
                disabled={completedCount === 0 || busyAction !== null}
                onClick={() => setConfirmClear(true)}
                className="inline-flex h-10 items-center gap-2 px-4 rounded-lg border border-red-200 dark:border-red-900/60 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Clear Completed</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  disabled={busyAction !== null}
                  onClick={() => setConfirmClear(false)}
                  className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busyAction !== null}
                  onClick={handleClear}
                  className="h-9 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-medium text-white"
                >
                  {busyAction === 'clear' ? 'Clearing...' : 'Confirm Clear'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
