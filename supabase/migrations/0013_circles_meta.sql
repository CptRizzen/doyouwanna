-- add visual metadata (emoji icon + brand color) to circles
alter table public.circles
  add column if not exists icon  text not null default '⭐',
  add column if not exists color text not null default '#FF5A3C';
