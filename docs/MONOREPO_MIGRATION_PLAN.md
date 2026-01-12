# Monorepo Migration Plan

## Analysis: Does This Structure Work for SaaS?

### ✅ **YES - This Structure is Excellent for SaaS**

Your proposed monorepo structure is well-suited for a SaaS platform:

1. **Clear Separation of Concerns**

   - `apps/lms/` - Student/Teacher facing app (your main product)
   - `apps/cms/` - Super-admin dashboard (platform management)
   - Both apps can share code via packages

2. **Shared Packages Make Sense**

   - `packages/database` - Single source of truth for Prisma schema
   - `packages/ui` - Shared Shadcn components (DRY principle)
   - `packages/lib` - Shared utilities, hooks, stores
   - `packages/config` - Shared ESLint/TypeScript configs (though you're using JS)

3. **Benefits for SaaS**
   - ✅ Code reuse between apps
   - ✅ Single database schema source
   - ✅ Consistent UI/UX across apps
   - ✅ Independent deployment options
   - ✅ Scalable team structure
   - ✅ Easier testing and maintenance

## Proposed Structure

```
skill-learn/
├── apps/
│   ├── lms/                    # Student/Teacher facing app
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # LMS-specific components
│   │   ├── middleware.js      # LMS middleware
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── jsconfig.json
│   │
│   └── cms/                    # Super-admin dashboard
│       ├── app/               # Next.js App Router
│       ├── components/        # CMS-specific components
│       ├── middleware.js      # CMS middleware
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── jsconfig.json
│
├── packages/
│   ├── database/               # Shared Prisma setup
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.js
│   │   ├── index.js            # Export Prisma client
│   │   └── package.json
│   │
│   ├── ui/                     # Shared Shadcn components
│   │   ├── components/        # UI components from src/components/ui/
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   ├── lib/                    # Shared utilities
│   │   ├── utils/             # From src/lib/utils/
│   │   ├── hooks/             # From src/lib/hooks/
│   │   ├── stores/            # From src/lib/store/
│   │   └── package.json
│   │
│   └── config/                 # Shared configs
│       └── eslint-config/     # Shared ESLint config (JS only, no TS)
│
├── package.json               # Root package.json with workspaces
├── turbo.json                 # Turborepo config
└── .gitignore
```

## Migration Strategy

### Phase 1: Setup Structure

1. Create directory structure
2. Set up Turborepo configuration
3. Create root package.json with workspaces

### Phase 2: Create Shared Packages

1. Move Prisma to `packages/database`
2. Move shared UI components to `packages/ui`
3. Move shared lib utilities to `packages/lib`

### Phase 3: Create Apps

1. Move CMS to `apps/cms`
2. Move LMS to `apps/lms`
3. Split app-specific components

### Phase 4: Update Imports

1. Update all imports to use workspace packages
2. Update path aliases in jsconfig.json files
3. Update middleware files

### Phase 5: Configuration

1. Update package.json files for each workspace
2. Update Next.js configs
3. Update Tailwind configs
4. Set up build scripts

## Key Decisions

### 1. What Goes Where?

**Shared (packages/ui):**

- All `src/components/ui/*` components
- Shared design system components

**LMS-Specific (apps/lms/components):**

- `components/features/` (landing, games, quiz, etc.)
- `components/layout/` (DashboardLayout, Sidebar, etc. - LMS versions)
- `components/shared/` (BreadCrumb, Logo, Pagination, etc.)

**CMS-Specific (apps/cms/components):**

- `components/cms/dashboard/`
- `components/cms/layout/`
- `components/cms/ui/` (or use shared ui package)

**Shared (packages/lib):**

- `lib/utils/`
- `lib/hooks/`
- `lib/store/`
- `lib/utils.js` (cn function)
- `lib/zodSchemas.js`

**App-Specific:**

- `lib/actions/` → apps/lms/lib/actions/
- `lib/cms/` → apps/cms/lib/

### 2. API Routes

- **Option A**: Keep in apps (recommended)

  - `apps/lms/app/api/` - LMS API routes
  - `apps/cms/app/api/` - CMS API routes (if needed)

- **Option B**: Shared API package
  - More complex, usually not needed for SaaS

**Recommendation: Option A** - Keep API routes in apps since they're app-specific

### 3. Middleware

- Each app has its own middleware
- `apps/lms/middleware.js`
- `apps/cms/middleware.js`

### 4. Database Access

- Both apps import from `@skill-learn/database`
- Single Prisma client instance

### 5. No TypeScript

- ✅ Using `.js` and `.jsx` files only
- ✅ Using `jsconfig.json` instead of `tsconfig.json`
- ✅ No TypeScript configs in packages/config

## Workspace Package Names

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

**Package Names:**

- `@skill-learn/lms` - LMS app
- `@skill-learn/cms` - CMS app
- `@skill-learn/database` - Database package
- `@skill-learn/ui` - UI components package
- `@skill-learn/lib` - Utilities package

## Import Examples After Migration

```javascript
// In apps/lms/app/page.jsx
import { Button } from "@skill-learn/ui";
import { cn } from "@skill-learn/lib";
import { prisma } from "@skill-learn/database";

// In apps/cms/app/page.jsx
import { Button } from "@skill-learn/ui";
import { cn } from "@skill-learn/lib";
import { prisma } from "@skill-learn/database";
```

## Turborepo Benefits

1. **Faster Builds** - Parallel builds, caching
2. **Task Orchestration** - Run dev/build for multiple apps
3. **Dependency Graph** - Automatic task ordering
4. **Remote Caching** - Share cache across CI/CD

## Potential Challenges

1. **Import Updates** - Need to update ~200+ files
2. **Path Aliases** - Update jsconfig.json in each app
3. **Shared Styles** - Tailwind config needs to include package paths
4. **Testing** - Update test paths if applicable

## Recommendation

**✅ PROCEED** - This structure is excellent for your SaaS and will scale well as you grow.

**Next Steps:**

1. Review this plan
2. Approve structure
3. Begin migration
