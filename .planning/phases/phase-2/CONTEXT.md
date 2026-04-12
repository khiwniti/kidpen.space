# Phase 2: Educational Backend (Weeks 7-14) - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Mode:** Autonomous docs-only pass

<domain>
## Phase Boundary

Implement educational intelligence core: device tier detection, hybrid inference routing, Socratic tutoring logic, mastery tracking, and Drive sync.

</domain>

<decisions>
## Implementation Decisions

### Inference Architecture
- Keep research-validated hybrid model: cloud + edge tiers.
- Tier selection must be capability-driven (memory/WebGPU/storage), not user choice.
- Fail safely to cloud path when edge runtime degrades or OOM occurs.

### Tutoring Strategy
- Enforce Socratic tutoring as a hard behavior rule (guide, do not reveal answers).
- Thai-language pedagogy and encouragement style are default.

### Learning State and Sync
- pyBKT mastery state remains first-class and drives tutoring adaptation.
- IndexedDB is local source of truth; Drive sync is periodic and conflict-aware.

### the agent's Discretion
- Exact model runtime adapter layering can follow existing backend/frontend abstractions.
- Sync compression and scheduling heuristics may be tuned empirically.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing backend APIs and agent/tool orchestration can host cloud fallback routes.
- Frontend state + storage hooks can host device detection and offline state.

### Established Patterns
- Service-level abstractions exist for external integrations.
- Incremental feature flags are already used in parts of the codebase.

### Integration Points
- Browser capability detection in web client startup path.
- Model routing + prompt logic in backend agent pipeline.
- Drive API auth token lifecycle through existing OAuth identity.

</code_context>

<specifics>
## Specific Ideas

Start with deterministic tier-assignment telemetry and fallback logging to avoid silent quality regressions.

</specifics>

<deferred>
## Deferred Ideas

- Full visual UX polish and complete Thai localization depth are deferred to Phase 3.
- Legal consent workflows remain Phase 4.

</deferred>
