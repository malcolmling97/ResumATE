CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,        -- e.g. "B.Sc. Computer Science"
  description TEXT NULL,              -- e.g. "Studied AI, ML, and Data Structures"
  grade VARCHAR(50) NULL,             -- e.g. "First Class Honours", "GPA: 3.8/4.0"
  start_date DATE NULL,
  end_date DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT education_pkey PRIMARY KEY (id),
  CONSTRAINT education_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE
);
