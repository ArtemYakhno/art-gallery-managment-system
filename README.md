# Art Gallery Management System

Full-stack test task for **Techstack** (Trainee Full-Stack JS): a Web API (NestJS) and an SPA (React) for managing artworks in a virtual gallery.

> **Status: work in progress.** The backend is complete: the `Artwork` model, CRUD endpoints with sorting, filtering and validation, and seed data with the first 4 artworks. The frontend currently shows the API status; the gallery pages are next.

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

# 5. Create the tables
pnpm --filter @art-gallery/backend prisma:migrate

# 6. Add the first 4 artworks (safe to run again: it resets them, never duplicates)
pnpm --filter @art-gallery/backend prisma:seed

# 7. Run backend and frontend together
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
| `GET` | `/artworks` | List artworks. Query: `price=asc\|desc` (sort), `artist` (case-insensitive partial match), `type` |
| `GET` | `/artworks/:id` | Get one artwork |
| `POST` | `/artworks` | Add an artwork (`201`) |
| `PUT` | `/artworks/:id` | Replace an artwork — the same body and rules as `POST` |
| `DELETE` | `/artworks/:id` | Delete an artwork (`204`) |

Example: `GET http://localhost:8000/artworks?price=asc&artist=Picasso&type=painting`

Request body for `POST` and `PUT`:

```json
{
  "title": "Sunset Over the Ocean",
  "artist": "Claude Monet",
  "type": "painting",
  "price": 4500,
  "availability": true
}
```

| Field | Rules |
|---|---|
| `title` | required, up to 99 characters (spaces around are trimmed) |
| `artist` | required, up to 50 characters (spaces around are trimmed) |
| `type` | required: `painting`, `sculpture`, `photography`, `drawing` or `print` |
| `price` | required, a number greater than 0, up to 2 decimal places |
| `availability` | optional boolean, `true` by default |

Errors share one shape: `{ statusCode, message, errors? }`. Validation errors return `400` with `errors` grouped by field; unknown fields and an `id` that is not a UUID also return `400`. A missing artwork returns `404`.

Price is stored as `DECIMAL(12, 2)` (exact, not a float) and returned as a JSON number. The database also has a `CHECK (price > 0)` constraint, so the rule holds even for writes that bypass the API.

## Project structure

```
apps/
├── backend/    NestJS API — src/artworks, src/common (setup, config, error filter, Prisma), src/health, prisma/ (schema, migrations, seed)
└── frontend/   React SPA — src/app, src/common (api, schemas, types), src/features, src/pages
```

## Production considerations

Kept out of scope for a test task on purpose, but this is what I would add before a real production launch:

1. **Request IDs** — a correlation ID in every log line and in error responses, to trace one request across interleaved logs and multiple instances.
2. **Structured logging** — JSON logs (e.g. `nestjs-pino`) instead of plain text, so a log platform can filter and aggregate them.
3. **Error tracking** — unexpected `500`s sent to a tool like Sentry, with alerts and release tracking.
4. **Machine-readable error codes** — a stable `code` field (or RFC 9457 Problem Details), so the client does not depend on message text.
5. **Health endpoints** — no internal error details in public responses; separate liveness and readiness checks.
6. **Idempotent `POST`** — an `Idempotency-Key` header with keys stored in the database, so a retried request (after a timeout or a double click) does not create a duplicate. Within this task, double submits are handled on the frontend instead: the add form disables its button while the request is in progress. `GET`, `PUT` and `DELETE` are already idempotent by HTTP semantics.
7. **Concurrent edits** — optimistic locking (a `version` field, `409 Conflict` on mismatch), so two admins editing the same artwork do not silently overwrite each other.
