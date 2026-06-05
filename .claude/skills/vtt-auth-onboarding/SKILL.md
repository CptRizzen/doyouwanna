---
name: vtt-auth-onboarding
description: Use when adding a brand-new VTT app under apps/<vtt>/ that needs to plug into the shared-cookie SSO and Patreon Connect — covers EVERY external-system touchpoint (Patreon developer portal, Vercel project + env vars + custom domain + DNS, Supabase Auth Redirect URLs, Supabase function secrets) AND every code-side touchpoint (packages/auth wiring, src/lib/supabase.js, Welcome.jsx, vite.config port pin, vercel.json, package.json workspace dep). Sibling of localhost-auth (which covers dev-port plumbing only). Triggers on "add a new VTT", "onboard <system>", "wire auth for new app", "new vercel project for vtt", "patreon for new vtt".
version: 1.4.0
---

# vtt-auth-onboarding

Canonical recipe for plugging a brand-new VTT app (e.g. `apps/dnd5e`) into the existing ShawnsVTTs auth + Patreon stack. Read this BEFORE creating a new `apps/<vtt>/` directory or a new Vercel project.

Sibling skills:
- `localhost-auth` — dev-port plumbing, the loop guard, the Welcome.jsx contract. Read first if you only need to add a new dev port to an existing VTT.
- `vercel-deploy-fallback` — what to do when the GitHub → Vercel webhook silently drops.
- `*-parity` (locations-notes / npcs / enemies / quests / initiative) — gameplay schema and entity panels. Run AFTER auth onboarding is done.

## Architecture recap

Two independent SSO mechanisms gated by host:

```
PROD                              DEV (localhost)
────                              ───────────────
*.shawnsvtts.com                  localhost:NNNN
   │                                 │
   │ shared cookie on                │ per-origin localStorage
   │ Domain=.shawnsvtts.com          │ (NO cross-port SSO)
   ▼                                 ▼
one session, every subdomain      one session per port
```

- Cookie domain hard-coded at `packages/auth/src/storage.js:26` (`DEFAULT_COOKIE_DOMAIN = '.shawnsvtts.com'`). Dev-host detection at `storage.js:33-38`.
- Patreon Connect flows through ONE shared callback URI: `https://ccoqfumatvoclsxbjqoe.supabase.co/functions/v1/patreon-oauth-callback` (built at `supabase/functions/patreon-oauth-start/index.ts:133`). Per-app routing happens via the `return_to` field, validated against an allowlist at `patreon-oauth-start/index.ts:126,176-189`.

Implication: a new VTT does NOT register a new Patreon OAuth client, does NOT deploy new edge functions, and does NOT need a new Supabase project. It plugs into the existing infra by hitting four allowlists/configs and mirroring six files.

## Pre-flight — what is SHARED across all VTTs (do NOT duplicate)

| Asset | Where | Action when adding a VTT |
|-------|-------|--------------------------|
| Patreon OAuth client | Patreon dev portal | Reuse — do NOT register a new client |
| Patreon redirect URI | Registered in Patreon dev portal as `https://ccoqfumatvoclsxbjqoe.supabase.co/functions/v1/patreon-oauth-callback` | No change — single shared callback |
| Edge function `patreon-oauth-start` | `supabase/functions/patreon-oauth-start/` (Verify JWT OFF) | No change |
| Edge function `patreon-oauth-callback` | `supabase/functions/patreon-oauth-callback/` (Verify JWT OFF) | No change |
| Edge function `patreon-webhook` | `supabase/functions/patreon-webhook/` (**Verify JWT MUST be OFF** — Patreon doesn't send a Supabase JWT, and a flip silently 401s every webhook) | No change |
| Edge function `send-game-invite` / `send-notification-email` | `supabase/functions/` | No change |
| Magic-link template | `supabase/templates/magic-link.html` (branded "ShawnsVTTs" — see lines 8, 21–23, 36, 53) | Reuse unless white-label is explicitly requested |
| Supabase project | `ccoqfumatvoclsxbjqoe` (us-west-2, Pro tier) | No change |

## The full onboarding checklist

Execute in order. Every step has a verification line; do not advance past a failing step.

### A. Code — workspace wiring (PR-local)

**Branch hygiene first.** Always branch from `origin/main`, NEVER from an in-flight feature branch — adding a new VTT touches `package.json`, `pnpm-lock.yaml`, `docker-compose.yml`, and three sibling Dockerfiles, all of which collide hard with anything else mid-flight (campaign-map, parity work, etc.). If you forget and end up with mixed changes on the wrong branch, the recovery is a two-stash dance: `git stash push -u -m "wip-1" -- <feature-files>` to isolate the in-flight work, `git checkout -b feature/<vtt>-scaffold main`, `git checkout stash@{0}^3 -- apps/<vtt>` (untracked files live in `^3` of the stash), re-apply the package.json edits manually, `pnpm install` to regenerate the lock, commit, then return to the original branch and `git stash pop`. Saves ~20 minutes of regret.

Pick the next free dev port (currently pinned: marketing 5173, swn 5174, shadowdark 5187, deadshell 5188 — pick e.g. 5189).

1. **`apps/<vtt>/package.json`** — mirror `apps/swn/package.json:12-27`. Mandatory deps: `@shawnsvtts/auth: workspace:*`, `@supabase/supabase-js`, `react`, `react-dom`. Add `@shawnsvtts/dice: workspace:*` if dice are needed.

2. **`apps/<vtt>/src/lib/supabase.js`** — mirror `apps/swn/src/lib/supabase.js:1-9`. Three lines: import `createSharedSupabaseClient` from `@shawnsvtts/auth`, read `import.meta.env.VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, export the configured client.

3. **`apps/<vtt>/src/components/Welcome.jsx`** — mirror `apps/swn/src/components/Welcome.jsx`. NOT a pure bouncer:
   - On prod host (`.shawnsvtts.com`): bounce to `${VITE_AUTH_HOST || 'https://shawnsvtts.com'}/login?return=<origin>`.
   - On localhost/127.0.0.1: render the inline magic-link form via `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/' } })`.
   - Do NOT simplify into a single bouncer — it re-creates the auth loop the marketing `Login.jsx` guard is patching from the other side (`apps/marketing/src/components/Login.jsx:22-122`).

4. **`apps/<vtt>/vite.config.js`** — pin the port:
   ```js
   server: { port: NNNN, strictPort: true },
   ```
   `strictPort: true` is non-negotiable — silent port drift means landing on an origin that isn't on either allowlist.

5. **`apps/<vtt>/vercel.json`** — mirror `apps/shadowdark/vercel.json` (SPA catch-all rewrite to `/index.html`, 1-year immutable cache on `/assets/*`).

6. **`apps/<vtt>/src/App.jsx`** — gate authenticated UI on session, mirroring `apps/shadowdark/src/App.jsx:32-53`:
   ```js
   if (authLoading) return <LoadingSpinner />;
   if (!session) return <Welcome />;
   // ...authenticated shell
   ```
   Per `feedback_session_state_singleton.md`: only the Landing/root component may call `useSessionState`. Re-mounting it in a routed view causes the viewport to go black.

7. **Root `package.json`** — add `dev:<vtt>`, `build:<vtt>`, `lint:<vtt>` scripts that filter on `@shawnsvtts/<vtt>`. Mirror the existing entries.

8. **`apps/<vtt>/.env.example`** — mirror `apps/swn/.env.example` (preserve the leading "Copy to .env in this directory" comment and the `placeholder.invalid` warning). MUST list every `VITE_*` var the app reads — at minimum `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AUTH_HOST`. Add `VITE_DDDICE_*` if dice are wired. Do NOT commit `.env` itself (it's already gitignored at the repo root). New collaborators bootstrap by `cp apps/<vtt>/.env.example apps/<vtt>/.env` and filling in the secrets — README "New collaborator setup" section relies on this file existing.

9. **`apps/<vtt>/.env.local`** — create this for your own machine, NOT committed (`*.local` is gitignored). **Mandatory before first magic-link test.** Without it, `pnpm dev:<vtt>` boots fine but `signInWithOtp` resolves the Supabase URL to `placeholder.invalid` and the magic-link submit throws `TypeError: Failed to fetch` in the browser console (DNS resolution fail, no network request reaches Supabase). This is the #1 "new VTT magic-link broken" symptom — confirmed on bitd 2026-05-04. Two lines, copy verbatim from a sibling app's `.env.local`:
   ```
   VITE_SUPABASE_URL=https://ccoqfumatvoclsxbjqoe.supabase.co
   VITE_SUPABASE_ANON_KEY=<paste from Supabase dashboard or another app's .env.local>
   ```
   Fastest source: `cat apps/shadowdark/.env.local` and copy. Restart dev server after writing — Vite only loads env on boot.

10. **Docker stack integration** (added in PR #20, 2026-05-03 — touches THREE existing apps):
    - **`apps/<vtt>/Dockerfile`** — clone `apps/shadowdark/Dockerfile` verbatim, change `EXPOSE` to your port and the `CMD` filter to `@shawnsvtts/<vtt>`.
    - **`docker-compose.yml`** — add a new service block mirroring the `shadowdark` service: container name `shawnsvtts-<vtt>`, env_file `apps/<vtt>/.env`, Traefik labels with `Host(\`<vtt>.localhost\`)` and `loadbalancer.server.port=NNNN`. Critical: include `/app/apps/<vtt>/node_modules` in the `volumes:` block so the container's pristine install isn't shadowed by the host bind-mount.
    - **Each existing app's Dockerfile** (`apps/marketing`, `apps/swn`, `apps/shadowdark`) — add one line `COPY apps/<vtt>/package.json ./apps/<vtt>/` BEFORE the `RUN pnpm install --frozen-lockfile`. Without this, frozen-lockfile install fails because the workspace expects every app's manifest to be present.
    - **Each existing service in `docker-compose.yml`** — add `- /app/apps/<vtt>/node_modules` to the `volumes:` array. Same anon-volume reason as above.

11. **Root `README.md`** — the README is the public face of the monorepo and is referenced by the "New collaborator setup" doc, so it MUST list every app. Edit FOUR locations (use the bitd PR `4133ea2` as a worked example):
    - **Apps table** (under `## Apps`) — append a row: `| \`apps/<vtt>/\` | \`@shawnsvtts/<vtt>\` | \`<vtt>.shawnsvtts.com\` | NNNN | <one-line description of what the VTT is> |`.
    - **Layout block** (under `## Layout`, inside the fenced `apps/` tree) — append a `<vtt>/  # <one-line description>` line after the existing apps.
    - **Quick start block** (under `## Quick start`) — add `pnpm dev:<vtt>           # http://localhost:NNNN` and `pnpm build:<vtt>` lines, mirroring the existing apps.
    - **New collaborator setup, step 4** (the maintainer-task line) — append `, NNNN` to the comma-separated port list so the next maintainer reading this knows your dev port also needs the two allowlists. Without this, future collaborators get silent "Redirect URL not allowed" errors and don't know to ask for port NNNN to be added.

**Verify A:** `pnpm install` from repo root (workspace resolves and reports N+1 projects, where N was the previous count), `pnpm --filter @shawnsvtts/<vtt> dev` lands on the pinned port. `apps/<vtt>/.env.example` + `apps/<vtt>/.env.local` exist and list every `VITE_*` symbol the app code reads (grep `import.meta.env.VITE_` under `apps/<vtt>/src`). If you have docker-compose running, `docker compose up <vtt>` should boot the container and Traefik should route `https://<vtt>.localhost:8443` to it. README grep — `grep -c "<vtt>" README.md` should return at least 4 (one per location above).

### B. Vercel project

**Order matters: merge step A to `main` BEFORE creating the Vercel project.** Vercel builds the production branch (`main`) on first deploy. If `apps/<vtt>/` isn't there yet, the first build fails with a missing-directory error and you have to re-trigger. Open + merge the PR for the scaffold first, then create the project.

**Vercel `/new` UI quirk:** the repo namespace dropdown defaults to a stale account (e.g. `CptRizzen` in this org's case) and shows "No Git Repositories Found". Click the "Continue with GitHub" button at the bottom of the empty list to re-auth — repos appear after the OAuth bounce. After that, the canonical import URL skips most of the form (replace `<vtt>` and the GitHub repo ID):
```
https://vercel.com/new/import?framework=vite&id=<GITHUB_REPO_ID>&owner=<GH_OWNER>&path=apps%2F<vtt>&project-name=shawnsvtts-<vtt>&provider=github&s=<REPO_URL_ENCODED>
```

1. **Create the project**, linked to the same monorepo, Root Directory `apps/<vtt>`, Framework Preset `Vite`. Build command and output dir auto-detect.

2. **Set env vars** for Production AND Preview AND Development scopes. Vercel env vars are per-project, never inherited from org — new projects start EMPTY and silently fall back to `placeholder.invalid` (see `packages/auth/src/client.js:28`). If a fresh prod build's auth is silently broken, this is the first thing to check.

   | Var | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://ccoqfumatvoclsxbjqoe.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | (anon key from Supabase dashboard) |
   | `VITE_AUTH_HOST` | `https://shawnsvtts.com` (or omit — same default) |

3. **Custom domain** — add `<vtt>.shawnsvtts.com` to the Vercel project. The domain MUST be a subdomain of `shawnsvtts.com`; vanity domains break the cookie-scope SSO.

4. **DNS** — there is a wildcard CNAME `*.shawnsvtts.com → cname.vercel-dns.com.` already set at the registrar. Any new `<vtt>.shawnsvtts.com` resolves automatically — Vercel marks the domain "Valid Configuration" within seconds of adding it. **No registrar action needed.** (Only override per-subdomain if you ever need to point one to something other than Vercel.)

5. **GitHub App** — confirm the GitHub App is installed on this Vercel project and a recent commit triggered a build. If the webhook silently drops (recent shadowdark incident, 2026-05-03), invoke the `vercel-deploy-fallback` skill — `npx vercel deploy --prod` from the repo root is the working escape hatch.

**Verify B:** push a branch → Vercel build succeeds → `https://<vtt>.shawnsvtts.com/` serves the app and Welcome bounces to `https://shawnsvtts.com/login?return=https://<vtt>.shawnsvtts.com/`.

### C. Supabase Auth — Redirect URLs allowlist (dashboard-only, no API)

Gates `signInWithOtp({ emailRedirectTo: ... })`. Off-list URLs are rejected with a vague error.

Dashboard: https://supabase.com/dashboard/project/ccoqfumatvoclsxbjqoe/auth/url-configuration

Add three (the `/**` wildcard supersets `/login` — every existing VTT uses wildcards only, no separate `/login` entry):
- `https://<vtt>.shawnsvtts.com/**`
- `http://localhost:NNNN/**`
- `https://<vtt>.localhost:8443/**` (only if the docker stack will route this VTT)

There is no public API. Drive via Chrome MCP if working from Claude.

**Verify C:** at localhost, submit your email → "Magic link sent" → click email → lands on `localhost:NNNN/`. If the link errors with "redirect URL not allowed" or lands on prod, this step is wrong.

### D. Supabase function secrets — Patreon return_to allowlist

Gates the OAuth `return_to` round-trip. Off-list origins are silently dropped and the callback falls through to `APP_REDIRECT_URL` (prod), so users get bounced to prod after Connect Patreon.

Set the FULL CSV (this overwrites every time — Supabase masks the existing value, so you cannot read it back to append):

```powershell
npx supabase --project-ref ccoqfumatvoclsxbjqoe secrets set PATREON_OAUTH_ALLOWED_RETURN_ORIGINS="https://shawnsvtts.com,https://swn.shawnsvtts.com,https://shadowdark.shawnsvtts.com,https://deadshell.shawnsvtts.com,https://<vtt>.shawnsvtts.com,http://localhost:5173,http://localhost:5174,http://localhost:5187,http://localhost:5188,http://localhost:NNNN,https://shawnsvtts.localhost:8443,https://swn.localhost:8443,https://shadowdark.localhost:8443,https://deadshell.localhost:8443,https://<vtt>.localhost:8443"
```

Drop the `--no-install` flag that earlier versions of this skill used — it blocks `npx` from installing the supabase CLI on a fresh machine and the command silently aborts. The verbatim baseline above (sans `<vtt>` placeholders) is the canonical 12-origin CSV captured in `~/.claude/projects/.../memory/project_deadshell_onboarding_in_flight.md` after the 2026-05-03 reconstruction. If you've added a staging/preview origin since then, append it to the list before running, or it gets dropped.

No redeploy needed — Deno reads env on each invocation.

Verify the hash on the [Supabase secrets dashboard](https://supabase.com/dashboard/project/ccoqfumatvoclsxbjqoe/functions/secrets) changes before vs after — that's the only confirmation you'll get that the write landed.

If the new VTT will OFFER Patreon Connect, also confirm these project-level secrets are still set (none of them are per-VTT):
- `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET`
- `PATREON_CAMPAIGN_ID`
- `PATREON_OAUTH_STATE_SECRET`
- `PATREON_WEBHOOK_SECRET`
- `APP_REDIRECT_URL`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (auto-injected; service-role is the new `sb_secret_*` form per `feedback_supabase_service_role_is_sb_secret.md`)

**Verify D:** if Patreon Connect is wired (step F), click Connect → OAuth round-trip → callback returns to `https://<vtt>.shawnsvtts.com/?patreon=connected` (or `localhost:NNNN/?patreon=connected` in dev). If it lands on prod, step D is wrong.

### E. Patreon developer portal

Typically NO change. The redirect URI is shared. Only edit if rotating client secret. The portal URL stays the same; nothing per-VTT goes here.

### F. Patreon Connect client wiring (OPTIONAL — only if the new VTT exposes Connect Patreon)

Most VTTs will. swn does; shadowdark does not yet but the allowlists are pre-seeded for it.

1. **`apps/<vtt>/src/lib/patreonOAuth.js`** — mirror `apps/swn/src/lib/patreonOAuth.js:17-52`:
   - `kickoffConnect()` (lines 17–45) — sends `return_to = ${origin}${pathname}`, invokes `patreon-oauth-start`, hard-navigates to `authorize_url`.
   - `disconnectPatreon()` (lines 47–52) — calls `supabase.rpc('patreon_disconnect')`.

2. **Connect button** — mirror `apps/swn/src/components/PreferencesModal.jsx:682-684` (button) and `:604` (handler). Place it in the prefs modal's subscription section.

3. **Query-param handler on mount** — mirror `PreferencesModal.jsx:572-589`. Reads `?patreon=`, `?reason=`, `?vanity=` and cleans them via `replaceState`.

**Verify F:** see verification under step D.

### G. Player invite — pass `redirect_to` to `send-game-invite`

Added 2026-05-10 after the cyberpunk-tracker incident where invite emails from a localhost dev GM landed players at the prod host instead of `localhost:NNNN`.

`send-game-invite` accepts an optional `body.redirect_to` (string, absolute URL). If present the function parses the URL and validates its origin against `PATREON_OAUTH_ALLOWED_RETURN_ORIGINS` (reused as the canonical "allowed app origins" allowlist — same CSV both the invite and Patreon flows trust). Off-allowlist origins return `400 redirect_to not allowed: <origin>`. The function uses the validated URL as the base for `?invite=<token>` in the email link. If absent (or if the allowlist secret is empty), the function falls back to the project-wide `APP_REDIRECT_URL` secret (typically `https://shawnsvtts.com/`). GoTrue still validates the final URL against Supabase Auth → URL Configuration → Redirect URLs at delivery time as a second gate.

Every VTT's `src/lib/inviteHelpers.js` (or wherever the function is invoked) MUST pass `redirect_to: window.location.origin + '/'`:

```js
await supabase.functions.invoke('send-game-invite', {
  body: { game_id, email, role, redirect_to: window.location.origin + '/' }
});
```

Without this, GMs on localhost cannot invite players to a local dev game — the email link lands on prod.

**Verify G:** as the GM, sign in on `localhost:NNNN`, click "Invite Player", enter a fresh email. The email's link target should be `http://localhost:NNNN/?invite=<token>`, not `https://<anything>.shawnsvtts.com/`.

## End-to-end smoke test (run after A–E in order; STOP on first failure)

1. `pnpm --filter @shawnsvtts/<vtt> dev` → loads on `localhost:NNNN`. Welcome shows the inline magic-link form (NOT a bouncer to prod).
2. Submit your email → "Magic link sent — check your email." Click the link → lands on `localhost:NNNN/`. (Failure modes: `TypeError: Failed to fetch` in console → step A.9 missing — `.env.local` not created, Supabase URL is `placeholder.invalid`. "Redirect URL not allowed" or link lands on prod → step C wrong.)
3. Push a branch → Vercel build → visit `https://<vtt>.shawnsvtts.com/`. Welcome bounces to `https://shawnsvtts.com/login?return=https://<vtt>.shawnsvtts.com/`. (Failure to bounce → app didn't build, env vars missing, or domain not on `.shawnsvtts.com`.)
4. Sign in at marketing → bounce back → already signed in. (Failure → cookie SSO broken, usually env vars in step B or domain not under `.shawnsvtts.com`.)
5. (If Patreon enabled) Click Connect Patreon → OAuth round-trip → callback returns to `https://<vtt>.shawnsvtts.com/?patreon=connected`. (Failure → step D wrong, or Patreon Connect button isn't wired correctly.)

## Pitfalls (incident-driven)

- **`apps/<vtt>/.env.local` is required for local magic-link to work.** Scaffold ships `.env.example` only (committed); `.env.local` is per-machine and gitignored. Symptom of forgetting: magic-link submit throws `TypeError: Failed to fetch` because the client resolves to `placeholder.invalid`. Confirmed on bitd 2026-05-04. Always `cat apps/shadowdark/.env.local > apps/<vtt>/.env.local` (or equivalent) BEFORE the first end-to-end smoke test.
- **Vercel env vars are per-project, NOT per-org.** New projects start EMPTY. Auth silently falls back to `placeholder.invalid` (`packages/auth/src/client.js:28`). See `feedback_vercel_env_per_project.md`.
- **Patreon webhook MUST have Verify JWT OFF.** Patreon doesn't send a Supabase JWT; flipping it on 401s every webhook silently and `webhook_events` stays empty. See `feedback_supabase_function_jwt_verify.md`.
- **Welcome.jsx is NOT a pure bouncer.** Inline magic-link form on localhost is mandatory — making it a pure bouncer re-creates the loop the marketing `Login.jsx` guard fixes from the other side. See `localhost-auth` skill.
- **Cookie SSO requires `.shawnsvtts.com` domain suffix.** Vanity/custom domains break it because the cookie scope won't match. If a partner needs a custom domain, it has to CNAME to a `<vtt>.shawnsvtts.com` Vercel domain or get its own SSO design.
- **The two allowlists are operational state outside the codebase.** A backup-restore, project clone, or env wipe loses them with no diff to detect it. Always re-verify after any infra rollback.
- **Vercel webhook silent-drop.** If pushes stop deploying with no error in the dashboard, invoke `vercel-deploy-fallback` — `npx vercel deploy --prod` from repo root is the working manual path.
- **`supabase db push --linked` is BANNED against prod.** Unrelated to auth onboarding directly, but listed in `CLAUDE.md` because new VTTs often want migrations — apply via SQL editor only.
- **`npx --no-install supabase ...` blocks the CLI install on a fresh machine.** Drop the flag — `npx supabase ...` lets it install on first use and prompts once for confirmation.
- **`PATREON_OAUTH_ALLOWED_RETURN_ORIGINS` cannot be revealed once set.** Supabase masks the value in the dashboard, the CLI, and every API. If you forget the current value and need to add an origin, you have to rebuild the full CSV from the canonical 12-origin baseline in step D and re-set it. Don't `secrets unset` it first — that nukes Patreon Connect for every existing app.
- **Branch from `main`, never from an in-flight feature branch.** Adding a new VTT touches `package.json`, `pnpm-lock.yaml`, `docker-compose.yml`, three sibling Dockerfiles. Any of these mid-flight on another branch (campaign-map, parity work) collides hard. The two-stash recovery is documented in step A but takes ~20 minutes — better not to need it.
- **Vite dep-pre-bundle cache is sticky across branch switches.** After flipping branches that change workspace deps (e.g. `packages/hex-grid` exists on one branch but not the other), `pnpm install` re-links node_modules but Vite still serves from `.vite/deps`. First dev-server boot post-switch needs `pnpm dev:<vtt> -- --force` (or `Remove-Item -Recurse -Force apps/<vtt>/node_modules/.vite`).

## File map — jump points

Code:
- `packages/auth/src/storage.js:26` — `DEFAULT_COOKIE_DOMAIN`
- `packages/auth/src/storage.js:33-38` — `isDevHost` (cookie-vs-localStorage decision)
- `packages/auth/src/storage.js:122` — `createSharedAuthStorage` export
- `packages/auth/src/client.js:15` — `createSharedSupabaseClient` export
- `packages/auth/src/client.js:28` — `placeholder.invalid` fallback
- `apps/swn/src/lib/supabase.js:1-9` — three-line wrapper template
- `apps/swn/src/components/Welcome.jsx:23` — `VITE_AUTH_HOST` fallback
- `apps/marketing/src/components/Login.jsx:22-122` — loop guard (`devMismatch`, `isLocalhostUrl`, `isOnProdHost`, manual continuation panel)
- `apps/swn/src/lib/patreonOAuth.js:17,24-26,47` — `kickoffConnect`, `return_to`, `disconnectPatreon`
- `apps/swn/src/components/PreferencesModal.jsx:572-589,604,682-684` — query-param handler, click handler, Connect button
- `apps/{swn,shadowdark}/src/App.jsx:32-53` — session-gate pattern

Edge functions / templates:
- `supabase/functions/patreon-oauth-start/index.ts:21` — Verify JWT OFF
- `supabase/functions/patreon-oauth-start/index.ts:126,176-189` — `return_to` validation
- `supabase/functions/patreon-oauth-start/index.ts:133` — single shared `redirectUri`
- `supabase/functions/patreon-oauth-callback/index.ts:23,86,540` — Verify JWT OFF, `state.returnTo` read, `APP_REDIRECT_URL` fallback
- `supabase/functions/patreon-webhook/index.ts:3,31-35,284-294` — Verify JWT OFF, event types, HMAC-MD5 check
- `supabase/templates/magic-link.html:8,21-23,36,53` — branded strings (white-label deferral)

Operational state (not in repo):
- Supabase Auth Redirect URLs — dashboard
- `PATREON_OAUTH_ALLOWED_RETURN_ORIGINS` — supabase secrets
- Vercel env vars — per-project Vercel dashboard
- Patreon dev portal — single shared client, single shared redirect URI

## Out of scope

- Cross-port SSO in dev (would require shared cookie domain like `*.local` + mkcert; explicitly punted in `localhost-auth`).
- Per-VTT magic-link template white-label (deferred — current template is shared "ShawnsVTTs" branding).
- Gameplay schema for the new VTT (handled by `*-parity` skills: `locations-notes-parity`, `npcs-parity`, `enemies-parity`, `quests-parity`, `initiative-parity`).
- New Supabase project per VTT (architectural decision: single project, RLS-scoped per `games.vtt`).
