# Coding conventions

Observed patterns for contributors and agents working in this repo.

## TypeScript / React (web and mobile)

- **Framework defaults:** Next.js App Router conventions under `apps/frontend/src/app/`; Expo Router under `apps/mobile/app/`.
- **UI primitives:** Radix on web (`@radix-ui/react-*`); `@rn-primitives/*` on mobile for accessible building blocks.
- **Styling:** Tailwind on web; NativeWind/Tailwind-class patterns on mobile — follow existing class ordering in touched files.
- **Data fetching:** TanStack Query (`useQuery` / `useMutation` patterns) with hooks often centralized under `apps/frontend/src/hooks/` and `apps/mobile` hook folders.
- **Forms:** `react-hook-form` + `@hookform/resolvers` + **Zod** appear in frontend dependencies — prefer schema-first validation for new forms.
- **Rich text:** TipTap extensions are numerous in `apps/frontend/package.json`; extend existing editor config rather than introducing a parallel editor.
- **Tool views:** Thread tools use dedicated folders under `apps/frontend/src/components/thread/tool-views/<tool-name>/` with `_utils.ts` for parsing — match this layout for new tools.

## Python (backend)

- **FastAPI style:** Routers exported as `router` from `core.<pkg>.api` modules and included in `backend/api.py`.
- **Logging:** `structlog` and helpers from `core.utils.logger` — prefer structured keys over string concatenation.
- **Config:** `core.utils.config` (`config`, `EnvMode`) — read environment through existing config objects instead of ad hoc `os.environ` in new code.
- **Auth:** Use `verify_and_get_user_id_from_jwt` and related dependencies from `core.utils.auth_utils` for protected routes.
- **Async:** `async def` endpoints and async clients where libraries support it; Windows note in `backend/api.py` sets `WindowsSelectorEventLoopPolicy` for compatibility.

## Shared package (`packages/shared`)

- **Exports:** Use subpath imports defined in `packages/shared/package.json` (`./types`, `./streaming`, `./tools`, etc.) rather than deep relative imports from apps.
- **Peer React:** Package declares React peer dependency — avoid importing React-only APIs from code meant to run on the server unless already established.

## Formatting and lint

- **Frontend:** `pnpm --filter Kidpen lint` (Next ESLint); `format` / `format:check` via Prettier in `apps/frontend/package.json`.
- **Config file:** `apps/frontend/eslint.config.mjs`.

## Error handling (general)

- **API:** Prefer `HTTPException` with clear status codes and messages; return `JSONResponse` for structured errors where the client already expects that shape.
- **Client:** Use established patterns in hooks (loading/error state) before introducing new global error boundaries; `apps/frontend/src/app/global-error.tsx` exists for root-level failures.

## Internationalization

- Frontend carries multiple locale JSON files under `apps/frontend/translations/` (e.g. `it.json`, `zh.json`) — new user-facing strings should go through the same i18n mechanism used nearby in the edited feature.

## Git and CI

- Workflows under `.github/workflows/` gate merges on backend path changes — coordinate **API contract** changes with `e2e-api-tests.yml` expectations.

When in doubt, **match the nearest existing file** in the same directory over introducing a new pattern.
