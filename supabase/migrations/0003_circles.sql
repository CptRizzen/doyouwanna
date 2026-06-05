-- Friend circles (user-defined, activity-tagged groups) and their members.

create table public.circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  activity_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index circles_owner_id_idx on public.circles (owner_id);

create trigger circles_set_updated_at
  before update on public.circles
  for each row execute function public.set_updated_at();

create table public.circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (circle_id, user_id)
);

create index circle_members_user_id_idx on public.circle_members (user_id);
create index circle_members_circle_id_idx on public.circle_members (circle_id);

-- When a circle is created, enrol its owner as the 'owner' member so membership
-- checks have a single source of truth.
create or replace function public.handle_new_circle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.circle_members (circle_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger on_circle_created
  after insert on public.circles
  for each row execute function public.handle_new_circle();
