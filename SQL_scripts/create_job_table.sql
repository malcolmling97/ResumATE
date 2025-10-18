CREATE TABLE public.job_descriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- owner or creator
  title text NOT NULL,             -- e.g., "Senior Backend Engineer"
  company text NULL,
  description text NOT NULL,       -- full job description
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT job_descriptions_pkey PRIMARY KEY (id)
);
