-- Jobs: Job descriptions for targeting resumes
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Job details
  title text NOT NULL,
  company text NULL,
  description text NOT NULL,            -- Full job description
  job_url text NULL,                    -- Link to job posting
  
  -- Optional parsed data
  required_skills text[] NULL,          -- Extracted by AI
  nice_to_have_skills text[] NULL,
  
  -- Application tracking
  status text DEFAULT 'saved' CHECK (status IN ('saved', 'applying', 'applied', 'interviewing', 'offer', 'rejected', 'closed')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT jobs_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_jobs_user ON public.jobs(user_id, created_at DESC);
CREATE INDEX idx_jobs_status ON public.jobs(user_id, status);

COMMENT ON TABLE public.jobs IS 'Job descriptions and postings that user wants to apply to';
COMMENT ON COLUMN public.jobs.required_skills IS 'AI-extracted skills from job description';

