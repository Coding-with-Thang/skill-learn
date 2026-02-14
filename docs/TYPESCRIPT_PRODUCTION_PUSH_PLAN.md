# TypeScript Migration — Failsafe Production Push Plan

This document provides a clean, low-risk plan to push the JavaScript→TypeScript migration to the remote monorepo (production). Follow the steps in order; do not skip pre-flight checks.

---

## Overview

| Item | Detail |
|------|--------|
| **Branch** | `migration/typescript` (current) |
| **Target** | Remote default branch (e.g. `main` / `master`) |
| **Scope** | Full monorepo: `apps/cms`, `apps/lms`, `packages/*` |
| **Risk mitigation** | Pre-push checks, optional staging, rollback steps |

---

## Phase 1: Pre-push checks (local)

Run these **before** pushing. Fix any failures before proceeding.

### 1.1 Clean and install

```bash
# From repo root
npm ci
# or, if you use local changes to lockfile:
npm install
```

### 1.2 TypeScript and build

```bash
# Generate Prisma client (if DB package exists)
npm run prisma:generate

# Full production build (all apps + packages)
npm run build
```

- **Pass criteria:** No build errors. Both LMS and CMS (and any other apps) must build.
- **If it fails:** Fix TypeScript/build errors; do not push until build is green.

### 1.3 Lint

```bash
npm run lint
```

- **Pass criteria:** No lint errors (or only agreed, documented exceptions).
- **If it fails:** Fix or explicitly allow with comments; do not push with new lint violations.

### 1.4 Optional: type-check only (no emit)

If your root `package.json` has a `typecheck` script, run it. If not, the full `npm run build` in 1.2 is sufficient.

### 1.5 Git status

```bash
git status
git diff --stat
```

- Ensure only intended files are staged (no `.env*`, secrets, or unrelated changes).
- Confirm you're on `migration/typescript` and remote is up to date:

```bash
git fetch origin
git status   # should show relationship to origin/migration/typescript and origin/main
```

---

## Phase 2: Remote and branch strategy

### 2.1 Ensure remote exists

```bash
git remote -v
# Should show your production monorepo (e.g. origin)
```

If the remote is missing or wrong, add/correct it before pushing.

### 2.2 Push migration branch first (recommended)

Push your current branch to the remote **without** merging to main yet. This gives you a backup and allows CI (if any) or colleagues to run checks on the same branch.

```bash
git push -u origin migration/typescript
```

- **Pass criteria:** Push succeeds; branch exists on remote.
- **If it fails:** Fix auth, network, or branch protection; do not force-push to shared branches without team agreement.

### 2.3 Optional: Staging / preview

- If you use **Vercel** (or similar): connect the repo and ensure deployments run for the branch `migration/typescript`. Open the preview URL and smoke-test LMS and CMS.
- If you have **staging environment**: deploy this branch to staging and run a short test plan (login, one API call per app, one page load per app).

---

## Phase 3: Merge to production branch

Choose one of the following. Prefer **Option A** if your team uses PRs.

### Option A: Merge via Pull Request (recommended)

1. Open a Pull Request: `migration/typescript` → `main` (or your default branch).
2. Title example: `chore: TypeScript migration — JS to TS conversion`.
3. In the PR description, add:
   - Link to this plan (`docs/TYPESCRIPT_PRODUCTION_PUSH_PLAN.md`).
   - One-line summary: “Full monorepo migration from JavaScript to TypeScript; builds and lint verified locally.”
4. Run any required CI checks; wait for green.
5. Merge (merge commit or squash, per your team policy).
6. Delete the branch after merge if desired: `git branch -d migration/typescript` (local), and delete remote branch in UI.

### Option B: Direct merge (no PR)

Only if you have no PR process or are the sole maintainer:

```bash
git fetch origin
git checkout main
git pull origin main
git merge migration/typescript -m "chore: TypeScript migration — JS to TS conversion"
git push origin main
```

---

## Phase 4: Post-merge verification

### 4.1 Remote build

- If you use **Vercel**: confirm the production deployment for `main` succeeds (LMS and CMS if both are deployed).
- If you use **other CI**: confirm the main-branch build and any deploy steps succeed.

### 4.2 Quick production smoke test

- Open production LMS and CMS URLs.
- Check: home/login, one API-backed page per app, and one admin/CMS page if applicable.
- If anything is broken, proceed to **Phase 5 (Rollback)**.

### 4.3 Optional: Tag the release

```bash
git checkout main
git pull origin main
git tag -a ts-migration-YYYY-MM-DD -m "TypeScript migration release"
git push origin ts-migration-YYYY-MM-DD
```

Use this tag to identify the first production state after the TS migration.

---

## Phase 5: Rollback (if needed)

Use only if production is broken after the merge.

### 5.1 Revert the merge (preferred)

```bash
git checkout main
git pull origin main
git revert -m 1 <merge_commit_sha>
git push origin main
```

- `<merge_commit_sha>` is the merge commit that brought `migration/typescript` into `main`.
- `-m 1` keeps the first parent (main) as the “mainline.”

### 5.2 Or reset main (destructive — use only if no one else has pulled)

```bash
git checkout main
git pull origin main
git reset --hard <commit_sha_before_merge>
git push --force-with-lease origin main
```

- **Warning:** Only do this if you understand the impact; coordinate with the team. Prefer revert over force-push.

### 5.3 After rollback

- Fix issues locally on a new branch (e.g. branch off `main` or off `migration/typescript`).
- Re-run Phase 1 and 2, then merge again when ready.

---

## Checklist summary

Print or copy this and tick as you go:

- [ ] **1.1** `npm ci` / `npm install` — success
- [ ] **1.2** `npm run prisma:generate` (if applicable) — success
- [ ] **1.2** `npm run build` — success (all apps)
- [ ] **1.3** `npm run lint` — success
- [ ] **1.5** `git status` clean; on `migration/typescript`; remote fetched
- [ ] **2.2** `git push -u origin migration/typescript` — success
- [ ] **2.3** (Optional) Staging/preview tested
- [ ] **3** Merge via PR (Option A) or direct merge (Option B) — success
- [ ] **4.1** Remote/production build — success
- [ ] **4.2** Production smoke test — pass
- [ ] **4.3** (Optional) Tag created and pushed

---

## Risk minimization summary

| Risk | Mitigation |
|------|-------------|
| Build breaks in CI/production | Run `npm run build` and `npm run lint` locally first; optional staging deploy. |
| Bad merge or wrong branch | Push branch first; merge via PR; verify branch names before merge. |
| Production regression | Smoke-test after deploy; keep rollback steps (revert) ready. |
| Lost work | Branch already on remote; optional tag after merge. |
| Env/secrets in commit | Review `git status` and `git diff`; ensure `.env*` (and similar) are in `.gitignore`. |

---

## References

- **Monorepo scripts:** `package.json` (root) — `build`, `lint`, `start`, `prisma:generate`
- **Deployment:** README § Deployment; Vercel (or your host) dashboard for env vars and build settings
- **Apps:** `apps/lms`, `apps/cms` — each has its own build; root `npm run build` runs all via Turbo

If your default branch is not `main`, replace `main` with your production branch name (e.g. `master`) everywhere in this plan.
