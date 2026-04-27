# Feature Specification: Kidpen Autonomous Education Platform

**Feature Branch**: `001-autonomous-education-platform`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: User description: "Create a comprehensive Spec Kit plan, starting from constitution, to merge the production-grade autonomous agent SaaS in `/Users/khiwn/kidpen/kidpen.space` with the product outcome prototype in `/Users/khiwn/kidpen-space` into a complete AI autonomous agent platform for education: interactive lessons, AI-powered learning, homework teaching engine, teacher/parent workflows, safe computer-use, and more."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Thai Socratic Student Tutor Loop (Priority: P1)

A Thai student signs in, opens the learning dashboard, chooses a subject or asks a question, and receives Thai-first Socratic tutoring that guides them through reasoning instead of directly giving homework answers. The student can continue the conversation, receive hints, practice follow-up questions, and see progress/mastery update after the interaction.

**Why this priority**: This is the core learning value and the smallest complete vertical slice proving that the production agent platform can power the education product outcome.

**Independent Test**: Can be fully tested by signing in as a student, asking a homework-like Thai subject question, verifying the assistant guides rather than solves directly, and confirming the learning interaction is recorded and visible in progress.

**Acceptance Scenarios**:

1. **Given** a signed-in student with consent and a selected subject, **When** they ask a concept question in Thai, **Then** the tutor responds in Thai with guiding questions, examples, and next steps appropriate to the student's level.
2. **Given** a signed-in student asks for a direct homework answer, **When** the tutor classifies the request as homework-like, **Then** the tutor asks for the student's attempt or gives a hint rather than directly providing the final answer.
3. **Given** the student completes a tutoring interaction, **When** the response is finished, **Then** the platform records the interaction, updates mastery/progress signals, and shows the update in the student dashboard.
4. **Given** AI response streaming or the model provider fails, **When** the student submits a question, **Then** the system shows a safe fallback message and does not lose the submitted question or corrupt progress data.

---

### User Story 2 - Interactive Lesson and Practice Flow (Priority: P2)

A student chooses a learning path topic and receives an interactive lesson with explanation, examples, checkpoints, practice questions, hints, and recap. The experience adapts to their prior mastery and records practice attempts.

**Why this priority**: Interactive lessons turn chat into structured learning and make the product more than a generic AI assistant.

**Independent Test**: Can be tested by launching one subject lesson, completing checkpoint questions, and verifying attempts affect mastery and recommended next practice.

**Acceptance Scenarios**:

1. **Given** a student selects a subject and topic, **When** they start a lesson, **Then** the platform presents a Thai lesson with objective, explanation, example, and first checkpoint.
2. **Given** the student answers a checkpoint incorrectly, **When** the answer is submitted, **Then** the platform provides a hint/scaffold and logs the attempt without penalizing unsafe or discouraging language.
3. **Given** the student completes the lesson, **When** the summary appears, **Then** the platform shows learned concepts, remaining gaps, recommended next step, and progress change.

---

### User Story 3 - Homework Teaching Engine (Priority: P2)

A student enters or uploads homework context and receives coaching that helps them understand and solve the work themselves. The engine distinguishes between "teach me", "check my work", and "do it for me" requests.

**Why this priority**: Homework help is a high-demand use case but must protect academic integrity and learning outcomes.

**Independent Test**: Can be tested by submitting homework-like prompts and verifying the engine consistently guides, hints, checks attempts, and explains after effort rather than directly solving.

**Acceptance Scenarios**:

1. **Given** a student submits a homework problem with no attempt, **When** they ask for the answer, **Then** the engine asks them to try a first step or gives a minimal hint.
2. **Given** a student submits their work, **When** they ask for checking, **Then** the engine identifies correct and incorrect steps and explains the next correction.
3. **Given** a teacher-configured assignment allows solution review after submission, **When** the student has attempted the task, **Then** the engine can provide a full explanation while still emphasizing learning.

---

### User Story 4 - Teacher Assignment and Insight Workflow (Priority: P3)

A teacher creates lessons or assignments, monitors class progress, reviews mastery gaps, and receives AI-generated intervention suggestions for students who need help.

**Why this priority**: Teacher workflows turn the platform into classroom infrastructure and create institutional adoption value.

**Independent Test**: Can be tested by signing in as a teacher, creating an assignment, having a student complete practice, and verifying the teacher sees aggregate and individual progress within role boundaries.

**Acceptance Scenarios**:

1. **Given** a signed-in teacher in a tenant/class, **When** they create an assignment, **Then** students in the class can see and start it.
2. **Given** students complete interactions, **When** the teacher opens the dashboard, **Then** they see class mastery, common misconceptions, and suggested interventions.
3. **Given** a teacher views a student, **When** privacy restrictions apply, **Then** the teacher sees permitted educational summaries and not disallowed private data.

---

### User Story 5 - Parent Safety and Progress View (Priority: P3)

A parent links to a child account, reviews safe progress summaries, receives home practice suggestions, and manages privacy/consent settings.

**Why this priority**: Parents are central to child safety, PDPA consent, and at-home learning support.

**Independent Test**: Can be tested by signing in as a parent, linking to a child, viewing progress, and changing consent/privacy settings.

**Acceptance Scenarios**:

1. **Given** a parent has a verified child link, **When** they open the dashboard, **Then** they see safe progress summaries, strengths, gaps, and suggested support activities.
2. **Given** a parent changes consent settings, **When** the setting is saved, **Then** all affected visibility and data-use behavior updates consistently.
3. **Given** a parent lacks consent or relationship verification, **When** they request child data, **Then** the platform denies access with a clear explanation.

---

### User Story 6 - Safe Computer-Use Learning Lab (Priority: P4)

A student or teacher launches a controlled learning lab where autonomous agents can use approved browser/file/simulation/coding tools within a role- and assignment-bounded policy.

**Why this priority**: Computer-use differentiates the platform but is higher risk and should follow core tutoring and safety foundations.

**Independent Test**: Can be tested by starting a teacher-approved coding or simulation lab, verifying allowed actions succeed, restricted actions are blocked, and audit logs are created.

**Acceptance Scenarios**:

1. **Given** a student starts an approved lab, **When** the agent uses allowed tools, **Then** the tools operate within the configured assignment context and audit events are recorded.
2. **Given** a student or prompt attempts a restricted action, **When** the tool call is evaluated, **Then** the platform blocks the action and records a policy-denial event.
3. **Given** a teacher starts a higher-privilege lab, **When** they configure allowed resources, **Then** the policy applies to all student runs created from that assignment.

---

### Edge Cases

- A student asks for direct homework answers, exam cheating, or answer-only output.
- A student sends unsafe, self-harm, bullying, sexual, violent, or emotionally concerning messages.
- A parent/teacher attempts to view student data without consent, tenant membership, or relationship verification.
- A teacher belongs to multiple tenants/classes with different permissions.
- AI provider, streaming, billing, sandbox, database, or storage services are unavailable.
- Existing prototype data conflicts with production Supabase data shapes.
- A student tries to use browser/computer tools outside an approved assignment.
- A prompt injection attempts to bypass tutoring, safety, or tool policies.
- A mobile client is offline or reconnects after a partially completed lesson.
- Thai and English mixed-language input must still preserve Thai-first learning behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Thai-first student learning dashboard with subjects, current progress, recommended next actions, recent conversations, assignments, and safety/accessibility controls.
- **FR-002**: System MUST provide a Socratic AI tutor that guides students through reasoning and asks scaffolded questions before giving final explanations.
- **FR-003**: System MUST detect homework-like requests and enforce a homework teaching policy that prioritizes hints, attempts, checking, and explanation-after-effort over direct answer delivery.
- **FR-004**: System MUST record tutoring, lesson, practice, and homework interactions as learning events tied to student, subject, topic/knowledge component, thread/run, and timestamp.
- **FR-005**: System MUST update student progress/mastery signals after relevant learning events and expose those updates to authorized student, teacher, and parent views.
- **FR-006**: System MUST provide interactive lessons with objectives, explanations, examples, checkpoints, hints, practice questions, and summaries.
- **FR-007**: System MUST provide teacher workflows for creating assignments/lessons, viewing class progress, identifying mastery gaps, and receiving suggested interventions.
- **FR-008**: System MUST provide parent workflows for safe child progress summaries, home practice suggestions, relationship-based access, and consent/privacy management.
- **FR-009**: System MUST enforce role, tenant, relationship, consent, and age/grade authorization for every student-data access path.
- **FR-010**: System MUST support PDPA-oriented consent capture, consent history, data export, data deletion request flow, retention metadata, and audit trail for student data usage.
- **FR-011**: System MUST provide AI safety behavior for unsafe, off-topic, emotionally concerning, or policy-violating messages, including appropriate Thai support guidance where needed.
- **FR-012**: System MUST expose autonomous agent capabilities through production-controlled agent runs with observable lifecycle state, streaming response status, cancellation, retry/failure handling, and cost/credit attribution.
- **FR-013**: System MUST define and enforce a tool policy matrix before exposing computer-use to students, including allowed/denied tools by role, tenant, assignment, age/grade, and consent state.
- **FR-014**: System MUST audit computer-use actions, including tool name, actor, role, assignment context, target resource, allow/deny result, and run/thread identifiers.
- **FR-015**: System MUST preserve the product UX intent from the prototype without importing demo-only security, auth, storage, or monolithic code patterns into production.
- **FR-016**: System MUST provide billing/credit attribution for AI tutoring, premium lesson generation, and computer-use runs where applicable.
- **FR-017**: System MUST provide mobile-compatible flows for the core student tutor loop and safe progress review.
- **FR-018**: System MUST include AI evaluation datasets for Thai Socratic behavior, homework guidance, safety escalation, hallucination resistance, and tool-policy compliance.
- **FR-019**: System MUST include role-specific QA flows for student, teacher, parent, admin, and super admin.
- **FR-020**: System MUST support graceful degradation when AI, billing, sandbox, or streaming dependencies fail, without data corruption or unsafe responses.

### Key Entities *(include if feature involves data)*

- **Learner Profile**: Student identity, grade level, tenant/class membership, consent state, preferences, language, accessibility settings, and guardian links.
- **Educator Profile**: Teacher identity, tenant/class assignments, permitted subjects, and authorized student access.
- **Guardian Relationship**: Verified parent/guardian link to a learner, consent permissions, visibility limits, and audit history.
- **Subject**: Thai/English subject names, icon/color identity, curriculum alignment, grade coverage, and learning paths.
- **Knowledge Component**: Curriculum concept or skill tracked for mastery, subject, grade, standard mapping, prerequisites, and assessment metadata.
- **Learning Interaction**: Event generated from chat, lesson, quiz, homework, or lab activity with outcome, scaffolding level, correctness, and timing.
- **Mastery State**: Student-by-knowledge-component progress estimate, opportunities, correct attempts, confidence, last practiced time, and evidence source.
- **Tutor Thread**: Conversation context, messages, subject/topic metadata, agent run references, safety flags, and visibility policy.
- **Lesson**: Structured learning activity with objectives, content blocks, checkpoints, practice items, and completion summary.
- **Assignment**: Teacher-created or system-generated task with due date, permitted tools, rubric, visibility, and submission state.
- **Computer Lab Session**: Sandboxed activity with role/tool policy, assignment context, agent run, artifacts, audit events, and lifecycle status.
- **Consent Record**: Actor, student, permission scope, timestamp, version, expiration/withdrawal, and data-use implication.
- **Audit Event**: Security/privacy/tool/billing/safety-relevant event with actor, target, action, result, and trace identifiers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student can complete the core tutor loop from login to streamed Socratic response to visible progress update in under 3 minutes during manual QA.
- **SC-002**: At least 95% of homework-like evaluation prompts receive guidance/checking/scaffolding rather than a direct final answer before student effort.
- **SC-003**: At least 95% of Thai tutoring evaluation prompts are answered primarily in Thai with age-appropriate tone and no unsupported claims about being a human teacher.
- **SC-004**: Role-boundary tests verify that students, teachers, parents, admins, and unauthenticated users can access only their permitted data in all tested flows.
- **SC-005**: Consent changes take effect across parent/teacher visibility and AI data-use paths within one user session.
- **SC-006**: Student-facing computer-use denies 100% of restricted tool-policy test cases and records an audit event for each denial.
- **SC-007**: Core student tutor and dashboard pages meet mobile viewport acceptance checks without blocking hydration or JavaScript errors.
- **SC-008**: AI provider failure, stream interruption, and sandbox unavailable scenarios produce safe user-visible fallback behavior and preserve submitted learning records.
- **SC-009**: Teacher can create an assignment and view class progress from student activity in a role-specific QA flow.
- **SC-010**: Parent can view safe progress summary and update consent/privacy settings in a role-specific QA flow.
- **SC-011**: Evals cover Socratic tutoring, homework coaching, safety escalation, hallucination resistance, and tool-policy compliance before implementation is marked complete.
- **SC-012**: The merged architecture avoids direct production dependency on the prototype's SQLite/demo-password/monolithic-page patterns.

## Assumptions

- The canonical production runtime repository is `/Users/khiwn/kidpen/kidpen.space`.
- The prototype repository `/Users/khiwn/kidpen-space` is used as product/UX/prompt/design reference, not as production runtime.
- Existing production authentication, Supabase/Postgres, Redis streaming, AgentPress, sandbox, billing, mobile, and observability infrastructure should be reused where feasible.
- The first implementation milestone should focus on the student Socratic tutor loop before migrating all prototype dashboards/widgets.
- Thai-first behavior is required for student-facing flows; English can be supported as secondary language.
- Computer-use for students is not enabled until role/age/assignment/tool policy and audit logging are implemented.
- Billing may be enabled after the core learning loop is stable, but credit/cost attribution must be designed early.
- Existing local changes in the production repo must be audited before large migration work begins.
