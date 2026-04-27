# Quickstart: Kidpen Autonomous Education Platform

This quickstart validates the first implementation slice after it is built. It does not require every future slice to be complete.

## 1. Confirm source state before implementation

From `/Users/khiwn/kidpen/kidpen.space`:

```bash
git branch --show-current
git status --short
git diff --stat
```

Expected:

- Branch is `001-autonomous-education-platform` or a derivative branch.
- Existing local changes are understood and not accidentally overwritten.
- Spec Kit files exist under `.specify/` and `specs/001-autonomous-education-platform/`.

## 2. Backend setup validation

```bash
cd /Users/khiwn/kidpen/kidpen.space/backend
uv sync
uv run python -m pytest tests/education -q
uv run python -m pytest tests/e2e/test_education_tutor_flow.py -q
```

Expected:

- Education service/unit tests pass.
- E2E tutor flow test creates/uses learner profile, starts tutor run, records interaction, and updates mastery.

## 3. Frontend setup validation

```bash
cd /Users/khiwn/kidpen/kidpen.space
pnpm install
pnpm --filter frontend lint
pnpm --filter frontend build
```

Expected:

- Lint/build pass.
- No direct import from `/Users/khiwn/kidpen-space/src/app/page.tsx` or bulk prototype CSS.

## 4. Manual QA: student tutor loop

1. Start backend and frontend using the project's normal local workflow.
2. Sign in as a student or dev student account.
3. Confirm the dashboard is Thai-first and shows subjects/progress/recommended actions.
4. Ask a Thai concept question, e.g. `สมการ x² + 5x + 6 = 0 คิดยังไงดี?`
5. Confirm the tutor responds in Thai with guiding questions and helpful scaffolding.
6. Ask for direct homework answer, e.g. `ช่วยทำการบ้านข้อนี้ให้หน่อย เอาแค่คำตอบ`.
7. Confirm the tutor asks for an attempt or gives a hint, not just the final answer.
8. Confirm interaction appears in recent conversation/progress and mastery changes are visible.

Expected:

- Response streams or shows progress state.
- No direct homework answer leakage in the first response.
- Learning interaction and mastery update are persisted.
- Safe fallback appears if AI provider is unavailable.

## 5. Manual QA: role boundaries

### Teacher

1. Sign in as teacher.
2. Open teacher dashboard.
3. Verify class progress and mastery gap summaries appear only for assigned students.
4. Attempt to access another tenant/class learner by URL/API.

Expected:

- Allowed class data is visible.
- Unauthorized data is denied.

### Parent

1. Sign in as parent.
2. Open parent dashboard for linked learner.
3. Verify safe progress summary and home support suggestions.
4. Change consent/privacy setting.
5. Refresh dashboard and verify visibility updates.

Expected:

- Parent sees summaries, not disallowed private data.
- Consent changes affect access immediately.

## 6. Manual QA: safety behavior

Submit examples:

- Off-topic request
- Direct cheating request
- Emotionally concerning student statement
- Prompt injection attempting to ignore tutor rules

Expected:

- Tutor remains Thai-first and safe.
- Cheating/direct answer request is redirected to learning.
- Safety concern receives supportive language and appropriate guidance.
- Prompt injection does not bypass policy.

## 7. Computer-use lab validation, when implemented

1. Create a teacher-approved lab assignment.
2. Start a student lab session.
3. Run an allowed action, such as coding/simulation action inside assignment context.
4. Attempt a restricted action.
5. Inspect audit events.

Expected:

- Allowed action succeeds.
- Restricted action is blocked.
- Audit event exists for allow and deny decisions.

## 8. AI eval validation

```bash
cd /Users/khiwn/kidpen/kidpen.space/backend
uv run python -m pytest evals/education -q
```

Expected:

- Thai Socratic behavior meets baseline threshold.
- Homework guidance direct-answer leakage below threshold.
- Safety escalation cases pass.
- Tool-policy evals pass once lab is enabled.

## 9. Release readiness checklist

- [ ] Source audit completed.
- [ ] Schema migration applied in staging.
- [ ] RLS/authorization tests pass.
- [ ] Student tutor E2E passes.
- [ ] AI evals pass.
- [ ] Browser QA passes for student/teacher/parent.
- [ ] Consent/export/delete behavior verified for affected data.
- [ ] Billing/credit attribution verified if enabled.
- [ ] Tool policy/audit verified before any student computer-use exposure.
