# Phase 2: Educational Backend (Weeks 7-14)
## Docs-Only Execution Plan

**Generated:** 2026-04-12
**Mode:** Autonomous docs-only pass
**Status:** Ready for implementation

## Goal
Implement hybrid LLM inference, Socratic tutoring system, pyBKT mastery tracking, and Google Drive sync.

## Workstreams

### 2.1 Device Detection
- Implement capability detector (`deviceMemory`, WebGPU, storage estimate).
- Add deterministic tier routing (cloud / hybrid / edge).
- Persist tier decisions and fallback reasons for diagnostics.

### 2.2 Hybrid Inference
- Integrate WebLLM runtime for supported devices.
- Add edge model initialization with progressive download.
- Implement cloud fallback API and seamless failover behavior.
- Add OOM/error guardrails with user-safe recovery path.

### 2.3 Socratic Tutoring System
- Implement Thai Socratic system prompt templates.
- Add dialogue policies: no direct answers, scaffold hints, misconception probing.
- Add subject-specific prompt variants and encouragement patterns.

### 2.4 Mastery Tracking
- Integrate pyBKT client-side mastery state.
- Map knowledge components to curriculum hierarchy.
- Connect mastery outputs to difficulty adaptation.

### 2.5 Google Drive Sync
- Configure `drive.appdata` scope and token lifecycle.
- Build IndexedDB ⇄ Drive sync engine (LWW baseline).
- Add compression + periodic background sync scheduling.

## Acceptance Checklist
- [ ] Device tier assignment works and logs correctly
- [ ] Inference routing works across all 3 tiers
- [ ] Socratic behavior consistently enforced
- [ ] Mastery scores update and influence tutoring behavior
- [ ] Drive sync is stable with conflict handling

## Risks
- Edge OOM and unstable WebGPU behavior
- Sync conflicts and stale state merges
- Socratic policy regressions in cloud fallback path

## Deliverables
- `02-CONTEXT.md`
- this `02-PLAN.md`
- implementation artifacts to be generated during execution phase
