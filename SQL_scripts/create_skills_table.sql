CREATE TABLE public.skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,                          -- FK to users
  name text NOT NULL,                             -- e.g. "React", "Spring Boot", "Python"
  category text NULL,                             -- e.g. "Frontend", "Backend", "Database", "DevOps"
  level text NULL CHECK (
    level IN ('beginner', 'intermediate', 'advanced', 'expert')
  ),                                              -- optional skill level
  source_pdf_id uuid NULL,                        -- optional: track where it was parsed from
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT skills_pkey PRIMARY KEY (id),
  CONSTRAINT skills_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
  CONSTRAINT skills_source_pdf_id_fkey 
      FOREIGN KEY (source_pdf_id) REFERENCES public.user_uploaded_pdfs (id) ON DELETE SET NULL
) TABLESPACE pg_default;
