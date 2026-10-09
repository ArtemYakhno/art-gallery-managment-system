# Context summary — backend-artworks (2026-10-08)

## What was built

Повна backend-частина ТЗ: модель `Artwork` (Prisma 7 + Postgres), міграції, ідемпотентний seed перших 4 творів, CRUD `/artworks` — `GET` (фільтр `artist` частковий без регістру, `type`, сортування `price=asc|desc`), `GET/:id`, `POST`, `PUT` (повна заміна), `DELETE`; валідація за ТЗ через class-validator, `404` через `rethrowPrismaError`, Swagger для всіх ендпоінтів. 39 unit-тестів (Vitest), ручна перевірка всіх ендпоінтів на реальній БД, README-кроки перевірені на чистій БД. Фото — не реалізовано (чекаємо замовника). Frontend не чіпали.

## Key modules & functions

- `apps/backend/prisma/schema.prisma` — `enum ArtworkType` (painting, sculpture, photography, drawing, print), `model Artwork` (`Uuid`, `VarChar(99/50)`, `Decimal(12,2)`, `availability @default(true)`, timestamps).
- `apps/backend/prisma/migrations/*_init_artwork` — таблиця й enum; `*_artwork_price_positive` — ручний SQL `CHECK ("price" > 0)`.
- `apps/backend/prisma/seed.ts` — 4 твори з фіксованими UUID (`…0001`–`…0004`) через `upsert`; `dotenv` + власний `PrismaClient` з `PrismaPg`.
- `apps/backend/prisma.config.ts` — `migrations.seed: 'tsx prisma/seed.ts'`; `package.json` — скрипт `prisma:seed`, devDep `tsx`.
- `apps/backend/src/common/utils/prisma-errors.ts` — `rethrowPrismaError` (лише `P2025` → `NotFoundException`, `Object.hasOwn`) + spec (5 кейсів).
- `apps/backend/src/common/decorators/trim.decorator.ts` — `@Trim()`.
- `apps/backend/src/artworks/dto/get-artworks-query.dto.ts` — `price` (`PRICE_SORT_ORDERS`), `artist` (trim, ≤ 50), `type` (enum) + spec через `ValidationPipe`.
- `apps/backend/src/artworks/dto/create-artwork.dto.ts` — правила ТЗ, `MAX_PRICE`, `availability: boolean = true` без `@IsOptional`; spec (`it.each` на кожне правило) + блок `ReplaceArtworkDto`.
- `apps/backend/src/artworks/dto/replace-artwork.dto.ts` — `ReplaceArtworkDto extends CreateArtworkDto`.
- `apps/backend/src/artworks/dto/artwork-response.dto.ts` — форма відповіді для Swagger.
- `apps/backend/src/artworks/artwork.mapper.ts` — `ARTWORK_SELECT` (без timestamps), `toArtworkResponse` (`Decimal` → `number`).
- `apps/backend/src/artworks/artworks.service.ts` — `findAll` (`where`/`orderBy` з tie-breaker `id`), `findOne`, `create`, `replace`, `remove` + spec з мок-Prisma.
- `apps/backend/src/artworks/artworks.controller.ts` — 5 ендпоінтів, `ParseUUIDPipe`, `@HttpCode` 201/204, Swagger.
- `apps/backend/src/artworks/artworks.module.ts`, `src/app.module.ts` — підключення модуля.
- `CLAUDE.md`, `README.md` — domain model, ендпоінти, рішення, кроки запуску, production considerations 6–7.

## Architectural decisions

- **UUID `id` + `ParseUUIDPipe`** — не-UUID → `400`, а не `500`.
- **`price` — `Decimal(12,2)`** (точно, як `BigDecimal`), у відповіді `number` (`toNumber()` без втрат до 15 значущих цифр; перевірено на граничних значеннях). `CHECK > 0` у БД як останній рубіж; `@Max` у DTO, щоб переповнення колонки давало `400`, а не `500`.
- **Default `availability` — у DTO** (`= true`): `ValidationPipe` створює DTO через `new`, тож працює і для `POST`, і для `PUT` (БД-ний `DEFAULT` не діє на `UPDATE`). `@IsOptional` прибрано — пропускав `null` у `NOT NULL`-колонку.
- **`PUT` — повна заміна** окремим `ReplaceArtworkDto` (назва за змістом, правила успадковані); `PATCH` немає.
- **Фільтри:** `artist` — `contains` + `insensitive`, порожній ігнорується; `type` — точний; сортування за ціною або `createdAt desc`, завжди `id asc` як tie-breaker.
- **Помилки Prisma:** catch-after + `rethrowPrismaError` лише з явним повідомленням на місці виклику; інше → `500` + код у лозі.
- **Тести — найпростіші unit** (рішення користувача); DTO — через справжній `ValidationPipe(validationConfig)` (патерн із book-managment, покриває `forbidNonWhitelisted`); без e2e.
- **Ідемпотентність `POST`** — не реалізована (питання замовнику надіслано); на фронті — disable кнопки; backend-варіант описано в README.
- **Seed поза Nest** — `tsx` (Node type stripping не розвʼязує `.js` → `.ts` згенерованого клієнта), `process.env` через `dotenv` (свідомий виняток з правила «лише `ConfigService`»).

## Open items / next steps

- **Frontend-план:** router, сторінка галереї (картки, фільтр artist/type, сортування за ціною — через query-параметри API), форма додавання (RHF + Zod: ті самі правила, що в `CreateArtworkDto`; кнопка disabled під час `isPending`), видалення; опційно редагування через `PUT`; заглушка замість фото; форматування ціни (`Intl.NumberFormat`); `MemoryRouter` у `renderWithProviders`. Enum типів на фронті — окрема Zod-схема (спільного пакета немає).
- **Фото** — чекаємо відповідь замовника; тоді нова міграція + поле в DTO + upload.
- **Відповідь замовника про ідемпотентність** — якщо потрібна, `Idempotency-Key` + таблиця в Postgres.
- `GET /artworks` — без пагінації; невідомий query-параметр → `400` (`forbidNonWhitelisted`) — фронт має слати лише `price`/`artist`/`type`.
- Посилення `health.controller.spec.ts` (перевірка ключа `'database'`) — запропоновано, не зроблено.
- Відомі обмеження з init-плану: сирий текст помилки Prisma в `/health`, бандл фронту ~675 kB.
- Коміт не зроблено — користувач комітить сам.
