# Daymark To-Do

A responsive MERN task manager with per-user task ownership, JWT authentication, task filters, dashboard statistics, theme switching, and a MongoDB-backed REST API.

## Requirements

- Node.js 20 or newer and npm
- A MongoDB Atlas cluster (or a MongoDB-compatible URI for local development)

## Install

From the project root:

```powershell
npm install
npm --prefix client install
npm --prefix server install
Copy-Item server/.env.example server/.env
```

Edit `server/.env` and set:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<at-least-32-random-characters>
CLIENT_ORIGIN=http://localhost:5173
```

In MongoDB Atlas, create a database user, allow your development IP in Network Access, and use the cluster connection string for `MONGODB_URI`. URL-encode special characters in the database username or password. Keep `server/.env` private; it is ignored by Git. The server will not start without a working MongoDB connection and a sufficiently long JWT secret.

## Run locally

Start the API and React development server together from the project root:

```powershell
npm run dev
```

- Client: http://localhost:5173
- API health check: http://localhost:5000/api/health

Run either service separately with `npm run dev:client` or `npm run dev:server`. Build the frontend with `npm run build`; start the API with `npm start`.

## Features

- Register, sign in, sign out, protected workspace, and editable profile name
- Password hashing with bcrypt and seven-day JWTs
- Dashboard totals, completion percentage, overdue count, today's tasks, and upcoming deadlines
- Create, read, update, complete, reopen, and delete tasks
- Task views for all, today, pending, upcoming, overdue, and completed tasks
- Title search; priority and category filters
- Light and dark themes, responsive sidebar, confirmation before deletion, loading and empty states, and toast feedback

## API

All task routes require `Authorization: Bearer <token>`. Authenticated task operations are scoped to the current user; unknown or foreign task IDs return 404.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account and return a JWT |
| POST | `/api/auth/login` | Sign in and return a JWT |
| GET | `/api/auth/me` | Read the current profile |
| PUT | `/api/auth/me` | Update the current user's name |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | List the current user's tasks |
| GET | `/api/tasks/:id` | Read one owned task |
| PUT | `/api/tasks/:id` | Update task fields |
| PATCH | `/api/tasks/:id/status` | Change status |
| DELETE | `/api/tasks/:id` | Delete an owned task |
| GET | `/api/health` | Check API and database connection status |

Task fields: `title`, `description`, `category` (`Personal`, `Work`, `Health`, `Learning`, `Other`), `priority` (`Low`, `Medium`, `High`), optional `dueDate`, and `status` (`Pending`, `In Progress`, `Completed`).

## Checks

```powershell
npm run build
npm --prefix server test
```

The validation tests exercise task payload rules. To verify registration, authentication, and persisted CRUD end to end, configure a reachable MongoDB instance and run the app locally.

## Project layout

- `client/src/pages/Pages.jsx`: landing/auth screens, dashboard, task views, and profile
- `client/src/components/`: protected routing, app shell, and task editor
- `client/src/context/`: session and toast state
- `server/models/`: Mongoose User and Task schemas
- `server/controllers/`: authentication and user-scoped task operations
- `server/routes/` and `server/middleware/`: REST routes, JWT enforcement, CORS/security setup, and error responses
