-- Allow public insert (upload) to the storage objects table for your bucket
create policy "Allow public upload to pdf-uploads"
on storage.objects
for insert
with check (bucket_id = 'pdf-uploads');