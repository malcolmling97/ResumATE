-- Curated Resume: AI-generated tailored resume
-- This is the "after AI" state
CREATE TABLE public.curated_resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Source data
  master_resume_id uuid NULL REFERENCES public.master_resumes(id) ON DELETE SET NULL,
  job_id uuid NULL REFERENCES public.jobs(id) ON DELETE SET NULL,
  
  -- Metadata
  title text NOT NULL,                  -- e.g., "Resume for Google Backend Engineer"
  
  -- AI generation info
  is_ai_generated boolean DEFAULT true,
  generation_prompt text NULL,
  model_used text NULL,
  generation_notes text NULL,           -- What AI changed and why
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'archived')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  finalized_at timestamptz NULL,
  
  CONSTRAINT curated_resumes_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_curated_resumes_user ON public.curated_resumes(user_id, created_at DESC);
CREATE INDEX idx_curated_resumes_job ON public.curated_resumes(job_id);
CREATE INDEX idx_curated_resumes_master ON public.curated_resumes(master_resume_id);

COMMENT ON TABLE public.curated_resumes IS 'AI-generated tailored resumes for specific jobs';
COMMENT ON COLUMN public.curated_resumes.generation_notes IS 'AI explanation of what was changed and why';

