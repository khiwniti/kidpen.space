-- ═══════════════════════════════════════════════════════════════
-- KIDPEN EDUCATION SCHEMA
-- Thai STEM Tutoring Platform
-- ═══════════════════════════════════════════════════════════════

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'teacher', 'school_admin', 'platform_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- SCHOOLS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_th TEXT NOT NULL,
  name_en TEXT,
  province TEXT NOT NULL,
  school_code TEXT UNIQUE, -- MOE school identifier
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- USER PROFILES (Educational extension of auth.users)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  role user_role NOT NULL DEFAULT 'student',
  grade_level INT CHECK (grade_level BETWEEN 1 AND 6), -- ม.1-ม.6
  display_name TEXT,
  parent_email TEXT,
  consent_granted_at TIMESTAMPTZ,
  consent_granted_by TEXT, -- 'self' or guardian name
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- KNOWLEDGE COMPONENTS (IPST-aligned curriculum)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS knowledge_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_th TEXT NOT NULL,
  name_en TEXT,
  subject TEXT NOT NULL, -- 'math', 'science', 'physics', 'coding'
  grade_level INT NOT NULL CHECK (grade_level BETWEEN 1 AND 6),
  ipst_standard TEXT, -- e.g., 'ค 1.1 ม.1/1'
  strand TEXT, -- curriculum strand
  prerequisites UUID[] DEFAULT '{}',
  difficulty_tier INT DEFAULT 1 CHECK (difficulty_tier BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- STUDENT KC MASTERY (pyBKT tracking)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS student_kc_mastery (
  student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  kc_id UUID REFERENCES knowledge_components(id) ON DELETE CASCADE,
  p_mastery FLOAT DEFAULT 0.0 CHECK (p_mastery BETWEEN 0 AND 1),
  p_transit FLOAT DEFAULT 0.1 CHECK (p_transit BETWEEN 0 AND 1),
  p_slip FLOAT DEFAULT 0.1 CHECK (p_slip BETWEEN 0 AND 1),
  p_guess FLOAT DEFAULT 0.2 CHECK (p_guess BETWEEN 0 AND 1),
  opportunity_count INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  streak INT DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, kc_id)
);

-- ═══════════════════════════════════════════════════════════════
-- STUDENT INTERACTIONS (Learning events)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS student_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  kc_id UUID NOT NULL REFERENCES knowledge_components(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INT,
  scaffolding_level INT CHECK (scaffolding_level BETWEEN 1 AND 4),
  hint_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by student and time
CREATE INDEX IF NOT EXISTS idx_student_interactions_student_time 
  ON student_interactions(student_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- COURSES (Teacher-managed)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name_th TEXT NOT NULL,
  name_en TEXT,
  subject TEXT NOT NULL,
  grade_level INT NOT NULL CHECK (grade_level BETWEEN 1 AND 6),
  kc_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- COURSE ENROLLMENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS course_enrollments (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (course_id, student_id)
);

-- ═══════════════════════════════════════════════════════════════
-- PDPA CONSENT RECORDS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  guardian_name TEXT NOT NULL,
  guardian_email TEXT,
  guardian_relationship TEXT, -- 'parent', 'guardian', 'self'
  consent_type TEXT NOT NULL, -- 'data_collection', 'ai_tutoring', 'analytics'
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT
);

-- ═══════════════════════════════════════════════════════════════
-- AI SAFETY LOG
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_safety_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
  flag_type TEXT NOT NULL, -- 'inappropriate_content', 'personal_info', 'harmful_request'
  severity TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  input_text TEXT,
  detected_patterns TEXT[],
  action_taken TEXT NOT NULL, -- 'blocked', 'warned', 'logged', 'escalated'
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_kc_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_safety_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's profile
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS user_profiles AS $$
  SELECT * FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if user is teacher or admin
CREATE OR REPLACE FUNCTION is_teacher_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('teacher', 'school_admin', 'platform_admin')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══ SCHOOLS ═══
-- Everyone can read schools
CREATE POLICY "Schools are viewable by authenticated users" ON schools
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only platform admins can modify schools
CREATE POLICY "Only platform admins can modify schools" ON schools
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- ═══ USER_PROFILES ═══
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- Teachers can view profiles of students in their school
CREATE POLICY "Teachers can view school students" ON user_profiles
  FOR SELECT USING (
    is_teacher_or_admin() AND 
    school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ═══ KNOWLEDGE_COMPONENTS ═══
-- Everyone can read KCs
CREATE POLICY "KCs are viewable by all" ON knowledge_components
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify KCs
CREATE POLICY "Only admins can modify KCs" ON knowledge_components
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('school_admin', 'platform_admin'))
  );

-- ═══ STUDENT_KC_MASTERY ═══
-- Students can view and update their own mastery
CREATE POLICY "Students can manage own mastery" ON student_kc_mastery
  FOR ALL USING (student_id = auth.uid());

-- Teachers can view mastery of students in their school
CREATE POLICY "Teachers can view school mastery" ON student_kc_mastery
  FOR SELECT USING (
    is_teacher_or_admin() AND
    student_id IN (
      SELECT id FROM user_profiles 
      WHERE school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- ═══ STUDENT_INTERACTIONS ═══
-- Students can view and create their own interactions
CREATE POLICY "Students can manage own interactions" ON student_interactions
  FOR ALL USING (student_id = auth.uid());

-- Teachers can view interactions of students in their school
CREATE POLICY "Teachers can view school interactions" ON student_interactions
  FOR SELECT USING (
    is_teacher_or_admin() AND
    student_id IN (
      SELECT id FROM user_profiles 
      WHERE school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- ═══ COURSES ═══
-- Teachers can manage their own courses
CREATE POLICY "Teachers can manage own courses" ON courses
  FOR ALL USING (teacher_id = auth.uid());

-- Students can view courses they're enrolled in or in their school
CREATE POLICY "Students can view available courses" ON courses
  FOR SELECT USING (
    school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid()) OR
    id IN (SELECT course_id FROM course_enrollments WHERE student_id = auth.uid())
  );

-- ═══ COURSE_ENROLLMENTS ═══
-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON course_enrollments
  FOR SELECT USING (student_id = auth.uid());

-- Teachers can manage enrollments for their courses
CREATE POLICY "Teachers can manage course enrollments" ON course_enrollments
  FOR ALL USING (
    course_id IN (SELECT id FROM courses WHERE teacher_id = auth.uid())
  );

-- ═══ CONSENT_RECORDS ═══
-- Users can view and create their own consent records
CREATE POLICY "Users can manage own consent" ON consent_records
  FOR ALL USING (student_id = auth.uid());

-- School admins can view consent for their school's students
CREATE POLICY "School admins can view school consent" ON consent_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('school_admin', 'platform_admin')
      AND school_id = (SELECT school_id FROM user_profiles WHERE id = consent_records.student_id)
    )
  );

-- ═══ AI_SAFETY_LOG ═══
-- Only teachers and admins can view safety logs
CREATE POLICY "Teachers can view school safety logs" ON ai_safety_log
  FOR SELECT USING (
    is_teacher_or_admin() AND (
      student_id IS NULL OR
      student_id IN (
        SELECT id FROM user_profiles 
        WHERE school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
      )
    )
  );

-- System can insert safety logs (via service role)
CREATE POLICY "System can insert safety logs" ON ai_safety_log
  FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- GRANTS
-- ═══════════════════════════════════════════════════════════════

GRANT ALL ON schools TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON knowledge_components TO authenticated;
GRANT ALL ON student_kc_mastery TO authenticated;
GRANT ALL ON student_interactions TO authenticated;
GRANT ALL ON courses TO authenticated;
GRANT ALL ON course_enrollments TO authenticated;
GRANT ALL ON consent_records TO authenticated;
GRANT ALL ON ai_safety_log TO authenticated;

GRANT ALL ON schools TO service_role;
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON knowledge_components TO service_role;
GRANT ALL ON student_kc_mastery TO service_role;
GRANT ALL ON student_interactions TO service_role;
GRANT ALL ON courses TO service_role;
GRANT ALL ON course_enrollments TO service_role;
GRANT ALL ON consent_records TO service_role;
GRANT ALL ON ai_safety_log TO service_role;

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS FOR updated_at
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_kc_mastery_updated_at
  BEFORE UPDATE ON student_kc_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
