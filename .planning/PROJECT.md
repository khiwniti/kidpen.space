# kidpen.space - Project Context

## Project Identity

**Project Name**: kidpen.space
**Type**: Migration/Transformation (Suna → Educational Platform)
**Domain**: EdTech - Thai Secondary STEM Education
**Scale**: National (4.4M students, ม.1-ม.6)
**Architecture**: Edge-first distributed computing

## Core Vision

Transform Kidpen AI's general-purpose Suna agent into a free, interactive Socratic STEM tutoring platform for Thai secondary students. Leverage edge computing (student devices + Google Drive) to minimize server costs while providing personalized learning at national scale.

## Key Differentiators

1. **Edge-First Computing**: LLM inference runs on student devices (WebLLM/ONNX), not central servers
2. **Google Drive Integration**: Student progress, mastery data, and AI cache stored in user's Drive
3. **Socratic Methodology**: Question-based tutoring, never gives direct answers
4. **Thai Language Native**: PyThaiNLP integration for proper word segmentation and cultural context
5. **Offline Capable**: Students can study after initial model download, sync when connected

## Target Users

### Primary
- **Thai Secondary Students (ม.1-ม.6)**: 4.4 million students ages 12-18
- **Device Reality**: Mostly Chromebooks (2-4GB RAM), Android phones, some Windows laptops
- **Connectivity**: Variable — urban areas have good internet, rural may be intermittent

### Secondary
- **Teachers**: Dashboard view of class mastery, no direct tutoring role
- **Parents**: Consent management (PDPA requirement for minors)

## Technical Constraints

### Device Limitations
- **RAM**: 2-4GB typical for Chromebook
- **Storage**: Limited local, Google Drive for persistence
- **GPU**: Integrated only, WebGPU not universal
- **CPU**: ARM (Chromebook) or low-end x86

### Model Requirements
- **Size**: <2GB quantized model to fit in memory
- **Inference**: ~100 tokens/sec minimum for acceptable UX
- **Candidates**: Phi-3-mini (3.8B), Gemma-2B, Qwen2-1.5B
- **Runtime**: llama.cpp WASM via WebLLM, or ONNX Runtime Web

### Regulatory
- **PDPA Compliance**: Dual consent (parent + student) for minors
- **Data Locality**: Prefer student's own Google Drive over central database
- **AI Safety**: Explicit logging of all AI interactions, content filtering

## Architecture Shift

### From Suna
```
Client → Next.js → FastAPI → LiteLLM → OpenAI/Anthropic
                          → Daytona Sandboxes
                          → Supabase + Redis
```

### To kidpen.space
```
Client (WebLLM inference) → Google Drive (state)
         ↓ (initial setup only)
     Next.js → FastAPI → Model Distribution CDN
                      → Minimal Supabase (auth, analytics)
```

## Scope Boundaries

### In Scope (Phase 1-4)
- Fork and rebrand Suna to kidpen.space
- Thai language UI localization
- Socratic tutoring system prompt
- Edge-first model deployment (WebLLM)
- Google Drive integration for persistence
- Basic PDPA consent flow
- All STEM subjects (Math, Physics, Chemistry, Biology)
- pyBKT mastery tracking (running client-side)

### Out of Scope (Future)
- Teacher dashboard
- School administrator features
- Gamification/badges
- Parent mobile app
- IPST formal curriculum mapping (no partnership yet)
- Real-time collaboration features

## Success Criteria

### Phase 1 (Fork & Brand) - 3+ months
- [ ] kidpen.space domain live with rebranded UI
- [ ] Thai localization complete
- [ ] WebLLM proof-of-concept running in browser

### Phase 2 (Educational Backend)
- [ ] Google Drive integration working
- [ ] Socratic tutoring prompt functional
- [ ] pyBKT mastery tracking operational
- [ ] Subject selector for all 4 STEM areas

### Phase 3 (Frontend Transform)
- [ ] Mobile-responsive for phone users
- [ ] Offline mode with service workers
- [ ] Progress visualization

### Phase 4 (Safety & Launch)
- [ ] PDPA consent flow implemented
- [ ] AI safety logging
- [ ] Public beta launch

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| WebLLM too slow on low-end devices | High | Fallback to server-side for incompatible devices |
| Google Drive API rate limits | Medium | Local-first with periodic sync |
| Model too large for 2GB RAM | High | Use smaller model (Qwen2-1.5B) or server fallback |
| PDPA compliance complexity | Medium | Consult Thai legal counsel, start with simple consent |
| No IPST partnership | Low | Build based on public curriculum, partner later |

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-03-30 | Edge-first architecture | Minimize server costs for free platform at national scale |
| 2024-03-30 | Google Drive for persistence | Students own their data, PDPA compliant, no storage costs |
| 2024-03-30 | All 4 STEM subjects from start | Broader appeal despite more content work |
| 2024-03-30 | 3+ month timeline for Phase 1 | Allow proper architecture shift, no existing partnerships |

## Related Documents

- `.planning/codebase/ARCHITECTURE.md` - Current Suna architecture
- `.planning/codebase/STACK.md` - Technology stack details
- `.planning/REQUIREMENTS.md` - Detailed requirements (to be created)
- `.planning/ROADMAP.md` - Phase breakdown (to be created)
