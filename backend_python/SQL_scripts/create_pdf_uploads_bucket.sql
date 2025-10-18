insert into storage.buckets (id, name, public)
values ('pdf-uploads', 'pdf-uploads', true)
on conflict (id) do nothing;