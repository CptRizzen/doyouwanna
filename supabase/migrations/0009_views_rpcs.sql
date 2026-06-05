-- RLS is row-level only. These two views add COLUMN-level masking, and the RPC
-- performs the privileged invite-acceptance side effects.

-- 1) Blurred public discovery surface.
-- Intentionally a SECURITY DEFINER view (security_invoker = off): it is the
-- *only* sanctioned way a stranger sees a discoverable user. It exposes a
-- limited column set and snaps home_location to a ~1km grid, mirroring
-- domain/discovery.ts blurPoint(). Rows are restricted to opted-in users.
create view public.discoverable_profiles
with (security_invoker = off) as
  select
    p.id,
    p.display_name,
    p.avatar_url,
    p.activity_tags,
    p.discovery_mode,
    st_snaptogrid(p.home_location::geometry, 0.01)::geography as approx_location
  from public.profiles p
  where p.discovery_mode <> 'off';

grant select on public.discoverable_profiles to authenticated;

-- 2) Live-location read surface with per-viewer column masking.
-- security_invoker = on => base event_attendees RLS (can_view_event) decides
-- which rows are visible; the CASE then decides whether live_location is
-- revealed. Mirrors domain/events.ts canSeeLiveLocation().
create view public.visible_attendee_locations
with (security_invoker = on) as
  select
    ea.id,
    ea.event_id,
    ea.user_id,
    ea.rsvp_status,
    ea.live_location_updated_at,
    case
      when ea.user_id = auth.uid() then ea.live_location
      when public.shares_event_circle(ea.event_id, auth.uid()) then ea.live_location
      when ea.visible_to_strangers and public.are_connected(auth.uid(), ea.user_id)
        then ea.live_location
      else null
    end as live_location
  from public.event_attendees ea;

grant select on public.visible_attendee_locations to authenticated;

-- 3) accept_invite: validates token + expiry + email match, then joins the
-- user to the circle and/or event. SECURITY DEFINER because the joins write
-- rows the invitee could not otherwise insert under RLS. Mirrors
-- domain/invites.ts canAcceptInvite().
create or replace function public.accept_invite(p_token text)
returns public.invites
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.invites;
  v_user uuid := auth.uid();
  v_email citext;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select * into v_invite from public.invites where token = p_token for update;
  if not found then
    raise exception 'invite not found' using errcode = 'P0002';
  end if;

  if v_invite.status <> 'pending' then
    raise exception 'invite is not pending' using errcode = '22023';
  end if;

  if v_invite.expires_at <= now() then
    update public.invites set status = 'expired' where id = v_invite.id;
    raise exception 'invite expired' using errcode = '22023';
  end if;

  -- The accepting account's email must match the invited email.
  select email into v_email from auth.users where id = v_user;
  if v_email is distinct from v_invite.email then
    raise exception 'invite email mismatch' using errcode = '42501';
  end if;

  if v_invite.circle_id is not null then
    insert into public.circle_members (circle_id, user_id, role)
    values (v_invite.circle_id, v_user, 'member')
    on conflict (circle_id, user_id) do nothing;
  end if;

  if v_invite.event_id is not null then
    insert into public.event_attendees (event_id, user_id, rsvp_status)
    values (v_invite.event_id, v_user, 'going')
    on conflict (event_id, user_id) do nothing;
  end if;

  update public.invites
    set status = 'accepted', accepted_by = v_user, accepted_at = now()
    where id = v_invite.id
    returning * into v_invite;

  return v_invite;
end;
$$;

grant execute on function public.accept_invite(text) to authenticated;
