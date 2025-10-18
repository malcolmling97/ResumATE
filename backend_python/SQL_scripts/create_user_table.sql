CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NULL,
  provider_id VARCHAR(255) NULL,
  name VARCHAR(100) NULL,
  about TEXT NULL,
  location VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_username_key UNIQUE (username)
) TABLESPACE pg_default;
