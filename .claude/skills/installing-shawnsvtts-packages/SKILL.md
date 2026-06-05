---
name: installing-shawnsvtts-packages
description: Use when a contributor (especially someone new to npm/GitHub) hits `401 Unauthorized` on `pnpm install` in any split-out VTT repo (shawnsvtts-marketing, swn-vtt-tracker, shadowdark-tracker, deadshell-tracker, bitd-tracker, cyberpunk-tracker), or when onboarding a new contributor to a repo that consumes private @shawnsvtts/* packages from GitHub Packages. Walks through creating a read:packages Personal Access Token, wiring it as a USER-SCOPE env var (the path that actually works), troubleshooting the most common errors with exact error text, and answering "why do I need this at all". Triggers on "401 on pnpm install", "can't install @shawnsvtts", "GitHub Packages auth", "new contributor setup", "set up shawnsvtts packages", "GITHUB_PACKAGES_TOKEN".
version: 2.0.0
---

# installing-shawnsvtts-packages

Onboarding recipe for a new contributor cloning any split-out VTT repo (e.g., `shadowdark-tracker`) and running `pnpm install` for the first time. The repo depends on private `@shawnsvtts/*` packages hosted on GitHub Packages — those won't install without a Personal Access Token (PAT). This skill is the friendly walkthrough.

## Why you need a PAT

The shared packages (`@shawnsvtts/auth`, `@shawnsvtts/dice`, etc.) live on GitHub Packages — a private npm registry scoped to the `ShawnsVTTs` GitHub organization. GitHub does not let anonymous downloads of org-private packages, so npm/pnpm needs to prove who you are. The proof is a Personal Access Token (PAT) — a long string that says "GitHub: this user is allowed to read packages from ShawnsVTTs."

The token never lets anyone publish anything, edit code, or impersonate you. It only proves "yes, this person has read access." Treat it like a password — don't commit it, don't share it, don't paste it into chat or terminal output where it might leak.

## The one path that works (env var, user-scoped, persistent)

Every split repo has a **committed** `.npmrc` like:

```
@shawnsvtts:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

The repo `.npmrc` always wins over `~/.npmrc` for the same key. So **putting your token literally in `~/.npmrc` does nothing in these repos** — the repo's `${GITHUB_PACKAGES_TOKEN}` reference overrides it. If the env var is unset, the repo `.npmrc` evaluates to an empty token, pnpm falls back to public npm, and you get a `404 Not Found` for `@shawnsvtts/auth` (it's private, not on public npm).

**Solution: set `GITHUB_PACKAGES_TOKEN` as a Windows USER-scope env var (or shell profile env on Mac/Linux) so every new shell, terminal, IDE, and Docker build inherits it.**

## One-time setup

### Step 1 — Create the PAT

1. Sign in to GitHub.
2. Top-right avatar → **Settings**.
3. Bottom of the left sidebar → **Developer settings**.
4. Left sidebar → **Personal access tokens** → **Tokens (classic)**.
5. **Generate new token** → **Generate new token (classic)**. (NOT "Fine-grained tokens" — those don't currently support GitHub Packages reliably.)
6. Fill in:
   - **Note**: `@shawnsvtts read:packages — <your name>`
   - **Expiration**: **Custom → 1 year** (or "No expiration" if you accept the trade-off — leaked tokens never auto-revoke).
   - **Scopes**: check **only** `read:packages`. Nothing else.
7. Bottom of the page → **Generate token**.
8. Copy the token. **It starts with `ghp_` and is shown exactly once.** If you close the page without copying, you have to generate a new one.

⚠ **Don't paste the token into chat, AI assistants, terminal output, or anywhere it may render in error messages.** PowerShell prints unquoted strings verbatim in error output — see "PowerShell quoting gotcha" below.

### Step 2 — Set the env var (persistent)

**Windows / PowerShell** (recommended — survives reboots, applies to every shell + IDE):

```powershell
[Environment]::SetEnvironmentVariable("GITHUB_PACKAGES_TOKEN", "ghp_paste_your_token_here", "User")
```

Run once in any PowerShell window. Writes to Windows User-scope env (registry). Close existing terminals, open a fresh one — env var is live.

**Mac / Linux / Git Bash** — add to `~/.zshrc` or `~/.bashrc`:

```bash
export GITHUB_PACKAGES_TOKEN=ghp_paste_your_token_here
```

Restart shell or `source ~/.zshrc`.

### Step 3 — Verify

Open a **new** terminal:

```
echo $env:GITHUB_PACKAGES_TOKEN     # PowerShell
echo $GITHUB_PACKAGES_TOKEN         # bash/zsh
```

Should print your `ghp_...` token. If empty:
- PowerShell: did you use `[Environment]::SetEnvironmentVariable(...)` (persistent) or only `$env:NAME = "..."` (session-only)?
- Did you open a NEW terminal after setting? Existing ones don't pick up new env vars.

Then:

```
cd <any-shawnsvtts-repo>
pnpm install
```

Should pull `@shawnsvtts/auth` and any other private deps without errors. First install can take a minute.

## Common errors with exact text

### `npm error 404 Not Found - GET https://registry.npmjs.org/@shawnsvtts/auth`

**Most common failure mode.** The env var is unset → repo `.npmrc` evaluates to empty token → pnpm falls back to public npm → 404 because the package is private.

**Fix**: Set `GITHUB_PACKAGES_TOKEN` env var per Step 2. Open a new terminal. Retry.

### `npm error 401 Unauthorized - GET https://npm.pkg.github.com/@shawnsvtts/auth`

**Cause**: Token is set but invalid (expired, revoked, or wrong scope).

**Fix**:
1. Has it expired? GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic). If "Expired", regenerate per Step 1.
2. Wrong scopes? Must have at least `read:packages`. Regenerate with that scope checked.
3. Were you removed from the `ShawnsVTTs` org? Ask Shawn.

### PowerShell quoting gotcha — `'ghp_...' is not recognized as a cmdlet`

```
PS> $env:GITHUB_PACKAGES_TOKEN=ghp_xyz
ghp_xyz : The term 'ghp_xyz' is not recognized as the name of a cmdlet...
```

**Cause**: Missing quotes. PowerShell tried to execute the token value as a command.

**⚠ The error message contains your token.** That counts as a leak — revoke and regenerate.

**Fix**: Use quotes:

```powershell
[Environment]::SetEnvironmentVariable("GITHUB_PACKAGES_TOKEN", "ghp_NEW_TOKEN", "User")
```

### `Tarball not found` / `ERR_INVALID_THIS` / `ECONNRESET`

**Cause**: Flaky network or GitHub Packages outage. Retry. Check https://www.githubstatus.com.

### Docker build fails inside container with `401`

**Cause**: The `GITHUB_PACKAGES_TOKEN` env var didn't make it into the container at build time.

**Fix**: The split repos pass it as a Docker build arg. Either:
- `docker compose build --build-arg GITHUB_PACKAGES_TOKEN=$env:GITHUB_PACKAGES_TOKEN <service>` (one-off), or
- Add to `.env` next to the compose file (compose reads it automatically).

### Vercel build fails with `401`

**Cause**: Vercel project doesn't have `GITHUB_PACKAGES_TOKEN` in its Environment Variables.

**Fix**: Vercel → Project → Settings → Environment Variables. Add `GITHUB_PACKAGES_TOKEN` for Production + Preview + Development. Redeploy.

## Rotating your PAT

When your PAT expires (or if you suspect it leaked — including being printed in any error message or chat):

1. Generate a new one with `read:packages` (Step 1).
2. Update `GITHUB_PACKAGES_TOKEN` env var:
   ```powershell
   [Environment]::SetEnvironmentVariable("GITHUB_PACKAGES_TOKEN", "ghp_NEW", "User")
   ```
3. Open a new terminal so the new value loads.
4. Verify with `echo $env:GITHUB_PACKAGES_TOKEN`.
5. **Revoke the old one** in GitHub Settings → Developer settings → Tokens (classic).
6. If you also use Vercel: update each project's `GITHUB_PACKAGES_TOKEN` env var to the new value.

## What this skill does NOT cover

- **Publishing** new versions of `@shawnsvtts/*` — see the `publishing-shawnsvtts-packages` skill (different PAT scopes, different procedure).
- **Becoming a member of the `ShawnsVTTs` org** — the org admin (Shawn) invites you. Once invited, your `read:packages` PAT works against the org's private packages without any further setup.
- **The platform repo (`swn-tracker`)** — it consumes `@shawnsvtts/*` packages via `workspace:*` (sibling `packages/*` directories), NOT GitHub Packages. No PAT needed in the monorepo for those workspace deps. (Migrations + edge functions also live there; no PAT needed.)

## Verification

- New terminal: `echo $env:GITHUB_PACKAGES_TOKEN` prints your `ghp_...` value.
- `pnpm install` in any split repo completes without 401 or 404.
- `pnpm dev` boots the app at the expected port (5173 marketing, 5174 swn, 5187 shadowdark, 5188 deadshell, 5189 bitd, 5190 cyberpunk).
