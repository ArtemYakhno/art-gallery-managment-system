Ініціалізація монорепо Art Gallery Management System (Techstack): pnpm workspaces, NestJS + Prisma 7 + PostgreSQL, React + Vite, CORS, health-check, CLAUDE.md.
status: done

## Контекст

- ТЗ: `Test JS full.pdf` (Techstack, Trainee Full-Stack JS). Робимо обидві частини: backend (Web API) + frontend (SPA, працює з реальним API).
- Референс коду: `ArtemYakhno/book-managment` — структура монорепо, `common/`-шар бекенду, Prisma 7 + `@prisma/adapter-pg`, health, `.claude/hooks`.
- Цей план — **лише ініціалізація**. Модель `Artwork`, CRUD, сторінки — окремі плани (питання з фото галереї ще відкрите в замовника).
- Поза скоупом цього плану: auth/JWT/ролі (в ТЗ їх немає), throttler, модель `Artwork`.

## Затверджені рішення (2026-10-08)

1. **Порт бекенду — `8000`** (як у прикладах ТЗ: `http://localhost:8000/artworks`), фронт — `5173`.
2. **Prisma замість TypeORM/Sequelize** — ТЗ позначає ORM як `optional`, тож Prisma допустима; зазначимо це в README.
3. **pnpm**: локально `10.33.2`, у референсі `packageManager: pnpm@11.13.1`. Пропоную зафіксувати `pnpm@10.33.2` (те, що реально встановлено), щоб не ловити розбіжність lockfile.
4. **Postgres у Docker на порту `5433`** + інше ім'я контейнера (`art-gallery-postgres`), щоб не конфліктувати з контейнером book-managment на `5432`.
5. **Баг у хуках референсу:** `typecheck.js`/`eslint-fix.js` фільтрують `@task-boards/*`, а пакети називаються `@book-managment/*` → хуки мовчки нічого не перевіряють. Плюс `eslint-fix.js` ганяє `eslint` по фронту, який на `oxlint`. При перенесенні — виправляємо (ім'я пакета `@art-gallery/*`, oxlint для фронту).
6. **NestJS 12 (шаблон `@nestjs/cli@latest`): ESM, Vitest, oxlint** — свідомий відхід від референсу (Nest 11, CJS, Jest, ESLint) і від глобального правила «backend — Jest»; обрано користувачем, щоб спробувати новий стек. Prisma 7 генерується в ESM (`moduleFormat = "esm"`).

## Stages

### Stage 1 — Скелет монорепо + інфраструктура `[x] done`

- `git init`, кореневі `package.json` (скрипти `dev`/`typecheck`/`lint`/`test`, `engines.node >=24`, `packageManager`), `pnpm-workspace.yaml` (`apps/*` + дозволені build-скрипти), `.gitignore` (у т.ч. `.claude/plans/`), `.nvmrc`, `.env.example`, `docker-compose.yml` (Postgres 18).
- `.claude/settings.json` + `.claude/hooks/` (block-env-files, block-git-push, typecheck, lint-fix) — перенесені з референсу з виправленим баґом.

**Acceptance criteria:**
- `docker compose up -d` піднімає Postgres, healthcheck `healthy`.
- `.claude/plans/` і `.env` у `.gitignore`.
- Хуки посилаються на правильні імена пакетів.

**Тести:** ні.

### Stage 2 — Backend init `[x] done`

- NestJS 12 у `apps/backend` (`@art-gallery/backend`), ESM, oxlint + Prettier, Vitest.
- `ConfigModule` (кореневий `.env`), Prisma 7: `prisma.config.ts`, `schema.prisma` без моделей (generator `output` поза `src/`, `moduleFormat = "esm"`), `@prisma/adapter-pg`, `PrismaService`/`PrismaModule` (`@Global()`).
- `common/`: `setup/app.setup.ts` (CORS, helmet, ValidationPipe, HttpExceptionFilter, Swagger), `configs/cors.config.ts` (`FRONTEND_URL`), `configs/validation.config.ts`, `filters/http-exception.filter.ts`, `middlewares/logger.middleware.ts`, `setup/swagger.setup.ts`.
- `health/`: `GET /health` (Terminus + `PrismaHealthIndicator`, `SELECT 1`).

**Acceptance criteria:**
- `pnpm dev:backend` стартує на `:8000`.
- `GET /health` → `200 {"status":"ok", ... "database":{"status":"up"}}`; при зупиненій БД → `503`.
- Swagger на `/api`.
- Preflight-запит з `Origin: http://localhost:5173` повертає `Access-Control-Allow-Origin: http://localhost:5173`.
- `typecheck`, `lint`, `build` — зелені.

**Тести:** так — `health.controller.spec.ts` (як у референсі). Optional checks: build, `prisma generate`.

### Stage 3 — Frontend init `[x] done`

- Vite + React 19 + TS у `apps/frontend` (`@art-gallery/frontend`), oxlint, alias `@/`, `envDir` → корінь.
- Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui init (лише конфіг + `cn`, компоненти додаємо по потребі).
- TanStack Query (`queryClient` + devtools), axios `common/lib/apiClient.ts` (`VITE_API_URL`), `common/api/health.ts` + Zod-схема відповіді, `features/health/queries`.
- Тимчасова головна сторінка зі статусом API (замінимо на галерею в наступному плані).
- Vitest + Testing Library + `setupTests.ts`, `src/test/renderWithProviders.tsx`.

**Acceptance criteria:**
- `pnpm dev` піднімає обидва застосунки; сторінка на `:5173` показує «API: ok / DB: up» — запит реально йде на `:8000` без CORS-помилок у консолі (перевірка Playwright).
- `typecheck`, `lint`, `test`, `build` — зелені.

**Тести:** так — один smoke-тест компонента статусу (успіх/помилка) з мокнутим API. Optional checks: build.

### Stage 4 — CLAUDE.md + README `[x] done`

- Проєктний `CLAUDE.md` за структурою референсу: стек, структура монорепо, локальний запуск, naming/testing conventions, git workflow, архітектурні рішення (що реально є в коді), ендпоінти, AI workflow/хуки, відкрите питання про фото.
- `README.md`: запуск, порти, примітка про Prisma vs ORM зі списку ТЗ.

**Acceptance criteria:**
- CLAUDE.md описує лише те, що реально є в коді.
- Інструкції з README відтворюються з нуля (`docker compose up -d` → `pnpm install` → `prisma generate` → `pnpm dev`).

**Тести:** ні.
