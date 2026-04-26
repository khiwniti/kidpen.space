# Education Schema Gap Analysis

**Date**: 2026-04-26
**Sources compared**:
- Prototype: `kidpen-space/prisma/schema.prisma` (SQLite, 17 models)
- Production: `backend/supabase/migrations/*.sql` (PostgreSQL/Supabase, 244 migrations)
- Spec target: `specs/001-autonomous-education-platform/data-model.md` (14 entities)

## Entity Mapping: Prototype → Production → Spec

### Core Identity & Auth

| Spec Entity | Prototype Model | Production Table | Status |
|-------------|----------------|------------------|--------|
| LearnerProfile | `Student` | `user_profiles` (role='student') | **PARTIAL** — Production has basic profile; missing guardian_consent_state, preferred_language, accessibility_preferences |
| EducatorProfile | `Teacher` | `user_profiles` (role='teacher') | **PARTIAL** — Missing class_ids, permissions, subjects as structured data |
| GuardianRelationship | (Student.parentId) | NOT PRESENT | **GAP** — No guardian relationship table in production. Prototype has only a parentId FK on Student. |
| — | `User`, `UserSession` | `auth.users` (Supabase) | **MISMATCH** — Prototype has custom auth. Production uses Supabase Auth. |

### Subjects & Curriculum

| Spec Entity | Prototype Model | Production Table | Status |
|-------------|----------------|------------------|--------|
| Subject | `Subject` | NOT PRESENT (inline in knowledge_components.subject) | **GAP** — No dedicated Subjects table in production. Prototype has full Subject model with key, name_th, name_en, icon, color, description, order. |
| KnowledgeComponent | `StudentMastery.knowledgeComponentId` (string, no table) | `knowledge_components` | **MISMATCH** — Production has KCs but prototype stores KC IDs as freeform strings without a KC table. Spec requires both. |

### Tutoring & Conversations

| Spec Entity | Prototype Model | Production Table | Status |
|-------------|----------------|------------------|--------|
| TutorThread | `ChatThread` + `ChatMessage` | `threads` (agentpress) | **MAJOR MISMATCH** — Prototype has custom ChatThread/ChatMessage models. Production uses agentpress thread/run system. Spec requires education-specific fields (learner_id, subject_id, kc_id, visibility_policy, safety_flags). |
| LearningInteraction | `StudentInteraction` | `student_interactions` | **PARTIAL** — Production has basic interaction log. Missing: lesson_id, assignment_id, interaction_type enum, evidence_summary, safety_flag. Prototype missing: hint_count (present in production), kcId as FK. |

### Mastery & Assessment

| Spec Entity | Prototype Model | Production Table | Status |
|-------------|----------------|------------------|--------|
| MasteryState | `StudentMastery` | `student_kc_mastery` | **PARTIAL** — Both have p_mastery, opportunity/correct counts. Production adds BKT parameters (p_transit, p_slip, p_guess). Spec adds confidence and last_evidence_interaction_id. Prototype's compound unique on [studentId, knowledgeComponentId] == production's primary key. |

### Lessons & Assignments

| Spec Entity | Prototype Model | Production Table | Status |
|-------------|----------------|------------------|--------|
| Lesson | NOT PRESENT | NOT PRESENT | **GAP** — Neither has a Lesson entity. Spec defines full lesson structure with content_blocks, checkpoint_items, practice_items. |
| Assignment | `Assignment` | NOT PRESENT | **GAP** — Production has no Assignments. Prototype has basic Assignment model but missing: knowledge_component_ids, allowed_tool_policy_id, homework_solution_policy, rubric. |

### Safety & Lab

| Spec Entity | Prototype Model | Production Table | Status |
|-------------|----------------|------------------|--------|
| ComputerLabSession | NOT PRESENT | NOT PRESENT | **GAP** — Neither has lab sessions. Spec requires sandbox_id, agent_run_id, tool_policy_id. |
| — | (no tool policy model) | NOT PRESENT | **GAP** — No tool policy model in either system. |

### Privacy & Audit

| Spec Entity | Prototype Model | Production Table | Status |
|-------------|----------------|------------------|--------|
| ConsentRecord | (handled via Student consent fields) | `consent_records` + `parental_consents` | **DUPLICATED/PARTIAL** — Production has both consent_records (from education schema) and parental_consents (from PDPA phase 1). Prototype embeds consent in Student. Spec requires a dedicated ConsentRecord with scope, status enum, policy_version. |
| AuditEvent | NOT PRESENT | `ai_safety_log` | **PARTIAL** — Production has ai_safety_log but it's safety-specific. Spec requires general AuditEvent for tool policy decisions, sensitive data access, consent changes, billing events. |

### Multi-Tenant

| Spec Entity | Prototype Model | Production Table | Status |
|-------------|----------------|------------------|--------|
| — | `Tenant` | (implicit in schools/courses) | **DIFFERENT APPROACH** — Prototype has explicit RBAC Tenant model. Production uses schools + user_profiles school_id. Different granularity. |

---

## Gap Summary: What's Missing from Production

### Critical Gaps (Blocking Education Features)

1. **Subjects table** — No dedicated subjects table. Knowledge components reference subjects as free-text strings. Need: `subjects` table aligned with spec Subject entity.

2. **GuardianRelationship table** — No parent-student relationship tracking. Need: table linking guardian users to learners with relationship_type, verification_status, visibility_scope.

3. **Lesson table** — Neither system has lessons. Need: full Lesson entity with content_blocks (JSONB), checkpoint_items, practice_items, review_status.

4. **Assignment enhancements** — Production has no assignments table. Prototype's Assignment is basic. Need: spec-aligned Assignment with knowledge_component_ids, tool_policy_id, homework_solution_policy.

5. **TutorThread education fields** — Production threads lack education-specific columns. Need: learner_id, subject_id, knowledge_component_id, visibility_policy, safety_flags on or linked to threads.

6. **AuditEvent table** — No general audit log. Need: unified AuditEvent for tool policy, consent, safety, billing events.

### Partial Gaps (Need Enhancement)

7. **user_profiles** — Add guardian_consent_state, preferred_language, accessibility_preferences fields.

8. **student_interactions** — Add interaction_type enum, lesson_id, assignment_id, evidence_summary, safety_flag.

9. **student_kc_mastery** — Add confidence field, last_evidence_interaction_id.

10. **consent_records** — Unify with parental_consents. Add scope, policy_version, expires_at.

### Design Differences (Need Reconciliation)

11. **Auth system** — Prototype custom RBAC vs Production Supabase Auth. Production approach should prevail; prototype RBAC concepts (roles with permissions) should inform RLS policies.

12. **Thread system** — Prototype custom ChatThread vs Production agentpress. Production agentpress should prevail; education metadata should be added as thread metadata or linked table.

13. **Subject key alignment** — Prototype: math, physics, chemistry, biology, cs. Production knowledge_components: math, science, physics, coding. Need to standardize.

---

## Recommended Migration Approach

### Phase 1: Production Schema Enhancement (this migration)

```sql
-- New tables needed:
CREATE TABLE subjects (...);           -- T013
CREATE TABLE guardian_relationships (...); -- T013
CREATE TABLE lessons (...);           -- T013
CREATE TABLE assignments (...);       -- T013
CREATE TABLE computer_lab_sessions (...); -- T013
CREATE TABLE audit_events (...);      -- T013
CREATE TABLE tool_policies (...);     -- T013

-- Enhance existing tables:
ALTER TABLE user_profiles ADD COLUMN preferred_language ...;
ALTER TABLE user_profiles ADD COLUMN accessibility_preferences ...;
ALTER TABLE student_interactions ADD COLUMN interaction_type ...;
ALTER TABLE student_kc_mastery ADD COLUMN confidence ...;
```

### Phase 2: Gap Closure

-综合性R2: Unify consent tables
- Add RLS policies for new tables (T014)
- Seed subjects data from prototype definitions

### Phase 3: Bridge Prototype Data

- Migrate prototype student mastery → production student_kc_mastery
- Map prototype ChatThread → production threads with education metadata
- Convert prototype RBAC roles → production RLS policies

---

## Entity Count Comparison

| System | Tables/Models |
|--------|--------------|
| Prototype (Prisma) | 17 models |
| Production education schema | 9 tables (schools, user_profiles, knowledge_components, student_kc_mastery, student_interactions, courses, course_enrollments, consent_records, ai_safety_log) |
| Production PDPA phase 1 | 2 additional tables (users, parental_consents) |
| Spec target | 14 entities |
| **Gap**: New tables needed | 6 (subjects, guardian_relationships, lessons, assignments, computer_lab_sessions, audit_events, tool_policies) |
| **Gap**: Tables needing enhancement | 4 (user_profiles, student_interactions, student_kc_mastery, consent_records/parental_consents) |