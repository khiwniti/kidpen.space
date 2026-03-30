# kidpen.space Development Roadmap
## Thai STEM Tutoring Platform - Phase-Based Implementation

**Version**: 1.0
**Generated**: 2026-03-30
**Based on**: REQUIREMENTS.md, Research Documents
**Architecture**: Hybrid Tiered (Research-Validated)

---

## Roadmap Overview

```
PHASE 1 (Weeks 1-6)          PHASE 2 (Weeks 7-14)
├── Fork & Brand             ├── Educational Backend
├── Google OAuth             ├── Hybrid Inference
├── Basic Thai UI            ├── pyBKT Integration
└── Infrastructure           └── Drive Sync
        │                            │
        ▼                            ▼
PHASE 3 (Weeks 15-20)        PHASE 4 (Weeks 21-26)
├── Full Thai UI             ├── PDPA Compliance
├── Offline-First            ├── Dual Consent
├── Progressive Download     ├── Data Export/Delete
└── Mobile Optimization      └── Production Launch
```

---

## Phase 1: Fork & Foundation (Weeks 1-6)

### Objective
Establish kidpen.space fork with Thai branding, authentication, and basic infrastructure.

### Success Criteria
- [ ] Suna fork deployed at kidpen.space domain
- [ ] Google OAuth working with Thai localization
- [ ] Basic Thai UI shell with navigation
- [ ] Supabase Singapore region configured
- [ ] CI/CD pipeline operational

### Tasks

#### 1.1 Repository Setup (Week 1)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Fork Suna repository | P0 | 2 | - |
| Rename to kidpen.space | P0 | 1 | 1.1.1 |
| Update package.json, configs | P0 | 2 | 1.1.2 |
| Configure .env structure | P0 | 2 | 1.1.2 |
| Set up GitHub Actions CI | P1 | 4 | 1.1.3 |

#### 1.2 Infrastructure (Week 2)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Provision Supabase (Singapore) | P0 | 2 | - |
| Create users table schema | P0 | 3 | 1.2.1 |
| Create parental_consents table | P0 | 2 | 1.2.1 |
| Configure Vercel/deployment | P1 | 4 | 1.1.5 |
| Set up staging environment | P1 | 3 | 1.2.4 |

#### 1.3 Authentication (Weeks 3-4)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Implement Google OAuth flow | P0 | 8 | 1.2.1 |
| Thai localization for login UI | P0 | 4 | 1.3.1 |
| Age verification (birth year) | P0 | 6 | 1.3.1 |
| Grade level selection (ม.1-ม.6) | P0 | 4 | 1.3.1 |
| Session management | P1 | 6 | 1.3.1 |

#### 1.4 Thai UI Shell (Weeks 5-6)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Replace Suna branding | P0 | 4 | - |
| Thai navigation structure | P0 | 6 | 1.4.1 |
| Thai typography setup (Sarabun) | P0 | 3 | - |
| Responsive shell (320-1920px) | P1 | 8 | 1.4.2 |
| Basic subject selection UI | P1 | 6 | 1.4.2 |

### Phase 1 Deliverables
- Branded kidpen.space landing page
- Working Google OAuth with Thai UI
- User registration with grade level
- Supabase users + consents tables
- Deployed staging environment

### Technical Decisions (Phase 1)
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth provider | Google OAuth | Target users have Google accounts |
| Database region | Singapore | PDPA compliance, low latency |
| Font | Sarabun | Open source Thai font |
| Framework | React 18+ | Existing Suna foundation |

---

## Phase 2: Educational Backend (Weeks 7-14)

### Objective
Implement hybrid LLM inference, Socratic tutoring system, and pyBKT mastery tracking.

### Success Criteria
- [ ] Device capability detection working
- [ ] Tier 1/2/3 inference routing functional
- [ ] Socratic tutoring system prompt active
- [ ] pyBKT mastery scores calculating
- [ ] IndexedDB learning state storage
- [ ] Google Drive sync operational

### Tasks

#### 2.1 Device Detection (Week 7)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Implement capability detection | P0 | 8 | - |
| navigator.deviceMemory check | P0 | 2 | 2.1.1 |
| WebGPU availability test | P0 | 4 | 2.1.1 |
| Storage quota estimation | P0 | 3 | 2.1.1 |
| Tier assignment logic | P0 | 4 | 2.1.2-4 |

```javascript
// REQ-ARCH-001 Implementation
async function selectInferenceTier() {
  const memory = navigator.deviceMemory || 2;
  const webgpu = 'gpu' in navigator && await navigator.gpu?.requestAdapter();
  const storage = await navigator.storage.estimate();

  if (memory >= 8 && webgpu) return 'edge';      // Phi-3-mini
  if (memory >= 4) return 'hybrid';              // Qwen2-0.5B
  return 'cloud';                                 // Server inference
}
```

#### 2.2 Hybrid Inference Setup (Weeks 8-10)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| WebLLM integration | P0 | 12 | 2.1 |
| Qwen2-0.5B model setup | P0 | 8 | 2.2.1 |
| Cloud fallback API | P0 | 10 | - |
| Progressive model download | P0 | 12 | 2.2.2 |
| WiFi detection + prompt | P1 | 4 | 2.2.4 |
| OOM error handling | P0 | 6 | 2.2.1 |
| Seamless tier fallback | P0 | 8 | 2.2.3, 2.2.6 |

#### 2.3 Socratic Tutoring System (Weeks 11-12)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Thai system prompt design | P0 | 8 | - |
| Socratic dialogue templates | P0 | 10 | 2.3.1 |
| Never-give-answer logic | P0 | 6 | 2.3.2 |
| Misconception detection | P1 | 8 | 2.3.2 |
| Encouragement patterns (Thai) | P0 | 4 | 2.3.1 |
| Subject-specific prompts | P1 | 12 | 2.3.2 |

```markdown
## Socratic Prompt Template (REQ-LOC-002)
System: ครูพี่เลี้ยง (supportive tutor, not authority)
Method: ถามนำ (guiding questions, never give direct answers)
Cultural: Face-saving, encouragement on mistakes
Adaptation: pyBKT mastery-aware difficulty scaling
```

#### 2.4 pyBKT Integration (Week 13)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| pyBKT client implementation | P0 | 12 | - |
| Knowledge component mapping | P0 | 8 | 2.4.1 |
| Mastery calculation logic | P0 | 6 | 2.4.1 |
| IndexedDB storage schema | P0 | 4 | - |
| Mastery-to-difficulty adapter | P1 | 6 | 2.4.3 |

#### 2.5 Google Drive Sync (Week 14)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| drive.appdata scope setup | P0 | 6 | 1.3.1 |
| IndexedDB ↔ Drive sync | P0 | 12 | 2.5.1 |
| Conflict resolution (LWW) | P0 | 8 | 2.5.2 |
| Compression (10x target) | P1 | 4 | 2.5.2 |
| Background sync (15-30min) | P0 | 6 | 2.5.2 |

### Phase 2 Deliverables
- Device tier detection and routing
- Working Qwen2-0.5B edge inference (Tier 2-3)
- Cloud API fallback (Tier 1)
- Socratic tutoring dialogue system
- pyBKT mastery tracking
- IndexedDB + Drive sync operational

### Technical Decisions (Phase 2)
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Edge model | Qwen2-0.5B-INT4 | Best Thai in small models (400MB) |
| Cloud model | Qwen2-7B or Claude | Full Thai capability |
| BKT library | pyBKT WASM port | Client-side mastery |
| Sync interval | 15-30 min | Balance freshness vs. battery |

---

## Phase 3: Thai UI Transformation (Weeks 15-20)

### Objective
Complete Thai-native user experience with offline-first capability and mobile optimization.

### Success Criteria
- [ ] 100% Thai student-facing UI
- [ ] Offline mode functional (80% features)
- [ ] Mobile-first responsive design
- [ ] Progress visualization dashboard
- [ ] <500KB initial app bundle

### Tasks

#### 3.1 Full Thai Localization (Weeks 15-16)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Complete Thai translations | P0 | 16 | - |
| Thai STEM terminology | P0 | 12 | 3.1.1 |
| Cultural context problems | P0 | 10 | 3.1.2 |
| Thai number formatting | P1 | 4 | - |
| Remove all English from UI | P0 | 8 | 3.1.1-4 |

#### 3.2 Offline-First PWA (Weeks 17-18)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Service Worker setup | P0 | 8 | - |
| App shell caching | P0 | 6 | 3.2.1 |
| Offline indicator UI | P0 | 4 | 3.2.1 |
| Sync status display | P0 | 4 | 3.2.3 |
| Background sync queue | P0 | 8 | 3.2.1 |
| Model cache management | P1 | 6 | 2.2.4 |

#### 3.3 Mobile Optimization (Weeks 19-20)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Touch-first interactions | P0 | 8 | - |
| 320px viewport support | P0 | 6 | 3.3.1 |
| Battery-efficient inference | P1 | 8 | 2.2 |
| Low-bandwidth image opt | P1 | 4 | - |
| WebP + lazy loading | P1 | 4 | 3.3.4 |

#### 3.4 Progress Visualization (Week 20)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Mastery dashboard UI | P0 | 10 | 2.4 |
| Subject → Topic → Concept tree | P0 | 8 | 3.4.1 |
| Thai progress indicators | P0 | 4 | 3.4.1 |
| Historical trend graphs | P1 | 6 | 3.4.1 |
| Self-comparison (not peers) | P0 | 4 | 3.4.1 |

### Phase 3 Deliverables
- Zero-English student interface
- Offline mode with 80% feature parity
- Mobile-optimized touch UI
- Mastery visualization dashboard
- PWA with install capability

### Technical Decisions (Phase 3)
| Decision | Choice | Rationale |
|----------|--------|-----------|
| PWA strategy | Offline-first | 35-40% users need offline |
| Image format | WebP | 30% smaller than JPEG |
| Thai NLP | PyThaiNLP WASM | Word segmentation client-side |
| Progress display | Stars (★★★☆☆) | Thai-localized, no numbers |

---

## Phase 4: PDPA Compliance & Launch (Weeks 21-26)

### Objective
Implement full PDPA compliance, dual consent system, and prepare for production launch.

### Success Criteria
- [ ] Dual consent flow operational
- [ ] Parent email verification working
- [ ] Data export feature complete
- [ ] Account deletion flow complete
- [ ] Privacy policy published (Thai + English)
- [ ] Production deployment ready

### Tasks

#### 4.1 Dual Consent System (Weeks 21-22)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Student consent UI | P0 | 6 | - |
| Parent email collection | P0 | 4 | 4.1.1 |
| Consent email generation | P0 | 8 | 4.1.2 |
| Email verification flow | P0 | 8 | 4.1.3 |
| Limited access mode | P0 | 10 | 4.1.1 |
| 7-day grace period logic | P0 | 4 | 4.1.5 |
| Consent reminder system | P1 | 6 | 4.1.5 |

```
LIMITED ACCESS MODE (REQ-PDPA-002):
├── ✅ Browse curriculum
├── ✅ Read content
├── ❌ AI tutoring (blocked)
├── ❌ Progress tracking (blocked)
├── ❌ Drive sync (blocked)
└── 🔔 Persistent consent reminder
```

#### 4.2 Data Rights Features (Weeks 23-24)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Data export (JSON/CSV) | P0 | 10 | - |
| Thai field names in export | P0 | 4 | 4.2.1 |
| Account deletion flow | P0 | 12 | - |
| 72-hour waiting period | P0 | 4 | 4.2.3 |
| Drive cleanup instructions | P0 | 4 | 4.2.3 |
| Deletion confirmation email | P0 | 4 | 4.2.4 |
| Anonymized audit logging | P1 | 6 | 4.2.3 |

#### 4.3 Privacy Documentation (Week 25)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Privacy policy (Thai) | P0 | 8 | - |
| Privacy policy (English) | P0 | 6 | 4.3.1 |
| Terms of service (Thai) | P0 | 6 | - |
| Terms of service (English) | P0 | 4 | 4.3.3 |
| Cookie consent banner | P0 | 4 | - |
| Consent logging system | P0 | 6 | 4.1 |

#### 4.4 Production Launch (Week 26)
| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| Security audit | P0 | 16 | All |
| Performance testing | P0 | 8 | All |
| Legal review | P0 | External | 4.3 |
| Production deployment | P0 | 8 | 4.4.1-3 |
| Monitoring setup | P0 | 6 | 4.4.4 |
| Soft launch (beta users) | P0 | 4 | 4.4.4 |

### Phase 4 Deliverables
- Complete PDPA-compliant consent flow
- Data portability (export) feature
- Account deletion with 72-hour wait
- Published privacy documentation
- Production-ready deployment
- Beta launch with initial users

### Technical Decisions (Phase 4)
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Consent method | Email + OTP | Parent verification |
| Grace period | 7 days | Allow time for parent consent |
| Deletion wait | 72 hours | Prevent accidental deletion |
| Audit format | Anonymized | PDPA compliance |

---

## Risk Mitigation Schedule

### Technical Risks
| Risk | Phase | Mitigation | Owner |
|------|-------|------------|-------|
| WebLLM OOM crashes | 2 | Hybrid architecture with cloud fallback | Backend |
| Thai quality issues | 2 | Qwen2 selection, prompt engineering | AI/NLP |
| Drive sync conflicts | 2 | Version vectors, last-write-wins | Backend |
| Storage quota exceeded | 3 | Compression, user notification | Frontend |

### Compliance Risks
| Risk | Phase | Mitigation | Owner |
|------|-------|------------|-------|
| Parent consent failures | 4 | Limited mode, 7-day grace, reminders | Product |
| PDPA violation | 4 | Legal review, minimal data, Drive storage | Legal |
| Cross-border transfer | 1 | Singapore/APEC servers, SCCs | Infra |

### Adoption Risks
| Risk | Phase | Mitigation | Owner |
|------|-------|------------|-------|
| Low awareness | 4+ | Influencer partnerships, teacher networks | Marketing |
| Download abandonment | 2 | Progressive download, WiFi prompts | UX |
| Device incompatibility | 2 | Hybrid architecture, graceful degradation | Backend |

---

## Metrics & Milestones

### Phase 1 Milestones
| Milestone | Target Date | Metric |
|-----------|-------------|--------|
| Fork deployed | Week 1 | Site accessible |
| OAuth working | Week 4 | User can register |
| Thai UI shell | Week 6 | Navigation functional |

### Phase 2 Milestones
| Milestone | Target Date | Metric |
|-----------|-------------|--------|
| Tier detection | Week 7 | 95% accuracy |
| Edge inference | Week 10 | 10+ tok/s Tier 2 |
| Socratic system | Week 12 | Dialogue working |
| Drive sync | Week 14 | Cross-device sync |

### Phase 3 Milestones
| Milestone | Target Date | Metric |
|-----------|-------------|--------|
| Full Thai UI | Week 16 | 0% English |
| Offline mode | Week 18 | 80% feature parity |
| Mobile ready | Week 20 | Touch-first |

### Phase 4 Milestones
| Milestone | Target Date | Metric |
|-----------|-------------|--------|
| Consent flow | Week 22 | E2E working |
| Data rights | Week 24 | Export/Delete functional |
| Legal ready | Week 25 | Policies published |
| Launch | Week 26 | Production live |

---

## Success Metrics (Post-Launch)

### 6-Month Targets
| Metric | Target |
|--------|--------|
| Registered users | 10,000 |
| Weekly active users | 5,000 |
| Sessions/user/week | 3 |
| 30-day retention | 40% |
| Parent consent rate | 60% |
| Edge inference rate | 30% |

### 12-Month Targets
| Metric | Target |
|--------|--------|
| Registered users | 100,000 |
| Weekly active users | 50,000 |
| Sessions/user/week | 5 |
| 30-day retention | 50% |
| Parent consent rate | 75% |
| Edge inference rate | 60% |
| Math score improvement | +15% |

---

## Team Requirements

### Phase 1-2
- 1x Full-stack Engineer (React, Node.js)
- 1x ML/AI Engineer (WebLLM, Qwen2)
- 0.5x Designer (Thai UI)

### Phase 3-4
- 1x Frontend Engineer (PWA, mobile)
- 0.5x Legal/Compliance (PDPA)
- 1x QA (testing, accessibility)

---

## Dependencies & Blockers

### External Dependencies
| Dependency | Phase | Risk | Mitigation |
|------------|-------|------|------------|
| Qwen2-0.5B availability | 2 | Low | Model already released |
| Google OAuth approval | 1 | Low | Standard API |
| Legal review | 4 | Medium | Early engagement |

### Internal Dependencies
```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
   │           │           │           │
   └── Auth ───┴── Inference ──────────┘
                    │
              Drive Sync ──► Offline ──► Consent
```

---

## Next Steps

After roadmap approval:
1. Run `/gsd:plan-phase 1` to begin Phase 1 execution
2. Create detailed sprint plans for Week 1-2
3. Set up development environment
4. Begin repository fork and branding

---

*Generated from REQUIREMENTS.md and research documents*
*Architecture: Hybrid Tiered (Research-Validated)*
