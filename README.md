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
