-- Phase 1 PDPA Foundation Tables
-- Date: 2026-04-12
-- Scope: users + parental_consents baseline for kidpen.space

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(100),
    grade_level SMALLINT CHECK (grade_level BETWEEN 1 AND 6),
    birth_year SMALLINT,
    consent_status JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parental_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_email VARCHAR(255),
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    consent_method VARCHAR(50),
    ip_address VARCHAR(45),
    withdrawn_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_parental_consents_user_id ON parental_consents(user_id);
