Frontend частина ТЗ: сторінка галереї (список, фільтр artist/type, сортування за ціною), додавання і видалення творів через реальний API. Дизайн — за UI Example з ТЗ; фото — градієнтна заглушка.
status: done

# Master plan — frontend gallery

Контекст: `.claude/plans/backend-artworks-2026-10-08-1549/context-summary.md`, ТЗ (PDF, стор. 2–3 — FrontEnd Part + UI Example).

## Рішення на погодження

1. **Одна сторінка, без роутера.** У UI Example усе на одному екрані: header → «Explore Our Collection» → пошук + сортування → сітка карток → кнопка → footer. Форма додавання — shadcn `Dialog`, підтвердження видалення — `AlertDialog`. Роутер не потрібен: стан фільтрів у URL веде `nuqs` через адаптер без роутера (п. 4). `HomePage` (статус API) замінюється на `GalleryPage`.
2. **Дизайн за UI Example:** світла тема; header з логотипом (lucide `Palette`) + «ArtGalleryManager»; заголовок «Explore Our Collection»; сітка карток 1/2/3 колонки (responsive); темний footer з назвою, слоганом «Your go-to platform for managing and exploring exquisite art pieces.» і декоративними іконками соцмереж; чорні кнопки (`Button` default).
3. **Картка твору:** зверху — заглушка фото: **градієнт, детермінований від `id`** (hash → два відтінки HSL), тож кожна картка своя і не змінюється після reload; поверх — іконка типу (lucide). Нижче: `title` + `price` в один рядок, «By: {artist}», бейдж типу і бейдж наявності — «For sale» / «Exhibition only» (формулювання з ТЗ). Ціна — `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` → `$5,500`, `$2,750.50`.
4. **Фільтри й сортування — на бекенді** (query-параметри `artist`, `type`, `price`):
   - `Select` типу («All types» + 5 значень); `Select` «Sort by»: Newest (без `price`) / Price: low → high / high → low;
   - **стан фільтрів — у URL через `nuqs`** (адаптер `nuqs/adapters/react`, без роутера): `/?price=asc&artist=Picasso&type=painting`. Reload, «Назад» і посилання зберігають фільтри.
     - парсери: `price` — `parseAsStringLiteral(PRICE_SORT_ORDERS)`, `type` — `parseAsStringLiteral(ARTWORK_TYPES)` (без default → `null` = «не вибрано»), `artist` — `parseAsString.withDefault('')`; константи — ті самі, що в Zod-схемах (без дублювання);
     - **default-значення в URL не пишуться** (`clearOnDefault` / `null` видаляє ключ): без фільтрів — чистий `/`; reset — `setParams(null)`;
     - **невалідне значення в URL** (`?type=poster`, `?price=cheap`) → парсер дає `null`, фільтр ігнорується, а не `400` від бекенду; невідомі параметри до API не потрапляють;
     - `history: 'replace'` — зміна фільтрів не засмічує історію.
   - пошук за artist — як `GalleryInput` у verify: локальний `useState` + debounce ~400 мс, у URL (і в API) іде вже debounced значення; синхронізація назад при reset / «Назад». Причина: стан `nuqs` оновлюється одразу, тож без debounce в інпуті кожна літера = запит.
   - `placeholderData: keepPreviousData`, щоб сітка не «блимала» під час зміни фільтра; порожні значення в API не відправляються.
   - версія `nuqs` — остання стабільна, не свіжа `2.10.2` (опублікована 2026-10-08).
5. **Видалення — кошик на кожній картці завжди** (вимога ТЗ «each listing has a delete button»). Глобальної кнопки «Remove Artwork» з UI Example немає — вона дублювала б кошики. Кнопка «Add New Artwork» — у рядку з пошуком і сортуванням (у макеті — під сіткою, але при багатьох картках вона «зїде» вниз).
6. **Форма додавання — React Hook Form + Zod** (`@hookform/resolvers`): ті самі правила, що в `CreateArtworkDto` — `title` trim / 1–99, `artist` trim / 1–50, `type` enum, `price` > 0 / ≤ 2 знаки після коми / ≤ `9 999 999 999.99`, `availability` — `Switch`, default `true`. Схема форми — у `common/schemas/artwork.schema.ts`, тип — `z.infer` у `common/types/artwork.ts`.
   - **Ідемпотентність (варіант 1):** кнопка Submit `disabled` + спінер, поки `isPending`; закрити діалог під час запиту не можна.
   - Серверні `400` з `errors` по полях → `setError` у відповідні поля форми; інші помилки — toast.
7. **Повідомлення** — `sonner` (shadcn `Sonner`): успіх додавання/видалення, помилки мутацій. Після успіху — `invalidateQueries` для списку (без optimistic updates — простіше і завжди точно).
8. **Стани списку:** loading — `Skeleton`-картки; помилка — повідомлення через `extractErrorMessage` + кнопка «Try again» (`refetch`); порожньо — «No artworks found» (з кнопкою скинути фільтри, якщо вони активні).
9. **Health прибираємо з фронту повністю:** `HomePage`, `features/health/` (`ApiStatus` + тест, queries), `common/api/health.ts`, `health.schema.ts`, `types/health.ts`. Backend `GET /health` лишається. Спільні `apiClient`, `parseApiResponse`, `extractErrorMessage` лишаються — їх використовує галерея.
10. **Редагування (`PUT`) — додано на прохання користувача** (у FrontEnd Part ТЗ його немає, у Backend — optional): іконка олівця на кожній картці → той самий діалог і форма, що й для додавання, з заповненими полями. Робиться у Stage 4 разом із додаванням.
11. **Тести — найпростіші** (як на бекенді): Zod-схема форми, `ArtworkCard`, фільтри в URL, форма (помилки валідації, disabled під час відправки), видалення (підтвердження викликає сервіс). Сервіси мокаються `vi.mock('@/common/api/artworks')`; URL — `withNuqsTestingAdapter`.
12. **Нові залежності:** `react-hook-form`, `@hookform/resolvers`, `sonner`, `nuqs`; shadcn-компоненти: `button`, `card`, `badge`, `input`, `label`, `select`, `switch`, `dialog`, `alert-dialog`, `skeleton`, `sonner`.

## Stages

### Stage 1 — Data layer: схеми, сервіс, хуки `[x] done`
- `common/schemas/artwork.schema.ts` — `ARTWORK_TYPES`, `PRICE_SORT_ORDERS`, `artworkTypeSchema` (`z.enum`), `artworkSchema` (відповідь), `artworkListSchema`, `artworkFormSchema` (правила з п. 6).
- `common/types/artwork.ts` — `Artwork`, `ArtworkType`, `PriceSortOrder`, `ArtworkFormValues`, `ArtworkFilters` через `z.infer`.
- `common/api/artworks.ts` — `artworksService.getAll(filters)` (без порожніх параметрів), `create(body)`, `remove(id)`; відповіді через `parseApiResponse`.
- `features/artworks/queries/` — `artworks.keys.ts`, `useArtworksQuery(filters)`, `useCreateArtworkMutation`, `useDeleteArtworkMutation` (invalidate списку).
- `extractErrorMessage` — без змін; додати хелпер для `errors` по полях (для форми).

**Acceptance:** typecheck/lint зелені; схема відповіді приймає реальну відповідь `GET /artworks`; форма-схема повторює правила `CreateArtworkDto`.

**Tests:** так — `artwork.schema.test.ts` (форма: валідне тіло, trim, порожній title, > 99, price 0 / 19.999, default availability).

### Stage 2 — Layout і список творів `[x] done`
- Видалити health з фронту (п. 9); `GalleryPage` замість `HomePage` у `GlobalProvider`.
- shadcn-компоненти для цього стейджу; `Header`, `Footer`.
- `ArtworkCard` + `ArtworkImagePlaceholder` (градієнт від `id`), `formatPrice`; сітка; стани loading / error / empty.

**Acceptance:** після seed видно 4 картки з градієнтами, ціною `$4,500` / `$2,750.50`, бейджами типу і наявності; вигляд відповідає UI Example; responsive (1/2/3 колонки); при вимкненому бекенді — повідомлення про помилку з «Try again»; у фронті немає залишків health.

**Tests:** так — `ArtworkCard.test.tsx`, `formatPrice`.

### Stage 3 — Фільтри й сортування `[x] done`
- `nuqs` + `NuqsAdapter` у `GlobalProvider`; `features/artworks/hooks/useArtworksParams.ts` — парсери й `useQueryStates` (п. 4); тут же `null` від `nuqs` → `undefined` для `ArtworkFilters` (тип без `null` — сервіс і query keys не знають про nuqs); у `renderWithProviders` — опція початкового URL через `withNuqsTestingAdapter`.
- `ArtworkSearchInput` (debounce), `ArtworkTypeFilter`, `ArtworkSort`, «Reset» коли є активні фільтри.

**Acceptance:**
- приклад ТЗ (`price=asc`, `artist=Picasso`, `type=painting`) відтворюється з UI і дає URL `/?price=asc&artist=Picasso&type=painting`;
- default-значення (All types, Newest, порожній пошук) у URL не потрапляють; «Reset» → чистий `/`;
- відкриття URL з фільтрами / reload відновлює фільтри; невалідні значення в URL ігноруються;
- Network показує лише непорожні параметри; сітка не блимає при зміні фільтра.

**Tests:** так — default не пишеться в URL, reset → чистий URL, невалідний `?type=` ігнорується, зміна сортування/типу викликає `artworksService.getAll` з потрібними параметрами.

### Stage 4 — Додавання і редагування твору `[x] done`
- Кнопка «Add New Artwork» → `Dialog` з `ArtworkForm` (RHF + Zod), `Toaster` у провайдері.
- Олівець на кожній картці → той самий діалог у режимі редагування (`PUT /artworks/:id`), поля заповнені.
- Submit disabled + спінер під час `isPending`; серверні `errors` → поля; успіх → toast, закриття, reset форми, оновлений список.

**Acceptance:** валідний твір зʼявляється в списку без reload і лишається після reload; редагування змінює картку; кожне правило ТЗ показує помилку під полем; подвійний клік створює лише один запис.

**Tests:** так — помилки валідації показуються, сервіс не викликається; disabled під час відправки; редагування викликає `update(id, …)` із заповненими значеннями.

### Stage 5 — Видалення твору `[x] done`
- Кошик на кожній картці (п. 5) → `AlertDialog` з назвою твору → `remove`; toast; `404` (вже видалено) → toast + оновлення списку.

**Acceptance:** видалений твір зникає й не повертається після reload; скасування нічого не видаляє; кнопка підтвердження disabled під час запиту.

**Tests:** так — підтвердження викликає `artworksService.remove(id)`, скасування — ні.

### Stage 6 — Документація і наскрізна перевірка `[x] done`

> **Рішення 2026-10-09.** Ідемпотентність `POST` на бекенді **не робимо** (немає часу) — лишається фронтовий захист від подвійного кліку + нотатка в README «Production considerations». Фото — окремий план після завершення цього.
>
> **Поза стейджами (2026-10-09, під час розбору тестів):** у фронт додано `prettier` (+ скрипт `format`, `.prettierignore` для `components/ui`); тести: debounce-скидання таймера (`ArtworkSearchInput`), `GalleryPage` (картки, помилка + Try again, Reset filters), помилка видалення з повтором, `errors.test.ts`, змішані кейси `handleMutationError`, межові значення схеми; `expect.anything()` у `DeleteArtworkDialog`, мок-аліас у `handleMutationError`. Разом 59 тестів.

- `CLAUDE.md` (структура, рішення фронту, прибрати згадки health-сторінки, оновити «Поточний стан»), `README.md` (статус, опис UI).
- Ручна перевірка в браузері (Playwright): усі сценарії стейджів 2–5, мобільна ширина.

#### Stage plan

**A. `CLAUDE.md`**
1. Шапка «Поточний стан»: бекенд + фронт-галерея готові; далі — фото окремим планом.
2. Стек фронту: + `nuqs`, React Hook Form + `@hookform/resolvers`, `sonner`, Prettier.
3. Структура монорепо: `app/` (layouts, components), `common/` (+ constants), `features/artworks/` (components/filters, components/form, hooks, queries, utils, constants), `pages/GalleryPage`; прибрати `features/health`.
4. Naming/Testing conventions — дописати те, що реально є в коді:
   - стан фільтрів у URL — `nuqs` (`useArtworksParams`), default-и не пишуться в URL;
   - помилки мутацій — `handleMutationError` (поля → `setError`, решта → toast);
   - тести: мок-аліас `const x = vi.mocked(...)` (без змішування з оригінальним шляхом); `waitFor` з Testing Library; debounce — fake timers + `fireEvent`; подвійний клік — проміс, що не завершується, + два `fireEvent.click`; `renderWithProviders` (QueryClient + `NuqsTestingAdapter`).
5. Архітектурні рішення фронту: одна сторінка без роутера; фільтри/сортування на бекенді; `keepPreviousData`; `invalidateQueries` без optimistic updates; градієнт-заглушка від `id`; редагування через той самий діалог (`useSaveArtworkMutation`); захист від подвійного кліку (`useRef` + `disabled`). Прибрати «Тимчасове: HomePage» і «health як data» (сторінки вже немає).
6. Відкриті питання: фото → окремий план; ідемпотентність → вирішено (лише фронт); прибрати «Router, RHF, sonner ще не встановлені»; оновити розмір бандла за фактичним build.

**B. `README.md`**
1. Стек фронту (як у A.2).
2. Замість «start page shows API status» — короткий розділ **Features** (галерея, фільтр за типом, пошук за artist, сортування за ціною, стан у URL, додавання/редагування/видалення, валідація, toasts).
3. Scripts: `pnpm --filter @art-gallery/frontend run format`.
4. Project structure — рядок фронту оновити.
5. Production considerations п. 6 — уточнити: захист на фронті і в формі, і в діалозі видалення.

**C. Наскрізна перевірка**
1. `pnpm typecheck` / `lint` / `test` (обидва пакети) + `build` фронту; розмір бандла — в CLAUDE.md.
2. README-кроки: `docker compose up -d` → `prisma:generate` → `prisma:migrate` → `prisma:seed` → `pnpm dev` на поточній БД (не свіжий клон — повний клон з нуля виходить за межі; кажу про це в звіті).
3. Playwright (desktop + 375 px): 4 твори з seed; фільтр типу, пошук artist (debounce), сортування; URL зберігає фільтри після reload; невалідний `?type=poster` ігнорується; Reset; додавання (помилки валідації → успіх → toast → картка в списку); редагування; видалення (Cancel / Delete); стан помилки при зупиненому бекенді + Try again.
4. Після перевірки — `prisma:seed` + видалити тестові твори, щоб у БД знову було рівно 4.

**Поза планом, лише за погодженням:** `.vscode/extensions.json` з Oxc (з чернетки) — зараз `.vscode/` повністю в `.gitignore`, тож знадобиться `.vscode/*` + `!.vscode/extensions.json`.

**Результат (2026-10-09):** README / CLAUDE.md оновлено; `.vscode/extensions.json` (Oxc + Prettier) погоджено й додано. Знайдено й виправлено розбіжність із рішенням 6: діалоги закривались Escape / кліком поза ними під час запиту → `onOpenChange` ігнорує закриття (`isPending` / `useIsMutating` + `artworkKeys.save`), +2 тести. Перевірки: typecheck, lint, test (39 + 61), build — зелені; README-кроки на поточній БД; Playwright desktop + 375 px — усі сценарії ок. Дубль seed-твору видалено, у БД рівно 4. Після рев'ю (крок 7): видалено мертвий `useUpdateArtworkMutation.ts`, фронт відформатовано Prettier, +3 дрібні тести (Delete-кнопка в картці, Switch `false`, `setPrice` / artist з пробілів) — 64 тести.

**Acceptance:** `pnpm typecheck`/`lint`/`test`/`build` (frontend) зелені; README-кроки з нуля дають робочу галерею з 4 творами.

**Tests:** ні (повний прогін наявних). **Optional checks:** build.
