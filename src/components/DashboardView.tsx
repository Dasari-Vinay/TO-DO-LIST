import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ListTodo, Plus, TrendingUp } from 'lucide-react';
import { TASK_CATEGORIES, type NavView, type Task } from '../types/task';
import { formatDueDate, isTaskOverdue, sortTasks } from '../utils/taskHelpers';
import { TaskItem } from './TaskItem';

interface DashboardViewProps {
  tasks: Task[];
  loading: boolean;
  busyId: string | null;
  onNavigate: (view: NavView) => void;
  onCreateTask: () => void;
  onToggleStatus: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function DashboardView({
  tasks,
  loading,
  busyId,
  onNavigate,
  onCreateTask,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
}: DashboardViewProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t));
  const completionPct = totalTasks === 0 ? 0 : Math.round((completedTasks.length / totalTasks) * 100);

  const focusQueue = sortTasks(pendingTasks, 'dueDate_asc').slice(0, 5);
  const recentlyCompleted = [...completedTasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const categoryStats = TASK_CATEGORIES.map((category) => {
    const items = tasks.filter((t) => t.category === category);
    const done = items.filter((t) => t.status === 'Completed').length;
    const pct = items.length === 0 ? 0 : Math.round((done / items.length) * 100);
    return { category, total: items.length, done, pct };
  }).filter((row) => row.total > 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse"
            >
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-7 w-16 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
          <div className="lg:col-span-5 h-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Intro */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Task Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track daily priorities, completion progress, and upcoming deadlines in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('all')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <span>Open All Tasks</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Overdue Alert Banner */}
      {overdueTasks.length > 0 && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                <span className="font-mono tabular-nums">{overdueTasks.length}</span>{' '}
                {overdueTasks.length === 1 ? 'task is' : 'tasks are'} past due
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                Earliest overdue: {overdueTasks[0].title} ({formatDueDate(overdueTasks[0].dueDate)})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('all')}
            className="h-9 px-3.5 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors whitespace-nowrap self-start sm:self-auto shrink-0"
          >
            Review Overdue
          </button>
        </div>
      )}

      {/* 5 Metric Cards */}
      <section aria-label="Task statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Tasks</span>
            <ListTodo className="h-4 w-4 shrink-0" aria-hidden="true" />
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {totalTasks}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Saved in MongoDB</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</span>
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {completedTasks.length}
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Finished items</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending</span>
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {pendingTasks.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active workload</p>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            overdueTasks.length > 0
              ? 'border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue</span>
            <AlertTriangle
              className={`h-4 w-4 shrink-0 ${
                overdueTasks.length > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
              aria-hidden="true"
            />
          </div>
          <p
            className={`mt-3 font-mono text-2xl font-semibold tabular-nums ${
              overdueTasks.length > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {overdueTasks.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {overdueTasks.length > 0 ? 'Requires attention' : 'All on schedule'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completion</span>
            <TrendingUp className="h-4 w-4 shrink-0" aria-hidden="true" />
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {completionPct}%
          </p>
          <div
            className="mt-2.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
            role="progressbar"
            aria-valuenow={completionPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall task completion percentage"
          >
            <div
              className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Priority & Next Due Tasks */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Upcoming & Priority Focus
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('today')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              View Today
            </button>
          </div>

          {focusQueue.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center">
              <CheckCircle2 className="h-9 w-9 mx-auto text-emerald-500" aria-hidden="true" />
              <h3 className="mt-3 font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                No pending tasks
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {totalTasks === 0
                  ? 'Create your first task to start organizing your schedule.'
                  : 'All your tasks are completed. Add a new task whenever you are ready.'}
              </p>
              <button
                type="button"
                onClick={onCreateTask}
                className="mt-4 inline-flex h-10 items-center gap-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add New Task</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {focusQueue.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  busyId={busyId}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}
        </section>

        {/* Right: Category Breakdown & Recent Completions */}
        <aside className="lg:col-span-5 space-y-6">
          {/* Category Progress */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Progress by Category
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Completed versus total tasks across categories
            </p>

            {categoryStats.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                Category metrics will appear once tasks are added.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {categoryStats.map((row) => (
                  <div key={row.category}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {row.category}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {row.done} / {row.total} ({row.pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Completed */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Recently Completed
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('completed')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View all
              </button>
            </div>

            {recentlyCompleted.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Completed tasks will appear here once checked off.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {recentlyCompleted.map((task) => (
                  <li key={task._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate line-through">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {task.category} · <span className="font-mono tabular-nums">{formatDueDate(task.dueDate)}</span>
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
