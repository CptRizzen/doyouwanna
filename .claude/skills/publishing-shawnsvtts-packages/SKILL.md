---
name: publishing-shawnsvtts-packages
description: Use when releasing a new version of any @shawnsvtts/* shared package (auth, confirm-dialog, dice, hex-grid, initiative-strip) to the private GitHub Packages registry. Walks through the semver bump rules, the publish command, the post-publish verification on the GitHub org Packages tab, and the publisher-PAT rotation procedure. Codifies the scope-guard so a package can never be accidentally published to public npmjs.org. Triggers on "publish package", "release shared package", "bump @shawnsvtts version", "publish to GitHub Packages", "release auth package", "release dice package".
version: 1.0.0
---

# publishing-shawnsvtts-packages

Recipe for cutting a new version of a shared package and pushing it to the private `@shawnsvtts` GitHub Packages registry. Packages are private to the `ShawnsVTTs` GitHub org. They never appear on public npmjs.org.

Scope owner: GitHub org `ShawnsVTTs` (free plan, sole admin = `CptRizzen`).

Registry URL: `https://npm.pkg.github.com`.

## When to use this skill

- Bumping a feature in `packages/auth/`, `packages/battle-map/`, `packages/confirm-dialog/`, `packages/dice/`, `packages/hex-grid/`, `packages/how-we-met/`, or `packages/initiative-strip/`.
- Publishing for the first time after the monorepo split (Phase 1 of the split plan).
- Re-publishing after a security or bug fix that needs to ship to the split-out VTT repos.
- Rotating the publisher PAT when the current one expires.

## Prerequisites (one-time setup on the publishing machine)

1. **Publisher PAT** — GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token. Scope: `write:packages` + `read:packages` + `repo` (the `repo` scope is required to associate packages with the parent repo). Expiry: 90 days max — set a calendar reminder.
2. **User-level `.npmrc`** at `~/.npmrc` (Windows: `%USERPROFILE%\.npmrc`):
   ```
   @shawnsvtts:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Never commit this file. The token is the publisher PAT.
3. **Verify auth**:
   ```
   pnpm whoami --registry https://npm.pkg.github.com
   ```
   Should print `CptRizzen`. If it errors, the PAT is wrong or expired.

## Publishing a new version

Always bump from the monorepo root. Workspace consumers (SWN, Shadowdark, Marketing) keep `workspace:*` and don't need the new version — only the split-out VTT repos do.

1. **Decide the bump** (semver):
   - **Patch** (`0.1.0` → `0.1.1`) — bug fix, no API change. Default.
   - **Minor** (`0.1.0` → `0.2.0`) — new export, new prop, no breaking change.
   - **Major** (`0.1.0` → `1.0.0`) — breaking change. Removed export, renamed prop, changed return type. Forces every consumer to update intentionally.
   When in doubt, patch. Cheap to bump again; expensive to break a downstream repo.

2. **Edit the package's `package.json`**:
   - Bump `"version"`.
   - Confirm `"publishConfig": { "registry": "https://npm.pkg.github.com" }` is present. **Without this, pnpm publishes to public npmjs.org.**
   - Confirm `"repository": { "type": "git", "url": "git+https://github.com/ShawnsVTTs/swn-tracker.git" }` is present. GitHub Packages uses this to attach the package to the parent repo's Packages tab.
   - Confirm `"private"` is removed (or `false`).
   - Confirm `"files": ["src", "README.md"]` is present so internal scripts/tests don't ship.

3. **Run the registry-guard sanity check** (every package has `prepublishOnly`):
   ```js
   "scripts": {
     "prepublishOnly": "node -e \"if(!(process.env.npm_config_registry||'').includes('npm.pkg.github.com')) { console.error('REFUSED: registry is', process.env.npm_config_registry, '— must be GitHub Packages'); process.exit(1); }\""
   }
   ```
   This refuses the publish if pnpm is somehow pointed at public npm.

4. **Publish** — **always pass `--registry` explicitly**. `publishConfig.registry` controls the destination of the upload, but pnpm does NOT propagate it into `npm_config_registry` env, which the `prepublishOnly` guard reads. Without the flag, the guard refuses with "REFUSED: registry is https://registry.npmjs.org/". Also pass `--no-git-checks` so a dirty working tree doesn't block.
   - Single package:
     ```
     pnpm --filter @shawnsvtts/auth publish --no-git-checks --registry https://npm.pkg.github.com
     ```
   - Multiple at once (only when bumping the whole set):
     ```
     pnpm -r --filter "./packages/*" publish --no-git-checks --registry https://npm.pkg.github.com
     ```
   - Skip already-published packages with an extra negative filter (e.g. `--filter "!@shawnsvtts/auth"` if you just published auth).
   The publisher PAT in `~/.npmrc` authenticates. pnpm topo-sorts so internal workspace deps publish first.

5. **Verify**:
   - GitHub → ShawnsVTTs org → Packages tab. New version should appear under the package name with the bumped version number and a fresh "Published just now" timestamp.
   - Or via CLI:
     ```
     pnpm view @shawnsvtts/auth version --registry https://npm.pkg.github.com
     ```
     Returns the version you just published.
   - **Confirm it did NOT leak to public npm**:
     ```
     pnpm view @shawnsvtts/auth version --registry https://registry.npmjs.org
     ```
     Should error with `404 Not Found`. If it returns a version, the package was leaked to public npm — see "Recovery" below.

## Bumping consuming repos

After publishing, update the split-out VTT repos that depend on the package:

1. In `deadshell-tracker` / `bitd-tracker` / future split repos: edit `package.json`:
   ```json
   "@shawnsvtts/auth": "^0.2.0"
   ```
2. `pnpm install` to refresh `pnpm-lock.yaml`.
3. Verify locally: `pnpm dev` boots, the feature using the new version works.
4. Commit + PR. Vercel auto-deploys on merge.

The monorepo apps (SWN, Shadowdark, Marketing) stay on `workspace:*` and don't need a bump — they consume the source directly.

## Publisher PAT rotation

Every 90 days (or sooner if leaked):

1. Generate a new PAT with the same scopes (`write:packages` + `read:packages` + `repo`).
2. Replace the token in `~/.npmrc` (`//npm.pkg.github.com/:_authToken=...`).
3. `pnpm whoami --registry https://npm.pkg.github.com` confirms the new token works.
4. Revoke the old PAT in GitHub → Settings → Developer settings → Personal access tokens.

If you forget and the PAT expires mid-publish, pnpm errors with `401 Unauthorized` on `pnpm publish`. Generate a new PAT and re-publish; the partial publish does not corrupt the registry (GitHub Packages is atomic per version).

## Recovery — accidentally published to public npm

If `pnpm view @shawnsvtts/auth --registry https://registry.npmjs.org` returns a version:

1. **Within 72 hours of publish**: `npm unpublish @shawnsvtts/auth@<version> --registry https://registry.npmjs.org`. After 72 hours, npm refuses unpublish to protect downstream consumers.
2. After 72 hours: publish a new version with the package contents emptied (only a README explaining the package moved). Mark the old version `deprecated`: `npm deprecate @shawnsvtts/auth@<version> "moved to GitHub Packages"`.
3. Audit `package.json` files and the `prepublishOnly` script. The leak almost always means `publishConfig.registry` was missing or the user-level `.npmrc` was bypassed.

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` on publish | Publisher PAT expired or wrong scopes | Regenerate PAT with `write:packages` + `read:packages` + `repo`; replace in `~/.npmrc` |
| `404 Not Found` on publish | Repository URL in package.json doesn't point to a repo the PAT can access | Confirm `repository.url` matches `https://github.com/ShawnsVTTs/swn-tracker.git`; confirm PAT has `repo` scope |
| `403 Forbidden` on publish | First publish of a new package — GH needs the package linked to the org | Manually publish once via `npm publish` (not pnpm); subsequent publishes work via pnpm |
| Publish succeeds but package not visible on org Packages tab | `repository` field missing or wrong | Add/fix `repository` in package.json, bump version, re-publish |
| Consumer repo `pnpm install` errors `401` | Consumer PAT issue, not publisher | Send them to the `installing-shawnsvtts-packages` skill |

## Files this skill modifies

- `packages/<name>/package.json` (version bump, publishConfig, repository, prepublishOnly)
- `packages/<name>/README.md` (optional — update if API changed)
- `~/.npmrc` (token rotation only, never committed)

## Verification

- `pnpm view @shawnsvtts/<name> version --registry https://npm.pkg.github.com` returns the new version.
- `pnpm view @shawnsvtts/<name> version --registry https://registry.npmjs.org` returns 404.
- Package visible on https://github.com/orgs/ShawnsVTTs/packages with new version timestamp.
