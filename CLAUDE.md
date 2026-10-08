> **Living document.** Тестове завдання **Art Gallery Management System** для **Techstack** (Trainee Full-Stack JS). Робимо обидві частини ТЗ: Web API (NestJS) і SPA (React), що працює з реальним API. **Поточний стан — ініціалізація:** монорепо, інфраструктура, `common/`-шари, health-check наскрізь (backend → frontend). Модель `Artwork`, CRUD і сторінки галереї — ще не реалізовані. Секції нижче описують лише те, що реально є в коді.

## Технологічний стек

| Шар | Технології |
|---|---|
| Backend | NestJS 12 (**ESM**), Prisma ORM 7 + `@prisma/adapter-pg`, PostgreSQL 18, `class-validator`/`class-transformer`, Swagger, `@nestjs/terminus`, `helmet`, CORS, **Vitest**, **oxlint** (type-aware) + Prettier |
| Frontend | React 19 + TypeScript 6, Vite 8, TanStack Query (+ devtools), axios, Zod 4, Tailwind CSS v4, shadcn/ui (стиль `radix-nova`), Vitest + Testing Library, oxlint |
| Інфраструктура | Docker Compose (Postgres), pnpm 10 workspaces (`apps/backend` + `apps/frontend`), Node 24 |
| AI-workflow | Claude Code, custom-flow процес, `.claude/hooks` |

## Структура монорепо

```
art-gallery-managment-system/
├── apps/
│   ├── backend/     # NestJS — src/ (health/, common/ [setup, configs, filters, middlewares, prisma], generated/ — Prisma client, gitignored), prisma/, prisma.config.ts
│   └── frontend/    # Vite + React — app/ (providers/, components/ui — shadcn), common/ (api/, lib/, schemas/, types/, utils/), features/ (health — components/queries), pages/, test/
├── docker-compose.yml
├── .env.example
└── .claude/         # settings.json, hooks/, plans/ (gitignored)
```

Без окремого `packages/shared`: Zod-схеми фронту й DTO бекенду визначаються окремо — свідомий trade-off для невеликого проєкту.

## Локальний запуск

`docker compose up -d` (Postgres `:5433`) → `pnpm install` → `pnpm --filter @art-gallery/backend prisma:generate` → `pnpm dev` (backend `:8000`, frontend `:5173`; `.env` у корені за зразком `.env.example`). `pnpm typecheck`/`lint`/`test` — по всіх пакетах, або `--filter @art-gallery/backend|frontend`. Swagger — `/api`, health-check — `/health`.

- Порт `8000` — як у прикладах ТЗ (`http://localhost:8000/artworks`).
- Postgres на `5433`, контейнер `art-gallery-postgres` — щоб не конфліктувати з іншими локальними Postgres.
- `prisma generate` **не** запускається автоматично на `pnpm install`: `prisma.config.ts` вимагає `DATABASE_URL`, тож postinstall упав би на свіжому клоні без `.env`.

## Naming conventions

- **Backend — ESM:** відносні імпорти **обовʼязково з `.js`** (`'./app.module.js'`, хоча файл `.ts`). Без розширення збірка проходить, а Node падає на старті. Немає `__dirname`/`require` — `import.meta.dirname` / `import`.
- **Backend — без path-аліасів** (свідомо): tsc не переписує `paths` у `dist/`, знадобились би `tsc-alias` або `package.json#imports`. Глибина імпортів невелика.
- Backend валідує через class-validator DTO (`*.dto.ts`). **Свідомий відхід від «schema-first Zod»** (глобальний CLAUDE.md користувача) — Zod лише на фронті.
- React-компоненти: PascalCase, один компонент на файл. Custom hooks: `useX.ts`.
- **Frontend:** Zod-схеми — у `common/schemas/*.schema.ts` (лише `z.object/enum`), типи — `z.infer` у `common/types/*.ts`, **окремо від схем**. HTTP-виклики — у `common/api/*.ts` (обʼєкт-сервіс, відповідь парситься через `parseApiResponse`); axios-інстанс — `common/lib/apiClient.ts`; TanStack Query хуки й ключі — у `features/*/queries/` (не inline у компонентах). Аліас `@/` → `src/`.
- shadcn: `cn` — `common/lib/cn.ts` (реекспорт пакета `cn` від shadcn — новий дефолт CLI замість `clsx` + `tailwind-merge`), компоненти — `app/components/ui/` (аліаси в `components.json`).

## Testing conventions

- Обидва застосунки — **Vitest**, файли поруч із кодом: backend `*.spec.ts`, frontend `*.test.ts(x)`. API — як у Jest, але `vi.fn()`/`vi.mock()` замість `jest.*`; `globals: true`.
- Frontend: рендер із провайдерами — `src/test/renderWithProviders.tsx` (поки лише `QueryClient`; `MemoryRouter` додати разом із роутером). `setupTests.ts` підключає jest-dom і поліфіли Pointer Capture + `scrollIntoView` (без них тести з Radix Select/Dropdown падають). Сервіси мокаються через `vi.mock('@/common/api/...')`.
- Запуск: `pnpm --filter @art-gallery/backend|frontend run test`.

## Git workflow

Процес — `custom-flow`: план зі стейджами, явне підтвердження користувача на кожному кроці. **Комітить користувач сам після завершення майстер-плану** — агент не комітить після стейджів.

## Архітектурні рішення

- **NestJS 12 замість 11 (як у референсі book-managment):** шаблон `@nestjs/cli@latest` — ESM + Vitest + oxlint. Обрано свідомо, щоб спробувати новий стек; Jest з ESM працює погано, тому Vitest.
- **Prisma 7:** `prisma.config.ts` + driver adapter `@prisma/adapter-pg` обовʼязкові (у `schema.prisma` немає `url`). Generator `prisma-client`, `moduleFormat = "esm"`, `output` — `src/generated/prisma` (gitignored): `tsconfig.build` має `rootDir: ./src`, тож `dist/main.js` лишається на дефолтному місці. `PrismaService`/`PrismaModule` — `common/prisma/`, `@Global()`. **Версії `prisma` і `@prisma/client` мусять збігатися:** npm-тег `latest` у `prisma` зараз вказує на `8.0.0-rc.*` — ставити тільки з явною версією (`prisma@^7.x`).
- **Конфігурація застосунку** — уся в `common/setup/app.setup.ts` (CORS, `helmet`, глобальний фільтр, `ValidationPipe`, Swagger); `main.ts` лише bootstrap. Env — тільки через `ConfigService` (кореневий `.env`), ніколи `process.env` напряму.
- **CORS** — `origin: FRONTEND_URL`, **без `credentials`** (cookies/auth немає; увімкнути разом з auth, якщо зʼявиться).
- **Помилки (backend):** `ValidationPipe` (`whitelist` + `forbidNonWhitelisted` + `transform`, кастомний `exceptionFactory` групує помилки по полях → `400 { message: 'Validation failed', errors: { field: [...] } }`). `HttpExceptionFilter` (`@Catch()` — ловить усе) → уніфіковане тіло `{ statusCode, message, errors?, details? }`: `HttpException` → її статус; будь-що інше → лог зі stack trace (+ код Prisma, якщо це `PrismaClientKnownRequestError`) і `500 Internal server error` без деталей. `details` пробрасується для 503 від Terminus (перевірка за формою тіла: `body.status && body.details`).
- **Health-check:** `GET /health` — Terminus + кастомний `PrismaHealthIndicator` (`$queryRaw SELECT 1`): `200` або `503` з `details.database.status = down` і причиною. Після падіння БД Prisma перепідключається сама.
- **Frontend — health як data, а не помилка:** `healthService.getHealth` приймає і `200`, і `503` (`validateStatus`) — обидва мають однакову форму `details`, тож UI показує «API up / database down», а не загальну помилку. Помилка запиту без відповіді → «No server connection» (`extractErrorMessage`).
- **Frontend API-шар:** `apiClient` — axios з `baseURL = VITE_API_URL`, без інтерцепторів. `queryClient` — `retry: false`, `staleTime` 60 с. `parseApiResponse` — Zod-валідація відповідей; невідповідність → `ApiValidationError`. Vite читає кореневий `.env` (`envDir`).
- **Тимчасове:** `pages/HomePage.tsx` (статус API) рендериться напряму з `GlobalProvider`, без роутера — замінюється сторінкою галереї.

## Domain model

Моделей ще немає (`schema.prisma` містить лише generator і datasource). За ТЗ — `Artwork`: `id: string`, `title` (обовʼязковий, ≤ 99), `artist` (обовʼязковий, ≤ 50), `type` (predefined: painting, sculpture, …), `price` (> 0), `availability` (boolean, optional).

## Ендпоінти

| Метод | Шлях | Опис |
|---|---|---|
| `GET` | `/health` | стан API і БД (`200` / `503`) |

Swagger — `/api`. За ТЗ далі: `GET /artworks` (`?price=asc|desc&artist=&type=`), `GET /artworks/:id`, `POST /artworks`, `DELETE /artworks/:id`, optional `PUT /artworks/:id`.

## Відкриті питання / наступні кроки

- **Фото в UI-прикладі ТЗ, але не в моделі / `POST`-тілі** — чекаємо відповідь замовника. Від неї залежить схема `Artwork`.
- **`rethrowPrismaError` з book-managment** (`common/utils/prisma-errors.ts`) — перенести разом із CRUD (`findUniqueOrThrow`/`update`/`delete` → `P2025` → 404). Залишити в мапі лише `P2025`, `in` замінити на `Object.hasOwn`, без `isPrismaError` (поки не потрібен), зі spec-тестом.
- **`/health` віддає сирий текст помилки Prisma** назовні — прийнятно локально, на проді — витік. Відоме обмеження.
- **Бандл фронту ~675 kB** (попередження Vite > 500 kB): основна вага — React 19, Zod 4, axios; devtools — окремий lazy-чанк. Не оптимізовано свідомо.
- Router, React Hook Form, sonner — ще не встановлені, додаються разом зі сторінками галереї.

## AI workflow

Процес — `custom-flow`: план на задачу зі стейджами, явне підтвердження до реалізації. Плани — `.claude/plans/` (gitignored).

Хуки (`.claude/hooks/`, підключені в `.claude/settings.json` через `$CLAUDE_PROJECT_DIR` — відносний шлях ламався, коли робоча тека сесії йшла в підпапку, і хуки, **включно із захистом `.env`**, мовчки не працювали):

- `block-env-files.js` (PreToolUse) — забороняє агенту читати/писати `.env*` (крім `.env.example`).
- `block-git-push.js` (PreToolUse) — `git push` лише з підтвердженням.
- `typecheck.js` (PostToolUse) — `pnpm run typecheck` у пакеті зміненого `.ts/.tsx`.
- `lint-fix.js` (PostToolUse) — `oxlint --fix` (backend — з `--type-aware`).
- `lib.js` — спільне: пакет визначається **зі шляху файлу** (не з імені пакета), помилки повертаються агенту через `additionalContext` (а не `systemMessage`, який бачить лише користувач).

**No duplicate types:** frontend виводить типи з Zod (`z.infer`), backend — DTO-класи; спільного пакета типів свідомо немає.
