-- ═══════════════════════════════════════════════════════════════
-- KIDPEN EDUCATION PLATFORM GAP MIGRATION
-- Date: 2026-04-26
-- Spec: 001-autonomous-education-platform
-- Closes gaps identified in docs/merge/education-schema-gap-analysis.md
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. SUBJECTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,          -- math, physics, chemistry, biology, cs
  name_th TEXT NOT NULL,             -- คณิตศาสตร์, ฟิสิกส์, etc.
  name_en TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  grade_range INT4RANGE DEFAULT '[1,6]'::int4range,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed subjects from prototype definitions
INSERT INTO subjects (key, name_th, name_en, icon, color, description, "order") VALUES
  ('math', 'คณิตศาสตร์', 'Mathematics', 'Calculator', '#2563EB', 'พีชคณิต เรขาคณิต ตรีโกณมิติ สถิติ แคลคูลัสเบื้องต้น', 1),
  ('physics', 'ฟิสิกส์', 'Physics', 'Atom', '#F97316', 'กลศาสตร์ คลื่น ไฟฟ้า แสง ความร้อน ฟิสิกส์อะตอม', 2),
  ('chemistry', 'เคมี', 'Chemistry', 'FlaskConical', '#10B981', 'อะตอม ตารางธาตุ พันธะเคมี ปฏิกิริยาเคมี เคมีอินทรีย์', 3),
  ('biology', 'ชีววิทยา', 'Biology', 'Leaf', '#8B5CF6', 'เซลล์ พันธุศาสตร์ วิวัฒนาการ ระบบนิเวศ ร่างกายมนุษย์', 4),
  ('cs', 'วิทยาการคอมพิวเตอร์', 'Computer Science', 'Code2', '#8B5CF6', 'อัลกอริทึม โปรแกรมมิ่ง ข้อมูล เครือข่าย AI เบื้องต้น', 5)
ON CONFLICT (key) DO NOTHING;

-- Add subject_id FK to knowledge_components
DO $$ BEGIN
  ALTER TABLE knowledge_components
    ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Backfill subject_id on knowledge_components from free-text subject field
UPDATE knowledge_components kc
SET subject_id = s.id
FROM subjects s
WHERE kc.subject = s.key
  AND kc.subject_id IS NULL;

-- ═══════════════════════════════════════════════════════════════
-- 2. GUARDIAN RELATIONSHIPS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS guardian_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'parent',  -- parent, guardian, self
  verification_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
  visibility_scope JSONB DEFAULT '{"progress": true, "safety_flags": true, "conversations": false}',
  consent_scope JSONB DEFAULT '{"data_collection": true, "ai_tutoring": true, "analytics": false}',
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guardian_user_id, learner_id)
);

CREATE INDEX IF NOT EXISTS idx_guardian_relationships_learner
  ON guardian_relationships(learner_id);

CREATE INDEX IF NOT EXISTS idx_guardian_relationships_guardian
  ON guardian_relationships(guardian_user_id);

-- ═══════════════════════════════════════════════════════════════
-- 3. LESSONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  knowledge_component_ids UUID[] DEFAULT '{}',
  title_th TEXT NOT NULL,
  title_en TEXT,
  objective TEXT,
  content_blocks JSONB DEFAULT '[]',     -- Array of {type, content, media_url}
  checkpoint_items JSONB DEFAULT '[]',   -- Array of {question, answer, hints[]}
  practice_items JSONB DEFAULT '[]',     -- Array of {question, answer, hints[]}
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL DEFAULT 'system',  -- teacher_created, ai_generated, system
  review_status TEXT NOT NULL DEFAULT 'draft', -- draft, reviewed, published
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_subject ON lessons(subject_id);

-- ═══════════════════════════════════════════════════════════════
-- 4. ASSIGNMENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id TEXT,
  teacher_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  knowledge_component_ids UUID[] DEFAULT '{}',
  title TEXT NOT NULL,
  instructions TEXT,
  due_at TIMESTAMPTZ,
  allowed_tool_policy_id UUID,  -- FK added after tool_policies creation
  homework_solution_policy TEXT NOT NULL DEFAULT 'strict_no_answer',
    -- strict_no_answer, check_after_attempt, explain_after_effort, teacher_allowed
  rubric JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',  -- draft, published, closed, archived
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_tenant ON assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. TOOL POLICIES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tool_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tenant_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  allowed_tools TEXT[] DEFAULT '{}',
  denied_tools TEXT[] DEFAULT '{}',
  require_assignment_context BOOLEAN DEFAULT true,
  max_session_duration_minutes INT DEFAULT 60,
  allow_browser BOOLEAN DEFAULT false,
  allow_filesystem_write BOOLEAN DEFAULT false,
  allow_network_access BOOLEAN DEFAULT false,
  allow_code_execution BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK on assignments after tool_policies exists
ALTER TABLE assignments
  ADD CONSTRAINT fk_assignments_tool_policy
  FOREIGN KEY (allowed_tool_policy_id) REFERENCES tool_policies(id) ON DELETE SET NULL;

-- ═══════════════════════════════════════════════════════════════
-- 6. COMPUTER LAB SESSIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS computer_lab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  sandbox_id TEXT,
  agent_run_id UUID,
  tool_policy_id UUID REFERENCES tool_policies(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
    -- pending, running, blocked, completed, failed, cancelled
  artifact_refs JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_sessions_learner ON computer_lab_sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_lab_sessions_assignment ON computer_lab_sessions(assignment_id);

-- ═══════════════════════════════════════════════════════════════
-- 7. AUDIT EVENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT,
  target_type TEXT NOT NULL,      -- thread, run, session, assignment, consent
  target_id TEXT,
  action TEXT NOT NULL,           -- tool_allow, tool_deny, consent_grant, consent_withdraw, safety_escalation
  result TEXT NOT NULL,           -- allowed, denied, failed
  reason_code TEXT,
  trace_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_target ON audit_events(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events(action, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 8. ENHANCE EXISTING TABLES
-- ═══════════════════════════════════════════════════════════════

-- user_profiles: add education-specific fields
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'th',
  ADD COLUMN IF NOT EXISTS accessibility_preferences JSONB DEFAULT '{"reduced_motion": false, "font_size": "medium"}';

-- student_interactions: add richer interaction metadata
ALTER TABLE student_interactions
  ADD COLUMN IF NOT EXISTS interaction_type TEXT DEFAULT 'chat',
    -- chat, lesson_checkpoint, homework_check, quiz, lab
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS evidence_summary TEXT,
  ADD COLUMN IF NOT EXISTS safety_flag TEXT;

-- student_kc_mastery: add confidence tracking
ALTER TABLE student_kc_mastery
  ADD COLUMN IF NOT EXISTS confidence FLOAT DEFAULT 0.0 CHECK (confidence BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS last_evidence_interaction_id UUID;

-- consent_records: add spec-aligned fields
ALTER TABLE consent_records
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'data_collection',
  ADD COLUMN IF NOT EXISTS policy_version TEXT DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════════
-- 9. TUTOR THREADS (education metadata on production threads)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tutor_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  knowledge_component_id UUID REFERENCES knowledge_components(id) ON DELETE SET NULL,
  visibility_policy JSONB DEFAULT '{"learner": true, "teacher": true, "guardian": false, "admin": true}',
  safety_flags TEXT[] DEFAULT '{}',
  homework_policy_mode TEXT DEFAULT 'strict_no_answer',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(thread_id)
);

CREATE INDEX IF NOT EXISTS idx_tutor_threads_learner ON tutor_threads(learner_id);

-- ═══════════════════════════════════════════════════════════════
-- 10. TRIGGERS FOR updated_at
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_guardian_relationships_updated_at
    BEFORE UPDATE ON guardian_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_tool_policies_updated_at
    BEFORE UPDATE ON tool_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_lab_sessions_updated_at
    BEFORE UPDATE ON computer_lab_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_tutor_threads_updated_at
    BEFORE UPDATE ON tutor_threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 11. ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all new tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE computer_lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_threads ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is teacher or admin (reuse from kidpen_education_schema)
-- is_teacher_or_admin() already exists from 20260330120000 migration

-- ═══ SUBJECTS ═══
-- All authenticated users can read subjects
CREATE POLICY "Subjects viewable by all authenticated users" ON subjects
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only platform admins can modify subjects
CREATE POLICY "Only platform admins can modify subjects" ON subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ═══ GUARDIAN RELATIONSHIPS ═══
-- Guardians can view their own relationships
CREATE POLICY "Guardians can view own relationships" ON guardian_relationships
  FOR SELECT USING (guardian_user_id = auth.uid());

-- Students can see their guardians
CREATE POLICY "Students can view own guardians" ON guardian_relationships
  FOR SELECT USING (
    learner_id IN (SELECT id FROM user_profiles WHERE id = auth.uid())
  );

-- Teachers can view guardians of students in their school
CREATE POLICY "Teachers can view school guardians" ON guardian_relationships
  FOR SELECT USING (
    is_teacher_or_admin() AND
    learner_id IN (
      SELECT id FROM user_profiles
      WHERE school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Admin can manage guardian relationships
CREATE POLICY "Admins can manage guardian relationships" ON guardian_relationships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('school_admin', 'platform_admin'))
  );

-- ═══ LESSONS ═══
-- All authenticated users can read published lessons
CREATE POLICY "Published lessons viewable by all" ON lessons
  FOR SELECT USING (
    auth.role() = 'authenticated' AND review_status = 'published'
  );

-- Teachers can view drafts they created
CREATE POLICY "Teachers can view own drafts" ON lessons
  FOR SELECT USING (
    created_by_user_id = auth.uid()
  );

-- Teachers can manage their own lessons
CREATE POLICY "Teachers can manage own lessons" ON lessons
  FOR ALL USING (created_by_user_id = auth.uid());

-- ═══ ASSIGNMENTS ═══
-- Students can view published assignments in their school
CREATE POLICY "Students can view school assignments" ON assignments
  FOR SELECT USING (
    status = 'published' AND
    tenant_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
  );

-- Teachers can manage assignments in their school
CREATE POLICY "Teachers can manage school assignments" ON assignments
  FOR ALL USING (
    is_teacher_or_admin() AND
    tenant_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
  );

-- ═══ TOOL POLICIES ═══
-- Tool policies viewable by authenticated users
CREATE POLICY "Tool policies viewable by authenticated users" ON tool_policies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify tool policies
CREATE POLICY "Only admins can modify tool policies" ON tool_policies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('school_admin', 'platform_admin'))
  );

-- ═══ COMPUTER LAB SESSIONS ═══
-- Students can view and manage their own lab sessions
CREATE POLICY "Students can manage own lab sessions" ON computer_lab_sessions
  FOR ALL USING (learner_id = auth.uid());

-- Teachers can view lab sessions in their school
CREATE POLICY "Teachers can view school lab sessions" ON computer_lab_sessions
  FOR SELECT USING (
    is_teacher_or_admin() AND
    learner_id IN (
      SELECT id FROM user_profiles
      WHERE school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- ═══ AUDIT EVENTS ═══
--dispatch users can view their own audit events
CREATE POLICY "Users can view own audit events" ON audit_events
  FOR SELECT USING (actor_user_id = auth.uid());

-- Teachers can view school audit events
CREATE POLICY "Teachers can view school audit events" ON audit_events
  FOR SELECT USING (
    is_teacher_or_admin() AND (
      actor_user_id IN (
        SELECT id FROM user_profiles
        WHERE school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
      )
    )
  );

-- System can insert audit events (via service_role)
CREATE POLICY "System can insert audit events" ON audit_events
  FOR INSERT WITH CHECK (true);

-- ═══ TUTOR THREADS ═══
-- Students can view their own tutor threads
CREATE POLICY "Students can view own tutor threads" ON tutor_threads
  FOR SELECT USING (learner_id = auth.uid());

-- Teachers can view tutor threads of students in their school
CREATE POLICY "Teachers can view school tutor threads" ON tutor_threads
  FOR SELECT USING (
    is_teacher_or_admin() AND
    learner_id IN (
      SELECT id FROM user_profiles
      WHERE school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- System can manage tutor threads
CREATE POLICY "System can manage tutor threads" ON tutor_threads
  FOR ALL USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 12. GRANTS
-- ═══════════════════════════════════════════════════════════════

GRANT ALL ON subjects TO authenticated;
GRANT ALL ON guardian_relationships TO authenticated;
GRANT ALL ON lessons TO authenticated;
GRANT ALL ON assignments TO authenticated;
GRANT ALL ON tool_policies TO authenticated;
GRANT ALL ON computer_lab_sessions TO authenticated;
GRANT ALL ON audit_events TO authenticated;
GRANT ALL ON tutor_threads TO authenticated;

GRANT ALL ON subjects TO service_role;
GRANT ALL ON guardian_relationships TO service_role;
GRANT ALL ON lessons TO service_role;
GRANT ALL ON assignments TO service_role;
GRANT ALL ON tool_policies TO service_role;
GRANT ALL ON computer_lab_sessions TO service_role;
GRANT ALL ON audit_events TO service_role;
GRANT ALL ON tutor_threads TO service_role;