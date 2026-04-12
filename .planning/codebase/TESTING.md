# Testing

How automated quality is enforced in this repository.

## Python backend

- **Framework:** **pytest** with plugins listed in `backend/pyproject.toml`: `pytest-asyncio`, `pytest-cov`, `pytest-env`, `pytest-mock`, `pytest-xdist`, `pytest-timeout`, `pytest-randomly`, `pytest-rerunfailures`.
- **Sample tests:** `backend/evals/test_simple.py` and broader `evals/` tree for evaluation harnesses.
- **Running:** Typically from `backend/` with `pytest` (exact invocations may be documented in root or backend README; CI uses workflow-defined commands).

## GitHub Actions (CI)

Key workflows under `.github/workflows/`:

| Workflow | Purpose |
|----------|---------|
| `e2e-api-tests.yml` | Post-deploy or branch-push API e2e against dev/staging/production URLs |
| `docker-build.yml` | Container image builds |
| `azure-deploy.yml` | Azure deployment pipeline |
| `e2e-benchmark.yml` / `e2e-benchmark-emergency-stop.yml` | Performance or load benchmarks |
| `context-compression-tests.yml` | Targeted tests for context compression behavior |
| `desktop-build.yml` | Desktop artifact builds |
| `mobile-eas-update.yml` | Expo EAS updates |
| `sync-db-to-staging.yml`, `sync-secrets.yml`, `promote-branch.yml` | Ops automation |

Inspect each YAML for **branch filters** (`main`, `staging`, `PRODUCTION`) and **path filters** (e.g. `backend/**`).

## Frontend and mobile

- **Lint:** `apps/frontend` — `next lint` via package script; no separate Jest/Vitest block read from `package.json` in the skimmed portion — confirm for unit tests by searching `*.test.ts` / `vitest` if adding coverage.
- **Mobile:** Rely on Expo/EAS for device builds; `apps/mobile` scripts focus on `expo start` and EAS build profiles — add **Maestro** or **Detox** only if the repo already contains them (grep before introducing).

## Evaluations and LLM quality

- **`backend/evals/`** — Datasets and eval APIs (`backend/evals/datasets.py` references expected agent behaviors).
- **Dependencies:** `braintrust`, `autoevals` — used for scoring model outputs in CI or offline runs.

## Local verification checklist

1. Backend: run focused `pytest` on changed modules before push.
2. Frontend: `pnpm --filter Kidpen lint` (and `build` if routes or types changed materially).
3. Mobile: `pnpm --filter kidpen` scripts as documented for the change (TypeScript check if configured).

## Gaps to be aware of

- **Cross-package tests:** Changes to `packages/shared` may require **typecheck** (`pnpm --filter @agentpress/shared typecheck`) in addition to app builds.
- **E2E env:** API e2e workflows assume reachable deployed URLs — not a substitute for fast local unit tests when iterating.

Update this file when you add a **new** primary test runner (e.g. Playwright for web) so planners do not assume the old stack.
