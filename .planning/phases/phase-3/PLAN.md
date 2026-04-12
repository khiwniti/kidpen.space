# Phase 3: Thai UI Transformation (Weeks 15-20)
## Docs-Only Execution Plan

**Generated:** 2026-04-12
**Mode:** Autonomous docs-only pass
**Status:** Ready for implementation

## Goal
Complete Thai-native UX with offline-first PWA capability, mobile optimization, and mastery dashboard visuals.

## Workstreams

### 3.1 Full Thai Localization
- Complete translation coverage across student-facing UI.
- Normalize Thai STEM terminology and phrasing style.
- Remove remaining English UX copy where not legally required.

### 3.2 Offline-First PWA
- Add service worker and app-shell caching.
- Implement offline indicator and sync state UI.
- Add background sync queue and cache lifecycle controls.

### 3.3 Mobile Optimization
- Enforce touch-first interactions and small viewport support.
- Optimize for battery and constrained bandwidth.
- Ship WebP/lazy loading strategy for media assets.

### 3.4 Progress Visualization
- Implement mastery dashboard (Subject → Topic → Concept).
- Add Thai-native progress indicators and trends.
- Preserve self-comparison framing; avoid peer ranking.

## Acceptance Checklist
- [ ] Student-facing UI is Thai-complete
- [ ] Offline mode supports core learning flows
- [ ] Mobile UX quality is acceptable at 320px+
- [ ] Progress dashboard communicates mastery clearly
- [ ] Initial bundle budget target enforced

## Risks
- Bundle bloat from localization/dashboard dependencies
- Offline cache invalidation issues
- Thai terminology inconsistency across features

## Deliverables
- `03-CONTEXT.md`
- this `03-PLAN.md`
- implementation artifacts to be generated during execution phase
