-- Extensions used across the schema.
--   postgis    : geography(Point) columns + proximity queries (discovery, map)
--   pgcrypto   : gen_random_bytes / gen_random_uuid for invite tokens & ids
--   citext     : case-insensitive email matching for invites
create extension if not exists postgis;
create extension if not exists pgcrypto;
create extension if not exists citext;
