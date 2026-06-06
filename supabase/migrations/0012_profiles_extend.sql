-- extend profiles: bio, display location label, and interests list
alter table public.profiles
  add column if not exists bio            text,
  add column if not exists location_label text,
  add column if not exists interests      text[] not null default '{}';
