# Import Update Guide for Monorepo Migration

## Overview

This guide provides patterns and scripts to update imports across the codebase after moving to the monorepo structure.

## Critical Import Patterns

### 1. Database Imports (HIGH PRIORITY)

**Pattern to find:**
```javascript
import prisma from '@/lib/utils/connect'
// or
const prisma = require('@/lib/utils/connect')
```

**Replace with:**
```javascript
import { prisma } from '@skill-learn/database'
```

**Files affected:** ~47 files in `apps/lms/app/api/`

**Script:**
```bash
# Find and replace (use with caution, test first)
find apps/lms apps/cms -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i "s|from '@/lib/utils/connect'|from '@skill-learn/database'|g" {} +
find apps/lms apps/cms -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i "s|import prisma from|import { prisma } from|g" {} +
find apps/lms apps/cms -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i "s|const prisma = require|// const prisma = require|g" {} +
```

### 2. Shared UI Components (LMS App)

**Pattern to find:**
```javascript
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

**Replace with:**
```javascript
import { Button } from '@skill-learn/ui/components/button'
import { Card } from '@skill-learn/ui/components/card'
```

**Note:** Only update imports for components that are in `packages/ui/components/`
**Files affected:** ~100+ files in `apps/lms/`

### 3. Shared Lib Utilities (LMS App)

**Pattern to find:**
```javascript
import { cn } from '@/lib/utils'
import { useDebounce } from '@/lib/hooks/useDebounce'
```

**Replace with:**
```javascript
import { cn, useDebounce } from '@skill-learn/lib'
```

**Note:** Keep app-specific lib files as `@/lib/*`
**Files affected:** ~200+ files in `apps/lms/`

## Manual Updates Required

### CMS App

CMS imports should be updated manually because:
- CMS has its own UI components (`@/components/cms/ui/*`)
- CMS has its own lib (`@/lib/cms/*`)
- May also use shared packages

### Package Imports

Update imports within packages:
- `packages/ui/components/*` - Update imports that reference `@/lib/utils` to `@skill-learn/lib/utils.js`
- `packages/lib/*` - Update internal imports

## Step-by-Step Update Process

### Step 1: Update Database Imports (CRITICAL)

This is the highest priority as it's used everywhere.

```bash
# 1. Find all files that import prisma
grep -r "from '@/lib/utils/connect'" apps/lms apps/cms --include="*.js" --include="*.jsx"

# 2. Review each file
# 3. Update manually or use find/replace with caution
```

### Step 2: Update Shared UI Components (LMS)

```bash
# Find all UI component imports in LMS
grep -r "from '@/components/ui" apps/lms --include="*.js" --include="*.jsx"

# Update to @skill-learn/ui/components/*
```

### Step 3: Update Shared Lib (LMS)

```bash
# Find all lib imports
grep -r "from '@/lib/utils'" apps/lms --include="*.js" --include="*.jsx"
grep -r "from '@/lib/hooks" apps/lms --include="*.js" --include="*.jsx"
grep -r "from '@/lib/store" apps/lms --include="*.js" --include="*.jsx"

# Update to @skill-learn/lib
```

### Step 4: Update Middleware

Update middleware files:
- `apps/lms/middleware.js` - Update imports
- `apps/cms/middleware.js` - Already updated

### Step 5: Update Package Imports

Update imports within packages themselves:
- `packages/ui/components/*` - Update `@/lib/utils` to `@skill-learn/lib/utils.js`
- `packages/lib/*` - Update internal imports if needed

## Testing After Updates

1. Run `npm install` from root
2. Run `npm run prisma:generate`
3. Try building: `npm run build`
4. Test each app: `npm run dev`

## Common Issues

### Issue: Module not found
- Check jsconfig.json paths
- Ensure workspace packages are installed
- Restart dev server

### Issue: Import path not resolving
- Verify path alias in jsconfig.json
- Check if file exists in expected location
- Ensure correct workspace package name

## Important Notes

1. **App-specific imports stay as `@/`**:
   - `@/components/*` → App-specific components
   - `@/lib/actions/*` → App-specific actions
   - `@/config/*` → App-specific config

2. **Shared packages use `@skill-learn/*`**:
   - `@skill-learn/database` → Prisma client
   - `@skill-learn/ui` → Shared UI components
   - `@skill-learn/lib` → Shared utilities/hooks/stores

3. **Test incrementally**:
   - Update one category at a time
   - Test after each category
   - Commit working state
