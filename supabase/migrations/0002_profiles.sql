-- Profiles mirror auth.users 1:1 and hold app-level identity + discovery prefs.

-- Reusable updated_at trigger function (used by every mutable table).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  activity_tags text[] not null default '{}',
  -- Privacy default: discovery OFF.
  discovery_mode text not null default 'off'
    check (discovery_mode in ('off', 'activity_match', 'open')),
  -- Precise home location; exposed to strangers only via the blurred
  -- discoverable_profiles view (see 0009).
  home_location geography(Point, 4326),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_home_location_idx on public.profiles using gist (home_location);
create index profiles_activity_tags_idx on public.profiles using gin (activity_tags);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up. Username defaults to
-- the local part of the email plus a short random suffix to avoid collisions;
-- the user can change it later.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(
      split_part(new.email, '@', 1) || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
      'user_' || substr(new.id::text, 1, 8)
    ),
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
