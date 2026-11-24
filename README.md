# Taskflow — Smart To-Do List Application

A full-stack **Smart To-Do List Web Application** built with React, TypeScript, Tailwind CSS, Node.js, Express, and MongoDB (via Mongoose).

## Features

- **Complete CRUD Operations**:
  - **Create** tasks with title, description, due date and time, priority (`High`, `Medium`, `Low`), and category (`Work`, `Personal`, `Health`, `Finance`, `Study`, `Errands`).
  - **Read** tasks across dedicated workspace views (`Dashboard`, `All Tasks`, `Today's Tasks`, `Upcoming Tasks`, `Completed Tasks`) with separate Pending and Completed sections.
  - **Update** existing task details or toggle status between `Pending` and `Completed`.
  - **Delete** individual tasks with a confirmation dialog before removal.
- **Interactive Dashboard**:
  - Displays Total Tasks, Completed Tasks, Pending Tasks, Overdue Tasks, and overall Completion Percentage with progress indicators and category breakdowns.
- **Search, Filter & Sort**:
  - Live search by title or description, filter by priority, category, and status, and sort by due date, priority, or creation date.
- **Overdue Notifications & Light/Dark Mode**:
  - Real-time overdue task alert indicator in the header and sidebar, plus persistent Light/Dark mode and configurable task defaults in Settings.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React
- **Backend**: Node.js, Express 4
- **Database**: MongoDB + Mongoose (`tasks` collection), with automatic embedded MongoDB support via `mongodb-memory-server` when `MONGODB_URI` is not specified

## Project Structure

```text
├── server.ts                  # Express server & Vite middleware entry point
├── server/
│   ├── db.ts                  # MongoDB connection manager & initial seed logic
│   ├── models/Task.ts         # Mongoose schema for `tasks` collection
│   └── routes/tasks.ts        # REST API endpoints (/api/tasks)
├── src/
│   ├── App.tsx                # Root workspace layout & state orchestration
│   ├── index.css              # Tailwind CSS v4 & Light/Dark theme setup
│   ├── types/task.ts          # Shared TypeScript types
│   ├── services/taskApi.ts    # Typed REST API client
│   ├── utils/taskHelpers.ts   # Date formatting, overdue checks & sorting
│   └── components/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── DashboardView.tsx
│       ├── TaskListView.tsx
│       ├── TaskItem.tsx
│       ├── TaskModal.tsx
│       ├── DeleteConfirmModal.tsx
│       ├── SettingsView.tsx
│       └── ToastContainer.tsx
└── package.json
```

## Database Schema (`tasks` collection)

| Field         | Type     | Details                              |
| ------------- | -------- | ------------------------------------ |
| `_id`         | ObjectId | MongoDB primary identifier           |
| `title`       | String   | Required, 2–120 characters           |
| `description` | String   | Optional, up to 1000 characters      |
| `category`    | String   | Work, Personal, Health, Finance, Study, Errands |
| `priority`    | String   | `High`, `Medium`, or `Low`           |
| `dueDate`     | Date     | Required due date and time           |
| `status`      | String   | `Pending` or `Completed`             |
| `createdAt`   | Date     | Managed automatically by Mongoose    |
| `updatedAt`   | Date     | Managed automatically by Mongoose    |

## REST API Endpoints

- `GET /api/tasks` — Retrieve all tasks (supports `search`, `category`, `priority`, `status`, `sort` query params)
- `GET /api/tasks/:id` — Retrieve a single task by ID
- `POST /api/tasks` — Create a new task
- `PUT /api/tasks/:id` — Update an existing task or toggle status
- `DELETE /api/tasks/:id` — Delete a task by ID
- `POST /api/tasks/seed` — Add sample starter tasks
- `DELETE /api/tasks/completed/clear` — Delete all completed tasks

## Setup & Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables (optional)**:
   Copy `.env.example` to `.env` and set `MONGODB_URI` if connecting to an external MongoDB Atlas or local `mongod` server. If `MONGODB_URI` is left blank, the server automatically starts a local embedded MongoDB instance.

3. **Run in development mode**:
   ```bash
   npm run dev
   ```
   The app and REST API will run together on `http://localhost:3000`.

4. **Build and run in production**:
   ```bash
   npm run build
   npm start
   ```
