-- Row Level Security. Every table is locked down; access flows through the
-- helper functions in 0007. auth.uid() is the calling user; auth.jwt() exposes
-- their email (used for invite claiming).

alter table public.profiles enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.events enable row level security;
alter table public.event_circles enable row level security;
alter table public.event_attendees enable row level security;
alter table public.invites enable row level security;
alter table public.discovery_connections enable row level security;
alter table public.reports enable row level security;

-- ---------------------------------------------------------------- profiles
create policy "profiles: read self, co-members, connections"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.shares_circle_with(auth.uid(), id)
    or public.are_connected(auth.uid(), id)
  );

create policy "profiles: insert self"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "profiles: update self"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------- circles
create policy "circles: members read"
  on public.circles for select to authenticated
  using (public.is_circle_member(id, auth.uid()));

create policy "circles: owner creates"
  on public.circles for insert to authenticated
  with check (owner_id = auth.uid());

create policy "circles: managers update"
  on public.circles for update to authenticated
  using (public.is_circle_manager(id, auth.uid()))
  with check (public.is_circle_manager(id, auth.uid()));

create policy "circles: owner deletes"
  on public.circles for delete to authenticated
  using (owner_id = auth.uid());

-- ------------------------------------------------------------ circle_members
create policy "circle_members: members read"
  on public.circle_members for select to authenticated
  using (public.is_circle_member(circle_id, auth.uid()));

create policy "circle_members: managers add"
  on public.circle_members for insert to authenticated
  with check (public.is_circle_manager(circle_id, auth.uid()));

create policy "circle_members: managers update roles"
  on public.circle_members for update to authenticated
  using (public.is_circle_manager(circle_id, auth.uid()))
  with check (public.is_circle_manager(circle_id, auth.uid()));

-- Managers may remove members; anyone may leave. The owner row is protected.
create policy "circle_members: manager or self remove (not owner)"
  on public.circle_members for delete to authenticated
  using (
    role <> 'owner'
    and (
      public.is_circle_manager(circle_id, auth.uid())
      or user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------- events
create policy "events: viewable read"
  on public.events for select to authenticated
  using (public.can_view_event(id, auth.uid()));

create policy "events: creator creates"
  on public.events for insert to authenticated
  with check (creator_id = auth.uid());

create policy "events: creator updates"
  on public.events for update to authenticated
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

create policy "events: creator deletes"
  on public.events for delete to authenticated
  using (creator_id = auth.uid());

-- ------------------------------------------------------------- event_circles
create policy "event_circles: viewable read"
  on public.event_circles for select to authenticated
  using (public.can_view_event(event_id, auth.uid()));

create policy "event_circles: creator broadcasts to own circles"
  on public.event_circles for insert to authenticated
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.creator_id = auth.uid()
    )
    and public.is_circle_member(circle_id, auth.uid())
  );

create policy "event_circles: creator unbroadcasts"
  on public.event_circles for delete to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.creator_id = auth.uid()
    )
  );

-- ----------------------------------------------------------- event_attendees
create policy "event_attendees: viewable read"
  on public.event_attendees for select to authenticated
  using (public.can_view_event(event_id, auth.uid()));

-- You manage your own attendance; the event creator may seed 'invited' rows.
create policy "event_attendees: self or creator inserts"
  on public.event_attendees for insert to authenticated
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.events e
      where e.id = event_id and e.creator_id = auth.uid()
    )
  );

create policy "event_attendees: self updates"
  on public.event_attendees for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "event_attendees: self deletes"
  on public.event_attendees for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------- invites
create policy "invites: inviter or invitee read"
  on public.invites for select to authenticated
  using (
    inviter_id = auth.uid()
    or email = (auth.jwt() ->> 'email')::citext
  );

create policy "invites: inviter with rights creates"
  on public.invites for insert to authenticated
  with check (
    inviter_id = auth.uid()
    and (
      (event_id is not null and public.can_view_event(event_id, auth.uid()))
      or (circle_id is not null and public.is_circle_member(circle_id, auth.uid()))
    )
  );

create policy "invites: inviter revokes"
  on public.invites for update to authenticated
  using (inviter_id = auth.uid())
  with check (inviter_id = auth.uid());

-- ------------------------------------------------------- discovery_connections
create policy "connections: party reads"
  on public.discovery_connections for select to authenticated
  using (from_user = auth.uid() or to_user = auth.uid());

create policy "connections: requester creates"
  on public.discovery_connections for insert to authenticated
  with check (from_user = auth.uid());

create policy "connections: party updates"
  on public.discovery_connections for update to authenticated
  using (from_user = auth.uid() or to_user = auth.uid())
  with check (from_user = auth.uid() or to_user = auth.uid());

create policy "connections: party deletes"
  on public.discovery_connections for delete to authenticated
  using (from_user = auth.uid() or to_user = auth.uid());

-- ---------------------------------------------------------------- reports
create policy "reports: reporter creates"
  on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());

create policy "reports: reporter reads own"
  on public.reports for select to authenticated
  using (reporter_id = auth.uid());
