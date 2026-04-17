# Phase 4: PDPA & Launch (Weeks 21-26) - Context

**Gathered:** 2026-04-13
**Status:** Ready for execution
**Mode:** Launch readiness

<domain>
## Phase Boundary

Finalize the platform for public beta launch. This includes full PDPA (Thailand's Data Protection Act) compliance, building the supporting dashboards for parents and teachers, and ensuring the platform is secure, stable, and ready for real-world educational impact.

</domain>

<decisions>
## Implementation Decisions

### PDPA Compliance
- **Consent Management**: Explicit consent for data collection and processing.
- **Right to be Forgotten**: Implementation of account deletion and data erasure.
- **Data Portability**: Allow users to download their mastery data (via Google Drive or direct export).
- **Privacy Policy**: Thai-localized privacy policy and terms of service.

### Dashboards
- **Parent Portal**: View child's progress, strengths, and areas for improvement. No direct editing of learning state.
- **Teacher Dashboard**: Class-wide view of mastery, identification of students needing intervention.

### Security & Launch
- **Rate Limiting**: Protection against API abuse.
- **Monitoring**: Integration of error tracking (Sentry) and basic analytics.
- **Load Testing**: Verify platform stability for 100+ concurrent students.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Supabase Auth handles the primary identity management.
- `InferenceRouter` (Phase 2.02) needs usage monitoring.
- `MasteryDashboard` (Phase 3.04) provides the template for parent/teacher views.

### Integration Points
- `apps/frontend/src/app/(dashboard)/settings/` for PDPA controls.
- `apps/frontend/src/lib/auth/` for consent management.

</code_context>

<specifics>
## Specific Ideas

- Use a "Parent/Teacher Switch" in the dashboard for multi-role users.
- Implement a "Data Privacy Shield" badge in the UI to build trust with parents.
- Add a "Report Issue" button in the tutor view to collect student feedback.

</specifics>

## Workstreams Overview

| ID | Workstream | Priority | Dependencies |
|----|------------|----------|--------------|
| 04-01 | PDPA Compliance | P0 | None |
| 04-02 | Parent Portal | P1 | 03-04 |
| 04-03 | Teacher Dashboard | P1 | 03-04 |
| 04-04 | Launch Readiness | P0 | All |

## Success Criteria

- [ ] PDPA consent flow active
- [ ] Account deletion functional
- [ ] Parent dashboard shows child progress
- [ ] Teacher dashboard shows class mastery
- [ ] Rate limiting and monitoring active

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| PDPA non-compliance | Low | High | Legal review of policy and flows |
| Scale issues with many students | Medium | Medium | Load testing, efficient KQL queries |
| Misinterpretation of mastery data | Medium | Medium | Clear UI explanations for parents |
