# Workspaces

This monorepo uses **npm workspaces** with a single workspace pattern: `apps/*`.

## Apps

- **`apps/lms`** — Main learning management app (Next.js).
- **`apps/cms`** — Super-admin / tenant management dashboard (Next.js).

## Shared packages (`@skill-learn/*`)

The apps depend on:

- `@skill-learn/database` — Prisma client and schema.
- `@skill-learn/lib` — Shared utilities and stores.
- `@skill-learn/ui` — Shared UI components (shadcn-style primitives: Button, Card, Dialog, Form, etc.). **LMS and CMS both use this package**, so those components are shared, not duplicated per app.

**Where they come from:** There is no `packages/` directory in this repo. These packages must be provided by one of:

1. **Published to npm** — Install with `npm install @skill-learn/database @skill-learn/lib @skill-learn/ui` (or list them in each app’s `dependencies`; they are resolved from the registry).
2. **Local `packages/`** — If you add a `packages/` directory with `database`, `lib`, and `ui` (each with a `package.json` naming the package), add `"packages/*"` back to root `package.json` workspaces and run `npm install` from the repo root so the apps link to the local packages.
3. **Another repo or path** — Use `npm link` or a file path in `package.json` (e.g. `"@skill-learn/ui": "file:../other-repo/packages/ui"`) and ensure the linked packages are built before building the apps.

The root script `prisma:push` uses the path `packages/database/prisma/schema.prisma`. If you are not using a local `packages/database`, either remove or change that script to point at your schema location.

## Shadcn UI

- **Shared primitives** (Button, Card, Dialog, etc.) live in `@skill-learn/ui`. Both LMS and CMS import from that package — they are not duplicated per app.
- **Per-app `components.json`** exists in both `apps/lms` and `apps/cms`. It configures the shadcn CLI when you add *new* components:
  - From **LMS:** `cd apps/lms && npx shadcn@latest add <name>` → installs into `apps/lms/components/ui`.
  - From **CMS:** `cd apps/cms && npx shadcn@latest add <name>` → installs into `apps/cms/components/ui`.
- To keep a new component **shared**, add it to the `@skill-learn/ui` package (e.g. in a local `packages/ui` or the repo that publishes it) instead of via the per-app CLI.
