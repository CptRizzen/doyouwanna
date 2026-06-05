-- Discovery connections (consent-required, not auto-follow) and the block/report
-- safety system.

create table public.discovery_connections (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles (id) on delete cascade,
  to_user uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'connected', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (from_user, to_user),
  constraint discovery_no_self check (from_user <> to_user)
);

create index discovery_connections_to_user_idx on public.discovery_connections (to_user);
create index discovery_connections_from_user_idx on public.discovery_connections (from_user);

create trigger discovery_connections_set_updated_at
  before update on public.discovery_connections
  for each row execute function public.set_updated_at();

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete set null,
  reported_event_id uuid references public.events (id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  created_at timestamptz not null default now(),
  constraint reports_target_present
    check (reported_user_id is not null or reported_event_id is not null)
);

create index reports_reporter_id_idx on public.reports (reporter_id);
