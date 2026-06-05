-- Email-based invites to an event and/or a circle. A non-user receives the
-- invite link, creates an account with that email, and is auto-joined via the
-- accept_invite RPC (see 0009).

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events (id) on delete cascade,
  circle_id uuid references public.circles (id) on delete cascade,
  inviter_id uuid not null references public.profiles (id) on delete cascade,
  email citext not null,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'revoked')),
  accepted_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  -- An invite must point at an event, a circle, or both.
  constraint invites_target_present check (event_id is not null or circle_id is not null)
);

create index invites_email_idx on public.invites (email);
create index invites_event_id_idx on public.invites (event_id);
create index invites_circle_id_idx on public.invites (circle_id);
