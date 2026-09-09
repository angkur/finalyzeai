drop policy if exists "Anyone can view documents" on storage.objects;
drop policy if exists "Anyone can upload documents" on storage.objects;
drop policy if exists "Anyone can delete documents" on storage.objects;

create policy "Users can view their own documents"
on storage.objects for select to authenticated
using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own documents"
on storage.objects for insert to authenticated
with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own documents"
on storage.objects for update to authenticated
using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own documents"
on storage.objects for delete to authenticated
using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);