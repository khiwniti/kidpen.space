# kidpen.space Project State

**Last Updated**: 2026-03-30
**Current Phase**: Phase 1 (Planning Complete, Ready for Execution)
**Next Action**: Begin Phase 1 execution - Fork kidpen-ai/suna

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
| Phase 1 | Fork & Foundation | 🔜 NEXT | Weeks 1-6 |
| Phase 2 | Educational Backend | ⏳ Pending | Weeks 7-14 |
| Phase 3 | Thai UI Transform | ⏳ Pending | Weeks 15-20 |
| Phase 4 | PDPA & Launch | ⏳ Pending | Weeks 21-26 |

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

### Session: 2026-03-30 (Initial Planning)

**Key Decisions**:
1. Rejected pure edge-first architecture based on WebLLM benchmarks
2. Selected Qwen2 model family for Thai language support
3. Adopted Google Drive storage for PDPA compliance advantage
4. Defined 26-week roadmap across 4 phases

**Validated Approaches**:
- Hybrid tiered architecture (research-backed)
- Dual consent flow (PDPA requirement)
- Offline-first with Drive sync (connectivity constraints)
- Mobile-first design (90% smartphone access in urban areas)

---

## Quick Reference

### Commands
```bash
# Start Phase 1 planning
/gsd:plan-phase 1

# View roadmap
cat .planning/ROADMAP.md

# View requirements
cat .planning/REQUIREMENTS.md
```

### Key Files
```
.planning/
├── PROJECT.md          # Project overview
├── REQUIREMENTS.md     # Full requirements spec
├── ROADMAP.md          # 26-week development plan
├── STATE.md            # This file (project memory)
├── config.json         # Workflow preferences
└── research/
    ├── WEBLLM_FEASIBILITY.md
    ├── GDRIVE_INTEGRATION.md
    ├── THAI_EDTECH.md
    └── PDPA_COMPLIANCE.md
```

---

## Next Actions

1. **Immediate**: Run `/gsd:plan-phase 1` to begin Phase 1 execution
2. **Phase 1 Focus**: Fork Suna, establish infrastructure, implement Google OAuth, create Thai UI shell
3. **Validate**: Ensure Suna repository access before starting
