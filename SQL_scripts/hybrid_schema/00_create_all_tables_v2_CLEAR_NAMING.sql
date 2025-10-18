-- Complete schema with CLEAR naming
-- v2: Renamed resume_items -> master_resume_items for clarity

-- ============================================
-- MASTER RESUME DATA (User's Original Input)
-- ============================================

-- 1. Master Resume Items (User's Experiences and Projects)
CREATE TABLE IF NOT EXISTS public.master_resume_items (
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
  
  CONSTRAINT master_resume_items_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_master_resume_items_user ON public.master_resume_items(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_master_resume_items_dates ON public.master_resume_items(user_id, start_date DESC);

COMMENT ON TABLE public.master_resume_items IS 'MASTER DATA: User''s original work experiences and projects - never modified by AI';

-- 2. Master Resume Item Points (User's Original Bullet Points)
CREATE TABLE IF NOT EXISTS public.master_resume_item_points (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  master_resume_item_id uuid NOT NULL REFERENCES public.master_resume_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Content
  content text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  
  -- Tracking
  usage_count integer DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT master_resume_item_points_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_master_item_points_item ON public.master_resume_item_points(master_resume_item_id, display_order);
CREATE INDEX IF NOT EXISTS idx_master_item_points_user ON public.master_resume_item_points(user_id);

COMMENT ON TABLE public.master_resume_item_points IS 'MASTER DATA: User''s original bullet points - each tracked individually';

-- 3. Master Resumes (Optional: Container/grouping for master items)
CREATE TABLE IF NOT EXISTS public.master_resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Metadata
  title text NOT NULL DEFAULT 'My Master Resume',
  is_primary boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT master_resumes_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_master_resumes_user ON public.master_resumes(user_id);

COMMENT ON TABLE public.master_resumes IS 'Container for organizing master resume items (optional)';

-- ============================================
-- JOB POSTINGS
-- ============================================

-- 4. Jobs (Job descriptions for targeting resumes)
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

COMMENT ON TABLE public.jobs IS 'Job postings user wants to apply to';

-- ============================================
-- CURATED RESUMES (AI-Generated/Tailored)
-- ============================================

-- 5. Curated Resumes (AI-generated tailored resumes)
CREATE TABLE IF NOT EXISTS public.curated_resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Source data
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

COMMENT ON TABLE public.curated_resumes IS 'AI-GENERATED: Tailored resumes for specific jobs';

-- 6. Curated Resume Items (Links to master items, with AI modifications)
CREATE TABLE IF NOT EXISTS public.curated_resume_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curated_resume_id uuid NOT NULL REFERENCES public.curated_resumes(id) ON DELETE CASCADE,
  master_resume_item_id uuid NOT NULL REFERENCES public.master_resume_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Ordering
  display_order integer NOT NULL DEFAULT 0,
  
  -- Optional AI overrides (title/description tweaks)
  title_override text NULL,
  organization_override text NULL,
  description_override text NULL,
  
  -- Tracking
  was_selected_by_ai boolean DEFAULT false,
  was_reordered_by_ai boolean DEFAULT false,
  was_edited_by_user boolean DEFAULT false,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT curated_resume_items_pkey PRIMARY KEY (id),
  CONSTRAINT curated_resume_items_unique UNIQUE (curated_resume_id, master_resume_item_id)
);

CREATE INDEX IF NOT EXISTS idx_curated_items_resume ON public.curated_resume_items(curated_resume_id, display_order);
CREATE INDEX IF NOT EXISTS idx_curated_items_master ON public.curated_resume_items(master_resume_item_id);

COMMENT ON TABLE public.curated_resume_items IS 'Links master items to curated resumes with optional AI modifications';
COMMENT ON COLUMN public.curated_resume_items.master_resume_item_id IS 'References the MASTER item - preserves link to original';

-- 7. Curated Resume Item Points (AI-tailored bullet points)
CREATE TABLE IF NOT EXISTS public.curated_resume_item_points (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curated_resume_item_id uuid NOT NULL REFERENCES public.curated_resume_items(id) ON DELETE CASCADE,
  
  -- Link back to original MASTER bullet point
  master_point_id uuid NULL REFERENCES public.master_resume_item_points(id) ON DELETE SET NULL,
  
  -- The AI-tailored content
  content text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  
  -- Tracking
  was_ai_generated boolean DEFAULT false,      -- AI created from scratch
  was_ai_modified boolean DEFAULT false,       -- AI rewrote master point
  was_edited_by_user boolean DEFAULT false,    -- User edited after AI
  ai_confidence_score decimal(3,2) NULL,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT curated_item_points_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_curated_points_item ON public.curated_resume_item_points(curated_resume_item_id, display_order);
CREATE INDEX IF NOT EXISTS idx_curated_points_master ON public.curated_resume_item_points(master_point_id);

COMMENT ON TABLE public.curated_resume_item_points IS 'AI-TAILORED: Modified/generated bullet points for curated resumes';
COMMENT ON COLUMN public.curated_resume_item_points.master_point_id IS 'Links to original MASTER point (if derived from one)';

-- ============================================
-- SUMMARY
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ All tables created with CLEAR naming!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 MASTER DATA (User Input - Never Modified):';
  RAISE NOTICE '   - master_resume_items';
  RAISE NOTICE '   - master_resume_item_points';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 CURATED DATA (AI Generated - Can Be Modified):';
  RAISE NOTICE '   - curated_resumes';
  RAISE NOTICE '   - curated_resume_items';
  RAISE NOTICE '   - curated_resume_item_points';
  RAISE NOTICE '';
  RAISE NOTICE '💼 JOB DATA:';
  RAISE NOTICE '   - jobs';
END $$;

