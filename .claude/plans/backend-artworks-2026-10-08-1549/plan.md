Backend частина ТЗ: модель `Artwork`, CRUD `/artworks` (фільтри, сортування, валідація), seed перших 4 творів. Без фото.
status: done

# Master plan — backend `/artworks`

Контекст: `.claude/plans/init-monorepo-2026-10-08-1040/context-summary.md`.

## Рішення на погодження

1. **`id`** — `String @id @default(uuid()) @db.Uuid`; у контролері `ParseUUIDPipe`, тож невалідний id → `400`, а не `500`/`404`.
2. **`price`** — `Decimal @db.Decimal(12, 2)` у БД (гроші не зберігаємо у float). Prisma віддає `Decimal` як рядок, тому сервіс мапить у `number` (`toNumber()`): API повертає `price: number`, як у ТЗ. DTO: `@IsNumber({ maxDecimalPlaces: 2 })`, `@IsPositive()`.
3. **`type`** — Prisma `enum ArtworkType { painting sculpture photography drawing print }`. DTO — `@IsEnum`.
4. **`availability`** — optional у `POST`, default у БД — `true` (у продажу).
5. **Фільтри `GET /artworks`:**
   - `artist` — частковий збіг без урахування регістру (`contains`, `mode: 'insensitive'`);
   - `type` — точний збіг (enum);
   - `price=asc|desc` — сортування; без нього — `createdAt desc`; `id` як tie-breaker.
   - Невалідні query-параметри → `400` (окремий `GetArtworksQueryDto`).
6. **`PUT`** — повна заміна з тими ж правилами, що й у `POST` (за ТЗ). Окремого `PATCH` немає.
7. **`DELETE`** → `204 No Content`; `GET`/`PUT`/`DELETE` неіснуючого → `404` через `rethrowPrismaError` (`P2025`).
8. **Seed** — `prisma/seed.ts`, 4 твори з фіксованими UUID через `upsert` (повторний запуск нічого не дублює). Запуск: `prisma db seed` (`migrations.seed` у `prisma.config.ts`).
9. **Без пагінації та фото** — у ТЗ їх немає; фото — окремий план після відповіді замовника.
10. **Тести — найпростіші** (погоджено): unit (Vitest), по кілька ключових кейсів — DTO (правила ТЗ), сервіс з мок-Prisma, `rethrowPrismaError`. Без e2e з реальною БД — ручна перевірка через curl/Swagger у Stage 5.

11. **Ідемпотентність `POST`** — поки варіант 1 (питання замовнику надіслано): disable кнопки на фронті під час мутації + пункт у README «Production considerations». `GET`/`PUT`/`DELETE` ідемпотентні за HTTP-семантикою.

## Stages

### Stage 1 — Модель `Artwork`, міграція, seed `[x] done`
- `schema.prisma`: `enum ArtworkType`, `model Artwork` (`id`, `title VarChar(99)`, `artist VarChar(50)`, `type`, `price Decimal(12,2)`, `availability @default(true)`, `createdAt`, `updatedAt`).
- Міграція `init_artwork`; `prisma/seed.ts`; скрипт `prisma:seed`; `migrations.seed` у `prisma.config.ts`.
- Додатково (погоджено): міграція `artwork_price_positive` — `CHECK ("price" > 0)` у БД.

**Acceptance:**
- `prisma migrate dev` застосовує міграцію; `prisma generate` відповідає схемі.
- Seed створює рівно 4 записи; повторний запуск не створює дублів.
- typecheck/lint зелені.

**Tests:** ні. **Optional checks:** Prisma migration check.

### Stage 2 — Спільні утиліти `[x] done`
- `common/utils/prisma-errors.ts` — `rethrowPrismaError` (лише `P2025` → `NotFoundException`, `Object.hasOwn`, без `isPrismaError`).
- `common/decorators/trim.decorator.ts` — `@Trim()` (як у book-managment).

**Acceptance:** `P2025` з повідомленням → `404`; будь-яка інша помилка прокидається далі без змін (її ловить фільтр → `500`).

**Tests:** так — `prisma-errors.spec.ts`.

### Stage 3 — Читання: `GET /artworks`, `GET /artworks/:id` `[x] done`
- `artworks/` модуль: `ArtworksModule`, `ArtworksService`, `ArtworksController`, `dto/get-artworks-query.dto.ts`, мапер `price` → `number`.
- Swagger: `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiQuery` через DTO.

**Acceptance:**
- `?price=asc|desc`, `?artist=`, `?type=` працюють і комбінуються (приклад з ТЗ: `?price=asc&artist=Picasso&type=painting`).
- `price=foo` / `type=foo` → `400` з `errors` по полях.
- `GET /artworks/:id`: неіснуючий → `404`, не-UUID → `400`.

**Tests:** так — query DTO, сервіс (побудова `where`/`orderBy`, мапінг `price`), контролер.

### Stage 4 — Запис: `POST`, `PUT`, `DELETE` `[x] done`
- `dto/create-artwork.dto.ts` (`@Trim`, `MaxLength(99/50)`, `IsEnum`, `IsPositive`, `IsOptional IsBoolean`); `PUT` використовує той самий DTO.

**Acceptance:**
- Тіло з прикладу ТЗ (`Sunset Over the Ocean`) → `201` + створений обʼєкт.
- Кожне порушення правил ТЗ → `400`; зайві поля → `400` (`forbidNonWhitelisted`).
- `PUT` неіснуючого → `404`; `DELETE` → `204`, повторний → `404`.

**Tests:** так — create DTO (кожне правило ТЗ), сервіс, контролер.

### Stage 5 — Документація і наскрізна перевірка `[x] done`
- `CLAUDE.md` (domain model, ендпоінти, рішення), `README.md` (API, seed-крок у Getting started).
- Ручна перевірка всіх ендпоінтів через curl на реальній БД; Swagger показує всі ендпоінти й схеми.

**Acceptance:** README-кроки з нуля дають працюючий API з 4 творами; `pnpm typecheck`/`lint`/`test`/`build` (backend) зелені.

**Tests:** ні (повний прогін наявних). **Optional checks:** build.
