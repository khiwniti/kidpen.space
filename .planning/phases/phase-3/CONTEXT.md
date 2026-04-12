# Phase 3: Thai UI Transformation (Weeks 15-20) - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Mode:** Autonomous docs-only pass

<domain>
## Phase Boundary

Deliver Thai-native UX at scale: full localization, offline-first behavior, mobile optimization, and mastery visualization.

</domain>

<decisions>
## Implementation Decisions

### Localization Quality
- Remove English from student-facing surfaces unless legally required.
- Use consistent Thai STEM terminology aligned with curriculum language.

### Offline and PWA
- Service worker and cache strategy prioritize study continuity over perfect freshness.
- Offline status and sync transparency are mandatory UI elements.

### Mobile Experience
- Touch-first interaction design is default.
- Low-bandwidth and low-battery behaviors are explicit quality criteria.

### Progress UX
- Progress visuals should encourage self-improvement, not peer ranking.
- Mastery hierarchy should align with Subject → Topic → Concept mental model.

### the agent's Discretion
- Component split between app shell and feature modules can adapt to current architecture.
- Exact charting/visual library choice may change based on bundle-size constraints.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing React component system and styling primitives can host Thai UI expansion.
- Current localization scaffolding from Phase 1 can be expanded rather than replaced.

### Established Patterns
- Current dashboard-like structures can be extended for mastery visualization.
- Existing cache/state patterns should be reused for offline indicators.

### Integration Points
- App shell routing/layout for localization propagation.
- Service worker registration/bootstrap in web app entrypoint.

</code_context>

<specifics>
## Specific Ideas

Treat bundle budget and perceived performance as release gates for this phase, not post-hoc optimization.

</specifics>

<deferred>
## Deferred Ideas

- Production legal documentation and deletion/export rights remain Phase 4 scope.

</deferred>
