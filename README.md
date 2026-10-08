# Art Gallery Management System

Full-stack test task for **Techstack** (Trainee Full-Stack JS): a Web API (NestJS) and an SPA (React) for managing artworks in a virtual gallery.

> **Status: work in progress.** The monorepo, infrastructure and an end-to-end health check (frontend → API → database) are in place. The `Artwork` model, CRUD endpoints and gallery pages are next.

## Tech stack

| Part | Technologies |
|---|---|
| Backend | NestJS 12 (ESM), Prisma ORM 7, PostgreSQL 18, class-validator, Swagger, Terminus, Vitest |
| Frontend | React 19, TypeScript, Vite, TanStack Query, axios, Zod, Tailwind CSS v4, shadcn/ui, Vitest |
| Tooling | pnpm workspaces, Docker Compose, oxlint, Prettier |

**ORM choice:** the brief lists TypeORM / Mongoose / Sequelize, and marks the ORM as optional. I used **Prisma**: it gives a type-safe client generated from one schema file and migrations out of the box.

## Prerequisites

- Node.js **24** (see `.nvmrc`)
- pnpm **10**
- Docker (for PostgreSQL)

## Getting started

```bash
# 1. Environment — the defaults work locally as is
cp .env.example .env

# 2. Database (PostgreSQL on localhost:5433)
docker compose up -d

# 3. Dependencies
pnpm install

# 4. Generate the Prisma client
pnpm --filter @art-gallery/backend prisma:generate

# 5. Run backend and frontend together
pnpm dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/api |
| Health check | http://localhost:8000/health |

The frontend start page currently shows the API and database status — a quick way to check that everything is wired up.

## Scripts

Run from the repository root:

| Command | What it does |
|---|---|
| `pnpm dev` | backend and frontend in watch mode |
| `pnpm dev:backend` / `pnpm dev:frontend` | one app only |
| `pnpm typecheck` | TypeScript check in both apps |
| `pnpm lint` | oxlint in both apps |
| `pnpm test` | Vitest in both apps |

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | API and database status (`200` or `503`) |

Errors share one shape: `{ statusCode, message, errors? }`. Validation errors return `400` with `errors` grouped by field.

## Project structure

```
apps/
├── backend/    NestJS API — src/common (setup, config, error filter, Prisma), src/health, prisma/
└── frontend/   React SPA — src/app, src/common (api, schemas, types), src/features, src/pages
```

## Production considerations

Kept out of scope for a test task on purpose, but this is what I would add before a real production launch:

1. **Request IDs** — a correlation ID in every log line and in error responses, to trace one request across interleaved logs and multiple instances.
2. **Structured logging** — JSON logs (e.g. `nestjs-pino`) instead of plain text, so a log platform can filter and aggregate them.
3. **Error tracking** — unexpected `500`s sent to a tool like Sentry, with alerts and release tracking.
4. **Machine-readable error codes** — a stable `code` field (or RFC 9457 Problem Details), so the client does not depend on message text.
5. **Health endpoints** — no internal error details in public responses; separate liveness and readiness checks.
