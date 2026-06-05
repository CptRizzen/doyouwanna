# Do You Wanna — Design System

> The brand & UI system for **Do You Wanna**, a social activity app that combines
> private friend-circle coordination with opt-in public discovery.
> Think **Meetup × Find My Friends × Bumble BFF**.

This project is the single source of truth for how the product looks, sounds, and
feels. An automated compiler bundles the React components into a runtime library
(`window.DoYouWannaDesignSystem_3f6d35`) and indexes the tokens in `styles.css`.

---

## 1. Product context

Do You Wanna helps groups of friends turn "we should hang out" into a real plan,
and lets the right strangers find each other around shared activities — safely,
with privacy on by default.

**Core loops**
1. **Friend circles** — user-defined, activity-tagged groups (Hiking Crew, Bar Trivia Gang…).
2. **Plans & broadcasts** — advance plans *or* spur-of-the-moment check-ins, sent to one or more circles.
3. **Live location** — share your live location with *specific circles only*.
4. **The map** — see friends/attendees en route ("on my way") or at the spot.
5. **Email invites** — non-users get an invite, make an account, auto-join the event.
6. **Discovery** — opt-in public presence so strangers doing the same activity can find you.

**Privacy posture (load-bearing for the brand):** Discovery is **OFF** by default,
location is **blurred** for strangers, and connection requests are **consent-required**
(never auto-follow). The UI should always make the audience of any share obvious.

**Platform:** mobile-first, **iOS-native feel** (Android parity later). Texting-heavy,
casual, social.

### Sources provided
- **Reference design** (user upload): `uploads/reference_designs-1780693023966.jpg` —
  a dark, hot-pink event/ticketing app. We borrowed its *structure & energy*
  (immersive photo cards, a live friend map, rounded bubbly UI, an iOS tab bar with a
  center action) but **not** its palette.
- No codebase or Figma was attached. The visual system below is original, anchored to
  the user's explicit answers: warm **coral + amber** palette, **rounded/bubbly** wordmark,
  casual chatty tone, **iOS-native**, **bold & novel**.

---

## 2. Content fundamentals (voice & tone)

**Vibe:** like texting a friend who's great at making plans happen. Warm, low-pressure,
a little hype — never corporate, never salesy.

- **Person:** second person, "you" / "your circles". The app talks *to* you and *for* you
  ("Maya started a plan", "3 friends are on the way").
- **Casing:** **sentence case** everywhere — buttons, titles, nav. Reserve UPPERCASE for
  tiny eyebrows/labels only (e.g. `NEARBY RIGHT NOW`, tracked `0.08em`).
- **Length:** short. Verb-first CTAs. Prefer 2–5 word buttons.
- **Punctuation:** contractions always ("you're", "can't", "let's"). Occasional em-dash.
  Avoid exclamation spam — one "!" max, used sparingly.
- **Naming the brand in copy:** the app's whole personality is the question — "**Do you wanna…?**"
  Headlines can complete it: *"Do you wanna go?"*, *"Wanna grab trivia?"*

**Example copy**
- Empty circle: *"No plans yet. Wanna start something?"*
- RSVP states: **I'm in** · **Maybe** · **Can't**
- Live: **I'm on my way** → once moving: *"You're on the way · sharing live"*
- Invite: *"We'll text Sam a link. They join the plan the second they sign up."*
- Privacy reassurance: *"Only Hiking Crew can see you right now."*
- Discovery off: *"You're invisible to people outside your circles."*

**Emoji:** used **sparingly and purposefully** — fine as a circle's chosen glyph or a
light reaction, never decorating system copy or buttons. Default to Lucide icons over emoji
in chrome. (User left this to us; we kept it tasteful, not emoji-forward.)

---

## 3. Visual foundations

The system is **warm, sunny, and social** — the opposite of the cold nightlife neon in
the reference. Coral does the talking; amber adds spark; everything sits on warm paper.

- **Color** — Primary **coral `#FF5A3C`** (buttons, links, active states, the brand glow).
  Accent **amber `#FFC23C`** (energy, highlights, RSVP-yes warmth — never the primary fill).
  Neutrals are a **warm ink ramp** (`--ink-900 #17140F` → `--paper #FFFBF5`), never pure
  gray/black. **Circle colors** are a categorical set (coral, amber, lime, teal, sky, grape,
  rose, clay) that users assign to their circles and that propagate to dots, pins, and avatar rings.
  Status: success/live green `#1FA971`, danger red `#E0322B`, info/route sky `#3B9EFF`.
- **Type** — Display/brand **Fredoka** (rounded, bubbly; weights 500–600 for headings).
  UI & body **Hanken Grotesk** (clean warm grotesque; 400 body, 600–700 labels).
  Mono **DM Mono** (invite codes, distances, timestamps). Mobile body is **15px**; nothing
  smaller than 11px. Display tracking `-0.02em`.
- **Spacing** — 4px grid. Default screen gutter **20px**, section gap **28px**. Touch targets **≥44px**.
- **Corners** — generous & bubbly: cards **24px** (`--radius-xl`), sheets **28px**, buttons & chips
  **fully rounded** (pill). Inputs/tiles **14px**.
- **Backgrounds** — warm **`--paper`** pages, **white** cards. No gradient-wash backgrounds.
  Imagery is **real activity photography** (warm, candid, outdoorsy/social — hiking, brunch,
  trivia, runs), always full-bleed inside rounded cards with a **bottom-up protection scrim**
  (`--scrim-photo`) so text stays legible.
- **Cards** — white, `--radius-xl`, hairline border `--border-subtle` + soft **`--shadow-md`**
  (warm ink-tinted, never harsh black). Photo cards use `--shadow-lg`.
- **Elevation** — soft, warm, ink-tinted shadows. Primary actions get a **coral glow**
  (`--shadow-primary`) — the one place we let a shadow take color.
- **Glass** — frosted **`--glass-light`** (blur ~10–18px) for chrome that floats over photos/maps:
  the tab bar, the circle tag on a photo, map controls.
- **Motion** — quick and a little springy. Default `--ease-out` at `--dur-base` (220ms).
  Playful overshoot `--ease-spring` for toggles, the segmented thumb, and things that "pop".
  No infinite decorative loops except the **live dot** pulse. Respect `prefers-reduced-motion`.
- **Press / hover states** — buttons **scale to 0.96** on press (icon buttons 0.90); cards
  scale to ~0.985. Hover isn't primary (touch-first) but secondary surfaces darken slightly.
- **Borders** — hairlines are warm ink (`--border-subtle`/`--divider`), 1–1.5px. Selection is a
  2px coral border.
- **Transparency & blur** — used only for chrome over content (glass), and the photo scrim.
  Solid surfaces everywhere else.

---

## 4. Iconography

- **System: [Lucide](https://lucide.dev)** — line icons, **2px stroke**, round caps/joins.
  Loaded from CDN (`https://unpkg.com/lucide@0.456.0`). The `Icon` component wraps it.
  In tab bars the active icon goes to a heavier 2.6 stroke to read as "filled".
- **Why Lucide:** the closest CDN match to an SF-Symbols-like, friendly-but-precise feel for an
  iOS-native app. **⚠ Substitution flag:** if you license/commission a custom icon set, swap the
  CDN link and keep the names mapping — nothing else should change.
- **App glyph:** a speech-bubble mark (the "wanna?") — see `assets/`. It is the only bespoke
  icon; everything else is Lucide.
- **Emoji / unicode as icons:** avoided in chrome. Allowed as a *circle's* user-chosen glyph.
- Common names in use: `house · users-round · map · user-round · plus · bell · search ·
  sliders-horizontal · map-pin · navigation · calendar · clock · check · x · chevron-right ·
  radar · shield-alert · circle-help · sparkles · compass · tent · mountain-snow · footprints`.

### Assets (`assets/`)
- `app-icon.svg` — primary app icon (coral squircle + speech-bubble mark).
- `app-icon-dark.svg` — on-dark / ink variant.
- `glyph.svg` — the bubble mark alone (`currentColor`), for monochrome lockups.

---

## 5. Index / manifest

**Root**
- `styles.css` — global entry point (consumers link this). `@import`s the tokens + fonts.
- `readme.md` — this file. `SKILL.md` — portable skill wrapper.

**`tokens/`** — `fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `effects.css` · `base.css`

**`guidelines/`** — foundation specimen cards (Design System tab):
colors (coral, amber, ink, circles, status), type (display, body, scale, mono), spacing
(scale, radii, shadows), brand (logo, signature photo card).

**`components/`** — reusable React primitives (`window.DoYouWannaDesignSystem_3f6d35`):
- `icon/` — **Icon** (Lucide wrapper)
- `actions/` — **Button**, **IconButton**
- `people/` — **Avatar**, **AvatarStack**, **CircleTag**, **Badge**
- `forms/` — **Input**, **Switch**, **SegmentedControl**
- `surfaces/` — **Card**, **ListRow**
- `app/` — **EventCard**, **TabBar**, **RSVPBar** (composites)

**`ui_kits/app/`** — high-fidelity, click-through recreation of the mobile app, centered on
the **Friend Circles** flow (`index.html`).

---

## 6. Using the system

- **Consumers** link `styles.css` and load `_ds_bundle.js` (auto-generated), then read components
  off `window.DoYouWannaDesignSystem_3f6d35`. Load the **Lucide** UMD script for icons.
- **Reference tokens, not raw values.** Use `--primary`, `--text-strong`, `--surface-card`,
  `--radius-card`, `--shadow-primary`, circle-color tokens, etc.
- **Compose, don't fork.** Build screens from the primitives; don't re-implement Button/Avatar.
