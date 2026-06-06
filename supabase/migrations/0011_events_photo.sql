-- Add photo support to events and create storage bucket.

alter table public.events add column if not exists photo_url text;

-- Public storage bucket for event photos (5 MB max, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-photos',
  'event-photos',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "auth users upload event photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'event-photos');

create policy "public read event photos"
  on storage.objects for select
  using (bucket_id = 'event-photos');

create policy "uploader deletes own event photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'event-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
