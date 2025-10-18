CREATE TABLE public.resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_description_id uuid NULL REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
  title text NULL,                     -- optional, e.g., "Resume for Google Backend"
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT resumes_pkey PRIMARY KEY (id)
);
