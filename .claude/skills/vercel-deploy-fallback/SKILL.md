---
name: vercel-deploy-fallback
description: Use when a Vercel project stops auto-deploying on git push but the GitHub repo and other Vercel projects in the same monorepo are healthy. Walks through the diagnostic ladder (dashboard → quota → hidden status filter → notifications → cross-project comparison → GitHub App install → project re-link) and ships the CLI deploy fallback recipe (`npx vercel deploy --prod` from repo root) when none of the resets unstick the webhook. Codified after the 2026-05-03 shadowdark incident where five consecutive commits to main never reached the build queue while swn-tracker and shawnsvtts-marketing kept deploying off the same repo. Triggers on "vercel not deploying", "deploy not firing", "webhook broken", "vercel cli deploy", "manual deploy to vercel", "shadowdark not deploying".
version: 1.0.0
---

# vercel-deploy-fallback

Recipe for diagnosing a stuck Vercel-on-Git pipeline + the CLI fallback that bypasses the broken webhook chain entirely. Codified after `shadowdark.shawnsvtts.com` silently stopped deploying on 2026-05-03.

## Symptoms — "Vercel isn't deploying our commit"

- `git push` to the production branch (`main`) succeeds, but the Vercel project's deployments list never shows the new commit.
- The currently-deployed commit is many commits behind `HEAD`.
- **GitHub commit page shows `0/N` checks** for the affected commit (Vercel registered the check but never reported a status).
- Empty `--allow-empty` commits also fail to fire — rules out "no file changes" auto-skip.
- **No matching deployment in any status** — not Ready, not Building, not Queued, not Canceled, not Error. Pure silence.
- Vercel notifications (bell icon, bottom-left) show NO entry for the affected project's recent commits.
- **Other Vercel projects in the same repo keep working.** The break is project-scoped, not repo-scoped or org-scoped.

If all of the above match, you're in the same failure mode as the 2026-05-03 shadowdark incident.

## Diagnostic ladder — fastest signal first

Walk these in order. Skip steps that have already been ruled out.

1. **Confirm the push reached GitHub.** `git push origin main` output should show `main -> main`. `git log origin/main -1 --oneline` should show your commit at the top.
2. **Reload the project's deployments page in Vercel.** Sometimes the dashboard caches an old list.
3. **Check the GitHub commit page** at `https://github.com/<owner>/<repo>/commit/<sha>`. Look at the `N/M` checks counter under the commit message:
   - `0/0` — no checks registered. Webhook never reached Vercel. Look at GitHub App install.
   - `0/M>0` — checks registered but no result. Webhook delivered, but Vercel dropped the build creation. **This is the silent-drop failure mode.**
   - `K/M` (some passed) — partial deploy fan-out is working. Investigate the failing project specifically.
4. **Check Vercel quota** at `https://vercel.com/<team>/~/usage`. Hobby tier limits: 100 GB Fast Data Transfer, 1M Edge Requests, etc. Out-of-quota would normally produce a banner but it's worth eliminating.
5. **Expand the deployments status filter.** The default filter hides one of the six statuses (often "Canceled"). Click "Filter by deployment status. 5 of 6 statuses selected" → enable "Canceled". If your missing deploys are in there, that's a different problem (build trigger fired but was killed — usually means Ignored Build Step's bash script returned 0).
6. **Check Vercel notifications** (bell icon). Recent failures show up there. Absence is meaningful — confirms the build never reached the failure stage either.
7. **Compare with sibling projects in the same repo.** If swn-tracker and shawnsvtts-marketing deploy fine off the same `git push`, the issue is the failing project's git binding, not the GitHub App or the repo webhook itself.
8. **Inspect the GitHub App install** at `https://github.com/settings/installations`. Vercel app should be listed under "Configure". If missing, that's the problem — reinstall it.
9. **Project Settings → Git** in Vercel. Confirm "Connected" status. The "Connected Xm ago" timestamp updates only when the link is rebound — old timestamp is fine if you haven't reconnected.
10. **Project Settings → Build & Deployment** in Vercel. Verify:
    - Root Directory matches the app's monorepo path (e.g. `apps/shadowdark`).
    - "Skip deployments when there are no changes to root directory or its dependencies" should be **Disabled** unless you intentionally want path-scoped builds.
    - Ignored Build Step Behavior is **Automatic** (not a custom shell script that might exit 0 to skip).

## Reset ladder — try in order, escalating destructiveness

Each step is non-destructive to deployed code; they only re-bind the project ↔ GitHub-App relationship.

1. **Project-level disconnect + reconnect.** Vercel → Project → Settings → Git → Disconnect → confirm → click "GitHub" again → Connect on `<owner>/<repo>`. Push an empty commit to test:
   ```bash
   git commit --allow-empty -m "ci: post-reconnect trigger" && git push
   ```
2. **GitHub App uninstall + reinstall.** GitHub → Settings → Applications → Vercel → Configure → Danger Zone → Uninstall (confirm). Then `https://github.com/apps/vercel/installations/new` → pick the user/org → "All repositories" → Install. After reinstall, the Vercel project's prior binding is stale; **also re-do step 1** to bind to the new install ID.
3. **CLI deploy fallback (the path that always works).** See next section. Use this if the reset ladder doesn't restore auto-deploys.
4. **Recreate the Vercel project entirely.** Heavy nuclear option — loses project ID, requires re-binding the custom domain (DNS already correct, but the verification step has to re-run). ~10 min downtime. Last resort.
5. **Vercel support ticket.** They can see internal webhook delivery logs that the dashboard hides.

## CLI deploy fallback — the recipe

The Vercel CLI uploads the local working tree directly to Vercel and kicks off a build. It bypasses the GitHub App + webhook chain entirely. Works even when the webhook is broken.

### One-time setup (per machine)

```bash
# 1. Install + login (opens browser for OAuth, asks for a device code)
npx vercel login
# Pick "Continue with GitHub". Verify the device code in the browser.
```

### Per-project setup (one-time per machine, per project)

**CRITICAL:** link from the **repo root**, NOT from `apps/<vtt>/`.

The Vercel project's "Root Directory" setting is already `apps/<vtt>`. If you `cd apps/shadowdark && vercel link`, the CLI writes `.vercel/project.json` there AND the link respects the project's Root Directory, so the CLI tries to deploy `apps/shadowdark/apps/shadowdark` — which doesn't exist. Error:

```
Error: The provided path "~\…\swn-tracker\apps\shadowdark\apps\shadowdark" does not exist.
```

Right way:

```bash
# From repo root:
cd /path/to/swn-tracker
npx vercel link --yes --project shawnsvtts-shadowdark
```

This creates `.vercel/project.json` at repo root with the project + org IDs. The folder is auto-added to `.gitignore`. **Keep this file** — future CLI deploys reuse it.

For the swn project: `npx vercel link --yes --project swn-tracker`. For marketing: `npx vercel link --yes --project shawnsvtts-marketing`. Note the `.vercel/project.json` only holds ONE project at a time — to deploy a different sibling project, re-run `vercel link` (or check the IDs into a script that swaps them).

### Deploy

```bash
# From repo root, with .vercel/project.json present:
npx vercel deploy --prod
```

What happens:
- Bundles the working tree (74MB+ for shadowdark — it includes the dice-box assets in `public/`).
- Uploads to Vercel.
- Triggers a production build using the project's existing Build Command + env vars + Root Directory.
- Auto-promotes to production on success.
- Custom domain (`shadowdark.shawnsvtts.com`) re-aliases automatically.
- Total time: ~45-60s for shadowdark.

Output ends with the live URL + the alias confirmation:
```
Production: https://shawnsvtts-shadowdark-XXXXXXXXX-shawnschultz-1777s-projects.vercel.app
Aliased: https://shadowdark.shawnsvtts.com
```

If the build fails, the URL is still printed; click it to see the failure logs in the inspector.

### Limits

- CLI deploys do NOT show a Git commit SHA in the deployments list — they show "Deployed via CLI" and the commit metadata is missing. Inspecting which code shipped requires checking the deploy timestamp against your local `git log`.
- CLI deploys count against the same monthly quota as webhook deploys.
- The Vercel Hobby plan limits CLI deploys to ~100/day across the team. Not a real limit for occasional fallback use.

## Decision tree — which fix to try?

```
Push didn't deploy.
├─ Other projects in same repo deploying off same push?
│   ├─ Yes → project-specific. Try project disconnect+reconnect (step 1).
│   │       Failed? → CLI deploy fallback. (GitHub App reinstall + project relink
│   │                  did NOT fix the 2026-05-03 shadowdark instance.)
│   └─ No  → repo-level or org-level. GitHub App uninstall+reinstall (step 2).
│            Most repos: this fixes it. Then re-do project disconnect+reconnect.
├─ Quota exceeded?
│   └─ Either upgrade or reduce traffic. Quota errors usually show a banner.
└─ "Skip when no changes" enabled + nothing changed?
    └─ Disable the skip OR push a real change.
```

## References

- `feedback_vercel_webhook_silent_drop.md` (in user memory) — the specific 2026-05-03 incident that motivated this skill.
- `https://vercel.com/docs/cli/deploy` — CLI docs.
- `https://vercel.com/docs/git#configure-vercel-for-git-integration` — webhook integration docs.
- `~/.claude/skills/swn-migration/SKILL.md` — sibling skill, unrelated topic, but same `.claude/skills/<name>/SKILL.md` shape.
