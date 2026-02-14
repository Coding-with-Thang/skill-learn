# Configuration & package.json Assessment

Assessment of config files and package.json across the monorepo for alignment with the current stack (Next.js 16, React 19, TypeScript, Tailwind v4, Turbo, Clerk) and recommended improvements.

---

## 1. Stack summary

| Layer | Choice |
|-------|--------|
| Monorepo | npm workspaces + Turbo |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (@tailwindcss/postcss, CSS-first config) |
| Auth | Clerk |
| DB / ORM | Prisma (via `@skill-learn/database` where used) |
| Apps | `apps/lms` (main app), `apps/cms` (super-admin dashboard) |

---

## 2. Root configuration

### 2.1 `package.json`

- **Workspaces:** `["apps/*"]` — Only app workspaces. Shared packages `@skill-learn/*` are not in this repo; see `docs/WORKSPACES.md` for how to provide them (npm, local `packages/`, or link).
- **Scripts:** `dev`, `build`, `start`, `lint`, `prisma:generate`, `prisma:push` — Sensible. `prisma:push` runs from root using `packages/database` schema; ensure that path exists or adjust.
- **Overrides:** `next: "16.1.6"` — Good for single Next version across workspaces.
- **Engines:** `node: ">=20.9.0"`, `npm: ">=9.0.0"`, `packageManager: "npm@10.0.0"` — Aligned and clear.

### 2.2 `tsconfig.json` & `tsconfig.base.json`

- Root tsconfig uses project references to `packages/*` and apps. If `packages/` is missing, references will point to non-existent paths; remove or conditionally include those references.
- **tsconfig.base.json:** Strict options (`strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), `target: "ES2022"`, `moduleResolution: "bundler"` — Strong and appropriate for the stack.

### 2.3 `next.config.mjs` (root)

- Contains images, headers, webpack cache. The repo has no root `app/`; only `apps/lms` and `apps/cms` have Next apps. So this file is either legacy or used by a different entry point.
- **Recommendation:** If you only run Next from `apps/lms` and `apps/cms`, remove root `next.config.mjs` to avoid confusion, or document when it is used.

### 2.4 `tailwind.config.mjs` (root)

- **content** points to `./src/pages`, `./src/components`, `./src/app` — There is no root `src/`. This matches a different (e.g. template) layout.
- **Recommendation:** Remove root `tailwind.config.mjs` or move to a template folder. Each app uses its own Tailwind config and CSS-based setup (Tailwind v4).

### 2.5 `postcss.config.mjs` (root)

- Uses `@tailwindcss/postcss`. Builds are run from inside `apps/lms` and `apps/cms`, which have their own PostCSS configs.
- **Recommendation:** Remove root `postcss.config.mjs` unless you run PostCSS from root.

### 2.6 `.eslintrc.json`

- **Extends:** `"eslint:recommended"`, `"next/core-web-vitals"`, `"prettier"`. The `"prettier"` extend is normally provided by `eslint-config-prettier`, which is not in any `package.json`. That can cause "Cannot find module 'prettier'" or similar.
- **Recommendation:** Add `eslint-config-prettier` to root `devDependencies`, or remove `"prettier"` from `extends` if you do not use Prettier integration.

### 2.7 `jsconfig.json` (root)

- **Paths:** `"@/*": ["./src/*]"` — No root `src/` directory.
- **Recommendation:** Remove root `jsconfig.json` or align with the actual root layout (e.g. if you ever add a root app).

### 2.8 `components.json` (shadcn/ui)

- **tailwind.css:** `"src/app/globals.css"` — Apps use `app/globals.css` (no `src/`).
- **Recommendation:** Update to the app you use for shadcn (e.g. `apps/lms` or `apps/cms`) or point to the correct `globals.css` path so `npx shadcn@latest add` works as expected.

### 2.9 `turbo.json`

- **build.outputs:** `.next/**`, `dist/**` — Good.
- **build.env:** Lists env vars needed for build — Good.
- **lint.dependsOn:** `["^build"]` — Lint runs after dependency build; correct but can be slow. Optional: use `dependsOn: []` for lint if you want faster lint-only runs and do not need built packages for lint.
- **dev / start:** `cache: false`, `persistent: true` — Appropriate.

---

## 3. LMS app (`apps/lms`)

### 3.1 `package.json`

- **Dependencies:** Next 16, React 19, Clerk, Tailwind v4, Prisma, shared `@skill-learn/*` — Aligned with stack.
- **Scripts:** `clean` uses `rm -rf .next` — Fails on Windows without WSL/git bash. Optional: use `rimraf .next` or `node -e "require('fs').rmSync('.next',{recursive:true,force:true})"` for cross-platform.
- **Versions:** Generally consistent; no major drift.

### 3.2 `next.config.mjs`

- **transpilePackages:** `@skill-learn/ui`, `@skill-learn/lib`, `@skill-learn/database` — Correct for monorepo.
- **outputFileTracingRoot** — Good for standalone/deploy.
- **Missing:** No explicit `eslint.ignoreDuringBuilds` or `typescript.ignoreBuildErrors`. Root next.config sets them; when building from `apps/lms`, the app’s next.config is used, so root values do not apply. Recommendation: set `eslint: { ignoreDuringBuilds: false }` and `typescript: { ignoreBuildErrors: false }` in LMS (and CMS) for consistent, strict builds.

### 3.3 `tsconfig.json`

- **extends** `../../tsconfig.base.json`, **baseUrl** `"."`, **paths** `"@/*": ["./*]"` — Good. Enables `@/components`, `@/lib`, etc.
- **target:** `ES2017` — Overrides base ES2022; acceptable for Next.

### 3.4 `tailwind.config.mjs`

- **content:** Only `*.{js,jsx}`. The app uses `.tsx`/`.ts` extensively.
- **Recommendation:** Add `*.ts` and `*.tsx` to content so all components are scanned (e.g. `"./app/**/*.{js,jsx,ts,tsx}"`, `"./components/**/*.{js,jsx,ts,tsx}"`).

---

## 4. CMS app (`apps/cms`)

### 4.1 `package.json`

- **Version drift vs LMS (shared deps):**
  - `@hookform/resolvers`: CMS `^3.9.0` vs LMS `^5.2.2` — Align to `^5.x` for consistency and Zod v4 compatibility if used.
  - `react-hook-form`: CMS `^7.54.0` vs LMS `^7.63.0` — Align to `^7.63.0`.
- **@tailwindcss/typography:** In `dependencies`; LMS has it in `devDependencies`. Move to `devDependencies` in CMS (build-time only).
- **Missing (optional):** `@types/node`, `@types/react` if you want consistent type checking (Next often brings them in; explicit is clearer).
- **Prisma:** Not in CMS deps; CMS uses `@skill-learn/database` (Prisma client). No need to add Prisma to CMS if the database package handles generation.

### 4.2 `next.config.mjs`

- **Missing:** `transpilePackages` for `@skill-learn/ui`, `@skill-learn/lib`, `@skill-learn/database`. CMS imports these; for reliable monorepo builds and deploys, add the same `transpilePackages` as LMS.
- **Missing:** `outputFileTracingRoot: path.join(__dirname, '../..')` for standalone/Node deploy.
- **Missing:** Explicit `eslint` and `typescript` build options (same as LMS recommendation above).

### 4.3 `tsconfig.json`

- **No paths:** CMS tsconfig has no `baseUrl` or `paths`, while the codebase uses `@/components/...`, `@/lib/...`. Next.js and the editor may resolve these via `jsconfig.json`, but TypeScript’s own resolution does not use jsconfig. So type-check and IDE can be inconsistent.
- **Recommendation:** Add `"baseUrl": "."` and `"paths": { "@/*": ["./*"] }` to CMS `tsconfig.json` (same pattern as LMS). You can keep or remove `jsconfig.json`; tsconfig will be the source of truth.

### 4.4 `jsconfig.json`

- **Paths:** `@/*` → `./app/*`, plus `@/components/*`, `@/lib/*`, and package aliases. With the recommended single `@/*` → `./*` in tsconfig, one alias covers all; you can remove jsconfig or leave it for non-TS tooling.

### 4.5 `tailwind.config.mjs`

- **content:** Only `*.{js,jsx}`. Add `*.ts` and `*.tsx` for full coverage.

---

## 5. Summary of recommendations

| Priority | Item | Action |
|----------|------|--------|
| High | ESLint extends "prettier" | Add `eslint-config-prettier` at root or remove `"prettier"` from extends |
| High | CMS path alias | Add `baseUrl` + `paths` in CMS `tsconfig.json` so `@/*` resolves |
| Medium | CMS next.config | Add `transpilePackages`, `outputFileTracingRoot`, and eslint/ts options |
| Medium | Shared dep versions | Align CMS with LMS for `@hookform/resolvers`, `react-hook-form`; move `@tailwindcss/typography` to devDeps in CMS |
| Medium | Tailwind content | Include `*.ts` and `*.tsx` in both apps’ Tailwind `content` |
| Low | Root configs | Remove or relocate root `next.config.mjs`, `tailwind.config.mjs`, `postcss.config.mjs`, `jsconfig.json` if unused |
| Low | Workspaces | Add `packages/` and implement shared packages, or remove `packages/*` from workspaces and document where `@skill-learn/*` comes from |
| Low | LMS clean script | Prefer cross-platform `rimraf` or a small node script instead of `rm -rf` |
| Low | components.json | Point shadcn at the correct app and `globals.css` path |
| Optional | Turbo lint | Consider `lint.dependsOn: []` for faster lint-only pipelines |

---

## 6. Alternative / follow-up options

- **Formatting:** If you use Prettier, add a root `prettier.config.js` and a `format` script; keep `eslint-config-prettier` so ESLint and Prettier do not conflict.
- **Type checking in CI:** Run `tsc --noEmit` in each app (and in packages if added) in addition to `next build` for stricter checks.
- **Env validation:** Use something like `zod` + a small `env.ts` that validates `process.env` at startup so missing vars fail fast.
- **Single Next config base:** If LMS and CMS share most of `next.config`, consider a shared `shared/next.config.mjs` and `require`/spread it from each app to reduce duplication (images, headers, webpack).
- **Tailwind:** With Tailwind v4, more config can live in CSS (`@theme`, `@plugin`). You can gradually move theme tokens into `globals.css` and slim down `tailwind.config.mjs` to content and a few overrides only.

Applying the high- and medium-priority items will align the configs with the current project design and stack and reduce drift between LMS and CMS.

---

## 7. Applied changes (this pass)

- **Root:** Added `eslint-config-prettier` to `devDependencies` so ESLint extend `"prettier"` resolves.
- **CMS tsconfig:** Added `baseUrl: "."` and `paths: { "@/*": ["./*"] }` for consistent `@/` resolution with TypeScript.
- **CMS package.json:** Bumped `react-hook-form` to `^7.63.0` and `@hookform/resolvers` to `^5.2.2`; moved `@tailwindcss/typography` to `devDependencies`.
- **LMS next.config:** Set `eslint: { ignoreDuringBuilds: false }` and `typescript: { ignoreBuildErrors: false }`.
- **CMS next.config:** Set `eslint` and `typescript` same as LMS; added `transpilePackages` for `@skill-learn/ui`, `@skill-learn/lib`, `@skill-learn/database`.
- **LMS & CMS tailwind.config.mjs:** Extended `content` globs to include `*.ts` and `*.tsx`.

**Later applied:** Root `next.config.mjs`, `tailwind.config.mjs`, `postcss.config.mjs`, and `jsconfig.json` removed (builds run from apps only). Workspaces set to `["apps/*"]`; `docs/WORKSPACES.md` added for `@skill-learn/*`. Shadcn `components.json` moved to `apps/lms` with correct paths. Cross-platform `clean` script using `rimraf` in both apps.
