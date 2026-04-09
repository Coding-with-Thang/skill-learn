# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Skill-Learn is an AI-powered multi-tenant LMS (Learning Management System) built as a **Turborepo monorepo** with npm workspaces. It contains two Next.js 16 apps and four shared packages.

| Service        | Port | Description                       |
|----------------|------|-----------------------------------|
| LMS (`apps/lms`) | 3000 | Main user-facing + admin app (webpack) |
| CMS (`apps/cms`) | 3001 | Super-admin dashboard (Turbopack)       |

### Quick reference

Standard commands are documented in the root `package.json`:

- **Dev servers**: `npm run dev` (starts both LMS and CMS via Turborepo)
- **Lint**: `npm run lint`
- **Tests**: `npm test` (runs Vitest via Turborepo)
- **Prisma generate**: `npm run prisma:generate` (must run after schema changes or fresh install)

### Non-obvious caveats

1. **Clerk authentication keys are required.** Without valid `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `apps/lms/.env.local` and `apps/cms/.env.local`, the dev servers will compile and serve pages, but the client-side Clerk SDK will redirect the browser to an error page. The publishable key must follow Clerk's format: `pk_test_<base64-encoded-frontend-api-url>`. Placeholder env files are auto-created during setup but require real Clerk credentials for full functionality.

2. **MongoDB is required for data operations.** The Prisma client connects to MongoDB via `MONGODB_URI`. Without a real connection, API routes that access the database will fail at runtime, but the apps will still compile and start.

3. **LMS uses `--webpack` flag** in its dev script (`next dev --webpack`), while CMS uses Turbopack. This is intentional; see the dev script in `apps/lms/package.json`.

4. **Lint has pre-existing errors in LMS.** Running `npm run lint` exits non-zero due to ~23 ESLint errors and ~35 warnings in `apps/lms`. The CMS lint passes with only warnings.

5. **The `next-intl` webpack cache warning** (`Parsing of .../format/index.js for build dependencies failed`) appears on every LMS compile and is harmless.

6. **No Docker/devcontainer** files exist. The project is designed for direct Node.js development or Vercel deployment.

7. **Environment files** should be placed in each app directory (`apps/lms/.env.local`, `apps/cms/.env.local`), not in the workspace root. Next.js loads `.env.local` from the app's working directory.
