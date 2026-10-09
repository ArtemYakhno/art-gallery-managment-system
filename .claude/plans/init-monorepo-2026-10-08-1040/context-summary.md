# Context summary — init-monorepo (2026-10-08)

## What was built

Ініціалізація монорепо для тестового завдання Techstack «Art Gallery Management System»: pnpm workspaces (`apps/backend` + `apps/frontend`), Postgres у Docker (`:5433`), NestJS 12 API (`:8000`) з Prisma 7 і спільним `common/`-шаром, React 19 SPA (`:5173`) з TanStack Query, Tailwind v4, shadcn. Health-check працює наскрізь (frontend → API → DB) у трьох сценаріях: усе up, DB down (503), API недоступний. Проєктні хуки Claude Code, `CLAUDE.md`, `README.md`. Моделі `Artwork`, CRUD і сторінок галереї ще немає.

## Key modules & functions

- `package.json`, `pnpm-workspace.yaml`, `docker-compose.yml`, `.env.example`, `.gitignore` — корінь монорепо (pnpm 10.33.2, `onlyBuiltDependencies`).
- `.claude/hooks/lib.js` — `readEditedApp` (пакет зі шляху файлу), `report` (через `additionalContext`), `commandOutput`.
- `.claude/hooks/typecheck.js`, `lint-fix.js` — PostToolUse: tsc / oxlint по пакету зміненого файлу.
- `.claude/hooks/block-env-files.js`, `block-git-push.js` — PreToolUse захист `.env` і `git push`.
- `.claude/settings.json` — підключення хуків через `$CLAUDE_PROJECT_DIR`.
- `apps/backend/prisma/schema.prisma`, `prisma.config.ts` — Prisma 7, ESM-клієнт у `src/generated/prisma`, без моделей.
- `apps/backend/src/main.ts` — bootstrap, `PORT` з `ConfigService`.
- `apps/backend/src/app.module.ts` — `ConfigModule` (кореневий `.env`), `PrismaModule`, `HealthModule`, `LoggerMiddleware`.
- `apps/backend/src/common/setup/app.setup.ts` — `setupApp`: CORS, helmet, фільтр, ValidationPipe, Swagger.
- `apps/backend/src/common/configs/cors.config.ts` — `getCorsConfig` (`FRONTEND_URL`, без credentials).
- `apps/backend/src/common/configs/validation.config.ts` — `validationConfig` (whitelist, forbidNonWhitelisted, помилки по полях).
- `apps/backend/src/common/filters/http-exception.filter.ts` — `HttpExceptionFilter`: уніфіковане тіло, 500 без деталей, код Prisma в лог, `details` для 503.
- `apps/backend/src/common/middlewares/logger.middleware.ts` — лог кожного запиту.
- `apps/backend/src/common/prisma/prisma.service.ts` — `PrismaService` з `PrismaPg` adapter.
- `apps/backend/src/health/*` — `HealthController` (`GET /health`), `PrismaHealthIndicator` (`SELECT 1`), spec.
- `apps/frontend/vite.config.ts` — alias `@/`, `envDir` = корінь, Vitest (jsdom).
- `apps/frontend/src/common/lib/apiClient.ts`, `queryClient.ts`, `cn.ts` — axios, QueryClient, `cn` (пакет `cn`).
- `apps/frontend/src/common/utils/errors/errors.ts` — `ApiValidationError`, `extractErrorMessage`.
- `apps/frontend/src/common/utils/errors/parseApiResponse.ts` — Zod-валідація відповідей.
- `apps/frontend/src/common/{schemas,types,api}/health*` — `healthSchema`, `Health`, `healthService.getHealth` (200 і 503 як дані).
- `apps/frontend/src/features/health/` — `useHealthQuery`, `healthKeys`, `ApiStatus` + тест (3 кейси).
- `apps/frontend/src/pages/HomePage.tsx`, `app/providers/GlobalProvider.tsx` — тимчасова сторінка статусу без роутера.
- `apps/frontend/src/test/renderWithProviders.tsx`, `setupTests.ts` — тестова інфраструктура.

## Architectural decisions

- **NestJS 12 (ESM + Vitest + oxlint)** замість Nest 11 як у book-managment — вибір користувача, щоб спробувати новий стек; Jest з ESM працює погано. Наслідок: `.js` в усіх відносних імпортах бекенду.
- **Без path-аліасів на бекенді** — tsc не переписує `paths` у `dist/`; знадобились би додаткові інструменти, виграш малий.
- **Prisma-клієнт у `src/generated/prisma`** — `tsconfig.build` має `rootDir: ./src`; так радить і гайд Prisma для Nest. `prisma` CLI зафіксований на `^7.10.0` (тег `latest` → `8.0.0-rc`).
- **Порт 8000** — як у прикладах ТЗ; **Postgres 5433** — щоб не конфліктувати з іншими локальними БД.
- **Prisma замість ORM зі списку ТЗ** — ORM у ТЗ optional; пояснено в README.
- **Health 503 на фронті як data** (`validateStatus`) — тіло має ту саму форму `details`, тож UI показує, що саме впало.
- **Хуки визначають пакет зі шляху і звітують через `additionalContext`**, команди — через `$CLAUDE_PROJECT_DIR`; виправлено три баги, успадковані з book-managment.
- **Мінімум залежностей** — router, RHF, sonner, throttler, auth не встановлені: у ТЗ немає auth, решта — разом із фічами.

## Open items / next steps

- **Фото галереї** є в UI-прикладі ТЗ, але не в моделі / `POST`-тілі — чекаємо відповідь замовника; від неї залежить схема `Artwork`.
- Наступний план: модель `Artwork` + міграція, `GET /artworks` (`price=asc|desc`, `artist`, `type`), `GET/DELETE /artworks/:id`, `POST` з валідацією (title ≤ 99, artist ≤ 50, type з enum, price > 0, availability optional), optional `PUT`; seed перших 4 творів (ТЗ: «first 4 artworks presented on launch»).
- Перенести `rethrowPrismaError` з book-managment: лише `P2025`, `Object.hasOwn` замість `in`, без `isPrismaError`, зі spec-тестом.
- Frontend: router, сторінка галереї (сітка карток, пошук, сортування, фільтри artist/type), форма додавання (RHF + Zod), видалення; `MemoryRouter` у `renderWithProviders`.
- Відомі обмеження: `/health` віддає сирий текст помилки Prisma; бандл ~675 kB; попередження pnpm про `@scarf/scarf` (нешкідливе).
- Ті самі баги хуків існують у book-managment — за потреби перенести фікси туди.
- Коміт не зроблено — користувач комітить сам.
