> **Living document.** Тестове завдання **Art Gallery Management System** для **Techstack** (Trainee Full-Stack JS). Робимо обидві частини ТЗ: Web API (NestJS) і SPA (React), що працює з реальним API. **Поточний стан:** backend готовий — модель `Artwork`, CRUD `/artworks` (фільтри, сортування, валідація), seed перших 4 творів, health-check. Frontend готовий — одна сторінка галереї: список карток, фільтр за типом, пошук за artist, сортування за ціною (стан у URL), додавання / редагування / видалення. Далі — фото творів окремим планом. Секції нижче описують лише те, що реально є в коді.

## Технологічний стек

| Шар | Технології |
|---|---|
| Backend | NestJS 12 (**ESM**), Prisma ORM 7 + `@prisma/adapter-pg`, PostgreSQL 18, `class-validator`/`class-transformer`, Swagger, `@nestjs/terminus`, `helmet`, CORS, **Vitest**, **oxlint** (type-aware) + Prettier |
| Frontend | React 19 + TypeScript 6, Vite 8, TanStack Query (+ devtools), axios, Zod 4, React Hook Form + `@hookform/resolvers`, `nuqs` (стан у URL), `sonner` (toasts), Tailwind CSS v4, shadcn/ui (стиль `radix-nova`), Vitest + Testing Library (+ `user-event`), oxlint + Prettier |
| Інфраструктура | Docker Compose (Postgres), pnpm 10 workspaces (`apps/backend` + `apps/frontend`), Node 24 |
| AI-workflow | Claude Code, custom-flow процес, `.claude/hooks` |

## Структура монорепо

```
art-gallery-managment-system/
├── apps/
│   ├── backend/     # NestJS — src/ (artworks/ [dto/, mapper, service, controller], health/, common/ [setup, configs, decorators, filters, middlewares, prisma, utils], generated/ — Prisma client, gitignored), prisma/ (schema, migrations/, seed.ts), prisma.config.ts
│   └── frontend/    # Vite + React — app/ (providers/, layouts/ [MainLayout, Header, Footer], components/ui — shadcn), common/ (api/, constants/, lib/, schemas/, types/, utils/ [errors/, formatPrice]), features/artworks/ (components/ [filters/, form/], constants/, hooks/, queries/, utils/), pages/ (GalleryPage), test/
├── docker-compose.yml
├── .env.example
├── .vscode/         # лише extensions.json (Oxc, Prettier) — решта gitignored
└── .claude/         # settings.json, hooks/, plans/ (gitignored)
```

Без окремого `packages/shared`: Zod-схеми фронту й DTO бекенду визначаються окремо — свідомий trade-off для невеликого проєкту.

## Локальний запуск

`docker compose up -d` (Postgres `:5433`) → `pnpm install` → `pnpm --filter @art-gallery/backend prisma:generate` → `… prisma:migrate` → `… prisma:seed` → `pnpm dev` (backend `:8000`, frontend `:5173`; `.env` у корені за зразком `.env.example`). `pnpm typecheck`/`lint`/`test` — по всіх пакетах, або `--filter @art-gallery/backend|frontend`; `format` (Prettier) — лише через `--filter` (у фронті `.prettierignore` виключає `components/ui` — код shadcn у своєму стилі). Swagger — `/api`, health-check — `/health`.

- Порт `8000` — як у прикладах ТЗ (`http://localhost:8000/artworks`).
- Postgres на `5433`, контейнер `art-gallery-postgres` — щоб не конфліктувати з іншими локальними Postgres.
- `prisma generate` **не** запускається автоматично на `pnpm install`: `prisma.config.ts` вимагає `DATABASE_URL`, тож postinstall упав би на свіжому клоні без `.env`.
- Seed (`prisma db seed` → `tsx prisma/seed.ts`) у Prisma 7 **не** запускається автоматично після `migrate` — лише вручну. Ідемпотентний: 4 твори з фіксованими UUID через `upsert`; повторний запуск повертає їх до початкових значень. `tsx` — бо Node-шний type stripping не розвʼязує ESM-імпорти `.js` → `.ts` згенерованого клієнта. Seed — окремий скрипт поза Nest, тож читає `DATABASE_URL` через `dotenv`, а не `ConfigService`.

## Naming conventions

- **Backend — ESM:** відносні імпорти **обовʼязково з `.js`** (`'./app.module.js'`, хоча файл `.ts`). Без розширення збірка проходить, а Node падає на старті. Немає `__dirname`/`require` — `import.meta.dirname` / `import`.
- **Backend — без path-аліасів** (свідомо): tsc не переписує `paths` у `dist/`, знадобились би `tsc-alias` або `package.json#imports`. Глибина імпортів невелика.
- Backend валідує через class-validator DTO (`*.dto.ts`). **Свідомий відхід від «schema-first Zod»** (глобальний CLAUDE.md користувача) — Zod лише на фронті.
- DTO за призначенням: `Create<X>Dto` (POST), `Replace<X>Dto extends Create<X>Dto` (PUT — повна заміна, тіло те саме), `Get<X>QueryDto` (query), `<X>ResponseDto` (форма відповіді для Swagger). Enum-и в DTO — з `generated/prisma/enums.js` (не дублювати).
- Feature-специфічні `select`/мапери — поруч із фічею (`artworks/artwork.mapper.ts`), не в `common/`.
- React-компоненти: PascalCase, один компонент на файл. Custom hooks: `useX.ts`.
- **Frontend:** Zod-схеми — у `common/schemas/*.schema.ts` (лише `z.object/enum`), типи — `z.infer` у `common/types/*.ts`, **окремо від схем**. HTTP-виклики — у `common/api/*.ts` (обʼєкт-сервіс, відповідь парситься через `parseApiResponse`); axios-інстанс — `common/lib/apiClient.ts`; TanStack Query хуки й ключі — у `features/*/queries/` (не inline у компонентах; ключі — фабрика `artworkKeys`). Ліміти полів — `common/constants/artwork.constants.ts` (спільні для схеми й форми). Аліас `@/` → `src/`.
- **Frontend-форми:** React Hook Form + `zodResolver(artworkFormSchema)`; поле обгортає `FormField` (label + `role="alert"` помилка + `aria-describedby`); Radix-контроли (`Select`, `Switch`) — через `Controller`. Помилки мутацій — `handleMutationError(error, setError?, fieldMap?)`: поля з `400 errors` → `setError`, решта → `toast.error`.
- **Стан у URL** — лише через `useArtworksParams` (`nuqs`): парсери з `*.options` Zod-енумів (без дублювання значень), компоненти фільтрів отримують `value`/`onChange` пропсами й про URL не знають.
- shadcn: `cn` — `common/lib/cn.ts` (реекспорт пакета `cn` від shadcn — новий дефолт CLI замість `clsx` + `tailwind-merge`), компоненти — `app/components/ui/` (аліаси в `components.json`).

## Testing conventions

- Обидва застосунки — **Vitest**, файли поруч із кодом: backend `*.spec.ts`, frontend `*.test.ts(x)`. API — як у Jest, але `vi.fn()`/`vi.mock()` замість `jest.*`; `globals: true`.
- Backend, обсяг — **найпростіші unit-тести** (рішення користувача): DTO, сервіси з мок-Prisma, утиліти; без e2e з реальною БД (ендпоінти перевіряються вручну через curl/Swagger).
- **DTO тестуються через справжній `ValidationPipe(validationConfig)`** + `pipe.transform(value, { type: 'body' | 'query', metatype })` (патерн із book-managment) — так покриваються й `forbidNonWhitelisted`, `@Trim`, default-и полів. Одне невалідне поле на кейс (`it.each`), інакше `rejects.toThrow(BadRequestException)` пройде через інше поле.
- Сервіси — `new XService(mock as unknown as PrismaService)` з `vi.fn()` лише для методів, які сервіс викликає; моки перестворюються в `beforeEach`.
- Frontend: рендер із провайдерами — `src/test/renderWithProviders.tsx` (новий `QueryClient` з `retry: false` + `NuqsTestingAdapter`; опції `searchParams` — початковий URL, `onUrlUpdate` — шпигун на запис URL). Хук `useArtworksParams` — `renderHook` + `withNuqsTestingAdapter`, запис URL перевіряється через `onUrlUpdate` у `waitFor` (nuqs пише URL асинхронно). `setupTests.ts` підключає jest-dom і поліфіли Pointer Capture + `scrollIntoView` + `ResizeObserver` (без них тести з Radix Select/Switch падають).
- **Моки:** сервіси — `vi.mock('@/common/api/...')`, мокається лише мережевий шар (компоненти, `useMutation`/`useQuery` — справжні). Після `vi.mock` — завжди аліас `const create = vi.mocked(artworksService.create)` і далі **лише він** (не змішувати з `artworksService.create`). Якщо `mutationFn` — сам метод сервісу (без обгортки), TanStack передає другим аргументом контекст → `toHaveBeenCalledWith(id, expect.anything())`.
- **Патерни:** `waitFor` — з `@testing-library/react` (не `vi.waitFor`); debounce — `vi.useFakeTimers()` + `fireEvent` (`userEvent` з fake timers зависає без `advanceTimers`); подвійний клік — `mockReturnValue(new Promise(() => {}))` + два синхронні `fireEvent.click` (з `userEvent` кнопка встигає стати `disabled`, і ref-захист не перевіряється); решта взаємодій — `userEvent.setup()`.
- Запуск: `pnpm --filter @art-gallery/backend|frontend run test`.

## Git workflow

Процес — `custom-flow`: план зі стейджами, явне підтвердження користувача на кожному кроці. **Комітить користувач сам після завершення майстер-плану** — агент не комітить після стейджів.

## Архітектурні рішення

- **NestJS 12 замість 11 (як у референсі book-managment):** шаблон `@nestjs/cli@latest` — ESM + Vitest + oxlint. Обрано свідомо, щоб спробувати новий стек; Jest з ESM працює погано, тому Vitest.
- **Prisma 7:** `prisma.config.ts` + driver adapter `@prisma/adapter-pg` обовʼязкові (у `schema.prisma` немає `url`). Generator `prisma-client`, `moduleFormat = "esm"`, `output` — `src/generated/prisma` (gitignored): `tsconfig.build` має `rootDir: ./src`, тож `dist/main.js` лишається на дефолтному місці. `PrismaService`/`PrismaModule` — `common/prisma/`, `@Global()`. **Версії `prisma` і `@prisma/client` мусять збігатися:** npm-тег `latest` у `prisma` зараз вказує на `8.0.0-rc.*` — ставити тільки з явною версією (`prisma@^7.x`).
- **Конфігурація застосунку** — уся в `common/setup/app.setup.ts` (CORS, `helmet`, глобальний фільтр, `ValidationPipe`, Swagger); `main.ts` лише bootstrap. Env — тільки через `ConfigService` (кореневий `.env`), ніколи `process.env` напряму.
- **CORS** — `origin: FRONTEND_URL`, **без `credentials`** (cookies/auth немає; увімкнути разом з auth, якщо зʼявиться).
- **Помилки (backend):** `ValidationPipe` (`whitelist` + `forbidNonWhitelisted` + `transform`, кастомний `exceptionFactory` групує помилки по полях → `400 { message: 'Validation failed', errors: { field: [...] } }`). `HttpExceptionFilter` (`@Catch()` — ловить усе) → уніфіковане тіло `{ statusCode, message, errors?, details? }`: `HttpException` → її статус; будь-що інше → лог зі stack trace (+ код Prisma, якщо це `PrismaClientKnownRequestError`) і `500 Internal server error` без деталей. `details` пробрасується для 503 від Terminus (перевірка за формою тіла: `body.status && body.details`).
- **Prisma-помилки → HTTP:** `common/utils/prisma-errors.ts` — `rethrowPrismaError(error, { P2025: 'Artwork not found' })` у `.catch` після `findUniqueOrThrow`/`update`/`delete` → `404`. У мапі лише `P2025`; перевірка через `Object.hasOwn` (не `in` — ловив би `toString` тощо). Код без переданого повідомлення або невідомий код прокидається як є → фільтр → `500` + код у лозі (свідомо: краще видимий баг, ніж вгаданий `404`). Catch-after замість check-first — без TOCTOU.
- **`price`:** `Decimal(12, 2)` у БД (не float — гроші), у відповіді — `number` через `toArtworkResponse` (`Decimal.toNumber()`; ≤ 12 значущих цифр — без втрат). Додатково `CHECK ("price" > 0)` окремою SQL-міграцією (`artwork_price_positive`) — Prisma-схема не вміє CHECK, у `schema.prisma` лише `///`-коментар; Prisma не бачить його як drift. DTO: `@IsNumber({ maxDecimalPlaces: 2 })`, `@IsPositive`, `@Max(9_999_999_999.99)` (інакше переповнення колонки → `500`). Рядок `"4500"` → `400` (без `enableImplicitConversion`).
- **`availability` default — у DTO** (`availability: boolean = true`): `ValidationPipe` створює DTO через `new`, тож відсутнє поле лишається `true` ще до валідації. **Без `@IsOptional()`** — він пропускає й `null`, а колонка `NOT NULL` (було б `500`). `@default(true)` у схемі — лише для записів поза API (seed, SQL). Default у DTO потрібен ще й тому, що БД-ний `DEFAULT` не працює на `UPDATE`.
- **`PUT` = повна заміна** (`update` з усім DTO), не `PATCH`; `PATCH` немає.
- **`GET /artworks`:** `artist` — `contains` + `mode: 'insensitive'` (порожній — ігнорується), `type` — точний збіг, `price=asc|desc`; без `price` — `createdAt desc`. Завжди `id asc` як tie-breaker (стабільний порядок за рівних значень). Відповідь — лише поля моделі ТЗ (`ARTWORK_SELECT`, без timestamps). Пагінації немає (немає в ТЗ).
- **`:id`** — UUID (`@db.Uuid`), `ParseUUIDPipe` → не-UUID дає `400`.
- **Ідемпотентність `POST`** — на бекенді **не реалізована** (замовник: «буде плюсом, але не обовʼязково»; рішення 2026-10-09 — не встигаємо). Захист від подвійного кліку — лише на фронті: `useRef`-прапорець (`isSaving` / `isDeleting`) відсікає другий клік у тому ж тіку, ще до ререндеру, + кнопка `disabled` поки `isPending`. Backend-варіант (`Idempotency-Key` + таблиця в Postgres) — у README «Production considerations». `GET`/`PUT`/`DELETE` ідемпотентні за HTTP-семантикою.
- **Health-check:** `GET /health` — Terminus + кастомний `PrismaHealthIndicator` (`$queryRaw SELECT 1`): `200` або `503` з `details.database.status = down` і причиною. Після падіння БД Prisma перепідключається сама.
- **Frontend API-шар:** `apiClient` — axios з `baseURL = VITE_API_URL`, без інтерцепторів. `queryClient` — `retry: false`, `staleTime` 60 с. `parseApiResponse` — Zod-валідація відповідей; невідповідність → `ApiValidationError` («Server returned unexpected data»). Помилка без відповіді → «No server connection», інакше — `message` з тіла бекенду (`extractErrorMessage`). Vite читає кореневий `.env` (`envDir`).
- **Frontend — одна сторінка без роутера:** `main.tsx` → `GlobalProvider` (`NuqsAdapter` для React без роутера, `QueryClientProvider`, `Toaster`) → `MainLayout` (header / footer) → `GalleryPage`. Додавання й редагування — shadcn `Dialog`, видалення — `AlertDialog`. Роутер не потрібен: усе на одному екрані, як в UI Example ТЗ.
- **Фільтри й сортування — на бекенді**, стан — у URL (`nuqs`): `type` / `price` — `parseAsStringLiteral` (невалідне значення в URL → `null` → ігнорується, а не `400`), `artist` — `parseAsString.withDefault('')`. Дефолти nuqs v2: default-значення в URL не пишуться (`clearOnDefault`), `history: 'replace'`. Пошук artist — локальний `useState` + debounce 400 мс (`ArtworkSearchInput`); синхронізація назад (Reset) — оновлення стану під час рендеру при зміні пропса, не `useEffect`. Порожні значення до API не йдуть.
- **Дані:** `useArtworksQuery` — `queryKey: artworkKeys.list(filters)` + `placeholderData: keepPreviousData` (сітка не блимає при зміні фільтра, стара — з `opacity-60`). Мутації — `invalidateQueries(artworkKeys.lists())` в `onSettled`, **без optimistic updates** (простіше і завжди точно; `onSettled`, а не `onSuccess` — щоб `404` на видаленні теж оновив список).
- **Додавання й редагування — один `ArtworkFormDialog` / `ArtworkForm`** (`artwork?` → режим edit) і одна мутація `useSaveArtworkMutation` (`create` або `update`). Edit: `Save` disabled, поки форма не змінена (`isDirty`); `PUT` — усе тіло. Під час запиту діалог не закривається (ні `Cancel` — disabled, ні Escape / клік поза ним — `onOpenChange` ігнорує закриття): мутація живе в дочірній формі, тож `ArtworkFormDialog` дізнається про запит через `useIsMutating({ mutationKey: artworkKeys.save(id) })`, а `DeleteArtworkDialog` — з власного `isPending`. При закритті вміст діалогу розмонтовується → наступне відкриття з порожньою формою.
- **Фото-заглушка:** `getArtworkGradient(id)` — хеш `id` (FNV-1a + MurmurHash3 finalizer) → два відтінки HSL; стабільний між reload, різний для сусідніх UUID. Поверх — іконка типу (`ARTWORK_TYPE_CONFIG`).
- **Ціна в UI** — `formatPrice`: `Intl.NumberFormat('en-US', USD)` з `trailingZeroDisplay: 'stripIfInteger'` → `$4,500`, `$2,750.50`.

## Domain model

`Artwork` (`prisma/schema.prisma`):

| Поле | БД | API / валідація |
|---|---|---|
| `id` | `UUID`, `@default(uuid())` | `string` (UUID) |
| `title` | `VARCHAR(99)` | обовʼязковий, trim, не порожній, ≤ 99 |
| `artist` | `VARCHAR(50)` | обовʼязковий, trim, не порожній, ≤ 50 |
| `type` | enum `ArtworkType`: `painting`, `sculpture`, `photography`, `drawing`, `print` | обовʼязковий, значення з enum |
| `price` | `DECIMAL(12,2)`, `CHECK > 0` | `number` > 0, ≤ 2 знаки після коми, ≤ `9 999 999 999.99` |
| `availability` | `BOOLEAN`, default `true` | optional, default `true`, `null` → `400` |
| `createdAt` / `updatedAt` | timestamps | у відповідь не віддаються |

Фото в моделі немає — див. відкриті питання.

## Ендпоінти

| Метод | Шлях | Опис |
|---|---|---|
| `GET` | `/health` | стан API і БД (`200` / `503`) |
| `GET` | `/artworks` | список; `?price=asc\|desc&artist=&type=` (`200` / `400`) |
| `GET` | `/artworks/:id` | один твір (`200` / `400` / `404`) |
| `POST` | `/artworks` | створити (`201` / `400`) |
| `PUT` | `/artworks/:id` | повна заміна (`200` / `400` / `404`) |
| `DELETE` | `/artworks/:id` | видалити (`204` / `400` / `404`) |

Swagger — `/api`. `400` — і невалідне тіло/query (зокрема невідомі поля — `forbidNonWhitelisted`), і не-UUID `:id`.

## Відкриті питання / наступні кроки

- **Фото в UI-прикладі ТЗ, але не в моделі / `POST`-тілі** — замовник: вільний вибір. **Наступний план.** Поки що: на бекенді поля немає, на фронті — градієнт-заглушка.
- **Lost update** при одночасному `PUT` двох адмінів — не вирішено (немає в ТЗ); варіант — optimistic locking (`version`/`updatedAt` → `409`).
- **`/health` віддає сирий текст помилки Prisma** назовні — прийнятно локально, на проді — витік. Відоме обмеження.
- **Бандл фронту ~911 kB / 284 kB gzip** (попередження Vite > 500 kB): основна вага — React 19, Radix, Zod 4, React Hook Form, axios; devtools — окремий lazy-чанк. Одна сторінка, тож code splitting майже нічого не дав би — не оптимізовано свідомо.
## AI workflow

Процес — `custom-flow`: план на задачу зі стейджами, явне підтвердження до реалізації. Плани — `.claude/plans/` (gitignored).

Хуки (`.claude/hooks/`, підключені в `.claude/settings.json` через `$CLAUDE_PROJECT_DIR` — відносний шлях ламався, коли робоча тека сесії йшла в підпапку, і хуки, **включно із захистом `.env`**, мовчки не працювали):

- `block-env-files.js` (PreToolUse) — забороняє агенту читати/писати `.env*` (крім `.env.example`).
- `block-git-push.js` (PreToolUse) — `git push` лише з підтвердженням.
- `typecheck.js` (PostToolUse) — `pnpm run typecheck` у пакеті зміненого `.ts/.tsx`.
- `lint-fix.js` (PostToolUse) — `oxlint --fix` (backend — з `--type-aware`).
- `lib.js` — спільне: пакет визначається **зі шляху файлу** (не з імені пакета), помилки повертаються агенту через `additionalContext` (а не `systemMessage`, який бачить лише користувач).

**No duplicate types:** frontend виводить типи з Zod (`z.infer`), backend — DTO-класи; спільного пакета типів свідомо немає.
