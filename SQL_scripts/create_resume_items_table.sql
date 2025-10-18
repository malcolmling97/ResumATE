CREATE TABLE public.resume_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),              -- unique ID for each entry
  resume_id uuid NOT NULL,                                  -- FK to resumes
  user_id uuid NOT NULL,                                    -- FK to users (optional convenience)
  source_pdf_id uuid NULL,                                  -- optional link to uploaded PDF
  ai_source_id uuid NULL,                                   -- optional link to AI-generated suggestions
  type text NOT NULL CHECK (type IN ('experience', 'project', 'education', 'skill')),
  title text NULL,                                          -- e.g. "Software Engineer", "React Developer"
  organization text NULL,                                   -- e.g. company, school, or org name
  resume_points text[] NULL,                                -- array of bullet points
  description text NULL,                                    -- longer description if needed
  start_date date NULL,
  end_date date NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT resume_items_pkey PRIMARY KEY (id),
  CONSTRAINT resume_items_resume_id_fkey
      FOREIGN KEY (resume_id) REFERENCES public.resumes (id) ON DELETE CASCADE,
  CONSTRAINT resume_items_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
  CONSTRAINT resume_items_source_pdf_id_fkey
      FOREIGN KEY (source_pdf_id) REFERENCES public.user_uploaded_pdfs (id) ON DELETE SET NULL,
  CONSTRAINT resume_items_ai_source_id_fkey
      FOREIGN KEY (ai_source_id) REFERENCES public.ai_generated_resume_items (id) ON DELETE SET NULL
) TABLESPACE pg_default;
