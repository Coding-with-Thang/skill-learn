# Monorepo Migration Step-by-Step Guide

## Overview

This guide will help you migrate from a single Next.js app to a Turborepo monorepo structure with:
- **apps/lms/** - Student/Teacher app (uses route groups `(lms)` - no URL prefix)
- **apps/cms/** - Super-admin dashboard (uses `/cms` URL prefix)
- **packages/** - Shared packages (database, ui, lib, config)

---

## Prerequisites

- Node.js 18+ and npm 9+
- Git (commit current work first)
- Backup your codebase

---

## Step 1: Create Directory Structure

```bash
# Create the monorepo structure
mkdir -p apps/lms apps/cms
mkdir -p packages/database/prisma
mkdir -p packages/ui/components
mkdir -p packages/lib/{utils,hooks,stores}
mkdir -p packages/config/eslint-config
```

---

## Step 2: Set Up Root Configuration

### 2.1 Update Root `package.json`

Replace the root `package.json` with:

```json
{
  "name": "skill-learn",
  "version": "0.0.4",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "prisma:generate": "turbo run prisma:generate",
    "prisma:seed": "turbo run prisma:seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "npm@10.0.0"
}
```

### 2.2 Create `turbo.json`

Create `turbo.json` in the root:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "start": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    },
    "prisma:generate": {
      "cache": false
    },
    "prisma:seed": {
      "dependsOn": ["prisma:generate"],
      "cache": false
    }
  }
}
```

### 2.3 Install Turborepo

```bash
npm install --save-dev turbo
```

---

## Step 3: Create Database Package

### 3.1 Move Prisma Files

```bash
# Copy Prisma files to database package
cp -r prisma/* packages/database/prisma/
cp prisma/seed.js packages/database/prisma/ 2>/dev/null || true
```

### 3.2 Create `packages/database/package.json`

```json
{
  "name": "@skill-learn/database",
  "version": "0.0.4",
  "private": true,
  "main": "./index.js",
  "scripts": {
    "prisma:generate": "prisma generate --schema=./prisma/schema.prisma",
    "prisma:seed": "node prisma/seed.js",
    "prisma:migrate": "prisma migrate dev --schema=./prisma/schema.prisma",
    "prisma:studio": "prisma studio --schema=./prisma/schema.prisma"
  },
  "dependencies": {
    "@prisma/client": "^6.16.2"
  },
  "devDependencies": {
    "prisma": "^6.16.2"
  }
}
```

### 3.3 Create `packages/database/index.js`

```javascript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

### 3.4 Update `packages/database/prisma/seed.js`

Update the import in `seed.js`:

```javascript
// Change from:
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// To:
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ... rest of seed file
```

---

## Step 4: Create UI Package

### 4.1 Move UI Components

```bash
# Copy all UI components to packages/ui
cp -r src/components/ui/* packages/ui/components/
```

### 4.2 Create `packages/ui/package.json`

```json
{
  "name": "@skill-learn/ui",
  "version": "0.0.4",
  "private": true,
  "main": "./components/index.js",
  "scripts": {},
  "dependencies": {
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.3",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.544.0",
    "react": "^19.2.1",
    "react-day-picker": "^9.7.0",
    "tailwind-merge": "^3.4.0"
  },
  "peerDependencies": {
    "react": "^19.2.1",
    "react-dom": "^19.2.1"
  }
}
```

### 4.3 Create `packages/ui/components/index.js`

Create a barrel export file (optional but recommended):

```javascript
// Export commonly used components
export { Button } from './button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export { Input } from './input';
export { Badge } from './badge';
// ... add other commonly used exports
```

**Note:** You can export components individually as needed. This is optional.

---

## Step 5: Create Lib Package

### 5.1 Move Shared Utilities

```bash
# Copy shared lib files
cp -r src/lib/utils packages/lib/utils/
cp -r src/lib/hooks packages/lib/hooks/
cp -r src/lib/store packages/lib/stores/
cp src/lib/utils.js packages/lib/utils.js
cp src/lib/zodSchemas.js packages/lib/zodSchemas.js
```

### 5.2 Create `packages/lib/package.json`

```json
{
  "name": "@skill-learn/lib",
  "version": "0.0.4",
  "private": true,
  "main": "./index.js",
  "scripts": {},
  "dependencies": {
    "axios": "^1.8.2",
    "clsx": "^2.1.1",
    "date-fns": "^2.30.0",
    "tailwind-merge": "^3.4.0",
    "zod": "^4.1.11",
    "zustand": "^5.0.3"
  },
  "peerDependencies": {
    "react": "^19.2.1"
  }
}
```

### 5.3 Create `packages/lib/index.js`

```javascript
// Export utilities
export { cn } from './utils.js';
export * from './zodSchemas.js';

// Export hooks (re-export from hooks directory)
export { useAppTheme } from './hooks/useAppTheme.js';
export { useDebounce } from './hooks/useDebounce.js';
export { useLocalStorage } from './hooks/useLocalStorage.js';
export { useMobile } from './hooks/useMobile.js';
// ... add other hooks as needed

// Export stores (re-export from stores directory)
export * from './stores/auditLogStore.js';
export * from './stores/categoryStore.js';
// ... add other stores as needed
```

---

## Step 6: Move CMS App

### 6.1 Move CMS Files

```bash
# Move CMS app directory
cp -r src/app/cms apps/cms/app
cp -r src/components/cms apps/cms/components
cp -r src/lib/cms apps/cms/lib
cp src/middleware.js apps/cms/middleware.js  # We'll update this
```

**Note:** The CMS uses `/cms` URL prefix, so routes go directly in `apps/cms/app/`

### 6.2 Create `apps/cms/package.json`

```json
{
  "name": "@skill-learn/cms",
  "version": "0.0.4",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    "@clerk/nextjs": "^6.20.2",
    "@skill-learn/database": "*",
    "@skill-learn/ui": "*",
    "@skill-learn/lib": "*",
    "next": "^15.5.9",
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "framer-motion": "^12.23.26",
    "recharts": "^3.6.0"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.19",
    "eslint": "^8.57.1",
    "eslint-config-next": "^15.2.8",
    "postcss": "^8.5.4",
    "tailwindcss": "^4.0.17"
  }
}
```

### 6.3 Create `apps/cms/next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      // ... add other patterns as needed
    ],
  },
};

export default nextConfig;
```

### 6.4 Create `apps/cms/tailwind.config.mjs`

Copy and update your tailwind config, adding package paths:

```javascript
import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    '../../packages/ui/components/**/*.{js,jsx}', // Include UI package
  ],
  // ... rest of your config
};
```

### 6.5 Create `apps/cms/jsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./app/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@skill-learn/ui": ["../../packages/ui/components"],
      "@skill-learn/lib": ["../../packages/lib"],
      "@skill-learn/database": ["../../packages/database"]
    }
  }
}
```

### 6.6 Update `apps/cms/middleware.js`

Update imports to use workspace packages:

```javascript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimiter } from "@skill-learn/lib/utils/rateLimit";
import { publicRoutes, rateLimits } from "./app/config/routes";

// ... rest of middleware
```

---

## Step 7: Move LMS App (Using Route Groups)

### 7.1 Move LMS Files

```bash
# Move LMS app - keep route group structure
cp -r src/app/\(lms\) apps/lms/app/\(lms\)
cp -r src/app/\(public\) apps/lms/app/\(public\)
cp -r src/app/api apps/lms/app/api
cp src/app/layout.jsx apps/lms/app/layout.jsx
cp src/app/globals.css apps/lms/app/globals.css
cp src/app/page.jsx apps/lms/app/page.jsx
cp src/app/not-found.jsx apps/lms/app/not-found.jsx

# Move LMS-specific components
cp -r src/components/features apps/lms/components/features
cp -r src/components/layout apps/lms/components/layout
cp -r src/components/shared apps/lms/components/shared
cp -r src/components/file-uploader apps/lms/components/file-uploader
cp -r src/components/providers apps/lms/components/providers
cp -r src/components/rich-text-editor apps/lms/components/rich-text-editor

# Move LMS-specific lib
cp -r src/lib/actions apps/lms/lib/actions
cp -r src/config apps/lms/config

# Move middleware
cp src/middleware.js apps/lms/middleware.js
```

**Important:** The LMS uses route groups `(lms)`, `(public)`, etc., so URLs stay at the root (`/`, `/home`, `/dashboard`, etc.) - no `/lms` prefix.

### 7.2 Create `apps/lms/package.json`

```json
{
  "name": "@skill-learn/lms",
  "version": "0.0.4",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    "@clerk/nextjs": "^6.20.2",
    "@clerk/themes": "^2.2.48",
    "@hookform/resolvers": "^5.2.2",
    "@skill-learn/database": "*",
    "@skill-learn/ui": "*",
    "@skill-learn/lib": "*",
    "@tailwindcss/postcss": "^4.1.8",
    "@tiptap/extension-text-align": "^3.6.2",
    "@tiptap/pm": "^3.6.2",
    "@tiptap/react": "^3.6.2",
    "@tiptap/starter-kit": "^3.6.2",
    "axios": "^1.8.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^2.30.0",
    "dotenv-cli": "^8.0.0",
    "firebase-admin": "^13.5.0",
    "framer-motion": "^12.23.26",
    "lightningcss": "^1.28.0",
    "lucide-react": "^0.544.0",
    "next": "^15.5.9",
    "next-themes": "^0.4.6",
    "postcss": "^8.5.4",
    "react": "^19.2.1",
    "react-day-picker": "^9.7.0",
    "react-dom": "^19.2.1",
    "react-dropzone": "^14.3.8",
    "react-hook-form": "^7.63.0",
    "react-icons": "^5.4.0",
    "recharts": "^3.6.0",
    "slugify": "^1.6.6",
    "sonner": "^2.0.2",
    "svix": "^1.45.1",
    "tailwind-merge": "^3.4.0",
    "tailwindcss": "^4.0.17",
    "tw-animate-css": "^1.2.4",
    "uuid": "^13.0.0",
    "zod": "^4.1.11",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.19",
    "@types/node": "^22.15.29",
    "@types/react": "^19.2.0",
    "eslint": "^8.57.1",
    "eslint-config-next": "^15.2.8",
    "prisma": "^6.16.2"
  }
}
```

### 7.3 Create `apps/lms/next.config.mjs`

Copy your existing `next.config.mjs` and update it.

### 7.4 Create `apps/lms/tailwind.config.mjs`

Copy your existing `tailwind.config.mjs` and update content paths:

```javascript
content: [
  './app/**/*.{js,jsx}',
  './components/**/*.{js,jsx}',
  '../../packages/ui/components/**/*.{js,jsx}', // Include UI package
],
```

### 7.5 Create `apps/lms/jsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./app/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/config/*": ["./config/*"],
      "@skill-learn/ui": ["../../packages/ui/components"],
      "@skill-learn/lib": ["../../packages/lib"],
      "@skill-learn/database": ["../../packages/database"]
    }
  }
}
```

---

## Step 8: Update Imports

### 8.1 Update Database Imports

**In both apps, replace:**
```javascript
import prisma from '@/lib/utils/connect'
// or
import { PrismaClient } from '@prisma/client'
```

**With:**
```javascript
import { prisma } from '@skill-learn/database'
```

### 8.2 Update UI Component Imports

**Replace:**
```javascript
import { Button } from '@/components/ui/button'
```

**With:**
```javascript
import { Button } from '@skill-learn/ui/components/button'
// or if you created index.js:
import { Button } from '@skill-learn/ui'
```

### 8.3 Update Lib Imports

**Replace:**
```javascript
import { cn } from '@/lib/utils'
import { useDebounce } from '@/lib/hooks/useDebounce'
```

**With:**
```javascript
import { cn, useDebounce } from '@skill-learn/lib'
// or individually:
import { cn } from '@skill-learn/lib/utils.js'
import { useDebounce } from '@skill-learn/lib/hooks/useDebounce.js'
```

### 8.4 Update Path Aliases

Keep app-specific imports using `@/`:
- `@/components/*` → App-specific components
- `@/lib/*` → App-specific lib files
- `@skill-learn/*` → Workspace packages

---

## Step 9: Update Configuration Files

### 9.1 Create `apps/cms/postcss.config.mjs`

```javascript
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

### 9.2 Create `apps/lms/postcss.config.mjs`

```javascript
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

---

## Step 10: Update Root Files

### 10.1 Update `.gitignore`

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

### 10.2 Remove Old Files (After Verification)

Once everything works:
```bash
# Remove old src directory (keep a backup first!)
# rm -rf src
# rm -rf prisma
```

---

## Step 11: Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Generate Prisma client
npm run prisma:generate
```

---

## Step 12: Test the Migration

### 12.1 Test LMS App

```bash
cd apps/lms
npm run dev
```

Visit: `http://localhost:3000`

### 12.2 Test CMS App

```bash
cd apps/cms
npm run dev
```

Visit: `http://localhost:3001`

### 12.3 Test from Root

```bash
# From root, run both apps
npm run dev
```

---

## Step 13: Update Build Scripts (CI/CD)

If you have CI/CD, update your build scripts:

```yaml
# Example GitHub Actions
- name: Build
  run: npm run build

- name: Build LMS
  run: npm run build --filter=@skill-learn/lms

- name: Build CMS
  run: npm run build --filter=@skill-learn/cms
```

---

## Common Issues & Solutions

### Issue 1: Module Not Found

**Solution:** Ensure all workspace packages are installed:
```bash
npm install
```

### Issue 2: Prisma Client Not Generated

**Solution:**
```bash
npm run prisma:generate
```

### Issue 3: Tailwind Styles Not Working

**Solution:** Update `tailwind.config.mjs` content paths to include package paths.

### Issue 4: Path Aliases Not Working

**Solution:** Check `jsconfig.json` paths and restart your dev server.

---

## URL Structure After Migration

- **LMS Routes** (no prefix):
  - `/` - Landing page
  - `/home` - User dashboard
  - `/dashboard` - Admin dashboard
  - `/training` - Training page
  - etc.

- **CMS Routes** (with `/cms` prefix):
  - `/cms` - CMS dashboard
  - `/cms/billing` - Billing page
  - `/cms/tenants` - Tenants page
  - etc.

---

## Summary Checklist

- [ ] Created directory structure
- [ ] Set up root package.json with workspaces
- [ ] Created turbo.json
- [ ] Created database package
- [ ] Created UI package
- [ ] Created lib package
- [ ] Moved CMS app
- [ ] Moved LMS app (with route groups)
- [ ] Updated all imports
- [ ] Created package.json files for all workspaces
- [ ] Updated configuration files
- [ ] Installed dependencies
- [ ] Tested both apps
- [ ] Updated CI/CD scripts (if applicable)

---

## Next Steps After Migration

1. Update documentation
2. Update deployment scripts
3. Consider setting up Turborepo remote caching
4. Set up shared ESLint config in packages/config
5. Consider code sharing strategies

---

**Good luck with your migration!** 🚀
