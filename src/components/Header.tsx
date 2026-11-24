import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bell, Check, Menu, Plus } from 'lucide-react';
import type { NavView, Task } from '../types/task';
import { formatDueDate } from '../utils/taskHelpers';

interface HeaderProps {
  activeView: NavView;
  overdueTasks: Task[];
  onOpenMobileMenu: () => void;
  onCreateTask: () => void;
  onToggleTaskStatus: (task: Task) => void;
  onEditTask: (task: Task) => void;
}

const VIEW_LABELS: Record<NavView, string> = {
  dashboard: 'Dashboard',
  all: 'All Tasks',
  today: "Today's Tasks",
  upcoming: 'Upcoming Tasks',
  completed: 'Completed Tasks',
  settings: 'Settings',
};

export function Header({
  activeView,
  overdueTasks,
  onOpenMobileMenu,
  onCreateTask,
  onToggleTaskStatus,
  onEditTask,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="hidden sm:inline text-slate-400 dark:text-slate-500 whitespace-nowrap">
            Workspace
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden="true">
            /
          </span>
          <span className="font-display font-semibold text-slate-900 dark:text-slate-100 truncate">
            {VIEW_LABELS[activeView]}
          </span>
        </div>
      </div>

      {/* Right: Overdue Notification Center + Primary CTA */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-expanded={notifOpen}
            aria-label={`Overdue task notifications (${overdueTasks.length})`}
            className={`flex h-10 items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              overdueTasks.length > 0
                ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Alerts</span>
            <span className="font-mono text-xs tabular-nums font-semibold">
              {overdueTasks.length}
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden z-40">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Overdue Notifications
                </h3>
                <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {overdueTasks.length} {overdueTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {overdueTasks.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No overdue tasks. Everything is on schedule.
                </div>
              ) : (
                <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {overdueTasks.map((task) => (
                    <li key={task._id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setNotifOpen(false);
                            onEditTask(task);
                          }}
                          className="text-left min-w-0 flex-1 focus-visible:outline-none focus-visible:underline"
                        >
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {task.title}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="font-mono tabular-nums">
                              Due {formatDueDate(task.dueDate)}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleTaskStatus(task)}
                          title="Mark as completed"
                          aria-label={`Mark "${task.title}" as completed`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition-colors shrink-0"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onCreateTask}
          className="flex h-10 items-center gap-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}
