create table public.user_uploaded_pdfs (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references public.users(id) on delete cascade,
  pdf_filename text not null, -- the filename stored in Supabase Storage
  uploaded_at timestamp with time zone not null default now(),
  constraint user_uploaded_pdfs_pkey primary key (id)
) TABLESPACE pg_default;
