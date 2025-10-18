-- Master Resume: User's original resume
-- This is the "before AI" state
CREATE TABLE public.master_resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Metadata
  title text NOT NULL,                  -- e.g., "My Main Resume"
  is_primary boolean DEFAULT true,      -- User's main resume
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT master_resumes_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_master_resumes_user ON public.master_resumes(user_id);

COMMENT ON TABLE public.master_resumes IS 'User''s original/master resume - the source of truth';
COMMENT ON COLUMN public.master_resumes.is_primary IS 'User can have multiple master resumes, one marked as primary';

