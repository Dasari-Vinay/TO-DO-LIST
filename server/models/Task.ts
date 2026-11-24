import mongoose, { Schema, type Document } from 'mongoose';

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'Completed';

export const TASK_PRIORITIES: readonly TaskPriority[] = ['High', 'Medium', 'Low'] as const;
export const TASK_STATUSES: readonly TaskStatus[] = ['Pending', 'Completed'] as const;
export const TASK_CATEGORIES: readonly string[] = [
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Study',
  'Errands',
] as const;

export interface TaskDocument extends Document {
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  dueDate: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Task title must be at least 2 characters'],
      maxlength: [120, 'Task title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: [...TASK_CATEGORIES],
        message: 'Category must be one of Work, Personal, Health, Finance, Study, or Errands',
      },
      default: 'Work',
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: [...TASK_PRIORITIES],
        message: 'Priority must be High, Medium, or Low',
      },
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date and time are required'],
    },
    status: {
      type: String,
      enum: {
        values: [...TASK_STATUSES],
        message: 'Status must be Pending or Completed',
      },
      default: 'Pending',
    },
  },
  {
    collection: 'tasks',
    timestamps: true,
    versionKey: false,
  }
);

taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1, priority: 1 });

export const Task =
  (mongoose.models.Task as mongoose.Model<TaskDocument>) ||
  mongoose.model<TaskDocument>('Task', taskSchema);
