# Phase 1: Fork & Foundation (Weeks 1-6) - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Mode:** Autonomous docs-only pass

<domain>
## Phase Boundary

Establish kidpen.space as a production-ready fork baseline: repository identity, infrastructure, auth foundation, and Thai UI shell.

</domain>

<decisions>
## Implementation Decisions

### Repository and Delivery
- Keep current pnpm monorepo structure from Suna; avoid structural rewrites in this phase.
- Prioritize deployable staging baseline over feature completeness.
- Keep CI focused on lint/type/build gates first, then expand.

### Authentication and Data
- Google OAuth remains primary identity provider.
- Supabase region target remains Singapore for latency/compliance goals.
- PDPA foundation includes `users` and `parental_consents` tables with explicit migration artifacts.

### UI and Localization
- Use Sarabun as Thai-first type system.
- Deliver Thai shell/navigation first; deeper localization follows in later phases.

### the agent's Discretion
- Exact folder-level implementation details may adapt to existing Suna code boundaries.
- Naming and migration sequencing can be optimized for minimal disruption.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/`, `backend/`, `packages/` monorepo segmentation already present.
- Existing Supabase and auth integration points are available under `backend/`.

### Established Patterns
- TypeScript frontend + Python backend split should be preserved.
- Existing CI/deployment scaffolding can be incrementally adapted.

### Integration Points
- Auth entry points in web app and backend callback handlers.
- Schema/migrations in backend supabase migration path.

</code_context>

<specifics>
## Specific Ideas

Use the existing Phase 1 planning artifacts as source of truth for task detail and weekly sequence.

</specifics>

<deferred>
## Deferred Ideas

- Full offline capability and hybrid inference behavior are deferred to Phases 2-3.
- Full PDPA rights tooling deferred to Phase 4.

</deferred>
