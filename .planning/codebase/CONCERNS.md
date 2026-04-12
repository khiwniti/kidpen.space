# Technical concerns and debt

Risks and follow-ups inferred from structure, dependencies, and a light **TODO/FIXME** scan. Not a security audit.

## Scale and complexity

- **Large integration surface:** `backend/pyproject.toml` lists many third-party SDKs (AI, sandboxes, payments, Google, Composio, etc.). Each integration is a **credential**, **quota**, and **failure-mode** liability — keep env documentation and least-privilege keys current.
- **Monorepo breadth:** Three client apps + Python API + shared TS increases **drift** risk (API vs web vs mobile). Breaking API changes need coordinated releases.

## TODO markers (non-exhaustive sample)

- **Frontend — placeholder analytics / UX:** `apps/frontend/src/hooks/use-teacher-data.ts` (student counts, mastery, activity — TODOs). `apps/frontend/src/hooks/use-student-data.ts` (streak and minutes TODOs).
- **Frontend — product gaps:** `apps/frontend/src/components/sidebar/nav-student.tsx` (tutoring-specific thread). `apps/frontend/src/lib/storage/factory.ts` (Nextcloud/WebDAV provider not implemented).
- **Frontend — thread UX:** `PlaybackControls.tsx`, `CompleteToolView.tsx` — TODOs around tool identity and follow-up actions.
- **Backend:** `backend/core/tools/web_search_tool.py` (filter/subpage improvements). `backend/core/admin/analytics_admin_api.py` (MRR change calculation TODO).

A full `rg 'TODO|FIXME|HACK|XXX'` pass before major releases will surface more items.

## Operational and architecture risks

- **In-memory rate limiting:** `backend/api.py` uses `OrderedDict` for IP tracking — may not behave as intended behind multiple replicas without shared store.
- **Windows event loop:** Special-casing in `backend/api.py` — any asyncio library upgrade should be validated on Windows if that target remains supported.
- **Sandbox WIP:** `backend/core/sandbox/` contains **WIP** presentation/HTML-to-PPTX paths — treat as unstable until tests and naming remove “wip”.

## Security and compliance

- **Secrets:** Never commit `.env` files; GSD workflow recommends scanning generated docs before commit. Rotate keys if docs ever contained real tokens.
- **JWT and thread access:** Authorization logic is centralized in `backend/core/utils/auth_utils.py` — any new endpoint must use the existing dependencies; bypass risks **IDOR**-class bugs.
- **Student data / PDPA:** Product planning (`.planning/research/PDPA_COMPLIANCE.md`) may outpace current storage code — verify actual retention and consent flows in `auth` and Supabase-related modules before claiming compliance.

## Performance

- **Heavy client bundles:** Frontend depends on Syncfusion, TipTap, CodeMirror, PDF tooling — watch **bundle size** and **SSR** compatibility when adding features.
- **LLM cost:** Thread + tool loops with many providers can explode cost — use Langfuse/Braintrust dashboards where enabled.

## Dependency / supply chain

- **pnpm overrides** pin `@types/react` — upgrading React types globally may require coordinated bumps.
- **Python pins vs ranges:** Mix of pinned (`==`) and lower-bounded (`>=`) packages — reproducibility vs freshness tradeoff; watch Renovate/Dependabot noise.

## Subagent mapping run (2026-04-11)

Parallel `gsd-codebase-mapper` background tasks did not populate transcripts or files in this environment; this map was completed **sequentially in-repo** to satisfy `/gsd-map-codebase`. Re-run mappers if the tooling issue is fixed and you want independent agent-written artifacts.
