-- Complete schema setup for ResumATE Master Resume feature
-- Run this file to create all necessary tables

-- Prerequisites: users, user_uploaded_pdfs, education, and skills tables should already exist

-- ============================================
-- MASTER RESUME DATA TABLES
-- ============================================

-- 1. Resume Items (Experiences and Projects)
CREATE TABLE IF NOT EXISTS public.resume_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Type of item
  item_type text NOT NULL CHECK (item_type IN ('experience', 'project')),
  
  -- Common fields
  title text NOT NULL,
  organization text NULL,
  description text NULL,
  
  -- Dates
  start_date date NULL,
  end_date date NULL,
  is_current boolean DEFAULT false,
  
  -- Experience-specific fields
  location text NULL,
  employment_type text NULL,
  
  -- Project-specific fields
  technologies text[] NULL,
  github_url text NULL,
  demo_url text NULL,
  
  -- Metadata
  source_pdf_id uuid NULL REFERENCES public.user_uploaded_pdfs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT resume_items_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_resume_items_user ON public.resume_items(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_resume_items_dates ON public.resume_items(user_id, start_date DESC);

COMMENT ON TABLE public.resume_items IS 'Master resume items - user''s complete work history and projects';

-- 2. Resume Item Points (Bullet Points)
CREATE TABLE IF NOT EXISTS public.resume_item_points (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resume_item_id uuid NOT NULL REFERENCES public.resume_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Content
  content text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  
  -- Tracking
  usage_count integer DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT resume_item_points_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_resume_item_points_item ON public.resume_item_points(resume_item_id, display_order);
CREATE INDEX IF NOT EXISTS idx_resume_item_points_user ON public.resume_item_points(user_id);

COMMENT ON TABLE public.resume_item_points IS 'Individual bullet points - each one tracked separately';

-- 3. Master Resumes (Container for user's master resume)
CREATE TABLE IF NOT EXISTS public.master_resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Metadata
  title text NOT NULL,
  is_primary boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT master_resumes_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_master_resumes_user ON public.master_resumes(user_id);

COMMENT ON TABLE public.master_resumes IS 'User''s original/master resume - the source of truth';

-- 4. Master Resume Items Junction
CREATE TABLE IF NOT EXISTS public.master_resume_items_junction (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  master_resume_id uuid NOT NULL REFERENCES public.master_resumes(id) ON DELETE CASCADE,
  resume_item_id uuid NOT NULL REFERENCES public.resume_items(id) ON DELETE CASCADE,
  
  -- Ordering
  display_order integer NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT master_resume_items_junction_pkey PRIMARY KEY (id),
  CONSTRAINT master_resume_items_unique UNIQUE (master_resume_id, resume_item_id)
);

CREATE INDEX IF NOT EXISTS idx_master_resume_items_master ON public.master_resume_items_junction(master_resume_id, display_order);
CREATE INDEX IF NOT EXISTS idx_master_resume_items_item ON public.master_resume_items_junction(resume_item_id);

-- ============================================
-- JOB POSTINGS TABLE
-- ============================================

-- 5. Jobs (Job descriptions for targeting resumes)
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Job details
  title text NOT NULL,
  company text NULL,
  description text NOT NULL,
  job_url text NULL,
  
  -- Optional parsed data
  required_skills text[] NULL,
  nice_to_have_skills text[] NULL,
  
  -- Application tracking
  status text DEFAULT 'saved' CHECK (status IN ('saved', 'applying', 'applied', 'interviewing', 'offer', 'rejected', 'closed')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT jobs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_user ON public.jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(user_id, status);

-- ============================================
-- CURATED RESUME TABLES (AI-Generated)
-- ============================================

-- 6. Curated Resumes (AI-generated tailored resumes)
CREATE TABLE IF NOT EXISTS public.curated_resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Source data
  master_resume_id uuid NULL REFERENCES public.master_resumes(id) ON DELETE SET NULL,
  job_id uuid NULL REFERENCES public.jobs(id) ON DELETE SET NULL,
  
  -- Metadata
  title text NOT NULL,
  
  -- AI generation info
  is_ai_generated boolean DEFAULT true,
  generation_prompt text NULL,
  model_used text NULL,
  generation_notes text NULL,
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'archived')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  finalized_at timestamptz NULL,
  
  CONSTRAINT curated_resumes_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_curated_resumes_user ON public.curated_resumes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_curated_resumes_job ON public.curated_resumes(job_id);
CREATE INDEX IF NOT EXISTS idx_curated_resumes_master ON public.curated_resumes(master_resume_id);

-- 7. Curated Resume Items Junction
CREATE TABLE IF NOT EXISTS public.curated_resume_items_junction (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curated_resume_id uuid NOT NULL REFERENCES public.curated_resumes(id) ON DELETE CASCADE,
  resume_item_id uuid NOT NULL REFERENCES public.resume_items(id) ON DELETE CASCADE,
  
  -- Ordering
  display_order integer NOT NULL DEFAULT 0,
  
  -- Optional overrides
  title_override text NULL,
  organization_override text NULL,
  description_override text NULL,
  
  -- Tracking
  was_reordered_by_ai boolean DEFAULT false,
  was_edited_by_user boolean DEFAULT false,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT curated_resume_items_junction_pkey PRIMARY KEY (id),
  CONSTRAINT curated_resume_items_unique UNIQUE (curated_resume_id, resume_item_id)
);

CREATE INDEX IF NOT EXISTS idx_curated_resume_items_curated ON public.curated_resume_items_junction(curated_resume_id, display_order);
CREATE INDEX IF NOT EXISTS idx_curated_resume_items_item ON public.curated_resume_items_junction(resume_item_id);

-- 8. Curated Resume Item Points (AI-tailored bullet points)
CREATE TABLE IF NOT EXISTS public.curated_resume_item_points (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curated_resume_item_junction_id uuid NOT NULL REFERENCES public.curated_resume_items_junction(id) ON DELETE CASCADE,
  
  -- Link to original bullet point
  original_point_id uuid NULL REFERENCES public.resume_item_points(id) ON DELETE SET NULL,
  
  -- Content
  content text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  
  -- Tracking
  was_ai_generated boolean DEFAULT false,
  was_ai_modified boolean DEFAULT false,
  was_edited_by_user boolean DEFAULT false,
  ai_confidence_score decimal(3,2) NULL,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT curated_resume_item_points_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_curated_points_junction ON public.curated_resume_item_points(curated_resume_item_junction_id, display_order);
CREATE INDEX IF NOT EXISTS idx_curated_points_original ON public.curated_resume_item_points(original_point_id);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'All tables created successfully!';
  RAISE NOTICE 'You can now use the Master Resume feature.';
END $$;

