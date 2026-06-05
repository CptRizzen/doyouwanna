-- Events (planned plans or spur-of-moment check-ins), the circles they are
-- broadcast to, and per-user attendance / live location.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  activity_tags text[] not null default '{}',
  -- circles_only = visible to broadcast circles; discoverable = opt-in public.
  visibility text not null default 'circles_only'
    check (visibility in ('circles_only', 'discoverable')),
  location geography(Point, 4326),
  place_name text,
  -- starts_at null => spur-of-moment check-in.
  starts_at timestamptz,
  ends_at timestamptz,
  is_checkin boolean not null default false,
  -- Only meaningful for discoverable events.
  discovery_radius_m integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_creator_id_idx on public.events (creator_id);
create index events_location_idx on public.events using gist (location);
create index events_starts_at_idx on public.events (starts_at);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- An event can be broadcast to one or more circles.
create table public.event_circles (
  event_id uuid not null references public.events (id) on delete cascade,
  circle_id uuid not null references public.circles (id) on delete cascade,
  primary key (event_id, circle_id)
);

create index event_circles_circle_id_idx on public.event_circles (circle_id);

create table public.event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rsvp_status text not null default 'invited'
    check (rsvp_status in ('invited', 'going', 'maybe', 'not_going', 'on_my_way', 'arrived')),
  -- Per-attendee opt-in to be seen by discovery strangers at this event.
  visible_to_strangers boolean not null default false,
  live_location geography(Point, 4326),
  live_location_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index event_attendees_user_id_idx on public.event_attendees (user_id);
create index event_attendees_event_id_idx on public.event_attendees (event_id);
create index event_attendees_live_location_idx
  on public.event_attendees using gist (live_location);

create trigger event_attendees_set_updated_at
  before update on public.event_attendees
  for each row execute function public.set_updated_at();
