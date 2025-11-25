# HPC Portal - Project Structure

## Overview

This document describes the complete architecture and file structure of the HPC Portal project.

## Technology Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (access + refresh tokens)
- **Background Jobs**: NestJS Scheduler + BullMQ (Redis)
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS
- **Forms**: react-hook-form + zod
- **Icons**: Lucide React

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (for frontend)
- **Scheduler Integration**: Slurm (via CLI or SSH)

## Directory Structure

```
HPC-Project/
├── backend/                      # NestJS Backend
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── src/
│   │   ├── auth/                # Authentication module
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   └── strategies/
│   │   ├── users/               # User management
│   │   ├── jobs/                # Job management (core feature)
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   │   ├── jobs.service.ts
│   │   │   │   └── job-polling.service.ts
│   │   │   └── dto/
│   │   ├── job-templates/       # Job templates
│   │   ├── workspace/           # File workspace management
│   │   ├── usage/               # Usage tracking
│   │   ├── admin/               # Admin functionality
│   │   ├── scheduler/           # Slurm integration
│   │   │   ├── services/
│   │   │   │   └── slurm-scheduler.service.ts
│   │   │   └── interfaces/
│   │   ├── common/              # Shared utilities
│   │   │   └── prisma/
│   │   │       ├── prisma.service.ts
│   │   │       └── prisma.module.ts
│   │   ├── app.module.ts        # Root module
│   │   └── main.ts              # Application entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── api/                 # API client functions
│   │   ├── components/          # Reusable components
│   │   │   └── AppLayout.tsx
│   │   ├── contexts/            # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilities
│   │   │   └── axios.ts
│   │   ├── pages/               # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── JobsPage.tsx
│   │   │   ├── NewJobPage.tsx
│   │   │   ├── JobDetailPage.tsx
│   │   │   ├── WorkspacePage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx              # Root component with routes
│   │   ├── main.tsx             # Application entry point
│   │   └── index.css            # Global styles
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docker-compose.yml            # Orchestration configuration
├── .env.example                  # Environment variables template
├── README.md                     # Project overview
├── DEPLOYMENT.md                 # Deployment guide
└── PROJECT_STRUCTURE.md          # This file
```

## Backend Architecture

### Module Structure

Each feature follows NestJS module pattern:

```
feature/
├── controllers/          # HTTP request handlers
├── services/            # Business logic
├── dto/                 # Data transfer objects
├── entities/            # TypeORM entities (if needed)
├── guards/              # Authorization guards
└── feature.module.ts    # Module definition
```

### Key Modules

#### 1. Auth Module (`/auth`)
Handles user authentication and authorization:
- Registration and login
- JWT token generation and validation
- Refresh token management
- Password hashing with bcrypt

**Key Files:**
- `auth.service.ts`: Authentication logic
- `jwt.strategy.ts`: JWT validation strategy
- `jwt-auth.guard.ts`: Route protection

#### 2. Jobs Module (`/jobs`)
Core feature for job management:
- Job creation and submission to Slurm
- Job status monitoring
- Job cancellation
- Event and log management

**Key Files:**
- `jobs.service.ts`: Job CRUD and Slurm submission
- `job-polling.service.ts`: Background worker for status updates
- `create-job.dto.ts`: Job submission validation

**Flow:**
1. User submits job via POST `/api/jobs`
2. Service builds Slurm script from job config
3. Script submitted to Slurm via `SchedulerService`
4. Job polling service updates status every minute
5. Events and logs stored in database

#### 3. Scheduler Module (`/scheduler`)
Abstract Slurm integration:

**Interface:**
```typescript
interface ISchedulerService {
  submitJob(jobId: string, scriptPath: string): Promise<{ schedulerJobId: string }>;
  cancelJob(schedulerJobId: string): Promise<void>;
  getJobStatus(schedulerJobId: string): Promise<SchedulerJobStatus>;
  listQueues(): Promise<QueueInfo[]>;
}
```

**Implementation:**
- `SlurmSchedulerService`: Implements interface
- Supports local mode (direct CLI) and SSH mode
- Parses Slurm command output to structured data

### Database Schema

**Key Models:**
- `User`: User accounts with role-based access
- `Session`: Refresh token storage
- `Job`: Job configurations and state
- `JobEvent`: Job lifecycle events
- `JobLog`: stdout/stderr/scheduler logs
- `JobTemplate`: Reusable job configurations
- `WorkspaceItem`: File browser entries
- `UsageRecord`: Resource usage tracking

**Relationships:**
```
User 1──N Job
Job 1──N JobEvent
Job 1──N JobLog
User 1──N WorkspaceItem
Job 1──N WorkspaceItem (outputs)
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate
- `POST /api/auth/logout` - Invalidate session
- `GET /api/auth/me` - Get current user

#### Jobs
- `POST /api/jobs` - Submit new job
- `GET /api/jobs` - List user's jobs (with filters)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/cancel` - Cancel running job
- `GET /api/jobs/:id/events` - Get job events
- `GET /api/jobs/:id/logs` - Get job logs

## Frontend Architecture

### Component Hierarchy

```
App
├── BrowserRouter
    └── AuthProvider
        ├── LandingPage (public)
        ├── LoginPage (public)
        ├── RegisterPage (public)
        └── ProtectedRoute
            └── AppLayout
                ├── DashboardPage
                ├── JobsPage
                ├── NewJobPage
                ├── JobDetailPage
                ├── WorkspacePage
                └── ProfilePage
```

### State Management

**React Query** for server state:
- Automatic caching and refetching
- Optimistic updates
- Background synchronization

**React Context** for auth state:
- `AuthContext`: User session management
- Provides: `user`, `login()`, `register()`, `logout()`

### Routing

```typescript
Routes:
  / → LandingPage
  /login → LoginPage
  /register → RegisterPage
  /dashboard → DashboardPage (protected)
  /jobs → JobsPage (protected)
  /jobs/new → NewJobPage (protected)
  /jobs/:id → JobDetailPage (protected)
  /workspace → WorkspacePage (protected)
  /profile → ProfilePage (protected)
```

### API Integration

**Axios Instance** (`lib/axios.ts`):
- Base URL configuration
- Request interceptor: Adds auth token
- Response interceptor: Handles token refresh

**Example Usage:**
```typescript
const { data: jobs } = useQuery({
  queryKey: ['jobs'],
  queryFn: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },
});
```

## Data Flow

### Job Submission Flow

```
User fills form → Frontend validates (zod) → POST /api/jobs
                                                  ↓
                        Backend validates DTO ← JobsService
                                                  ↓
                     Build Slurm script ← SchedulerService
                                                  ↓
                    Submit via sbatch ← Slurm CLI/SSH
                                                  ↓
                         Store job record → PostgreSQL
                                                  ↓
                          Return job data → Frontend
```

### Job Status Update Flow

```
Cron Job (every 60s) → JobPollingService.pollJobStatuses()
                                 ↓
                  Query active jobs → PostgreSQL
                                 ↓
             For each job: SchedulerService.getJobStatus()
                                 ↓
                       Parse squeue/sacct output
                                 ↓
                  Update job status → PostgreSQL
                                 ↓
              Create JobEvent if status changed
                                 ↓
         If completed: Calculate usage → UsageRecord
```

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection
- `JWT_SECRET`: Access token signing key
- `JWT_REFRESH_SECRET`: Refresh token signing key
- `SLURM_MODE`: `local` or `ssh`
- `SLURM_SSH_*`: SSH connection details
- `WORKSPACE_ROOT`: Shared filesystem path

### Frontend
- `VITE_API_URL`: Backend API base URL

## Development Workflow

### Backend Development

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Docker Development

```bash
docker compose up --build
```

## Testing Strategy

### Backend
- Unit tests: Jest
- E2E tests: Supertest
- Test Slurm integration: Mock SSH/CLI

### Frontend
- Component tests: React Testing Library
- E2E tests: Playwright (optional)

## Security Considerations

### Backend
- JWT tokens with short expiry (15 min access, 7 day refresh)
- Passwords hashed with bcrypt (10 rounds)
- Input validation with class-validator
- SQL injection prevention via Prisma
- CORS configured for frontend origin only

### Frontend
- XSS prevention via React's default escaping
- CSRF token for state-changing requests (optional)
- Secure token storage (httpOnly cookies preferred over localStorage)
- Input sanitization before API calls

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
```bash
cp .env.example .env
# Edit .env with your configuration
docker compose up -d --build
```

## Future Enhancements

- **Real-time updates**: WebSocket for live job status
- **Job visualization**: Gantt charts for job scheduling
- **Resource quotas**: Per-user limits
- **Notebook integration**: JupyterHub integration
- **Cost estimation**: AWS cost calculator
- **Advanced file management**: S3 browser, file preview
- **Batch operations**: Bulk job submission
- **SSO integration**: LDAP, OAuth2, SAML
