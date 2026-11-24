import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import {
  Task,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from '../models/Task.ts';
import { buildSampleTasks } from '../db.ts';

const router = express.Router();

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  data?: {
    title: string;
    description: string;
    category: string;
    priority: TaskPriority;
    dueDate: Date;
    status: TaskStatus;
  };
}

function validateTaskPayload(body: unknown, isPartial = false): {
  valid: boolean;
  errors: Record<string, string>;
  updateFields?: Partial<NonNullable<ValidationResult['data']>>;
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      valid: false,
      errors: { general: 'Request body must be a JSON object.' },
    };
  }

  const payload = body as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const updateFields: Partial<NonNullable<ValidationResult['data']>> = {};

  if (!isPartial || 'title' in payload) {
    if (typeof payload.title !== 'string') {
      errors.title = 'Task title must be a valid string.';
    } else {
      const trimmedTitle = payload.title.trim();
      if (trimmedTitle.length < 2) {
        errors.title = 'Task title must be at least 2 characters.';
      } else if (trimmedTitle.length > 120) {
        errors.title = 'Task title cannot exceed 120 characters.';
      } else {
        updateFields.title = trimmedTitle;
      }
    }
  }

  if ('description' in payload) {
    if (payload.description !== undefined && payload.description !== null && typeof payload.description !== 'string') {
      errors.description = 'Description must be a string.';
    } else {
      const trimmedDesc = typeof payload.description === 'string' ? payload.description.trim() : '';
      if (trimmedDesc.length > 1000) {
        errors.description = 'Description cannot exceed 1000 characters.';
      } else {
        updateFields.description = trimmedDesc;
      }
    }
  } else if (!isPartial) {
    updateFields.description = '';
  }

  if (!isPartial || 'category' in payload) {
    if (typeof payload.category !== 'string' || !TASK_CATEGORIES.includes(payload.category)) {
      errors.category = `Category must be one of: ${TASK_CATEGORIES.join(', ')}.`;
    } else {
      updateFields.category = payload.category;
    }
  }

  if (!isPartial || 'priority' in payload) {
    if (
      typeof payload.priority !== 'string' ||
      !TASK_PRIORITIES.includes(payload.priority as TaskPriority)
    ) {
      errors.priority = 'Priority must be High, Medium, or Low.';
    } else {
      updateFields.priority = payload.priority as TaskPriority;
    }
  }

  if (!isPartial || 'dueDate' in payload) {
    if (typeof payload.dueDate !== 'string' && !(payload.dueDate instanceof Date)) {
      errors.dueDate = 'A valid due date and time is required.';
    } else {
      const parsedDate = new Date(payload.dueDate);
      if (Number.isNaN(parsedDate.getTime())) {
        errors.dueDate = 'Due date format is invalid.';
      } else {
        updateFields.dueDate = parsedDate;
      }
    }
  }

  if ('status' in payload && payload.status !== undefined) {
    if (
      typeof payload.status !== 'string' ||
      !TASK_STATUSES.includes(payload.status as TaskStatus)
    ) {
      errors.status = 'Status must be Pending or Completed.';
    } else {
      updateFields.status = payload.status as TaskStatus;
    }
  } else if (!isPartial) {
    updateFields.status = 'Pending';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    updateFields,
  };
}

// GET /api/tasks - List all tasks with optional safe filtering & sorting
router.get('/', async (req: Request, res: Response) => {
  try {
    const query: Record<string, unknown> = {};

    if (typeof req.query.status === 'string' && TASK_STATUSES.includes(req.query.status as TaskStatus)) {
      query.status = req.query.status;
    }

    if (typeof req.query.priority === 'string' && TASK_PRIORITIES.includes(req.query.priority as TaskPriority)) {
      query.priority = req.query.priority;
    }

    if (typeof req.query.category === 'string' && TASK_CATEGORIES.includes(req.query.category)) {
      query.category = req.query.category;
    }

    if (typeof req.query.search === 'string' && req.query.search.trim().length > 0) {
      const safeRegex = new RegExp(escapeRegExp(req.query.search.trim()), 'i');
      query.$or = [{ title: safeRegex }, { description: safeRegex }];
    }

    let sortSpec: Record<string, 1 | -1> = { dueDate: 1, createdAt: -1 };
    if (typeof req.query.sort === 'string') {
      switch (req.query.sort) {
        case 'dueDate_desc':
          sortSpec = { dueDate: -1, createdAt: -1 };
          break;
        case 'created_desc':
          sortSpec = { createdAt: -1 };
          break;
        case 'dueDate_asc':
        default:
          sortSpec = { dueDate: 1, createdAt: -1 };
          break;
      }
    }

    const tasks = await Task.find(query).sort(sortSpec).lean();
    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks from database.' });
  }
});

// POST /api/tasks/seed - Add sample tasks when user wants starter data
router.post('/seed', async (_req: Request, res: Response) => {
  try {
    const samples = buildSampleTasks();
    const created = await Task.insertMany(samples);
    res.status(201).json({
      message: `Added ${created.length} sample tasks.`,
      count: created.length,
    });
  } catch (error) {
    console.error('Error seeding tasks:', error);
    res.status(500).json({ error: 'Failed to seed sample tasks.' });
  }
});

// DELETE /api/tasks/completed/clear - Clear all completed tasks
router.delete('/completed/clear', async (_req: Request, res: Response) => {
  try {
    const result = await Task.deleteMany({ status: 'Completed' });
    res.json({
      message: `Removed ${result.deletedCount} completed tasks.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error clearing completed tasks:', error);
    res.status(500).json({ error: 'Failed to clear completed tasks.' });
  }
});

// GET /api/tasks/:id - Get a specific task
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid task ID format.' });
      return;
    }

    const task = await Task.findById(id).lean();
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    res.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to retrieve task.' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = validateTaskPayload(req.body, false);
    if (!validation.valid || !validation.updateFields) {
      res.status(400).json({
        error: 'Validation failed. Please check the task fields.',
        details: validation.errors,
      });
      return;
    }

    const createdTask = await Task.create(validation.updateFields);
    res.status(201).json({
      message: 'Task created successfully.',
      task: createdTask.toObject(),
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const details: Record<string, string> = {};
      for (const [key, err] of Object.entries(error.errors)) {
        details[key] = err.message;
      }
      res.status(400).json({ error: 'Task validation failed.', details });
      return;
    }
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id - Update an existing task
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid task ID format.' });
      return;
    }

    const validation = validateTaskPayload(req.body, true);
    if (!validation.valid || !validation.updateFields || Object.keys(validation.updateFields).length === 0) {
      res.status(400).json({
        error: 'Validation failed. Please provide valid fields to update.',
        details: validation.errors,
      });
      return;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: validation.updateFields },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedTask) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    res.json({
      message: 'Task updated successfully.',
      task: updatedTask,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const details: Record<string, string> = {};
      for (const [key, err] of Object.entries(error.errors)) {
        details[key] = err.message;
      }
      res.status(400).json({ error: 'Task validation failed.', details });
      return;
    }
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid task ID format.' });
      return;
    }

    const deletedTask = await Task.findByIdAndDelete(id).lean();
    if (!deletedTask) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    res.json({
      message: 'Task deleted successfully.',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

export default router;
