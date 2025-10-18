-- Individual bullet points for resume items
-- KEY: Each bullet point is a separate row with its own ID
CREATE TABLE public.resume_item_points (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resume_item_id uuid NOT NULL REFERENCES public.resume_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Content
  content text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  
  -- Tracking
  usage_count integer DEFAULT 0,        -- How many curated resumes use this
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT resume_item_points_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_resume_item_points_item ON public.resume_item_points(resume_item_id, display_order);
CREATE INDEX idx_resume_item_points_user ON public.resume_item_points(user_id);

COMMENT ON TABLE public.resume_item_points IS 'Individual bullet points - each one tracked separately instead of text array';
COMMENT ON COLUMN public.resume_item_points.usage_count IS 'Tracks reuse across multiple curated resumes';

