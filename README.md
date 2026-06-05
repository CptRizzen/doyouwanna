# DoYouWanna

Social activity app combining private friend-circle coordination with opt-in public discovery.
Think Meetup × Find My Friends × Bumble BFF.

## Core Loops

1. Create named friend circles tied to activities (hiking crew, bar trivia gang, etc.)
2. Broadcast events/plans to one or more circles
3. Check in to a location and share live location with specific circles
4. Friends RSVP / mark "on my way" — visible on map
5. Email invite flow for non-users (invite → account creation → auto-join event)
6. Discovery mode: opt-in public presence so strangers doing the same activities can find you

## Stack

- **Frontend:** Expo (React Native) — background location, push notifications, maps
- **Backend/DB:** Supabase — PostGIS, Realtime, Auth, Edge Functions, Row Level Security
- **Maps:** react-native-maps + Google Maps API
- **Email:** Resend
- **Push:** Expo Notifications
- **Testing:** Jest + React Native Testing Library + MSW — TDD from day 1

## Constraints

- Android-first (iOS via Expo EAS cloud builds)
- TDD required — unit tests for all domain logic
- ~$0 cost target at launch (free tiers)

## Getting started

```bash
npm install                 # uses .npmrc (legacy-peer-deps) for Expo SDK peers
cp .env.example .env        # fill in EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY
npm test                    # domain spec (100% cov) + component render tests
npm run typecheck           # tsc --noEmit
npx expo start              # run the app (Expo Go / Android emulator)
```

Supabase (needs Docker, or a free hosted project):

```bash
npx supabase start          # applies supabase/migrations + seed.sql locally
npm run supabase:gen-types  # regenerate src/types/database.types.ts
```

## Project layout

| Path | What |
|---|---|
| `app/` | Expo Router routes: `(auth)` sign-in/up, `(tabs)` events/circles/profile, `invite/[token]` |
| `src/domain/` | Pure TS rules + Jest specs (membership, event visibility, RSVP / invite / connection state machines) — the executable spec |
| `src/api/` | TanStack Query hooks over the Supabase client |
| `src/lib/` | Supabase client, query client, auth context |
| `supabase/migrations/` | Schema → PostGIS → helper functions → RLS → masking views + `accept_invite` RPC |
| `test/` | Jest setup, factories, MSW infra (`test/api/README.md` for the staged REST suite) |

## Status

This is the **foundation + Auth/Circles/Events** slice. Built and verified: full
schema with RLS (validated against a real Postgres+PostGIS instance), the domain
spec at 100% coverage, and working auth / circles / events+RSVP screens. Later
phases: invite email (Resend Edge Function), live map (Realtime + PostGIS),
discovery, block/report, push, EAS builds.
