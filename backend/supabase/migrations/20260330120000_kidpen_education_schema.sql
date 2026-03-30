-- Create ENUM types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'school_admin', 'platform_admin');

-- Schools and organizational hierarchy
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_th TEXT NOT NULL,
  name_en TEXT,
  province TEXT NOT NULL,
  school_code TEXT UNIQUE, -- MOE school identifier
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Extended user profiles with educational roles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  school_id UUID REFERENCES schools(id),
  role user_role NOT NULL DEFAULT 'student',
  grade_level INT CHECK (grade_level BETWEEN 1 AND 6),
  display_name TEXT,
  parent_email TEXT,
  consent_granted_at TIMESTAMPTZ,
  consent_granted_by TEXT
);

-- IPST-aligned knowledge components
CREATE TABLE knowledge_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_th TEXT NOT NULL,
  name_en TEXT,
  subject TEXT NOT NULL,
  grade_level INT NOT NULL,
  ipst_standard TEXT,
  strand TEXT,
  prerequisites UUID[] DEFAULT '{}',
  difficulty_tier INT DEFAULT 1
);

-- pyBKT mastery tracking per student per KC
CREATE TABLE student_kc_mastery (
  student_id UUID REFERENCES user_profiles(id),
  kc_id UUID REFERENCES knowledge_components(id),
  p_mastery FLOAT DEFAULT 0.0,
  p_transit FLOAT DEFAULT 0.1,
  opportunity_count INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  PRIMARY KEY (student_id, kc_id)
);

-- Individual interaction logs
CREATE TABLE student_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES user_profiles(id),
  kc_id UUID REFERENCES knowledge_components(id),
  thread_id UUID REFERENCES threads(id),
  is_correct BOOLEAN NOT NULL,
  response_time_ms INT,
  scaffolding_level INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Courses and assignments
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  teacher_id UUID REFERENCES user_profiles(id),
  name_th TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level INT NOT NULL,
  kc_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PDPA consent records
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES user_profiles(id),
  guardian_name TEXT NOT NULL,
  guardian_relationship TEXT,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  revoked_at TIMESTAMPTZ
);

-- AI safety audit log
CREATE TABLE ai_safety_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES user_profiles(id),
  thread_id UUID REFERENCES threads(id),
  flag_type TEXT NOT NULL,
  input_text TEXT,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE student_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School isolation" ON student_interactions
FOR ALL USING (
  student_id IN (
    SELECT id FROM user_profiles 
    WHERE school_id = (auth.jwt() ->> 'school_id')::uuid
  )
);
