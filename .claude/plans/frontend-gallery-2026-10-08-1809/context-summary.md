## What was built

Frontend part of the Techstack test task: one gallery page (React 19 + Vite) that works with the real NestJS API.

- Responsive grid of artwork cards (1/2/3 columns) with a gradient "photo" placeholder derived from the `id`, type icon, price, artist, type and availability badges.
- Filter by type, debounced artist search (400 ms), sort by price — all done by the backend; filter state lives in the URL (`nuqs`).
- Add and edit in one dialog (React Hook Form + Zod, same rules as the API DTO); server field errors under their fields.
- Delete with a confirmation `AlertDialog` on every card.
- Loading skeletons, error state with "Try again", empty states (with "Reset filters" when filters are active), `sonner` toasts.
- Double-submit protection (ref lock + disabled buttons); dialogs cannot be closed while a request runs.
- The temporary API status page (`HomePage`, `features/health`) was removed.
- 64 frontend tests (Vitest + Testing Library); Prettier added to the frontend; `.vscode/extensions.json` (Oxc, Prettier); README and CLAUDE.md updated.
- Verified end to end with Playwright (desktop + 375 px). The DB holds exactly the 4 seed artworks.

## Key modules & functions

- `apps/frontend/src/main.tsx` — renders `GlobalProvider` → `MainLayout` → `GalleryPage`.
- `app/providers/GlobalProvider.tsx` — `NuqsAdapter` (react, no router), `QueryClientProvider`, `Toaster`, devtools.
- `app/layouts/MainLayout.tsx`, `Header.tsx`, `Footer.tsx` — page shell from the brief's UI example.
- `common/schemas/artwork.schema.ts` — `artworkTypeSchema`, `priceSortOrderSchema`, `artworkSchema`, `artworkListSchema`, `artworkFormSchema`.
- `common/types/artwork.ts` — `Artwork`, `ArtworkType`, `PriceSortOrder`, `ArtworkFormValues`, `ArtworkFilters` via `z.infer`.
- `common/constants/artwork.constants.ts` — field limits shared by schema and form.
- `common/api/artworks.ts` — `artworksService.getAll / create / update / remove`, responses parsed with `parseApiResponse`.
- `common/utils/errors/errors.ts` — `ApiValidationError`, `extractErrorMessage`, `extractFieldErrors`.
- `common/utils/errors/handleMutationError.ts` — field errors → `setError`, the rest → `toast.error`.
- `common/utils/formatPrice.ts` — USD format, no `.00` for whole numbers.
- `features/artworks/hooks/useArtworksParams.ts` — URL state (`nuqs` parsers), `filters` for the API, setters, `resetFilters`.
- `features/artworks/queries/artworks.keys.ts` — `artworkKeys.all / lists / list(filters) / save(id)`.
- `features/artworks/queries/useArtworksQuery.ts` — list query with `keepPreviousData`.
- `features/artworks/queries/useSaveArtworkMutation.ts` — create or update (by `artwork?`), `mutationKey: artworkKeys.save(id)`.
- `features/artworks/queries/useDeleteArtworkMutation.ts` — delete + toast; both mutations invalidate lists in `onSettled`.
- `features/artworks/components/ArtworkList.tsx` — loading / error / empty / grid states.
- `features/artworks/components/ArtworkCard.tsx`, `ArtworkImagePlaceholder.tsx` — card and gradient placeholder.
- `features/artworks/components/DeleteArtworkDialog.tsx` — confirm dialog, `isDeleting` ref lock, no close while pending.
- `features/artworks/components/filters/` — `ArtworkToolbar`, `ArtworkSearchInput` (debounce + sync on reset), `ArtworkTypeFilter`, `ArtworkSort`.
- `features/artworks/components/form/` — `ArtworkFormDialog` (no close while saving via `useIsMutating`), `ArtworkForm` (RHF, `isSaving` ref lock, `isDirty` for edit), `FormField`, `AddArtworkButton`, `EditArtworkButton`.
- `features/artworks/utils/getArtworkGradient.ts` — hash of `id` → two HSL hues.
- `features/artworks/constants/artworkType.config.ts` — label and icon per type.
- `pages/GalleryPage.tsx` — wires `useArtworksParams` to toolbar and list.
- `test/renderWithProviders.tsx` — `QueryClient` (`retry: false`) + `NuqsTestingAdapter` (`searchParams`, `onUrlUpdate`).
- `setupTests.ts` — jest-dom, Pointer Capture / `scrollIntoView` / `ResizeObserver` polyfills for Radix.

## Architectural decisions

- **One page, no router** — everything is on one screen in the brief's UI example; dialogs for add/edit/delete.
- **Filtering and sorting on the backend; state in the URL via `nuqs`** — reload and shared links keep filters; parsers come from Zod enum `options` (no duplicated values); invalid URL values become `null` and are ignored (no `400`); defaults are not written to the URL; `history: 'replace'`.
- **Debounced search with local state** — `nuqs` updates at once, so the input keeps its own state and sends the value after 400 ms; reset syncs back by updating state during render, not in `useEffect`.
- **No optimistic updates** — `invalidateQueries` in `onSettled` (also refreshes after a `404` on delete); `keepPreviousData` keeps the grid from flashing.
- **One dialog and one mutation for add and edit** — `useSaveArtworkMutation` picks `create` or `update`; `PUT` sends the full body; Save is disabled until the form is dirty.
- **Double-submit protection on the frontend only** — a `useRef` flag blocks the second click in the same tick, `disabled` blocks later ones; dialogs ignore Escape / outside click while pending. Backend idempotency (`Idempotency-Key`) was decided against (no time) and stays in README "Production considerations".
- **Photo placeholder** — deterministic gradient from the `id` (FNV-1a + MurmurHash3 finalizer), since the model has no photo field.
- **Zod on the frontend, class-validator on the backend, no shared package** — conscious trade-off for a small project; limits are mirrored by hand.
- **Tests mock only the network layer** (`vi.mock('@/common/api/...')`); components and TanStack hooks are real. Conventions (mock alias, `waitFor` from Testing Library, fake timers + `fireEvent` for debounce, never-settling promise + two `fireEvent.click` for double clicks) are in CLAUDE.md.

## Open items / next steps

- **Artwork photos** — decided 2026-10-09 not to build them (no time; a plain URL field was rejected). If revisited: `imageUrl` field + separate `POST /artworks/:id/image` (multer, local `uploads/`), mind `helmet` CORP and deleting old files. Described in README "Production considerations".
- **Commit** — nothing is committed yet; the user commits the whole plan (proposed message: `feat(frontend): add artwork gallery with filters, add/edit and delete`, 64 tests).
- **Not verified by hand:** the 2-column grid at the `sm` width, and the browser Back button with filters; a fresh-clone run of the README steps (only checked on the existing DB).
- **Bundle ~911 kB / 284 kB gzip** — Vite warns (> 500 kB); not optimized on purpose.
- **Known limits (from the backend plan):** lost update on concurrent `PUT`, raw Prisma error text in `/health`.
