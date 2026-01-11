# Monorepo Migration Status

## ✅ Completed Steps

1. ✅ Created directory structure
2. ✅ Set up root configuration (package.json, turbo.json)
3. ✅ Created database package
4. ✅ Created UI package
5. ✅ Created lib package
6. ✅ Moved CMS app
7. ✅ Moved LMS app (with route groups)
8. ✅ Created package.json files for all workspaces
9. ✅ Created configuration files (next.config, tailwind, postcss, jsconfig)

## ⚠️ Remaining Steps

### Step 8: Update Imports (CRITICAL)

This is the largest remaining task. Need to update imports in:

#### CMS App (`apps/cms/`)
- Update UI component imports:
  - `@/components/cms/ui/*` → Keep as is (CMS-specific)
  - Should use `@skill-learn/ui` for shared components (if needed)
- Update lib imports:
  - `@/lib/cms/*` → Keep as is (CMS-specific)
  - `@/lib/utils` → `@skill-learn/lib/utils`
  - `@/lib/hooks` → `@skill-learn/lib/hooks`
- Update database imports:
  - `@/lib/utils/connect` → `@skill-learn/database`

#### LMS App (`apps/lms/`)
- Update UI component imports:
  - `@/components/ui/*` → `@skill-learn/ui/components/*` (for shared UI)
  - `@/components/*` → Keep as is (LMS-specific components)
- Update lib imports:
  - `@/lib/utils` → `@skill-learn/lib/utils` (for shared utils)
  - `@/lib/hooks` → `@skill-learn/lib/hooks` (for shared hooks)
  - `@/lib/store` → `@skill-learn/lib/stores` (for shared stores)
  - `@/lib/actions` → Keep as is (LMS-specific)
  - `@/lib/utils/connect` → `@skill-learn/database`
- Update config imports:
  - `@/config/*` → Keep as is (LMS-specific)

#### Packages
- Update UI package component imports:
  - Components importing `@/lib/utils` → `@skill-learn/lib/utils.js`
- Update lib package imports:
  - Update any internal imports

### Step 11: Update .gitignore

Add to `.gitignore`:
```
# Turborepo
.turbo

# Apps
apps/*/.next
apps/*/node_modules

# Packages
packages/*/node_modules
packages/*/dist
```

## 📋 Import Update Patterns

### Pattern 1: Database Imports
```javascript
// OLD
import prisma from '@/lib/utils/connect'
import { PrismaClient } from '@prisma/client'

// NEW
import { prisma } from '@skill-learn/database'
```

### Pattern 2: Shared UI Components (LMS)
```javascript
// OLD
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// NEW
import { Button } from '@skill-learn/ui/components/button'
import { Card } from '@skill-learn/ui/components/card'
```

### Pattern 3: Shared Lib Utilities (LMS)
```javascript
// OLD
import { cn } from '@/lib/utils'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useUserRole } from '@/lib/hooks/useUserRole'

// NEW
import { cn, useDebounce, useUserRole } from '@skill-learn/lib'
// OR individually:
import { cn } from '@skill-learn/lib/utils.js'
import { useDebounce } from '@skill-learn/lib/hooks/useDebounce.js'
```

### Pattern 4: CMS UI Components
```javascript
// OLD (if using shared)
import { Button } from '@/components/ui/button'

// NEW
import { Button } from '@skill-learn/ui/components/button'

// OR keep CMS-specific UI as is:
import { Button } from '@/components/cms/ui/button'
```

### Pattern 5: CMS Lib
```javascript
// OLD
import { cn } from '@/lib/cms/utils'
import { formatCurrency } from '@/lib/cms/utils'

// NEW (keep as is - CMS-specific)
import { cn, formatCurrency } from '@/lib/cms/utils'

// OR if moved to shared lib:
import { cn } from '@skill-learn/lib/utils.js'
```

## 🚨 Important Notes

1. **App-specific imports stay as `@/`**:
   - `@/components/*` → LMS-specific components
   - `@/lib/actions/*` → LMS-specific actions
   - `@/config/*` → LMS-specific config

2. **Shared packages use `@skill-learn/*`**:
   - `@skill-learn/database` → Prisma client
   - `@skill-learn/ui` → Shared UI components
   - `@skill-learn/lib` → Shared utilities/hooks/stores

3. **CMS has its own components**:
   - `@/components/cms/*` → CMS-specific components
   - `@/lib/cms/*` → CMS-specific lib

## 🔄 Next Steps

1. Run find/replace for database imports across both apps
2. Run find/replace for shared UI components in LMS
3. Run find/replace for shared lib utilities in LMS
4. Update middleware files
5. Update .gitignore
6. Test build
7. Install dependencies
8. Run tests
