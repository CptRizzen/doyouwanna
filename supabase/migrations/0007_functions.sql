-- Membership / visibility helpers used inside RLS policies.
--
-- CRITICAL: these are SECURITY DEFINER so they bypass RLS. A policy on
-- circle_members that itself selected from circle_members would recurse
-- infinitely; routing every membership check through these definer functions
-- breaks that cycle. They are STABLE (no writes) and pin search_path.

create or replace function public.is_circle_member(p_circle uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from circle_members
    where circle_id = p_circle and user_id = p_user
  );
$$;

-- Whether the actor is an owner/admin of the circle (manage rights).
create or replace function public.is_circle_manager(p_circle uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from circle_members
    where circle_id = p_circle
      and user_id = p_user
      and role in ('owner', 'admin')
  );
$$;

-- Whether two users share at least one circle.
create or replace function public.shares_circle_with(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from circle_members ma
    join circle_members mb on ma.circle_id = mb.circle_id
    where ma.user_id = p_a and mb.user_id = p_b
  );
$$;

-- Whether two users are connected discovery contacts.
create or replace function public.are_connected(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from discovery_connections
    where status = 'connected'
      and (
        (from_user = p_a and to_user = p_b) or
        (from_user = p_b and to_user = p_a)
      )
  );
$$;

-- Whether a user can view an event: creator, discoverable, or member of a
-- broadcast circle.
create or replace function public.can_view_event(p_event uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from events e
    where e.id = p_event
      and (
        e.creator_id = p_user
        or e.visibility = 'discoverable'
        or exists (
          select 1
          from event_circles ec
          join circle_members cm on cm.circle_id = ec.circle_id
          where ec.event_id = e.id and cm.user_id = p_user
        )
      )
  );
$$;

-- Whether a user is a member of a circle this event is broadcast to (drives
-- live-location visibility).
create or replace function public.shares_event_circle(p_event uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from event_circles ec
    join circle_members cm on cm.circle_id = ec.circle_id
    where ec.event_id = p_event and cm.user_id = p_user
  );
$$;
