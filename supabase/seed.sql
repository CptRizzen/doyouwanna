-- Local dev seed. Runs after migrations on `supabase db reset`.
-- Creates two confirmed auth users (password: "password123"); the
-- handle_new_user trigger auto-creates their profiles, which we then enrich.

insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password,
   email_confirmed_at, created_at, updated_at,
   confirmation_token, recovery_token, email_change_token_new, email_change)
values
  ('00000000-0000-0000-0000-000000000000',
   '11111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'alice@example.com',
   crypt('password123', gen_salt('bf')),
   now(), now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   '22222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'bob@example.com',
   crypt('password123', gen_salt('bf')),
   now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;

-- Enrich the trigger-created profiles with stable usernames + tags.
update public.profiles
  set username = 'alice', display_name = 'Alice', activity_tags = array['hiking', 'trivia']
  where id = '11111111-1111-1111-1111-111111111111';
update public.profiles
  set username = 'bob', display_name = 'Bob', activity_tags = array['hiking']
  where id = '22222222-2222-2222-2222-222222222222';

-- Alice owns a circle; the on_circle_created trigger enrols her as owner.
insert into public.circles (id, owner_id, name, description, activity_tags)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Hiking Crew', 'Weekend trails', array['hiking']
) on conflict (id) do nothing;

-- Bob joins the circle.
insert into public.circle_members (circle_id, user_id, role)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '22222222-2222-2222-2222-222222222222',
  'member'
) on conflict (circle_id, user_id) do nothing;

-- Alice creates an event broadcast to the circle.
insert into public.events (id, creator_id, title, visibility, starts_at, activity_tags)
values (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '11111111-1111-1111-1111-111111111111',
  'Saturday Sunrise Hike', 'circles_only',
  now() + interval '2 days', array['hiking']
) on conflict (id) do nothing;

insert into public.event_circles (event_id, circle_id)
values (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
) on conflict (event_id, circle_id) do nothing;
