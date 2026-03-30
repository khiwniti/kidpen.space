# kidpen.space Requirements Specification
## Thai STEM Tutoring Platform - Research-Validated Requirements

**Version**: 1.0
**Generated**: 2026-03-30
**Based on**: WEBLLM_FEASIBILITY.md, GDRIVE_INTEGRATION.md, THAI_EDTECH.md, PDPA_COMPLIANCE.md

---

## Executive Summary

| Requirement Area | Complexity | Priority |
|------------------|------------|----------|
| Hybrid Tiered Architecture | High | 🔴 P0 |
| Thai Language Support | High | 🔴 P0 |
| PDPA Dual Consent | High | 🔴 P0 |
| Offline-First + Drive Sync | Medium | 🟡 P1 |
| Mobile-First UI | Medium | 🟡 P1 |
| Socratic Tutoring System | Medium | 🟡 P1 |
| pyBKT Mastery Tracking | Low | 🟢 P2 |

---

## 1. Architecture Requirements

### 1.1 Hybrid Tiered Inference (VALIDATED)

**Rationale**: Pure edge-first NOT viable. WebLLM benchmarks show 5-20 tok/s on target devices vs 100+ tok/s requirement.

```
TIER DISTRIBUTION (Research-Validated):
├── Tier 1: Cloud-only (~40% of users)
│   ├── Devices: Low-end phones (2GB), 2GB Chromebooks
│   ├── Model: Server-side Qwen2-7B or Claude
│   ├── Performance: 50+ tok/s
│   └── Requirement: Online connectivity
│
├── Tier 2: Hybrid (~35% of users)
│   ├── Devices: 4GB Chromebooks, mid-range phones
│   ├── Model: Qwen2-0.5B-INT4 (400MB) + cloud fallback
│   ├── Performance: 10-25 tok/s local
│   └── Requirement: Progressive download, WiFi prompt
│
└── Tier 3: Full Edge (~25% of users)
    ├── Devices: 8GB+ RAM, WebGPU support
    ├── Model: Phi-3-mini-INT4 (2.2GB)
    ├── Performance: 30-60 tok/s
    └── Requirement: Full offline capability
```

**REQ-ARCH-001**: Device capability detection on first load
- Detect: `navigator.deviceMemory`, WebGPU availability, storage quota
- Route to appropriate tier automatically
- Allow manual override for power users

**REQ-ARCH-002**: Progressive model download
- Background download during first session
- WiFi detection with user prompt for large downloads
- Resume capability for interrupted downloads
- Storage in IndexedDB with quota management

**REQ-ARCH-003**: Seamless tier fallback
- Automatic cloud fallback on OOM errors
- Transparent to user experience
- Retry local inference after memory pressure resolves

### 1.2 Data Storage Architecture

**REQ-STORE-001**: Offline-First with Drive Sync
```
┌─────────────────────────────────────────────┐
│ Browser (Primary Data Layer)                │
├─────────────────────────────────────────────┤
│ IndexedDB                                   │
│ ├── learning_state (mastery, progress)      │
│ ├── conversations (AI tutoring history)     │
│ ├── practice_results (quiz answers)         │
│ └── model_cache (quantized weights)         │
└─────────────────────────────────────────────┘
                    ↓ Sync (15-30 min)
┌─────────────────────────────────────────────┐
│ Google Drive (Backup Layer)                 │
├─────────────────────────────────────────────┤
│ drive.appdata scope (hidden app folder)     │
│ ├── state.json (compressed learning state)  │
│ ├── conversations/ (archived sessions)      │
│ └── sync_metadata.json (conflict handling)  │
└─────────────────────────────────────────────┘
```

**REQ-STORE-002**: Minimal Central Database
```sql
-- Supabase (Singapore region)
users (id, google_id, display_name, grade_level, birth_year, consent_status)
parental_consents (id, user_id, parent_email, consent_given, consent_date)
-- NO learning data stored centrally (PDPA advantage)
```

**REQ-STORE-003**: Cross-device sync via Drive
- Conflict resolution: Last-write-wins with version vectors
- Delta sync to minimize bandwidth
- Compression: ~10x reduction on learning state JSON

---

## 2. Thai Language Requirements

### 2.1 Model Selection (VALIDATED)

**REQ-THAI-001**: Use Qwen2 series for edge inference
- Qwen2-0.5B for hybrid tier (best Thai in small models)
- Qwen2-7B for cloud fallback
- ~1.5-2x token overhead vs English (Thai tokenization)

**REQ-THAI-002**: Thai-native UI
- Full Thai interface (zero English in student-facing UI)
- Thai mathematical terminology
- Cultural context in problem examples (Thai names, scenarios)

**REQ-THAI-003**: Thai NLP integration
- PyThaiNLP for word segmentation (client-side WASM build)
- Thai spell-checking for student input
- Curriculum-aligned vocabulary (IPST standards)

### 2.2 Content Localization

**REQ-LOC-001**: IPST Curriculum Alignment
- ม.1-ม.6 scope and sequence for Math, Physics, Chemistry, Biology
- O-NET examination preparation focus
- Thai national curriculum indicators mapped to knowledge components

**REQ-LOC-002**: Socratic Prompt Templates
```
System prompt structure:
1. Role: ครูพี่เลี้ยง (supportive tutor, not authority figure)
2. Method: ถามนำ (guiding questions, never give direct answers)
3. Encouragement: Thai cultural sensitivity (face-saving)
4. Adaptation: pyBKT mastery-aware difficulty scaling
```

---

## 3. PDPA Compliance Requirements

### 3.1 Consent Flow (CRITICAL)

**REQ-PDPA-001**: Dual Consent System
```
Registration Flow:
1. Student registers via Google OAuth
2. Age verification (birthdate → under 20 = minor)
3. Student consent acknowledgment
4. Parent/guardian email collection
5. Consent form sent to parent
6. Limited access mode (7-day grace period)
7. Full access after parent consent
```

**REQ-PDPA-002**: Limited Access Mode
- Basic features: Browse curriculum, read content
- Blocked: AI tutoring, progress tracking, Drive sync
- Reminder: Persistent but non-intrusive parent consent prompt

**REQ-PDPA-003**: Consent Management
```javascript
consent_status: {
  student_consent: { given: boolean, date: timestamp },
  parent_consent: {
    given: boolean,
    date: timestamp,
    method: 'email' | 'otp',
    parent_email: string
  },
  withdrawal: { requested: boolean, date: timestamp }
}
```

### 3.2 Data Rights Implementation

**REQ-PDPA-004**: Data Export (Portability)
- JSON/CSV export of all user data
- Include: profile, learning history, AI conversations, mastery scores
- Format: Human-readable with Thai field names

**REQ-PDPA-005**: Account Deletion (Erasure)
```
Deletion Flow:
1. Request via in-app (re-authentication required)
2. Show data summary to be deleted
3. 72-hour waiting period (withdrawal option)
4. Delete from Supabase (central)
5. Provide Drive cleanup instructions
6. Confirmation email
7. Anonymized audit log entry
```

**REQ-PDPA-006**: Privacy Documentation
- Privacy policy: Thai + English
- Terms of service: Thai + English
- Cookie consent banner
- Consent logging with IP/timestamp

---

## 4. User Experience Requirements

### 4.1 Device Optimization

**REQ-UX-001**: Mobile-First Design
- Primary device: Smartphone (90% urban, 70% rural)
- Touch-optimized interactions
- Responsive: 320px to 1920px viewport
- Offline indicators and sync status

**REQ-UX-002**: Low-Bandwidth Optimization
- Initial app: <500MB (including smallest model)
- Progressive download for larger models
- Image optimization: WebP, lazy loading
- API payload compression

**REQ-UX-003**: Low-End Device Support
- 2GB RAM minimum viable
- Graceful degradation (cloud fallback)
- Battery-efficient model inference
- Background sync batching

### 4.2 Educational UX

**REQ-UX-004**: Socratic Interaction Pattern
```
Student: "ช่วยหาคำตอบให้หน่อย" (Help me find the answer)
AI: "ลองบอกครูก่อนว่าน้องเข้าใจโจทย์อย่างไร?"
    (Tell me first, how do you understand the problem?)
Student: [explains understanding]
AI: [asks probing question based on misconception detected]
```

**REQ-UX-005**: Progress Visualization
- Mastery dashboard: Subject → Topic → Concept tree
- Progress indicators: Thai-localized (e.g., ★★★☆☆)
- Historical trend graphs
- Comparison: Self over time (not vs peers)

**REQ-UX-006**: Cultural Sensitivity
- No public leaderboards (face-saving)
- Private progress tracking
- Encouraging language for mistakes
- Respect hierarchy (ครู/นักเรียน relationship)

---

## 5. Technical Stack Requirements

### 5.1 Frontend

**REQ-FE-001**: Framework Selection
- React 18+ with Server Components where applicable
- Tailwind CSS for Thai typography support
- Radix UI for accessible components
- Service Worker for offline capability

**REQ-FE-002**: State Management
- IndexedDB via Dexie.js (offline storage)
- React Query for server state
- Zustand for client state
- Drive sync state machine

### 5.2 Backend

**REQ-BE-001**: Serverless Infrastructure
- Supabase (Singapore region) for auth and minimal user data
- Edge Functions for API endpoints
- Google Drive API integration (OAuth 2.0)

**REQ-BE-002**: AI Serving
- Cloud tier: Anthropic Claude API or self-hosted Qwen2-7B
- Rate limiting: Per-user, per-minute quotas
- Semantic caching for common explanations

### 5.3 Edge Inference

**REQ-EDGE-001**: WebLLM Integration
```javascript
// Device capability detection
async function selectInferenceTier() {
  const memory = navigator.deviceMemory || 2;
  const webgpu = 'gpu' in navigator && await navigator.gpu?.requestAdapter();
  const storage = await navigator.storage.estimate();

  if (memory >= 8 && webgpu) return 'edge';      // Phi-3-mini
  if (memory >= 4) return 'hybrid';              // Qwen2-0.5B
  return 'cloud';                                 // Server inference
}
```

**REQ-EDGE-002**: Model Management
- IndexedDB storage for model weights
- Version tracking and delta updates
- Eviction handling with user notification
- Re-download capability

---

## 6. Success Metrics

### 6.1 Technical Metrics

| Metric | Target (6mo) | Target (12mo) |
|--------|--------------|---------------|
| First Contentful Paint | <2s (3G) | <1.5s (3G) |
| Time to Interactive | <5s (3G) | <4s (3G) |
| Offline capability | 80% features | 95% features |
| Edge inference rate | 30% users | 60% users |
| Crash-free rate | >99% | >99.5% |

### 6.2 User Metrics

| Metric | Target (6mo) | Target (12mo) |
|--------|--------------|---------------|
| Registered users | 10,000 | 100,000 |
| Weekly active users | 5,000 | 50,000 |
| Sessions/user/week | 3 | 5 |
| 30-day retention | 40% | 50% |
| Parent consent rate | 60% | 75% |

### 6.3 Learning Metrics

| Metric | Target (6mo) | Target (12mo) |
|--------|--------------|---------------|
| Math score improvement | +10% | +15% |
| Avg mastery per topic | 0.6 | 0.75 |
| Concept completion rate | 50% | 70% |
| Self-reported satisfaction | 4.0/5 | 4.3/5 |

---

## 7. Risk Mitigations

### 7.1 Technical Risks

| Risk | Probability | Mitigation |
|------|-------------|------------|
| WebLLM OOM crashes | High | Hybrid architecture with cloud fallback |
| Thai quality issues | Medium | Qwen2 selection, prompt engineering |
| Drive sync conflicts | Medium | Version vectors, last-write-wins |
| Storage quota exceeded | Medium | Compression, user notification, cleanup |

### 7.2 Compliance Risks

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Parent consent failures | High | Limited mode, 7-day grace, reminders |
| PDPA violation | Low | Legal review, minimal data, Drive storage |
| Cross-border transfer | Low | Singapore/APEC servers, SCCs |

### 7.3 Adoption Risks

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Low awareness | High | Influencer partnerships, teacher networks |
| Download abandonment | Medium | Progressive download, WiFi prompts |
| Device incompatibility | Medium | Hybrid architecture, graceful degradation |

---

## 8. Phase Mapping

| Requirement Area | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------------------|---------|---------|---------|---------|
| Fork & Brand | ✅ | | | |
| Thai UI Shell | ✅ | ✅ | | |
| Google OAuth | ✅ | | | |
| Device Detection | | ✅ | | |
| Hybrid Inference | | ✅ | | |
| Socratic Prompts | | ✅ | | |
| pyBKT Tracking | | ✅ | | |
| Drive Sync | | ✅ | ✅ | |
| Full Thai UI | | | ✅ | |
| Offline-First | | | ✅ | |
| Dual Consent | | | | ✅ |
| Privacy Policy | | | | ✅ |
| Data Export | | | | ✅ |
| Account Deletion | | | | ✅ |

---

## Sources

- WEBLLM_FEASIBILITY.md: Browser inference benchmarks, model selection
- GDRIVE_INTEGRATION.md: Storage architecture, sync patterns, rate limits
- THAI_EDTECH.md: Market size, device constraints, adoption strategy
- PDPA_COMPLIANCE.md: Legal requirements, consent flows, data rights
