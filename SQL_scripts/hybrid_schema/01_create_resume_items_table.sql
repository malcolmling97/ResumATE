-- Resume Items: Combines experiences and projects
-- This is the "master" data that users create
CREATE TABLE public.resume_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Type of item
  item_type text NOT NULL CHECK (item_type IN ('experience', 'project')),
  
  -- Common fields
  title text NOT NULL,                  -- Job title or project name
  organization text NULL,               -- Company name (for experiences) or null (for projects)
  description text NULL,
  
  -- Dates
  start_date date NULL,
  end_date date NULL,
  is_current boolean DEFAULT false,
  
  -- Experience-specific fields
  location text NULL,
  employment_type text NULL,            -- 'Full-time', 'Contract', etc.
  
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

CREATE INDEX idx_resume_items_user ON public.resume_items(user_id, item_type);
CREATE INDEX idx_resume_items_dates ON public.resume_items(user_id, start_date DESC);

COMMENT ON TABLE public.resume_items IS 'Master resume items - user''s complete work history and projects';
COMMENT ON COLUMN public.resume_items.item_type IS 'Either experience or project - simplified from original design';

