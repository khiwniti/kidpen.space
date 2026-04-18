# kidpen.space Project State

**Last Updated**: 2026-04-13
**Current Phase**: Phase 2 - Educational Backend (Weeks 7-14)
**Next Action**: Execute workstream plans from `.planning/phases/02-educational-backend-weeks-7-14/`

---

## Project Identity

| Field | Value |
|-------|-------|
| Project Name | kidpen.space |
| Source Fork | Kidpen AI Suna Agent |
| Target Users | 4.4M Thai ม.1-ม.6 students (ages 12-18) |
| Mission | Free Socratic STEM tutoring for Thai secondary education |

---

## Architecture Decisions

### ✅ VALIDATED: Hybrid Tiered Architecture (NOT Pure Edge-First)

**Rationale**: Research validated that pure edge-first is NOT viable. WebLLM benchmarks show 5-20 tok/s on target devices vs 100+ tok/s requirement.

```
TIER DISTRIBUTION:
├── Tier 1: Cloud-only (~40% of users)
│   └── Devices: 2GB phones, 2GB Chromebooks → Server-side Qwen2-7B
│
├── Tier 2: Hybrid (~35% of users)
│   └── Devices: 4GB Chromebooks, mid-range phones → Qwen2-0.5B-INT4 + cloud fallback
│
└── Tier 3: Full Edge (~25% of users)
    └── Devices: 8GB+ RAM, WebGPU → Phi-3-mini-INT4
```

### ✅ VALIDATED: Google Drive Storage Architecture

**Rationale**: PDPA-advantageous - student owns data in their Drive, minimal central database.

```
Browser (IndexedDB) ←→ Google Drive (drive.appdata)
          ↓
    Supabase (minimal: users, parental_consents)
```

### ✅ VALIDATED: Qwen2 for Thai Language

**Rationale**: Best Thai support in small models. ~1.5-2x token overhead vs English acceptable.

---

## Research Findings Summary

| Document | Key Finding | Impact |
|----------|-------------|--------|
| WEBLLM_FEASIBILITY.md | 100+ tok/s NOT achievable on 2-4GB | Hybrid architecture required |
| GDRIVE_INTEGRATION.md | drive.appdata scope, 15-30min sync | User data ownership |
| THAI_EDTECH.md | 4.4M TAM, 50% rural, low connectivity | Offline-first critical |
| PDPA_COMPLIANCE.md | Dual consent required for minors <20 | Parent flow mandatory |

---

## Technology Stack (Planned)

### Frontend
- React 18+ with Server Components
- Tailwind CSS (Thai typography)
- Radix UI (accessible components)
- Service Worker (offline capability)
- Zustand (client state)
- Dexie.js (IndexedDB wrapper)

### Backend
- Supabase (Singapore region)
- Edge Functions (API endpoints)
- Google Drive API (OAuth 2.0)

### AI/ML
- Cloud: Anthropic Claude API or Qwen2-7B
- Hybrid: Qwen2-0.5B-INT4 via WebLLM (400MB)
- Edge: Phi-3-mini-INT4 via WebLLM (2.2GB)
- pyBKT: Client-side mastery tracking

### Thai NLP
- PyThaiNLP (WASM build for client-side)
- Thai word segmentation
- Curriculum-aligned vocabulary

---

## Phase Status

| Phase | Description | Status | Target |
|-------|-------------|--------|--------|
| Phase 1 | Fork & Foundation | 🔄 Partial | Weeks 1-6 |
| Phase 2 | Educational Backend | 🔄 Partial | Weeks 7-14 |
| Phase 2.01 | Device Detection | ❌ Not Implemented | Week 7 |
| Phase 2.02 | Hybrid Inference | ❌ Not Implemented | Week 8 |
| Phase 2.03 | Socratic Tutoring | ❌ Not Implemented | Week 12 |
| Phase 2.04 | Mastery Tracking | 🔄 Partial | Week 13 |
| Phase 2.05 | Google Drive Sync | ❌ Not Implemented | Week 14 |
| Phase 3 | Thai UI Transform | 🔄 Partial | Weeks 15-20 |
| Phase 3.01 | Thai Localization | 🔄 Partial | Week 15 |
| Phase 3.02 | Offline-First PWA | ❌ Not Implemented | Week 16 |
| Phase 3.03 | Mobile Optimization | 🔄 Partial | Week 17 |
| Phase 3.04 | Progress Visualization | 🔄 Partial | Week 18 |
| Phase 4 | PDPA & Launch | ❌ Not Started | Weeks 21-26 |
| Phase 4.01 | PDPA Compliance | ❌ Not Started | Week 21 |
| Phase 4.02 | Parent Portal | ❌ Not Started | Week 22 |
| Phase 4.03 | Teacher Dashboard | ❌ Not Started | Week 23 |
| Phase 4.04 | Launch Readiness | ❌ Not Started | Week 24 |

---

## Blocking Dependencies

1. **Suna Access**: Need Kidpen AI Suna repository fork access
2. **API Keys**: Anthropic/OpenAI for cloud tier
3. **Supabase Project**: Singapore region setup
4. **Google OAuth**: Cloud Console credentials
5. **IPST Curriculum**: No partnership yet - use public curriculum standards

---

## Success Metrics (6-Month Targets)

| Metric | Target |
|--------|--------|
| Registered users | 10,000 |
| Weekly active users | 5,000 |
| Sessions/user/week | 3 |
| 30-day retention | 40% |
| Parent consent rate | 60% |
| Math score improvement | +10% |
| Edge inference rate | 30% |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebLLM OOM crashes | High | High | Hybrid architecture with cloud fallback |
| Thai quality issues | Medium | High | Qwen2 selection, prompt engineering |
| Parent consent failures | High | Medium | Limited mode, 7-day grace, reminders |
| Download abandonment | Medium | Medium | Progressive download, WiFi prompts |
| PDPA violation | Low | Critical | Legal review, minimal data, Drive storage |

---

## Memory & Learnings

### Session: 2026-04-17 (Documentation Correction)

**Issue Discovered**: Planning documents (STATE.md, Phase Summaries) claimed all phases were "✅ Complete" but actual codebase implementation was missing critical files.

**Action Taken**:
1. Corrected STATE.md Phase Status table to reflect actual implementation state
2. Changed all incorrectly marked phases from ✅ Complete to 🔄 Partial or ❌ Not Implemented
3. Started systematic implementation of Phase 2 critical components

**Verification Checklist**:
- [ ] Device Detection (Phase 2.01): Types, detection utils, tier assignment
- [ ] Hybrid Inference (Phase 2.02): WebLLM integration, tier routing
- [ ] Socratic Tutoring (Phase 2.03): Thai tutoring prompts
- [ ] Mastery Tracking (Phase 2.04): Partial (useStudentData hook exists)
- [ ] Google Drive Sync (Phase 2.05): Drive module, sync hooks
- [ ] Phase 3: Partial Thai strings, no PWA service worker
- [ ] Phase 4: Not started

### Session: 2026-03-30 (Initial Planning)

**Key Decisions**:
1. Rejected pure edge-first architecture based on WebLLM benchmarks
2. Selected Qwen2 model family for Thai language support
3. Adopted Google Drive storage for PDPA compliance advantage
4. Defined 26-week roadmap across 4 phases

### Session: 2026-04-12 (Autonomous Docs-Only Pass)

**Outcome**:
1. Completed autonomous planning pass for all roadmap phases in docs-only mode
2. Added phase context/plan scaffolding for Phases 2-4 under `.planning/phases/`
3. Added missing Phase 1 CONTEXT.md to align phase artifacts
4. Deferred code execution to explicit implementation runs (`/gsd-execute-phase` style workflow)

**Validated Approaches**:
- Hybrid tiered architecture (research-backed)
- Dual consent flow (PDPA requirement)
- Offline-first with Drive sync (connectivity constraints)
- Mobile-first design (90% smartphone access in urban areas)

### Session: 2026-04-13 (Phase 2 Sprint Planning)

**Outcome**:
1. Created Phase 2 sprint directory: `.planning/phases/02-educational-backend-weeks-7-14/`
2. Created `02-CONTEXT.md` with workstream overview and success criteria
3. Created 5 workstream PLAN files:
   - `02-01-PLAN.md`: Device Detection (wave 1, no deps)
   - `02-02-PLAN.md`: Hybrid Inference (wave 2, depends on 02-01)
   - `02-03-PLAN.md`: Socratic Tutoring (wave 1, no deps)
   - `02-04-PLAN.md`: Mastery Tracking (wave 2, depends on 02-03)
   - `02-05-PLAN.md`: Google Drive Sync (wave 1, no deps)
4. Updated STATE.md to reflect Phase 2 in progress

**Workstream Dependencies**:
```
Wave 1 (parallel): 02-01 (Device Detection), 02-03 (Socratic), 02-05 (Drive Sync)
Wave 2 (sequential): 02-02 (Hybrid Inference) after 02-01, 02-04 (Mastery) after 02-03
```


---

## Quick Reference

### Commands
```bash
# Execute Phase 2 workstreams
/gsd:execute-phase 02-01  # Device Detection
/gsd:execute-phase 02-02  # Hybrid Inference (after 02-01)
/gsd:execute-phase 02-03  # Socratic Tutoring
/gsd:execute-phase 02-04  # Mastery Tracking (after 02-03)
/gsd:execute-phase 02-05  # Google Drive Sync

# View roadmap
cat .planning/ROADMAP.md

# View Phase 2 plans
ls .planning/phases/02-educational-backend-weeks-7-14/
```

### Key Files
```
.planning/
├── PROJECT.md          # Project overview
├── REQUIREMENTS.md     # Full requirements spec
├── ROADMAP.md          # 26-week development plan
├── STATE.md            # This file (project memory)
├── config.json         # Workflow preferences
├── phases/
│   ├── 01-fork-foundation-weeks-1-6/   # Phase 1 (complete)
│   └── 02-educational-backend-weeks-7-14/  # Phase 2 (in progress)
│       ├── 02-CONTEXT.md
│       ├── 02-01-PLAN.md  # Device Detection
│       ├── 02-02-PLAN.md  # Hybrid Inference
│       ├── 02-03-PLAN.md  # Socratic Tutoring
│       ├── 02-04-PLAN.md  # Mastery Tracking
│       └── 02-05-PLAN.md  # Google Drive Sync
└── research/
    ├── WEBLLM_FEASIBILITY.md
    ├── GDRIVE_INTEGRATION.md
    ├── THAI_EDTECH.md
    └── PDPA_COMPLIANCE.md
```

---

## Next Actions

1. **Immediate**: Execute Wave 1 workstreams in parallel (02-01, 02-03, 02-05)
2. **Then**: Execute Wave 2 workstreams (02-02 after 02-01, 02-04 after 02-03)
3. **Validate**: Run verification steps in each PLAN file after execution
