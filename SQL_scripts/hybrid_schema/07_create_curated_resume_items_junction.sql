-- Junction: Links resume items to curated resume
-- AI selects which items to include
CREATE TABLE public.curated_resume_items_junction (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curated_resume_id uuid NOT NULL REFERENCES public.curated_resumes(id) ON DELETE CASCADE,
  resume_item_id uuid NOT NULL REFERENCES public.resume_items(id) ON DELETE CASCADE,
  
  -- Ordering (AI might reorder)
  display_order integer NOT NULL DEFAULT 0,
  
  -- Optional overrides (AI might suggest tweaking)
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

CREATE INDEX idx_curated_resume_items_curated ON public.curated_resume_items_junction(curated_resume_id, display_order);
CREATE INDEX idx_curated_resume_items_item ON public.curated_resume_items_junction(resume_item_id);

COMMENT ON TABLE public.curated_resume_items_junction IS 'Links resume items to curated resume with AI modifications';

