import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardView } from './components/DashboardView';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Header } from './components/Header';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { TaskListView } from './components/TaskListView';
import { TaskModal } from './components/TaskModal';
import { ToastContainer } from './components/ToastContainer';
import {
  clearCompletedTasks,
  createTask,
  deleteTask,
  fetchTasks,
  seedSampleTasks,
  updateTask,
} from './services/taskApi';
import type {
  NavView,
  Task,
  TaskPayload,
  ThemeMode,
  ToastMessage,
  UserPreferences,
} from './types/task';
import { isTaskDueToday, isTaskOverdue, isTaskUpcoming, sortTasks } from './utils/taskHelpers';

const THEME_STORAGE_KEY = 'taskflow_theme';
const PREFS_STORAGE_KEY = 'taskflow_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultCategory: 'Work',
  defaultPriority: 'Medium',
  defaultSort: 'dueDate_asc',
};

function loadInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore storage errors
  }
  return 'light';
}

function loadInitialPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserPreferences>;
      return {
        defaultCategory: parsed.defaultCategory || DEFAULT_PREFERENCES.defaultCategory,
        defaultPriority: parsed.defaultPriority || DEFAULT_PREFERENCES.defaultPriority,
        defaultSort: parsed.defaultSort || DEFAULT_PREFERENCES.defaultSort,
      };
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_PREFERENCES;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState<ThemeMode>(loadInitialTheme);
  const [preferences, setPreferences] = useState<UserPreferences>(loadInitialPreferences);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const handleUpdatePreferences = useCallback(
    (next: UserPreferences) => {
      setPreferences(next);
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      addToast('success', 'Default task preferences updated.');
    },
    [addToast]
  );

  const loadAllTasks = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load tasks from the server.';
      setLoadError(msg);
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void loadAllTasks();
  }, [loadAllTasks]);

  const overdueTasks = useMemo(
    () => sortTasks(tasks.filter((t) => isTaskOverdue(t)), 'dueDate_asc'),
    [tasks]
  );

  const counts = useMemo(() => {
    const now = new Date();
    return {
      all: tasks.length,
      today: tasks.filter((t) => isTaskDueToday(t, now)).length,
      upcoming: tasks.filter((t) => isTaskUpcoming(t, now)).length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      overdue: overdueTasks.length,
    };
  }, [tasks, overdueTasks]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (payload: TaskPayload, taskId?: string) => {
    try {
      if (taskId) {
        const updated = await updateTask(taskId, payload);
        setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
        addToast('success', `Updated "${updated.title}".`);
      } else {
        const created = await createTask(payload);
        setTasks((prev) => [created, ...prev]);
        addToast('success', `Created "${created.title}".`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save task.';
      addToast('error', msg);
      throw err;
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setBusyId(task._id);
    try {
      const updated = await updateTask(task._id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
      addToast(
        'success',
        nextStatus === 'Completed'
          ? `Marked "${updated.title}" as completed.`
          : `Reopened "${updated.title}" as pending.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update task status.';
      addToast('error', msg);
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async (task: Task) => {
    setBusyId(task._id);
    try {
      await deleteTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      setTaskToDelete(null);
      addToast('success', `Deleted "${task.title}".`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task.';
      addToast('error', msg);
    } finally {
      setBusyId(null);
    }
  };

  const handleClearCompleted = async () => {
    try {
      const removed = await clearCompletedTasks();
      setTasks((prev) => prev.filter((t) => t.status !== 'Completed'));
      addToast('success', `Cleared ${removed} completed ${removed === 1 ? 'task' : 'tasks'}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to clear completed tasks.';
      addToast('error', msg);
    }
  };

  const handleSeedSampleTasks = async () => {
    try {
      const count = await seedSampleTasks();
      await loadAllTasks();
      addToast('success', `Added ${count} sample tasks.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add sample tasks.';
      addToast('error', msg);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        counts={counts}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeView={activeView}
          overdueTasks={overdueTasks}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onCreateTask={handleOpenCreateModal}
          onToggleTaskStatus={handleToggleTaskStatus}
          onEditTask={handleOpenEditModal}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {loadError && !loading ? (
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 p-8 text-center">
              <p className="font-display text-base font-semibold text-red-700 dark:text-red-300">
                Could not connect to task service
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadAllTasks()}
                className="mt-4 h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : activeView === 'dashboard' ? (
            <DashboardView
              tasks={tasks}
              loading={loading}
              busyId={busyId}
              onNavigate={setActiveView}
              onCreateTask={handleOpenCreateModal}
              onToggleStatus={handleToggleTaskStatus}
              onEditTask={handleOpenEditModal}
              onDeleteTask={setTaskToDelete}
            />
          ) : activeView === 'settings' ? (
            <SettingsView
              theme={theme}
              onSetTheme={setTheme}
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              tasks={tasks}
              onClearCompleted={handleClearCompleted}
              onSeedSampleTasks={handleSeedSampleTasks}
            />
          ) : (
            <TaskListView
              key={activeView}
              view={activeView}
              tasks={tasks}
              loading={loading}
              busyId={busyId}
              defaultSort={preferences.defaultSort}
              onCreateTask={handleOpenCreateModal}
              onToggleStatus={handleToggleTaskStatus}
              onEditTask={handleOpenEditModal}
              onDeleteTask={setTaskToDelete}
            />
          )}
        </main>
      </div>

      <TaskModal
        open={taskModalOpen}
        editingTask={editingTask}
        defaultCategory={preferences.defaultCategory}
        defaultPriority={preferences.defaultPriority}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      <DeleteConfirmModal
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
