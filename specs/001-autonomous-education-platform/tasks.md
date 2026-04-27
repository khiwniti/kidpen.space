# Tasks: Kidpen Autonomous Education Platform

**Input**: Design documents from `/specs/001-autonomous-education-platform/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include tests/evals for learning-critical, privacy, safety, billing, RLS/authorization, and autonomous tool-use behavior. Tests should be written before implementation for critical paths.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Include exact file paths in descriptions

## Phase 1: Setup & Source Audit

**Purpose**: Protect existing work and establish merge source of truth.

- [ ] T001 Create source audit report at `docs/merge/2026-04-25-source-audit.md` with `git status`, branch, remotes, and diff stats for `/Users/khiwn/kidpen/kidpen.space` and `/Users/khiwn/kidpen-space`.
- [ ] T002 [P] Secret-scan both source trees excluding `.git`, `node_modules`, `.next`, `.venv`, `.gradle`, build artifacts, and screenshots; document findings in `docs/merge/2026-04-25-source-audit.md`.
- [ ] T003 [P] Create prototype feature inventory at `docs/product/prototype-feature-inventory.md` from `/Users/khiwn/kidpen-space/src/app/page.tsx`, `src/lib/types.ts`, `src/app/api/*`, and `worklog.md`.
- [ ] T004 [P] Create design extraction document at `docs/design/kidpen-spark-of-joy-design-system.md` from prototype colors, fonts, subject worlds, mobile patterns, and reduced-motion behavior.
- [ ] T005 Create schema gap analysis at `docs/merge/education-schema-gap-analysis.md` comparing `/Users/khiwn/kidpen-space/prisma/schema.prisma` with production Supabase migrations.

**Checkpoint**: Merge sources are understood and safe to use.

---

## Phase 2: Foundational Education Backend

**Purpose**: Shared backend/data/auth foundation that blocks user-story implementation.

- [ ] T006 Create `backend/core/education/__init__.py`.
- [ ] T007 Create education API router skeleton in `backend/core/education/api.py` with health/metadata endpoint.
- [ ] T008 Modify `backend/api.py` to include the education router under the production API namespace.
- [ ] T009 [P] Create `backend/core/education/curriculum/service.py` for subject and knowledge component read models.
- [ ] T010 [P] Create `backend/core/education/pdpa/service.py` for consent state helpers.
- [ ] T011 [P] Create `backend/core/education/safety/policy.py` for student AI safety and homework policy constants.
- [ ] T012 [P] Create `backend/core/education/safety/tool_policy.py` for role/tenant/assignment tool policy model.
- [ ] T013 Create Supabase migration `backend/supabase/migrations/<timestamp>_education_platform_gap.sql` for missing education entities from `specs/001-autonomous-education-platform/data-model.md`.
- [ ] T014 Add RLS policies in the migration for student self-access, teacher class access, parent verified relationship access, admin tenant access, and unauthorized denial.
- [ ] T015 [P] Create backend tests `backend/tests/education/test_education_subjects_api.py` for subject listing.
- [ ] T016 [P] Create backend tests `backend/tests/education/test_education_rls.py` for role and consent boundaries.
- [ ] T017 [P] Create backend tests `backend/tests/education/test_tool_policy.py` for allowed/denied tool policy decisions.

**Checkpoint**: Backend router, schema, RLS, and policy skeletons exist and tests fail for missing implementation before coding proceeds.

---

## Phase 3: User Story 1 - Thai Socratic Student Tutor Loop (Priority: P1) 🎯 MVP

**Goal**: Student can ask a Thai question, receive Socratic agent response through production runtime, and see mastery/progress update.

**Independent Test**: Sign in as student, ask Thai homework-like question, verify guidance rather than final answer, verify interaction and mastery update.

### Tests for US1

- [ ] T018 [P] [US1] Create E2E backend test `backend/tests/e2e/test_education_tutor_flow.py` for student question -> agent run -> stream event -> interaction -> mastery update.
- [ ] T019 [P] [US1] Create AI eval dataset `backend/evals/education/test_socratic_tutor_eval.py` for Thai Socratic behavior.
- [ ] T020 [P] [US1] Create AI eval dataset `backend/evals/education/test_homework_guidance_eval.py` for direct-answer prevention.
- [ ] T021 [P] [US1] Create frontend QA/test notes `apps/frontend/src/features/education/tutor-chat/README.md` with student manual QA steps from quickstart.

### Implementation for US1

- [ ] T022 [P] [US1] Create prompt template `backend/core/prompts/education/socratic_tutor.md` from prototype `/Users/khiwn/kidpen-space/src/app/api/chat/route.ts` policy.
- [ ] T023 [P] [US1] Create prompt template `backend/core/prompts/education/homework_coach.md` for hint/check/explain-after-effort behavior.
- [ ] T024 [US1] Implement tutor request classifier in `backend/core/education/tutoring/classifier.py` for concept, homework, check-work, safety, off-topic, and lab intents.
- [ ] T025 [US1] Implement tutor orchestration service in `backend/core/education/tutoring/service.py` using production agent/thread/run APIs.
- [ ] T026 [US1] Implement learning interaction writer in `backend/core/education/mastery/interactions.py`.
- [ ] T027 [US1] Implement mastery update service in `backend/core/education/mastery/service.py`.
- [ ] T028 [US1] Add `POST /education/tutor/messages` endpoint in `backend/core/education/api.py`.
- [ ] T029 [US1] Add `GET /education/tutor/threads/{threadId}` endpoint in `backend/core/education/api.py`.
- [ ] T030 [US1] Add `GET /education/mastery/me` endpoint in `backend/core/education/api.py`.
- [ ] T031 [US1] Create frontend education API client `apps/frontend/src/lib/education/api.ts`.
- [ ] T032 [US1] Create tutor stream hook `apps/frontend/src/hooks/education/useEducationTutorStream.ts` reusing production stream patterns.
- [ ] T033 [US1] Create tutor chat feature components under `apps/frontend/src/features/education/tutor-chat/`.
- [ ] T034 [US1] Create student progress widget under `apps/frontend/src/features/education/progress/`.
- [ ] T035 [US1] Wire student dashboard to tutor/progress features in the production dashboard route.

**Checkpoint**: US1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Interactive Lesson and Practice Flow (Priority: P2)

**Goal**: Student starts a structured Thai lesson, completes checkpoints, and sees mastery/recommendation updates.

**Independent Test**: Launch one subject lesson, submit checkpoint attempts, verify hints and mastery evidence.

### Tests for US2

- [ ] T036 [P] [US2] Create backend test `backend/tests/education/test_lessons_api.py` for lesson start/checkpoint/complete flow.
- [ ] T037 [P] [US2] Create frontend test or QA note `apps/frontend/src/features/education/lessons/README.md` for lesson manual flow.

### Implementation for US2

- [ ] T038 [P] [US2] Create `backend/core/education/lessons/models.py` domain dataclasses/types.
- [ ] T039 [US2] Create `backend/core/education/lessons/service.py` for lesson generation/retrieval/checkpoint handling.
- [ ] T040 [US2] Add lesson endpoints to `backend/core/education/api.py`.
- [ ] T041 [US2] Create frontend lesson feature under `apps/frontend/src/features/education/lessons/`.
- [ ] T042 [US2] Connect lesson checkpoint submissions to interaction/mastery service.

**Checkpoint**: US2 works independently after foundation and US1 mastery services.

---

## Phase 5: User Story 3 - Homework Teaching Engine (Priority: P2)

**Goal**: Student receives coaching for homework without direct answer leakage.

**Independent Test**: Submit homework-like prompts with and without attempts; verify hint/check/explain behavior.

### Tests for US3

- [ ] T043 [P] [US3] Expand `backend/evals/education/test_homework_guidance_eval.py` with Thai homework, check-my-work, and teacher-allowed explanation cases.
- [ ] T044 [P] [US3] Create backend unit tests `backend/tests/education/test_homework_policy.py`.

### Implementation for US3

- [ ] T045 [US3] Implement homework state machine in `backend/core/education/tutoring/homework_policy.py`.
- [ ] T046 [US3] Integrate homework policy with tutor orchestration in `backend/core/education/tutoring/service.py`.
- [ ] T047 [US3] Add UI states for attempt request, hint, check result, and explanation in `apps/frontend/src/features/education/tutor-chat/`.
- [ ] T048 [US3] Log homework policy mode into LearningInteraction and AuditEvent records.

**Checkpoint**: US3 passes direct-answer leakage eval threshold.

---

## Phase 6: User Story 4 - Teacher Assignment and Insight Workflow (Priority: P3)

**Goal**: Teacher creates assignments and sees class progress/misconceptions/interventions.

**Independent Test**: Teacher creates assignment, student completes activity, teacher sees permitted progress.

### Tests for US4

- [ ] T049 [P] [US4] Create backend tests `backend/tests/education/test_teacher_dashboard.py` for teacher role boundaries and class summaries.
- [ ] T050 [P] [US4] Create frontend QA note `apps/frontend/src/features/education/teacher/README.md`.

### Implementation for US4

- [ ] T051 [P] [US4] Create `backend/core/education/assignments/service.py`.
- [ ] T052 [US4] Add teacher assignment/dashboard endpoints to `backend/core/education/api.py`.
- [ ] T053 [US4] Create teacher dashboard feature under `apps/frontend/src/features/education/teacher/`.
- [ ] T054 [US4] Add assignment creation UI and API client methods.
- [ ] T055 [US4] Add intervention suggestion read model from mastery gaps.

**Checkpoint**: Teacher workflow works without exposing unauthorized student data.

---

## Phase 7: User Story 5 - Parent Safety and Progress View (Priority: P3)

**Goal**: Parent views safe progress summaries and manages consent/privacy.

**Independent Test**: Parent links to child, views summary, changes consent, sees visibility update.

### Tests for US5

- [ ] T056 [P] [US5] Create backend tests `backend/tests/education/test_parent_consent.py` for guardian relationship and consent behavior.
- [ ] T057 [P] [US5] Create frontend QA note `apps/frontend/src/features/education/parent/README.md`.

### Implementation for US5

- [ ] T058 [US5] Implement guardian relationship service in `backend/core/education/pdpa/guardian_relationships.py`.
- [ ] T059 [US5] Implement consent endpoints in `backend/core/education/api.py`.
- [ ] T060 [US5] Implement parent dashboard endpoint in `backend/core/education/api.py`.
- [ ] T061 [US5] Create parent dashboard feature under `apps/frontend/src/features/education/parent/`.
- [ ] T062 [US5] Create consent/privacy UI under `apps/frontend/src/features/education/safety/`.

**Checkpoint**: Parent workflow passes relationship and consent visibility tests.

---

## Phase 8: User Story 6 - Safe Computer-Use Learning Lab (Priority: P4)

**Goal**: Role/assignment-bounded computer-use lab with policy enforcement and audit logging.

**Independent Test**: Teacher-approved lab allows permitted action, blocks restricted action, records audit events.

### Tests for US6

- [ ] T063 [P] [US6] Create backend tests `backend/tests/education/test_lab_sessions.py` for lab lifecycle and assignment context.
- [ ] T064 [P] [US6] Create backend tests `backend/tests/education/test_tool_policy_enforcement.py` for pre-tool allow/deny behavior.
- [ ] T065 [P] [US6] Create evals `backend/evals/education/test_tool_policy_eval.py` for prompt-injection and restricted tool cases.

### Implementation for US6

- [ ] T066 [US6] Implement lab session service in `backend/core/education/safety/lab_sessions.py`.
- [ ] T067 [US6] Add `POST /education/labs/sessions` endpoint in `backend/core/education/api.py`.
- [ ] T068 [US6] Modify `backend/core/tools/tool_registry.py` or production tool execution layer to call education tool policy before execution.
- [ ] T069 [US6] Implement audit event writer for tool allow/deny decisions in `backend/core/education/safety/audit.py`.
- [ ] T070 [US6] Create lab UI under `apps/frontend/src/features/education/labs/`.

**Checkpoint**: Student computer-use remains blocked unless explicitly allowed by assignment/tool policy.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T071 [P] Add shared education types/constants in `packages/shared/src/education/` if frontend/mobile/backend contract generation requires them.
- [ ] T072 [P] Add billing/credit attribution tests for tutor and lab runs in `backend/tests/education/test_education_billing.py` if billing is enabled for MVP.
- [ ] T073 Add production observability fields for education tutor runs, safety flags, policy modes, and mastery updates.
- [ ] T074 [P] Add mobile compatibility notes or minimal Expo integration plan under `apps/mobile` once web slice passes.
- [ ] T075 [P] Update `docs/product/thai-socratic-tutor-policy.md` after eval results.
- [ ] T076 Run quickstart validation from `specs/001-autonomous-education-platform/quickstart.md`.
- [ ] T077 Run full relevant backend tests, frontend lint/build, and AI evals.
- [ ] T078 Create final release/UAT report under `docs/merge/education-platform-uat-report.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup & Source Audit**: No dependencies; must finish before migration decisions.
- **Phase 2 Foundational Backend**: Depends on Phase 1; blocks all user stories.
- **US1 Student Tutor Loop**: Depends on Phase 2; MVP slice.
- **US2 Lessons**: Depends on Phase 2 and mastery services from US1.
- **US3 Homework Engine**: Depends on US1 tutor orchestration.
- **US4 Teacher Workflow**: Depends on Phase 2 and learning/mastery data from US1/US2.
- **US5 Parent Workflow**: Depends on Phase 2 consent/relationship foundation.
- **US6 Computer Lab**: Depends on Phase 2 tool policy and audit foundation; should not expose student lab before US1 safety behavior is stable.
- **Phase 9 Polish**: Depends on selected stories for release.

### Parallel Opportunities

- T003, T004, T005 can run after T001 starts.
- T009-T012 and T015-T017 can run in parallel after router direction is clear.
- US1 prompt/eval/frontend scaffolding tasks can run in parallel as long as contracts are stable.
- Teacher and parent UI can begin after contracts are stable, but backend authorization tests must gate completion.

## Implementation Strategy

1. Complete Phase 1 and Phase 2 first.
2. Deliver US1 as MVP and verify with quickstart.
3. Add US3 homework engine next if academic-integrity risk is the highest business concern.
4. Add US2 lessons next if structured learning depth is the highest product concern.
5. Add US4/US5 for classroom/family adoption.
6. Add US6 only after policy/audit tests are trusted.

## MVP Scope Recommendation

MVP should include T001-T035 plus the minimum from T043-T048 needed to enforce homework guidance. Defer full lessons, teacher dashboards, parent dashboards, and computer-use labs until the core learning loop is stable.
