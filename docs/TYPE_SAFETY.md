# Type safety in the TypeScript migration

This doc describes how we keep the codebase type-safe after the migration to TypeScript.

## 1. TypeScript configuration

- **Root:** `tsconfig.base.json` enables strict mode, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`. All apps extend this.
- **Apps:** Each app (`apps/lms`, `apps/cms`) has its own `tsconfig.json` with `paths` for `@/*` so you can import from `@/lib`, `@/types`, etc.

## 2. API route handlers (App Router)

- **Request:** Use `NextRequest` from `next/server` for the first argument.
- **Params:** In Next.js 15+, the second argument is `{ params: Promise<T> }`. Use the shared `RouteContext<TParams>` type so params are typed and consistent.

**Example – route with dynamic segment:**

```ts
// app/api/admin/categories/[categoryId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { RouteContext } from "@/types";

type CategoryParams = { categoryId: string };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext<CategoryParams>
) {
  const { categoryId } = await validateRequestParams(
    z.object({ categoryId: objectIdSchema }),
    params
  );
  // ...
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext<CategoryParams>
) {
  // request for body; params for categoryId
}
```

**Example – route without dynamic segments:**

```ts
export async function GET(request: NextRequest) {
  // no second argument, or _context: RouteContextNoParams
}
```

- **Shared types:** `apps/lms/types/api.ts` and `apps/cms/types/api.ts` define `RouteContext<TParams>`, `RouteContextNoParams`, and optional handler types. Import from `@/types` in each app.

## 3. Validated request body and params

- Use Zod schemas (e.g. in `@/lib/zodSchemas`) with `validateRequestBody(request, schema)` and `validateRequestParams(schema, params)`.
- Derive TypeScript types from schemas where useful: `z.infer<typeof categoryUpdateSchema>`, or `Partial<z.infer<typeof schema>>` for update payloads you build by hand.

## 4. Component and client state

- **useState:** Prefer explicit type parameters for non-trivial state, e.g. `useState<Error | null>(null)`.
- **Catch blocks:** Normalize unknown errors before storing or passing to UI:  
  `setError(err instanceof Error ? err : new Error(String(err)))`.

## 5. Gradual rollout

- New and touched API routes should use `NextRequest` and `RouteContext<…>` (and the same pattern in CMS where applicable).
- When editing a route or component, add or tighten types (params, request, state, inferred from Zod) as part of the change.

## 6. Applied coverage

- **LMS:** All `app/api/**/route.ts` handlers use `NextRequest` and, where applicable, `RouteContext<{ paramName: string }>` from `@/types`. Static routes use `(request: NextRequest)` or `(_request: NextRequest)`; dynamic routes use `({ params }: RouteContext<Params>)`.
- **CMS:** All `app/api/**/route.ts` handlers use `NextRequest` and `RouteContext<…>` from `@/types` where there are dynamic segments. Shared types live in `apps/cms/types/api.ts`.
- When adding new routes, follow the same pattern so they stay type-safe.
