import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Task } from './models/Task.ts';

let memoryServer: MongoMemoryServer | null = null;
let isConnected = false;

export function buildSampleTasks() {
  const now = new Date();

  const hoursFromNow = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);
  const daysFromNow = (days: number, hour = 14, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  return [
    {
      title: 'Submit quarterly product roadmap review',
      description: 'Finalize Q4 milestone dependencies, engineering capacity notes, and stakeholder sign-off deck.',
      category: 'Work',
      priority: 'High',
      dueDate: hoursFromNow(-4),
      status: 'Pending',
    },
    {
      title: 'Prepare sprint architecture notes',
      description: 'Outline MongoDB indexing strategy and API pagination contract for the backend sync meeting.',
      category: 'Work',
      priority: 'High',
      dueDate: hoursFromNow(3),
      status: 'Pending',
    },
    {
      title: 'Schedule annual dental checkup',
      description: 'Call downtown clinic to confirm morning availability next week and verify insurance coverage.',
      category: 'Health',
      priority: 'Medium',
      dueDate: hoursFromNow(6),
      status: 'Pending',
    },
    {
      title: 'Reconcile monthly utility & cloud invoices',
      description: 'Match bank statement entries against hosting receipts and archive PDFs in the tax folder.',
      category: 'Finance',
      priority: 'Medium',
      dueDate: daysFromNow(2, 16, 30),
      status: 'Pending',
    },
    {
      title: 'Review TypeScript generics & strict tsconfig notes',
      description: 'Work through mapped type exercises and document utility patterns for the team handbook.',
      category: 'Study',
      priority: 'Low',
      dueDate: daysFromNow(4, 19, 0),
      status: 'Pending',
    },
    {
      title: 'Pick up dry cleaning & espresso beans',
      description: 'Stop by Elm Street cleaners before 6:00 PM and restock whole-bean medium roast.',
      category: 'Errands',
      priority: 'Low',
      dueDate: daysFromNow(1, 17, 30),
      status: 'Pending',
    },
    {
      title: 'Complete morning 5km tempo run',
      description: 'Maintain steady cadence around the river loop and log post-run hydration.',
      category: 'Health',
      priority: 'Medium',
      dueDate: daysFromNow(-1, 8, 30),
      status: 'Completed',
    },
    {
      title: 'Organize home workspace cable routing',
      description: 'Mount under-desk power strip and label Thunderbolt monitor cables.',
      category: 'Personal',
      priority: 'Low',
      dueDate: daysFromNow(-2, 15, 0),
      status: 'Completed',
    },
  ];
}

export async function seedInitialTasksIfEmpty(): Promise<number> {
  const existingCount = await Task.countDocuments();
  if (existingCount === 0) {
    const inserted = await Task.insertMany(buildSampleTasks());
    return inserted.length;
  }
  return 0;
}

export async function connectDatabase(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const configuredUri = process.env.MONGODB_URI?.trim();

  if (configuredUri) {
    await mongoose.connect(configuredUri, {
      dbName: process.env.MONGODB_DB_NAME?.trim() || 'taskflow',
    });
    isConnected = true;
    await seedInitialTasksIfEmpty();
    return;
  }

  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'taskflow',
    },
  });

  const memoryUri = memoryServer.getUri('taskflow');
  await mongoose.connect(memoryUri);
  isConnected = true;
  await seedInitialTasksIfEmpty();
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  isConnected = false;
}
