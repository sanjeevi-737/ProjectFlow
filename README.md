# ProjFlow - Project Management Tool

A full-featured project management application with Kanban boards, real-time collaboration, and team management.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Redux Toolkit, TanStack React Query, Socket.IO Client, Recharts, Framer Motion, React Hook Form + Zod, @hello-pangea/dnd

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT Authentication, Socket.IO, Nodemailer, Cloudinary, Winston, Helmet, express-rate-limit

## Features

- **Authentication** — JWT access/refresh tokens, email verification, password reset
- **Workspaces** — Team grouping with role-based access control and invite system
- **Projects** — Within workspaces, with status/priority tracking and color coding
- **Kanban Boards** — Drag-and-drop task management with custom columns
- **Tasks** — Rich task model with checklists, subtasks, labels, attachments, comments, activity logs
- **Real-time Updates** — Socket.IO for live collaboration, notifications, online user tracking
- **Dashboard & Analytics** — Charts, stats, project completion rates, activity timeline
- **File Uploads** — Cloudinary integration with MIME type validation
- **Notifications** — 10 notification types, read/unread tracking, in-app delivery
- **Dark Mode** — Full dark mode support with system preference detection

## Prerequisites

- Node.js 20+
- MongoDB 7+
- Cloudinary account (for file uploads)
- SMTP email account (for email verification)

## Installation

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd projflow

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your settings (MongoDB URI, JWT secrets, Cloudinary credentials, SMTP settings).

### 3. Start development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
projflow/
├── backend/
│   ├── src/
│   │   ├── config/          # App configuration & database
│   │   ├── controllers/     # Route handlers
│   │   ├── emails/          # Email templates & service
│   │   ├── middlewares/     # Auth, error handling, validation, upload
│   │   ├── models/          # Mongoose schemas (9 models)
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── socket/          # Socket.IO real-time server
│   │   ├── utils/           # Helpers, logger, API response classes
│   │   └── validators/      # express-validator schemas
│   ├── tests/               # Jest + Supertest integration tests
│   └── uploads/             # Local file storage (fallback)
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components & modals
│   │   ├── constants/       # App constants (roles, priorities, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Page layouts (AppLayout, Navbar, Sidebar)
│   │   ├── pages/           # Route pages (15+ pages)
│   │   ├── redux/           # Redux store & slices
│   │   ├── services/        # API client (Axios with interceptors)
│   │   ├── utils/           # Formatters, cn helper
│   │   └── __tests__/       # Vitest unit tests
│   └── dist/                # Production build output
├── docker-compose.yml       # Multi-service Docker setup
├── Dockerfile               # Production container (multi-stage)
└── .github/workflows/       # CI/CD pipelines
```

## Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot reload (nodemon) |
| `npm start` | Production start |
| `npm test` | Run integration tests |
| `npm run lint` | Lint code |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run preview` | Preview production build |

## Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop
docker-compose down
```

Services:
- **Frontend** — `http://localhost:5173` (served via Nginx)
- **Backend API** — `http://localhost:5000`
- **MongoDB** — `localhost:27017`

## API Overview

| Endpoint Group | Description |
|---|---|
| `POST /api/auth/*` | Register, login, logout, refresh tokens, password reset |
| `GET/PATCH /api/users/*` | Profile management, avatar, preferences |
| `GET/POST/PATCH/DELETE /api/workspaces/*` | Workspace CRUD, members, invitations |
| `GET/POST/PATCH/DELETE /api/projects/*` | Project CRUD, members, archive |
| `GET/POST/PATCH/DELETE /api/boards/*` | Board CRUD, column management |
| `GET/POST/PATCH/DELETE /api/tasks/*` | Task CRUD, move, comments, attachments |
| `GET/PATCH/DELETE /api/notifications/*` | Notifications list, read/unread |
| `GET /api/dashboard` | Dashboard stats, charts, activity |
| `GET /api/health` | Health check |

## Testing

```bash
# Backend integration tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test
```

The backend tests use `mongodb-memory-server` for an isolated test database.

## CI/CD

GitHub Actions workflows are configured in `.github/workflows/`:
- **ci.yml** — Lint, test, and build on push/PR to main
- **deploy.yml** — Build Docker images and push to GitHub Container Registry on main push

## Deployment

### Docker (recommended)

```bash
docker-compose -f docker-compose.yml up -d
```

### Manual

```bash
# Build frontend
cd frontend && npm run build

# Start backend (serves frontend from dist/)
cd backend && NODE_ENV=production npm start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development`, `production`, or `test` |
| `PORT` | Yes | Backend server port (default: 5000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | JWT access token signing key |
| `JWT_REFRESH_SECRET` | Yes | JWT refresh token signing key |
| `CLOUDINARY_*` | No | Cloudinary file upload (optional) |
| `SMTP_*` | No | Email service (optional) |
| `CLIENT_URL` | Yes | Frontend URL for CORS |

## License

MIT
