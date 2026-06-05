---
name: new-vtt
description: Use when adding a full new VTT (gameplay layer, not just auth scaffold) under apps/<vtt>/. Covers CSS design system, DB migration with RLS, GameContext filter, character data files, wizard pattern (WizardProvider/CharacterWizard/buildCharacter/queries), character sheet pattern (data fetching + 3-column grid + Skeleton), advancement pattern (level-based wizard mode OR XP-based inline), roster (MyCharactersPage + setPrimaryCharacter), and App.jsx view-state machine wiring. Sibling of vtt-auth-onboarding (run that FIRST for Vercel/DNS/Supabase Auth/Patreon plumbing). Triggers on "add new VTT gameplay", "build character creation for <system>", "wire up <system> sheet", "new game system to monorepo".
version: 1.0.0
---

# new-vtt

Canonical playbook for adding a full new VTT (e.g. `apps/dnd5e`, `apps/bitd`) on top of an existing auth-scaffold app. Use this AFTER `vtt-auth-onboarding` (which handles Vercel project, DNS, Supabase Auth Redirect URLs, Patreon allowlist, package.json wiring).

Sibling skills:
- `vtt-auth-onboarding` — Vercel/DNS/Supabase Auth/Patreon. Run FIRST.
- `localhost-auth` — dev-port plumbing.
- `*-parity` (locations-notes / npcs / enemies / quests / initiative) — gameplay schema and entity panels for shared features. Run AFTER this skill if you want shared overworld features.

## Architecture recap

A VTT in this monorepo is a fully separate Vite app. Each VTT has:
- Its own design system (CSS) — never shared
- Its own character DB table (e.g. `sd_characters`, `bitd_characters`)
- Its own wizard for character creation/editing (and possibly level-up)
- Its own character sheet
- A roster (`MyCharactersPage`) that scopes via `games.vtt = '<vtt>'`
- An `App.jsx` view-state machine (no router; useState branches)

Shared infra (do NOT duplicate):
- `packages/auth/` — Supabase client + cookie storage
- `packages/dice/` — dice engine
- `packages/confirm-dialog/` — confirm dialog primitive
- `public.games`, `public.profiles`, `public.game_members` tables
- RLS helpers `is_member_of(game_id, uid)`, `is_gm_of(game_id, uid)`
- `public.set_updated_at()` trigger function

## Pre-flight checklist

Before starting:
1. Auth scaffold exists at `apps/<vtt>/src/` with App.jsx, main.jsx, hooks/useAuth.jsx, lib/supabase.js, components/Welcome.jsx
2. `apps/<vtt>/package.json` has `@shawnsvtts/auth` workspace dep
3. Vercel project exists (per `vtt-auth-onboarding`)
4. `games.vtt = '<vtt>'` is supported by the games table (it is — the column accepts free text)
5. Read the system's official rules. Each game system has a different shape; do not assume.

## Step A — CSS Design System

**Each VTT writes its OWN CSS from scratch.** Do NOT copy CSS from another VTT — even when palettes share names, the aesthetic should differ.

Files to create at `apps/<vtt>/src/styles/`:

```
index.css         ← @import only (in order)
tokens.css        ← all CSS custom properties
base.css          ← reset, typography defaults, utilities
components.css    ← .card, .btn, .input, .badge primitives
atmosphere.css    ← .skeleton shimmer, .grain, .vignette, reduced-motion fallbacks
wizard.css        ← .wiz-shell, .wiz-step, .wiz-progress, .info-card, system-specific selectors
sheet.css         ← .<vtt>-sheet 3-column grid, panel headers
```

`tokens.css` MUST define this token schema (so other apps' patterns transfer cleanly):

```css
:root {
  /* Fonts */
  --font-display:   "<system display font>", serif;
  --font-body:      "<system body font>", serif;
  --font-smallcaps: "<system smallcaps font>", serif;
  --font-mono:      "JetBrains Mono", ui-monospace, monospace;

  /* Type scale (clamp() for display, fixed for body) */
  --fs-display-1, --fs-display-2, --fs-display-3
  --fs-h2, --fs-h3, --fs-h4
  --fs-body, --fs-body-sm, --fs-caption, --fs-mono
  --tracking-display, --tracking-tight, --tracking-caps, --tracking-caps-tight

  /* 4px-base spacing */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 64px;
  --s-9: 96px; --s-10: 128px;

  /* Radii — pick aesthetic; e.g. flat for industrial, soft for fantasy */
  --r-sm; --r-md; --r-lg; --r-pill: 999px;

  /* Borders */
  --bw-hair: 1px; --bw-rule: 2px; --bw-bold: 3px;

  /* Motion */
  --dur-fast: ~120ms;
  --dur-base: ~220ms;
  --dur-slow: ~400ms;
  --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-in:  cubic-bezier(0.55, 0, 0.7, 0.2);

  /* Layout */
  --container: 1240px;
  --container-narrow: 760px;
}
```

Then per palette (`[data-palette="..."]` on `<body>`):

```css
[data-palette="<name>"] {
  --bg-0..4         /* page → cards → raised → dividers */
  --fg-1..4         /* primary → secondary → tertiary → disabled */
  --line-1..3       /* hairline → divider → emphasized */
  --accent          /* main accent color */
  --accent-bright   /* hover/active */
  --accent-deep     /* burnt end of gradients */
  --accent-soft     /* tint backgrounds */
  --accent-glow     /* halos */
  --skeleton-base   /* shimmer base — typically var(--bg-3) */
  --skeleton-shimmer/* shimmer highlight — rgba of fg-1 */
  --danger
  --danger-glow
}
```

Update `apps/<vtt>/index.html` `<head>` with the Google Fonts link.

`atmosphere.css` MUST include `.skeleton` shimmer with reduced-motion fallback. CLAUDE.md mandates Skeleton on all React VTTs.

## Step B — DB Migration

Naming: `supabase/migrations/NNN_<vtt>_characters.sql` (next available NNN).

**RULES (from CLAUDE.md):**
- Never `supabase db push --linked`. Apply via Supabase SQL editor with a human reading the file.
- Pre-flight + post-flight row count audits in comments.
- Idempotent (`create table if not exists`, `if not exists` on indexes, `drop policy if exists` before `create policy`).
- Pair with `NNN<b>_<vtt>_characters_verify.sql` for post-apply validation.

Required columns (every character table):
- `id uuid pk default gen_random_uuid()`
- `game_id uuid not null references games(id) on delete cascade`
- `owner_id uuid not null references profiles(id) on delete cascade`
- `name text not null default ''`
- `is_primary boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

System-specific columns: stats, inventory, advancement state, etc. Use `jsonb` for shapes that may evolve, columns for primitives that have constraints.

Required indexes:
- pkey
- `<vtt>_characters_game_idx on (game_id)`
- `<vtt>_characters_owner_idx on (owner_id)`
- `<vtt>_characters_owner_game_idx on (owner_id, game_id)`
- `<vtt>_characters_one_primary_per_owner_per_game_idx UNIQUE on (owner_id, game_id) WHERE is_primary`

Required trigger:
- `before update for each row execute function public.set_updated_at()`

Required RLS (all using `is_member_of()` / `is_gm_of()`):
- SELECT: any game member
- INSERT: member AND (owner = auth.uid() OR is_gm)
- UPDATE: member AND (owner = auth.uid() OR is_gm)
- DELETE: GM only (or owner — choose policy)

Reference: `supabase/migrations/120_sd_characters.sql`, `127_sd_characters_is_primary.sql`, `137_bitd_characters.sql`.

## Step C — GameContext

**File:** `apps/<vtt>/src/contexts/GameContext.jsx`

Mirror `apps/shadowdark/src/contexts/GameContext.jsx`. Change:
- `LS_KEY = '<vtt>:currentGameId'` (per-app localStorage so games don't leak between VTTs)
- Membership filter: `.filter((m) => m.games?.vtt === '<vtt>')`
- Exports: `useGame()` hook, `<GameProvider>` provider

Wrap `<GameProvider>` in `main.jsx` between `<AuthProvider>` and `<App>`.

## Step D — Data Files

**Folder:** `apps/<vtt>/src/data/`

One file per game-data domain:
- `playbooks.js` / `classes.js` / `ancestries.js` — keyed objects + ordered arrays + `getById()` helpers
- `actions.js` / `skills.js` — flat lists + grouping metadata
- `items.js` — equipment catalog
- `spells.js` / `talents.js` — if the system has them

Pattern:
```js
export const FOO_DATA = { id1: { ... }, id2: { ... } };
export const FOOS = Object.entries(FOO_DATA).map(([id, v]) => ({ id, ...v }));
export const getFoo = (id) => FOO_DATA[id] ?? null;
```

Pure data. No React, no Supabase calls. The wizard reads from these to render choices.

## Step E — Wizard

**Files at `apps/<vtt>/src/wizard/`:**

```
WizardProvider.jsx     ← context + useReducer (PATCH/PATCH_NESTED/RESET/HYDRATE)
CharacterWizard.jsx    ← step orchestrator + progress pip rail + STEP_VALIDATORS
StepHeader.jsx         ← shared step header (eyebrow + title + lede)
buildCharacter.js      ← buildCharacterRow(draft) + draftFromRow(row)
steps/
  Step<X>.jsx ...       ← one file per step
```

`WizardProvider` exports:
- `WIZARD_STEPS = [{ id, label, enabled?(draft, mode) }, ...]`
- `activeSteps(draft, mode)` — filter helper
- `<WizardProvider mode='create'|'edit'|'level-up' editingRow={row} children>`
- `useWizard()` returning `{ draft, mode, steps, currentIndex, currentStep, setStep, patch, patchNested, reset, hydrate, next, prev }`

Reducer must include a step-bounce useEffect: if a draft change disables the current step, fall back to the last enabled step.

`CharacterWizard.jsx` renders:
- Progress rail (one pip per active step)
- Active step component (from `STEP_COMPONENTS[currentStep.id]`)
- Sticky `<ActionBar>` footer with Prev / Next / Submit buttons
- `STEP_VALIDATORS[stepId](draft)` predicates gate Next button
- In `mode='edit'`, validators bypassed (`canNext = true`)

Submit (review step):
- Calls `saveCharacter({ mode, draft, gameId, ownerId, characterId })` from `lib/characterQueries.js`
- On success, calls `onExit?.(savedId)` so the parent can navigate

Reference: `apps/shadowdark/src/wizard/WizardProvider.jsx`, `apps/shadowdark/src/wizard/CharacterWizard.jsx`.

## Step F — Character Sheet

**Files at `apps/<vtt>/src/sheet/`:**

```
CharacterSheet.jsx        ← data-fetching wrapper; <SkeletonSheet> while loading
CharacterSheetInner.jsx   ← pure presentation; 3-col grid
sections/                 ← optional, split panels per file
```

Layout: 3-column CSS Grid (`<vtt>-sheet` class). Pre-shape Skeleton to match grid so loading does not jank.

CLAUDE.md: **Skeleton is mandatory.** Add `apps/<vtt>/src/components/ui/Skeleton.jsx` with at minimum `<Skeleton>`, `<SkeletonText>`, `<SkeletonRowList>`, and a system-specific `<SkeletonSheet>`.

## Step G — Advancement

Two patterns depending on the system:

**Level-based (Shadowdark, SWN, D&D):** reuse the wizard with `mode='level-up'`. Add a level-up branch to `WIZARD_STEPS.enabled` predicates. Build a level-up step set (HP roll, skill spend, focus pick, review). Save via `saveCharacter({ mode: 'level-up', ... })` which produces a level-up patch.

**XP-based (BitD, FitD games):** advancement is granular and inline. Don't wrap in a wizard — embed pickers in the sheet. Create `lib/advancementQueries.js` with `applyXAdvancement({ characterId, ... })` functions that fetch current state, compute the patch, and write back. Reset XP to 0 atomically.

Reference: `apps/swn/src/sheet/levelup/` (level-based), `apps/bitd/src/sheet/XPTracker.jsx` (XP-based).

## Step H — Roster

**File:** `apps/<vtt>/src/components/MyCharactersPage.jsx`

Mirror `apps/shadowdark/src/components/MyCharactersPage.jsx`:
- Fetch `listMy<Vtt>Characters(ownerId)` (joins on `games` filtered by `vtt`)
- `<SkeletonRowList>` while `rows === null`
- Each row shows: name, system-specific subtitle (e.g. class+level for SD, playbook+heritage for BitD), `<ActiveToggle>` for `is_primary`
- "+ Forge new <thing>" button opens `CharacterWizard mode='create'`
- "Edit" opens `CharacterWizard mode='edit' editingRow={row}` with `draftFromRow(row)`

`is_primary` toggling MUST use the two-step clear-then-set pattern (`lib/setPrimaryCharacter.js`):
1. UPDATE `is_primary = false` WHERE owner = X AND game = G AND is_primary = true AND id <> targetId
2. UPDATE `is_primary = true` WHERE id = targetId AND game = G

The partial unique index would reject a single UPDATE that lands two true values transiently. Two-step keeps the index satisfied.

Reference: `apps/swn/src/lib/setPrimaryCharacter.js`.

## Step I — App.jsx view-state machine

Replace the auth-stub `App.jsx` with a view-state machine. No router.

States typically include:
- `authLoading` — full-screen `<Skeleton>`
- no session — `<Welcome />`
- `view === 'myCharacters'` — `<MyCharactersPage />`
- `gameLoading` — chrome + Skeleton
- no `currentGameId` — `<Landing />` (game picker, create game)
- main game screen (system-specific: party strip, sheet overlay, etc.)

Use `useState` for view branches. localStorage-persist non-sensitive view state if useful (e.g. last-opened character).

Provider tree in `main.jsx`:
```jsx
<AuthProvider>
  <ThemeProvider>           {/* sets data-palette on body */}
    <GameProvider>
      <App />
    </GameProvider>
  </ThemeProvider>
</AuthProvider>
```

## Step J — Index file imports

`apps/<vtt>/src/main.jsx` imports `./styles/index.css`. The `index.css` `@import`s tokens → base → components → atmosphere → wizard → sheet in order.

`apps/<vtt>/index.html` adds Google Fonts `<link>` (preconnect + stylesheet).

## Verification checklist

After implementation, verify each in order:

**Migration:**
1. Pre-flight: `SELECT count(*) FROM public.games WHERE vtt = '<vtt>';` — record
2. Apply migration via SQL editor
3. Run verify migration — expect `NOTICE: NNN PASS`
4. Post-flight: re-run pre-flight count — unchanged

**Wizard create:**
1. `pnpm dev:<vtt>` → localhost
2. Sign in → pick/create game → click "+ create"
3. Walk all wizard steps → submit
4. New row appears in `<vtt>_characters` with all expected fields populated

**Wizard edit:**
1. Open roster → Edit
2. Steps marked `mode='edit'`-only are shown; create-only steps hidden/locked
3. Change a field → save → DB row updated; roster reflects change

**Primary toggle:**
1. Create 2 characters in same game
2. Toggle primary on A → `is_primary = true`
3. Toggle primary on B → A flips to false, B becomes true
4. Partial unique index holds (no duplicate primary rows)

**Skeleton:**
1. DevTools Network → Slow 3G
2. Roster → SkeletonRowList renders for ~2s, real rows replace with no jank
3. Character sheet → SkeletonSheet 3-col grid holds, no width collapse

**Advancement:**
1. Trigger advancement (level up OR fill XP track)
2. Make picks → confirm
3. DB row reflects changes; XP track resets if XP-based

## Account Owner / per-game role parity (mandatory)

As of 2026-05-07 (PRs #57/#58/#59, migrations 155-159), the Patreon-paying user is formally the **Account Owner** of any game they create — a permanent identity tied to `games.owner_id` and the tier cap, distinct from the per-game role on `game_members.role`. A new VTT MUST surface this split or it will misbehave the moment a user tries to be a Player in their own game.

Every new VTT must:

1. **`Landing.jsx` create form** — radio "I'll play as: GM / Player". Pass through to `createVttGame({ name, role })` which forwards `p_role` to the `create_game` RPC. Default `'gm'` for back-compat.
2. **`Landing.jsx` game tiles** — render an `OWNER` badge on tiles where `m.games.owner_id === user.id`, alongside the existing GM/Player role badge. Both can show together (owner-self-GMs).
3. **`gameQueries.js`** — also export:
   - `listGameMembersWithCharacters(gameId)` — joins `profiles` + the VTT's character table.
   - `setMemberRole({ gameId, userId, role })` — wraps `set_member_role` RPC.
   - `setMemberKicked({ gameId, userId, kicked })` — direct UPDATE on `game_members.kicked_at`.
4. **`InvitePlayerDialog.jsx`** (new) — email + role dropdown (Player default / GM). Calls `inviteHelpers.sendGameInvite(gameId, email, role)` which invokes the shared `send-game-invite` edge function with `{ game_id, email, role }`.
5. **`inviteHelpers.js`** (new) — full port of `apps/swn/src/lib/inviteHelpers.js`. **Use a per-VTT sessionStorage namespace** (e.g. `'<vtt>:pendingInviteToken'`) so two VTTs open in the same browser don't consume each other's pending invites.
6. **`ManageUsersModal.jsx`** (new) — full member list (GMs + Players) with per-row role select. Owner row exempt from kick + role-change-by-others. Surface server errors via `useNotice`:
   - P0001 → "Cannot demote the last Game Master. Promote another member first."
   - 42501 → "Only the Account Owner can change the Account Owner's role." (or for kicks: "cannot kick the Account Owner from their own game")
7. **`AppHeader.jsx`** — profile menu adds "Switch to Player / Switch to Game Master" affordance for the Account Owner. Manage Users opens for Owner OR GM (NOT just GM — an owner-as-player must still manage members). Drop any old `isGm = (currentGame.owner_id === user.id)` derivation; use `useGame().isGm` (from `currentRole === 'gm'`) instead.
8. **`GameContext.jsx`** — expose both `isGm` (per-game role) and `isAccountOwner` (`currentGame.owner_id === user.id`) as separate values on the context. Many gates need one and not the other; conflating them broke shadowdark in PR #59 review.
9. **`App.jsx`** — detect `?invite=<token>` on URL. If authed: call `redeemInvite`, `setCurrentGameId(returned)`, `refetchMemberships`, `stripInviteFromUrl`. If unauthed: stash via `stashPendingInviteToken`, strip URL, replay after session settles.

**Server-side guarantees you do not need to re-implement** (migrations 155-159):
- `create_game(p_role)` validates role and seeds `game_members` accordingly.
- `create_game_invite(p_role)` stores role on the invite row; `redeem_game_invite` reads it on join.
- `set_member_role` enforces last-GM, owner-protect, and kicked-member guards.
- `game_members_owner_unkickable` trigger blocks kicking the owner directly.
- Tier cap counts on `games.owner_id` regardless of role — no abuse vector for an owner-as-player.

**Reference impls (in order of complexity to read):**
- `apps/swn/` — original (uses `<ModalShell>` + amber palette).
- `apps/shadowdark/` — first port; portaled modals + per-VTT design tokens. Read this when adapting to a new theme.

## Common pitfalls

- **Don't share CSS files between VTTs.** Even when names overlap, write each system's tokens.css from scratch.
- **Don't skip Skeleton.** CLAUDE.md mandate; Network: Slow 3G test reveals jank immediately.
- **Don't use `supabase db push --linked`.** Migration files only, applied via SQL editor.
- **Don't use a single UPDATE for `is_primary`.** Two-step clear-then-set; the partial unique index will reject otherwise.
- **Don't add `vtt`-scoping at the app's GameContext level only.** RLS happens via `is_member_of(game_id, ...)` which checks `game_members`, not `games.vtt`. Frontend filter prevents the SD app from showing BitD games; RLS does NOT.
- **Don't forget the trigger.** `set_updated_at()` is required for `updated_at` to track writes; drop+recreate so the migration is idempotent.
- **Don't write giant migrations.** One feature per migration. Add columns in follow-up migrations as the system evolves.

## Reference files

For each pattern, read these files first:
- `apps/shadowdark/src/wizard/WizardProvider.jsx` — reducer + step-bounce pattern
- `apps/shadowdark/src/wizard/CharacterWizard.jsx` — orchestrator + validators
- `apps/shadowdark/src/wizard/buildCharacter.js` — draft↔row transform
- `apps/shadowdark/src/lib/characterQueries.js` — Supabase CRUD
- `apps/shadowdark/src/components/MyCharactersPage.jsx` — roster pattern
- `apps/shadowdark/src/contexts/GameContext.jsx` — VTT-scoped game filter
- `apps/swn/src/lib/setPrimaryCharacter.js` — two-step primary flag
- `apps/swn/src/sheet/levelup/` — level-based advancement
- `apps/bitd/src/sheet/XPTracker.jsx` — XP-based advancement
- `supabase/migrations/120_sd_characters.sql` — character table template
- `supabase/migrations/127_sd_characters_is_primary.sql` — is_primary partial-index pattern
