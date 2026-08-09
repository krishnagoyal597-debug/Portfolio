-- ====================================================================
-- SUPABASE DATABASE SCHEMA & RLS POLICIES FOR PERSONAL RESUME PORTFOLIO
-- ====================================================================

-- 1. Table: projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  tech_stack text[],
  github_url text,
  live_url text,
  image_url text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Table: skills
CREATE TABLE IF NOT EXISTS skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL, -- "Programming", "AI/ML", "Databases", "Web", "Tools"
  proficiency integer CHECK (proficiency >= 0 AND proficiency <= 100),
  icon_url text,
  created_at timestamptz DEFAULT now()
);

-- 3. Table: certifications
CREATE TABLE IF NOT EXISTS certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  platform text,
  date_earned date,
  certificate_url text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- 4. Table: experience
CREATE TABLE IF NOT EXISTS experience (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company text NOT NULL,
  role text NOT NULL,
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  description text[],
  created_at timestamptz DEFAULT now()
);

-- 5. Table: achievements (Achievements & Extracurricular Activities)
CREATE TABLE IF NOT EXISTS achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text, -- "Academic", "Competition", "Extracurricular", "Leadership"
  date_achieved date,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- 6. Table: links
CREATE TABLE IF NOT EXISTS links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL, -- "resume_url", "github", "linkedin", "twitter"
  value text,
  updated_at timestamptz DEFAULT now()
);

-- 7. Table: meta
CREATE TABLE IF NOT EXISTS meta (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL, -- "bio", "resume_summary", "tagline", "profile_photo_url"
  value text,
  updated_at timestamptz DEFAULT now()
);

-- 8. Table: messages (contact form submissions)
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  received_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & POLICIES FOR FULL CRUD ACCESS
-- ====================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script to avoid duplicate name conflicts
DROP POLICY IF EXISTS "Public full projects" ON projects;
DROP POLICY IF EXISTS "Public full skills" ON skills;
DROP POLICY IF EXISTS "Public full certifications" ON certifications;
DROP POLICY IF EXISTS "Public full experience" ON experience;
DROP POLICY IF EXISTS "Public full achievements" ON achievements;
DROP POLICY IF EXISTS "Public full links" ON links;
DROP POLICY IF EXISTS "Public full meta" ON meta;
DROP POLICY IF EXISTS "Public full messages" ON messages;

-- Allow full SELECT, INSERT, UPDATE, DELETE for all tables
CREATE POLICY "Public full projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full skills" ON skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full certifications" ON certifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full experience" ON experience FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full achievements" ON achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full links" ON links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full meta" ON meta FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full messages" ON messages FOR ALL USING (true) WITH CHECK (true);
