# Phase 3: Thai UI Transformation (Weeks 15-20) - Context

**Gathered:** 2026-04-13
**Status:** Ready for execution
**Mode:** Sprint planning

<domain>
## Phase Boundary

Complete the Thai-native user experience with offline-first capability and mobile optimization. Transform the platform into a fully localized, accessible, and resilient learning environment for Thai students.

</domain>

<decisions>
## Implementation Decisions

### Localization Strategy
- **100% Thai Student UI**: Eliminate all English terminology from student-facing paths.
- **Thai STEM Terminology**: Use standard IPST-aligned terms for math and science.
- **Cultural Context**: Adaptation of word problems to Thai contexts (names, places, units).

### Offline & Resilience
- **Offline-First PWA**: Use Service Workers for asset caching and offline access.
- **Background Sync**: Queue learning events when offline and sync when reconnected.
- **Optimistic UI**: Immediate feedback for student actions even when offline.

### Mobile & Performance
- **Touch-First UI**: 100% responsive design down to 320px (low-end smartphones).
- **Bundle Optimization**: Target <500KB initial bundle size for slow networks.
- **WebP Images**: Mandatory for all visual assets to reduce bandwidth.

### Visualization
- **Mastery Dashboard**: Visual representation of pyBKT scores (Stars/Progress bars).
- **Growth Mindset**: Focus on self-comparison and improvement, not leaderboard competition.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `next-intl` is already used for basic translations.
- `Radix UI` and `Tailwind CSS` provide the foundation for responsive design.
- `SyncEngine` (Phase 2.05) handles the data sync layer.

### Integration Points
- Service Worker registration in `apps/frontend/src/app/layout.tsx`.
- Dashboard components in `apps/frontend/src/components/dashboard/`.
- Mastery context in `apps/frontend/src/components/mastery-provider.tsx`.

</code_context>

<specifics>
## Specific Ideas

- Implement a "Thai STEM Glossary" to ensure consistent terminology across the app.
- Use a "Dino" or "Rocket" mascot for the offline state to keep it friendly.
- Implement "Lazy Loading" for heavy LLM-related components.

</specifics>

<deferred>
## Deferred Ideas

- Advanced teacher/parent dashboard (Phase 4).
- Gamification elements beyond basic mastery visualization (Future).

</deferred>

## Workstreams Overview

| ID | Workstream | Priority | Dependencies |
|----|------------|----------|--------------|
| 03-01 | Full Thai Localization | P0 | None |
| 03-02 | Offline-First PWA | P0 | 02-05 |
| 03-03 | Mobile Optimization | P0 | None |
| 03-04 | Progress Visualization | P0 | 02-04 |

## Success Criteria

- [ ] Student-facing UI is 100% Thai
- [ ] App loads and functions (read-only) while offline
- [ ] Responsive design verified on 320px viewports
- [ ] Mastery dashboard displays pyBKT progress visually
- [ ] Initial bundle size is within targets

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Translation quality regressions | Medium | High | Automated translation checks, native review |
| Service Worker caching conflicts | Medium | Medium | Stale-while-revalidate strategy, versioning |
| Slow loading on low-end devices | High | Medium | Code splitting, image compression, minimal JS |
