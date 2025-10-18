-- Curated bullet points: AI-tailored versions of original bullets
-- This is where AI magic happens - rewriting bullets for specific jobs
CREATE TABLE public.curated_resume_item_points (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curated_resume_item_junction_id uuid NOT NULL REFERENCES public.curated_resume_items_junction(id) ON DELETE CASCADE,
  
  -- Link to original bullet point (if based on one)
  original_point_id uuid NULL REFERENCES public.resume_item_points(id) ON DELETE SET NULL,
  
  -- The actual content (AI-tailored version)
  content text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  
  -- Tracking
  was_ai_generated boolean DEFAULT false,      -- Did AI create this from scratch?
  was_ai_modified boolean DEFAULT false,       -- Did AI modify existing point?
  was_edited_by_user boolean DEFAULT false,    -- Did user edit after AI?
  ai_confidence_score decimal(3,2) NULL,       -- How confident was AI?
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT curated_resume_item_points_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_curated_points_junction ON public.curated_resume_item_points(curated_resume_item_junction_id, display_order);
CREATE INDEX idx_curated_points_original ON public.curated_resume_item_points(original_point_id);

COMMENT ON TABLE public.curated_resume_item_points IS 'AI-tailored bullet points for curated resumes';
COMMENT ON COLUMN public.curated_resume_item_points.original_point_id IS 'Links back to original master bullet point';
COMMENT ON COLUMN public.curated_resume_item_points.was_ai_generated IS 'True if AI created entirely new bullet point';
COMMENT ON COLUMN public.curated_resume_item_points.was_ai_modified IS 'True if AI rewrote existing bullet point';

