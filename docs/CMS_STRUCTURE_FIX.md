# CMS Structure Fix

## Issue

The CMS app build was failing because imports expected `@/components/cms/*` but files were in `apps/cms/components/*` directly.

## Solution

The CMS app uses imports like:
- `@/components/cms/layout/DashboardLayout`
- `@/components/cms/ui/button`
- `@/lib/cms/utils`

These resolve via jsconfig.json paths:
- `@/components/*` → `./components/*`
- `@/lib/*` → `./lib/*`

So `@/components/cms/layout` resolves to `./components/cms/layout`, which means we need a nested `cms` directory.

## Final Structure

```
apps/cms/
├── app/
│   ├── billing/page.jsx
│   ├── layout.jsx
│   ├── page.jsx
│   └── tenants/page.jsx
├── components/
│   └── cms/              ← Nested structure for @/components/cms/* imports
│       ├── dashboard/
│       ├── layout/
│       └── ui/
└── lib/
    └── cms/              ← Nested structure for @/lib/cms/* imports
        ├── utils.js
        ├── store.js
        └── mockData.js
```

## Files Copied

1. Components: `src/components/cms/*` → `apps/cms/components/cms/*`
2. Lib: `src/lib/cms/*` → `apps/cms/lib/cms/*`
3. App files: `src/app/cms/*` → `apps/cms/app/*`

The nested structure matches the import paths used in the CMS app files.
