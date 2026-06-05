---
name: localhost-auth
description: Use when localhost dev sign-in fails on a VTT — magic-link "redirect URL not allowed", a Patreon Connect bounce lands on prod, a new dev port is added, or auth loops between prod /login and localhost. Codifies the architecture (shared .shawnsvtts.com cookie in prod, per-origin localStorage in dev), the loop guard in apps/marketing/src/components/Login.jsx (devMismatch + isLocalhostUrl + isOnProdHost), the inline magic-link Welcome.jsx contract, and the two allowlists (Supabase Auth Redirect URLs + PATREON_OAUTH_ALLOWED_RETURN_ORIGINS) that gate every new dev port. Triggers on "localhost auth", "magic link not working in dev", "patreon return_to wrong", "add a new dev port", "vtt sign-in loop", "auth across vtts".
version: 1.0.0
---

# localhost-auth

Reference card for the multi-VTT auth pattern in this repo. Read this BEFORE touching `Welcome.jsx`, `Login.jsx`, the `@shawnsvtts/auth` storage adapter, vite port pins, or either of the two allowlists. Both allowlists are operational state outside the codebase — easy to forget, painful to debug.

## Architecture

Two independent code paths gated by `window.location.hostname`.

### Production (any `*.shawnsvtts.com` host)

```
user → shadowdark.shawnsvtts.com (or swn., or marketing root)
        │
        │  no session? bounce to:
        ▼
       https://shawnsvtts.com/login?return=<dev_or_prod_origin>
        │
        │  user submits email → Supabase magic-link → click email
        ▼
       /login completes auth, sets cookie on `.shawnsvtts.com`
        │
        │  cookie visible to every *.shawnsvtts.com subdomain
        ▼
       redirect back to ?return URL — already signed in (SSO)
```

The shared cookie is the SSO mechanism. Once the user signs in at `shawnsvtts.com`, every subdomain sees the same session. Implemented by `createSharedAuthStorage()` in `packages/auth/src/storage.js` writing to `.shawnsvtts.com` cookie.

### Localhost (any `localhost` or `127.0.0.1` origin)

```
user → http://localhost:NNNN/
        │
        │  Welcome.jsx detects dev host → renders inline magic-link form
        ▼
       supabase.auth.signInWithOtp({
         email,
         options: { emailRedirectTo: window.location.origin + '/' }
       })
        │
        │  user clicks link in email → bounces to the dev origin
        ▼
       session lands in localStorage (per-origin — NOT shared)
```

The shared `.shawnsvtts.com` cookie is invisible at localhost origins (different domain). The auth storage adapter detects this and falls back to localStorage, scoped to the single origin. **This means each dev port needs its own sign-in.** No SSO across ports in dev.

## The two allowlists (operational state — easy to forget)

Adding a new dev port means updating BOTH or sign-in silently breaks.

### 1. Supabase Auth → URL Configuration → Redirect URLs

Gates `signInWithOtp({ emailRedirectTo: ... })`. If the redirect URL isn't on the list, Supabase rejects the magic-link request with a vague error.

- Dashboard: https://supabase.com/dashboard/project/ccoqfumatvoclsxbjqoe/auth/url-configuration
- Add: `http://localhost:NNNN/**` (the `/**` wildcard supersets `/login`; existing entries use wildcards only).
- Also add `https://<vtt>.localhost:8443/**` if the new dev port will be reached through the Traefik docker stack.
- **There is no public API.** This is dashboard-only. Drive it via Chrome MCP if working from Claude.

### 2. `PATREON_OAUTH_ALLOWED_RETURN_ORIGINS` (Supabase function env)

Gates the Patreon OAuth `return_to` round-trip. If the dev origin isn't in this CSV, `patreon-oauth-start` ignores the `return_to` and the callback falls back to `APP_REDIRECT_URL` (prod), so the user gets bounced to prod after Connect Patreon.

The canonical CSV + the `secrets set` incantation now live in the `vtt-auth-onboarding` skill (step D). Read that section before running the command — Supabase masks the existing value, so you have to re-set the full origin list every time. Do NOT use a `<csv-of-origins>` placeholder; substitute the literal value.

No redeploy needed — Deno reads env vars on each invocation.

## The loop guard — DO NOT REMOVE

`apps/marketing/src/components/Login.jsx:22-122` contains a deliberate manual-continuation panel for the `prod-host + localhost-return` case. Without it, this loop happens:

1. Dev origin (localhost:NNNN) has no session → Welcome.jsx bounces to `https://shawnsvtts.com/login?return=http://localhost:NNNN`.
2. Prod `/login` sees the prod cookie session → useEffect auto-redirects to the return URL.
3. Browser lands at `http://localhost:NNNN/` — no localStorage session there → Welcome.jsx fires the bouncer again.
4. Goto 1. Forever.

The guard: `devMismatch = isOnProdHost() && isLocalhostUrl(returnUrl)` (line 52). When true, render a manual "Open localhost:NNNN →" button instead of auto-redirecting. User clicks it themselves, breaks the loop. Don't simplify it back.

## Welcome.jsx contract — DO NOT SIMPLIFY

Both `apps/swn/src/components/Welcome.jsx` and `apps/shadowdark/src/components/Welcome.jsx` mirror each other. They are NOT pure bouncers. On localhost they render the inline magic-link form. Keeping them as bouncers re-creates the loop the guard above is fixing from the OTHER side.

Pattern (same in both):

```js
const AUTH_HOST = import.meta.env.VITE_AUTH_HOST || 'https://shawnsvtts.com';

function isDevOrigin() {
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}

// On prod: bounce to AUTH_HOST/login?return=<origin>.
// On localhost: render inline magic-link form using supabase.auth.signInWithOtp.
```

`VITE_AUTH_HOST` lets the prod bouncer point at a localhost marketing dev server (e.g. `http://localhost:5173`) for full-stack local testing. It does **not** enable SSO across localhost ports — localStorage is per-origin.

## `useSessionState` singleton rule

Per `feedback_session_state_singleton.md` in user memory: **only Landing may call `useSessionState`.** Re-mounting it (e.g. inside a routed view) makes the viewport go black. If you're touching the auth provider, route guards, or session boot code, leave the singleton owner alone.

## Adding a new dev port — the recipe

When a new VTT or app needs a localhost dev origin:

1. **Pin the port** in the app's `vite.config.js`:

   ```js
   server: { port: NNNN, strictPort: true },
   ```

   `strictPort: true` makes Vite fail loudly if the port is taken — better than silently drifting to a port that isn't on the allowlist.

2. **Add to Supabase Auth Redirect URLs** (dashboard, see above). Add `http://localhost:NNNN/**` and `http://localhost:NNNN/login`.

3. **Add to Patreon allowlist** (CLI, see above). Set the full CSV including the new origin.

4. **Verify end-to-end:**

   - `pnpm --filter <app> dev` — confirm it lands on `:NNNN`.
   - Hit `http://localhost:NNNN/` in a real browser. Expect Welcome inline form.
   - Submit your email. Expect "Magic link sent — check your email."
   - Click the link. The bounced URL should target `http://localhost:NNNN/`. If it lands on prod or errors with "redirect URL not allowed," step 2 is wrong.
   - (Optional) Click "Connect Patreon" if the app has it. The OAuth callback should return to `http://localhost:NNNN/...?patreon=connected`. If it lands on prod, step 3 is wrong.

## Current pinned ports

| App                 | Port | strictPort | vite.config.js                    |
|---------------------|------|------------|-----------------------------------|
| `apps/marketing`    | 5173 | yes        | `apps/marketing/vite.config.js`   |
| `apps/swn`          | 5174 | yes        | `apps/swn/vite.config.js`         |
| `apps/shadowdark`   | 5187 | yes        | `apps/shadowdark/vite.config.js`  |

## File map

Jump points for future-me:

- `apps/marketing/src/components/Login.jsx:22-122` — `isLocalhostUrl`, `isOnProdHost`, `devMismatch`, manual continuation panel.
- `apps/marketing/src/components/Login.jsx:13-19` — `buildEmailRedirectTo` (preserves the `return` query param across the magic-link round-trip).
- `apps/marketing/src/lib/returnUrl.js` — `readReturnParam` (the validator).
- `apps/swn/src/components/Welcome.jsx` and `apps/shadowdark/src/components/Welcome.jsx` — VTT bouncer + inline form.
- `packages/auth/src/storage.js` — cookie ↔ localStorage adapter (`createSharedAuthStorage`). Detects host, picks backend, handles cookie-from-localStorage migration on first prod read.
- `packages/auth/src/client.js` — `createSharedSupabaseClient({ url, anonKey })`. All apps build their `supabase` client through this.
- `apps/{marketing,swn,shadowdark}/src/lib/supabase.js` — three-line wrapper around `createSharedSupabaseClient`.
- `apps/swn/src/lib/patreonOAuth.js` — `kickoffConnect`. Sends `return_to`. Wired only in swn today; shadowdark Patreon is a future task.
- `supabase/functions/patreon-oauth-start/` — validates `return_to` against `PATREON_OAUTH_ALLOWED_RETURN_ORIGINS`, embeds in HMAC state.
- `supabase/functions/patreon-oauth-callback/` — reads `state.returnTo`, falls back to `APP_REDIRECT_URL` if absent.

## Pitfalls (incident-driven)

- **The loop is real, not theoretical.** It was hit during 2026-05-02 SSO E2E. Don't auto-redirect from prod `/login` to a localhost `return` URL.
- **localStorage is per-origin in dev.** Signing in at `localhost:5174` does not sign you in at `localhost:5187`. Each port stands alone.
- **Vercel env vars are per-project, not per-org.** New marketing/VTT projects start with EMPTY `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` and silently fall back to `placeholder.invalid` at runtime. If a brand-new prod build's auth is broken, check Vercel project env first.
- **JWT verify on the Patreon webhook function MUST be OFF.** Patreon doesn't send a Supabase JWT, so a "Verify JWT" flip on the function makes the gateway 401 every webhook silently — `webhook_events` stays empty and you can't tell from the function logs.

## Out of scope

- Cross-port SSO in dev (would require shared cookie domain like `*.local` + mkcert; explicitly punted).
- Replacing per-origin localStorage with a shared backing store in dev. Same reason.
- Wiring shadowdark up to Patreon OAuth (pending; the allowlist already has `http://localhost:5187` + `https://shadowdark.shawnsvtts.com` so it'll work when the client code lands).
