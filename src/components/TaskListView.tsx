import { useMemo, useState } from 'react';
import { CheckCircle2, ListTodo, Plus, RotateCcw, Search, X } from 'lucide-react';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type NavView,
  type SortOption,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '../types/task';
import { isTaskDueToday, isTaskUpcoming, sortTasks } from '../utils/taskHelpers';
import { TaskItem } from './TaskItem';

interface TaskListViewProps {
  view: Extract<NavView, 'all' | 'today' | 'upcoming' | 'completed'>;
  tasks: Task[];
  loading: boolean;
  busyId: string | null;
  defaultSort: SortOption;
  onCreateTask: () => void;
  onToggleStatus: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

const VIEW_HEADERS: Record<
  TaskListViewProps['view'],
  { title: string; subtitle: string; emptyTitle: string; emptySubtitle: string }
> = {
  all: {
    title: 'All Tasks',
    subtitle: 'Manage every task across all categories, priorities, and completion states.',
    emptyTitle: 'No tasks match your filters',
    emptySubtitle: 'Try clearing search filters or create a new task to get started.',
  },
  today: {
    title: "Today's Tasks",
    subtitle: 'Focus on tasks scheduled for completion today.',
    emptyTitle: 'No tasks scheduled for today',
    emptySubtitle: 'You have an open schedule today. Add a task if something comes up.',
  },
  upcoming: {
    title: 'Upcoming Tasks',
    subtitle: 'Pending tasks scheduled for tomorrow and beyond.',
    emptyTitle: 'No upcoming tasks',
    emptySubtitle: 'Plan ahead by scheduling upcoming tasks with due dates and priorities.',
  },
  completed: {
    title: 'Completed Tasks',
    subtitle: 'Review finished tasks or reopen them if further work is needed.',
    emptyTitle: 'No completed tasks yet',
    emptySubtitle: 'Tasks you mark as completed will be archived here for reference.',
  },
};

export function TaskListView({
  view,
  tasks,
  loading,
  busyId,
  defaultSort,
  onCreateTask,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
}: TaskListViewProps) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>(defaultSort);

  const viewInfo = VIEW_HEADERS[view];

  const scopedTasks = useMemo(() => {
    const now = new Date();
    switch (view) {
      case 'today':
        return tasks.filter((t) => isTaskDueToday(t, now));
      case 'upcoming':
        return tasks.filter((t) => isTaskUpcoming(t, now));
      case 'completed':
        return tasks.filter((t) => t.status === 'Completed');
      case 'all':
      default:
        return tasks;
    }
  }, [tasks, view]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matched = scopedTasks.filter((task) => {
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
        return false;
      }
      if (categoryFilter !== 'All' && task.category !== categoryFilter) {
        return false;
      }
      if (view === 'all' && statusFilter !== 'All' && task.status !== statusFilter) {
        return false;
      }
      if (query) {
        const inTitle = task.title.toLowerCase().includes(query);
        const inDesc = (task.description || '').toLowerCase().includes(query);
        if (!inTitle && !inDesc) {
          return false;
        }
      }
      return true;
    });
    return sortTasks(matched, sortBy);
  }, [scopedTasks, search, priorityFilter, categoryFilter, statusFilter, view, sortBy]);

  const pendingTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'Pending'),
    [filteredTasks]
  );
  const completedTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'Completed'),
    [filteredTasks]
  );

  const hasActiveFilters =
    search.trim().length > 0 ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All' ||
    (view === 'all' && statusFilter !== 'All');

  const clearFilters = () => {
    setSearch('');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setStatusFilter('All');
  };

  const showSeparateSections =
    view !== 'completed' &&
    !(view === 'all' && statusFilter !== 'All') &&
    (pendingTasks.length > 0 || completedTasks.length > 0);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {viewInfo.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{viewInfo.subtitle}</p>
        </div>
        <div className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
          Showing {filteredTasks.length} of {scopedTasks.length}{' '}
          {scopedTasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      {/* Search, Filter & Sort Toolbar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by title or description..."
              aria-label="Search tasks"
              className="w-full h-10 pl-10 pr-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'All')}
              aria-label="Filter by priority"
              className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort tasks"
              className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="dueDate_asc">Due Date (Earliest)</option>
              <option value="dueDate_desc">Due Date (Latest)</option>
              <option value="priority_desc">Priority (High to Low)</option>
              <option value="created_desc">Recently Created</option>
            </select>
          </div>
        </div>

        {/* Status Segmented Filter + Reset */}
        {(view === 'all' || hasActiveFilters) && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {view === 'all' ? (
              <div
                role="group"
                aria-label="Filter by task status"
                className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                {(['All', 'Pending', 'Completed'] as const).map((st) => {
                  const active = statusFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div />
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse"
            >
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-3 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          {view === 'completed' ? (
            <CheckCircle2 className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" aria-hidden="true" />
          ) : (
            <ListTodo className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" aria-hidden="true" />
          )}
          <h2 className="mt-3 font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            {hasActiveFilters ? 'No matching tasks found' : viewInfo.emptyTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {hasActiveFilters
              ? 'No tasks match your current search or filter criteria.'
              : viewInfo.emptySubtitle}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={onCreateTask}
              className="inline-flex h-10 items-center gap-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      ) : showSeparateSections ? (
        /* Separate Pending and Completed Sections */
        <div className="space-y-8">
          <section aria-label="Pending tasks" className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Pending Tasks
              </h2>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {pendingTasks.length}
              </span>
            </div>
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
                No pending tasks in this view.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
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

          {completedTasks.length > 0 && (
            <section aria-label="Completed tasks" className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Completed Tasks
                </h2>
                <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {completedTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {completedTasks.map((task) => (
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
            </section>
          )}
        </div>
      ) : (
        /* Single Filtered List (e.g., Completed view or explicit status filter) */
        <div className="space-y-3">
          {filteredTasks.map((task) => (
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
    </div>
  );
}
