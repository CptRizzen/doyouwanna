import { http, HttpResponse } from 'msw';

/**
 * Default MSW handlers for Supabase calls in component/integration tests.
 *
 * supabase-js talks to PostgREST (`/rest/v1/*`) and GoTrue auth (`/auth/v1/*`)
 * over plain HTTP, so MSW can intercept them. Individual tests override these
 * with `server.use(...)` for the specific rows they need. Realtime is a
 * WebSocket and is out of scope here — mock the channel object directly when
 * live-location lands.
 */
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';

export const handlers = [
  // Auth: return a fake session for password sign-in/up.
  http.post(`${SUPABASE_URL}/auth/v1/token`, () =>
    HttpResponse.json({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: { id: 'test-user', email: 'test@example.com' },
    }),
  ),
  http.post(`${SUPABASE_URL}/auth/v1/signup`, () =>
    HttpResponse.json({
      id: 'test-user',
      email: 'test@example.com',
    }),
  ),
  http.get(`${SUPABASE_URL}/auth/v1/user`, () =>
    HttpResponse.json({ id: 'test-user', email: 'test@example.com' }),
  ),
  // PostgREST: default to empty result sets; tests override per table.
  http.get(`${SUPABASE_URL}/rest/v1/:table`, () => HttpResponse.json([])),
  http.post(`${SUPABASE_URL}/rest/v1/:table`, async ({ request }) =>
    HttpResponse.json([await request.json()], { status: 201 }),
  ),
  http.patch(`${SUPABASE_URL}/rest/v1/:table`, async ({ request }) =>
    HttpResponse.json([await request.json()], { status: 200 }),
  ),
  // Edge Functions: acknowledge send-invite by default.
  http.post(`${SUPABASE_URL}/functions/v1/send-invite`, () =>
    HttpResponse.json({ ok: true }),
  ),
];
