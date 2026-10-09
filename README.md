# Art Gallery Management System

Full-stack test task for **Techstack** (Trainee Full-Stack JS): a Web API (NestJS) and an SPA (React) for managing artworks in a virtual gallery.


## Tech stack

| Part | Technologies |
|---|---|
| Backend | NestJS 12 (ESM), Prisma ORM 7, PostgreSQL 18, class-validator, Swagger, Terminus, Vitest |
| Frontend | React 19, TypeScript, Vite, TanStack Query, axios, Zod, React Hook Form, nuqs, Tailwind CSS v4, shadcn/ui, sonner, Vitest + Testing Library |
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

## Features

The SPA is one gallery page that works with the real API:

- **Gallery** — a responsive grid of artwork cards (1–3 columns): title, price, artist, type and a "For sale" / "Exhibition only" badge. Artworks have no photos in the API, so each card shows a gradient placeholder that is stable for its `id`.
- **Filter and sort** — filter by type, search by artist (case-insensitive, sent after a short pause in typing) and sort by price. Filtering and sorting run on the backend.
- **Filters in the URL** — e.g. `/?price=asc&artist=Monet&type=painting`, so reload, the Back button and shared links keep them. Invalid values in the URL are ignored.
- **Add and edit** — one dialog with a validated form (the same rules as the API). Server validation errors are shown under their fields.
- **Delete** — a delete button on every card, with a confirmation dialog.
- **Feedback** — loading skeletons, empty and error states with "Try again", and toast messages after add, edit and delete.
- **No double submits** — the submit and delete buttons are locked while a request is in progress.

## Scripts

Run from the repository root:

| Command | What it does |
|---|---|
| `pnpm dev` | backend and frontend in watch mode |
| `pnpm dev:backend` / `pnpm dev:frontend` | one app only |
| `pnpm typecheck` | TypeScript check in both apps |
| `pnpm lint` | oxlint in both apps |
| `pnpm test` | Vitest in both apps |
| `pnpm --filter @art-gallery/backend run format` / `pnpm --filter @art-gallery/frontend run format` | Prettier in one app |

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
└── frontend/   React SPA — src/app (providers, layouts, shadcn/ui), src/common (api, schemas, types, utils), src/features/artworks (components, hooks, queries), src/pages
```

## Production considerations

Kept out of scope for a test task on purpose, but this is what I would add before a real production launch:

1. **Request IDs** — a correlation ID in every log line and in error responses, to trace one request across interleaved logs and multiple instances.
2. **Structured logging** — JSON logs (e.g. `nestjs-pino`) instead of plain text, so a log platform can filter and aggregate them.
3. **Error tracking** — unexpected `500`s sent to a tool like Sentry, with alerts and release tracking.
4. **Machine-readable error codes** — a stable `code` field (or RFC 9457 Problem Details), so the client does not depend on message text.
5. **Health endpoints** — no internal error details in public responses; separate liveness and readiness checks.
6. **Idempotent `POST`** — an `Idempotency-Key` header with keys stored in the database, so a retried request (after a timeout or a double click) does not create a duplicate. Within this task, double submits are handled on the frontend instead: the add/edit form and the delete dialog ignore a second click and disable their buttons while the request is in progress. `GET`, `PUT` and `DELETE` are already idempotent by HTTP semantics.
7. **Concurrent edits** — optimistic locking (a `version` field, `409 Conflict` on mismatch), so two admins editing the same artwork do not silently overwrite each other.
