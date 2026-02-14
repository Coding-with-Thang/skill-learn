# ESLint configuration

Skill-Learn uses a shared, production-oriented ESLint setup across the monorepo.

## Structure

- **Root:** `eslint.config.base.mjs` — shared rules for all apps and packages (industry best practices, security, TypeScript).
- **Apps:** `apps/cms/eslint.config.mjs` and `apps/lms/eslint.config.mjs` — extend Next.js `core-web-vitals`, the shared base, Prettier, and app-specific overrides.

## Running lint

From the repo root:

```bash
npm run lint
```

This runs `turbo run lint` (each app lints its own tree). To lint a single app:

```bash
cd apps/cms && npm run lint
cd apps/lms && npm run lint
```

Auto-fix where possible:

```bash
cd apps/cms && npx eslint . --fix
cd apps/lms && npx eslint . --fix
```

## Rules (summary)

| Category | Examples |
|----------|----------|
| **General** | `no-var`, `prefer-const`, `eqeqeq`, `no-console` (warn; allow `warn`/`error`), `no-debugger`, `prefer-template` |
| **Security** | `no-eval`, `no-implied-eval`, `no-new-func` |
| **Imports** | `no-duplicate-imports`, `import/no-duplicates` |
| **TypeScript** | `@typescript-eslint/no-explicit-any` (warn), `@typescript-eslint/consistent-type-imports` (warn) |
| **React** | `react/jsx-no-target-blank` (warn), `react-hooks/exhaustive-deps` (warn) |

Type-aware rules (`@typescript-eslint/no-floating-promises`, `no-misused-promises`) are not enabled because they require `parserOptions.project`; they can be added later if type-aware linting is configured.

## App overrides

- **CMS / LMS:** `react/no-unknown-property` and `@next/next/no-img-element` are off for SVG and third-party props; `react-hooks/set-state-in-effect` and `react-hooks/error-boundaries` are **warn** so existing patterns don’t fail CI while you refactor.

## Prettier

`eslint-config-prettier` is applied in each app config so ESLint doesn’t enforce style rules that conflict with Prettier.

## Adding packages

For a new app or package, extend the base the same way:

```js
import baseConfig from "../../eslint.config.base.mjs";
import eslintConfigPrettier from "eslint-config-prettier";

export default [...yourBase, ...baseConfig, eslintConfigPrettier, { rules: { /* overrides */ } }];
```
