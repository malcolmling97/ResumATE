-- Junction: Links resume items to master resume
-- This is how we "contain" items without using arrays
CREATE TABLE public.master_resume_items_junction (
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

CREATE INDEX idx_master_resume_items_master ON public.master_resume_items_junction(master_resume_id, display_order);
CREATE INDEX idx_master_resume_items_item ON public.master_resume_items_junction(resume_item_id);

COMMENT ON TABLE public.master_resume_items_junction IS 'Links resume items to master resume - replaces array approach';

