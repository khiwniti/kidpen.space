# Phase 4: PDPA Compliance & Launch (Weeks 21-26)
## Docs-Only Execution Plan

**Generated:** 2026-04-12
**Mode:** Autonomous docs-only pass
**Status:** Ready for implementation

## Goal
Implement full PDPA compliance and launch readiness: dual consent, data rights workflows, legal docs, production deployment gates.

## Workstreams

### 4.1 Dual Consent System
- Implement student consent UI and parent email capture.
- Build parent verification + reminder workflow.
- Enforce limited-access mode until consent resolution.

### 4.2 Data Rights
- Build data export (JSON/CSV) flow with Thai field naming.
- Build account deletion with waiting period and confirmations.
- Add anonymized audit logging for compliance traceability.

### 4.3 Policies and Terms
- Publish Thai + English privacy policy and terms.
- Add cookie/consent banner and persistent acceptance logs.

### 4.4 Launch Readiness
- Run security/performance checks as release gates.
- Finalize deployment and operational monitoring.
- Soft-launch to beta cohort and monitor stability.

## Acceptance Checklist
- [ ] Dual consent flow works end-to-end
- [ ] Data export and deletion are fully functional
- [ ] Policy/terms are published and linked in product
- [ ] Security/performance checks pass launch threshold
- [ ] Production rollout + monitoring are active

## Risks
- Consent drop-off impacting activation
- Legal text delays blocking release timeline
- Operational blind spots during first-week launch traffic

## Deliverables
- `04-CONTEXT.md`
- this `04-PLAN.md`
- implementation artifacts to be generated during execution phase
