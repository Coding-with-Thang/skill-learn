# Project Scan: Redundant Code, Refactoring & Architecture Opportunities

**Date:** February 2026  
**Scope:** Redundant code, refactoring (keeping functionality, security, best practices), simplification, and design/architecture improvements with pros, cons, and priority.

---

## 1. Redundant Code

### 1.1 Duplicate Zod schemas (LMS vs package) ✅ Done

| Location | Content |
|----------|--------|
| `packages/lib/zodSchemas.js` | objectIdSchema, courseStatus, courseSchema, courseUpdateSchema, addPointsSchema, spendPointsSchema, quiz schemas, userCreateSchema, userUpdateSchema, categoryCreateSchema, categoryUpdateSchema, settingUpdateSchema, reward schemas, settingsFormSchema, etc. (~324 lines) |
| `apps/lms/lib/zodSchemas.js` | **Now:** Re-exports all shared schemas from `@skill-learn/lib`; defines only LMS-specific: userCreateSchema/userUpdateSchema (with reportsToUserId empty-string→null transform for forms), and all flashcard* schemas. |

**Refactor (completed):**  
- LMS `zodSchemas.js` imports shared schemas from `@skill-learn/lib` and re-exports them.  
- LMS-only schemas kept locally: flashcard schemas, and user create/update schemas with the form transform for `reportsToUserId`.

| Priority | Pros | Cons |
|----------|------|------|
| **High** | Single source of truth; no drift between apps; smaller LMS bundle for shared schemas | One-time migration of imports; must ensure package has all shared schemas LMS needs |

---

### 1.2 Duplicate utils (LMS vs package) ✅ Done

| File | LMS (`apps/lms/lib/utils/`) | Package (`packages/lib/utils/utils/`) |
|------|----------------------------|---------------------------------------|
| `apiResponseParser.js` | **Removed** – was same logic | Canonical |
| `greetingGenerator.js` | **Removed** – was same logic | Canonical |
| `notifications.js` | **Removed** – was same logic | Canonical |

**Refactor (completed):**  
- Removed `apps/lms/lib/utils/apiResponseParser.js`, `greetingGenerator.js`, `notifications.js`.  
- Added package.json exports for `greetingGenerator.js` and `notifications.js` (apiResponseParser was already exported).  
- LMS now imports from `@skill-learn/lib/utils/apiResponseParser.js`, `@skill-learn/lib/utils/greetingGenerator.js`, `@skill-learn/lib/utils/notifications.js`.

| Priority | Pros | Cons |
|----------|------|------|
| **High** | No duplicate logic; consistent behavior; easier to fix bugs in one place | Update all LMS imports (greetingGenerator, notifications, apiResponseParser) |

---

### 1.3 Duplicate hooks (LMS vs package) ✅ Done

| Hook | LMS | Package |
|------|-----|---------|
| `useAuditLog.js` | **Removed** – was duplicate | `packages/lib/hooks/useAuditLog.js` (canonical) |
| `useWelcomeContext.js` | **Removed** – was duplicate | `packages/lib/hooks/useWelcomeContext.js` (canonical) |

**Refactor (completed):**  
- Exported `useAuditLog` and `useWelcomeContext` from `packages/lib` (index.js and package.json).  
- Deleted `apps/lms/lib/hooks/useAuditLog.js` and `useWelcomeContext.js`.  
- LMS now imports from `@skill-learn/lib`: WelcomeBanner uses `useWelcomeContext`, quiz results page uses `useAuditLog`.

| Priority | Pros | Cons |
|----------|------|------|
| **High** | Single implementation; package already has these hooks | Add exports in package if missing; update 2 call sites in LMS |

---

### 1.4 Duplicate file Uploader (CMS vs LMS) ✅ Done

| App | Before | After |
|-----|--------|--------|
| CMS | `apps/cms/.../file-uploader/Uploader.jsx` + `RenderState.jsx` | **Removed** – uses shared |
| LMS | `apps/lms/.../file-uploader/Uploader.jsx` + `RenderState.jsx` | **Removed** – uses shared |

**Refactor (completed):**  
- Single shared component: `packages/ui/components/file-uploader.jsx` (Uploader + RenderEmptyState, RenderErrorState, RenderUploadedState, RenderUploadingState).  
- API: `value`, `onChange`, `onUploadComplete`, `uploadEndpoint` (default `'/api/admin/upload'`), optional `className`, `name` (for forms).  
- Dependencies added to `@skill-learn/ui`: axios, react-dropzone, sonner.  
- LMS (course edit/create, RewardForm) and CMS (ChangelogForm) now import from `@skill-learn/ui/components/file-uploader`.  
- Duplicate Uploader and RenderState files removed from both apps.

| Priority | Pros | Cons |
|----------|------|------|
| **Medium** | One component to maintain; consistent upload UX and error handling | Need to align RenderState and any app-specific styling; LMS uses `@/components/file-uploader` in several places |

---

### 1.5 Inline loading vs shared Loader

- **Shared:** `packages/ui/components/loader.jsx` – variants: spinner, page, card, gif, fullscreen; sizes.
- **Current usage:** Many LMS/CMS pages use raw `<Loader2 className="... animate-spin" />` from lucide-react instead of the shared Loader.

**Refactor:**  
- Prefer `import { Loader } from "@skill-learn/ui/components/loader"` and use `<Loader variant="spinner" size="md" />` (and other variants) for consistency.
- **Custom text:** Loader supports an optional `text` prop on all variants. Use it for contextual messages (e.g. `<Loader variant="spinner" text="Deleting..." />`, `<Loader variant="spinner" text="Saving..." />`). Spinner shows text beside the icon; page/fullscreen use it as the subtitle.

| Priority | Pros | Cons |
|----------|------|------|
| **Low** | Consistent loading UX; one place to change behavior/style; optional custom text per loading state | Many files to touch to migrate from raw Loader2 |

---

## 2. Refactoring Opportunities (functionality, security, best practices)

### 2.1 Standardize API error responses ✅ Done (listed routes)

**Completed for:**  
`api/user/progress`, `api/user-permissions`, `api/tenant`, `api/tenant/features`, `api/tenant/billing`, `api/tenant/roles`, `api/tenant/roles/[roleId]`, `api/features`, `api/stripe/subscription`, `api/stripe/portal`, `api/stripe/checkout`.

**Changes:**  
- All listed routes now import `handleApiError`, `AppError`, `ErrorType` from `@skill-learn/lib/utils/errorHandler.js`.  
- Known cases (unauthorized, not found, validation) throw `new AppError(message, ErrorType.*, { status })`; catch blocks return `handleApiError(error)`.  
- `packages/lib/utils/errorHandler.js`: extra keys on `AppError.details` (e.g. `redirectToSignup`, `contactSales`, `redirectToPortal`) are copied onto the JSON response so clients can keep using them.

**Still ad-hoc (migrate when touching):**  
`api/users`, `api/categories/[categoryId]`, `api/onboarding/*`, `api/users/lookup`, `api/tenant/user-roles`, `api/stripe/webhook`, `api/tenant/templates`, `api/tenant/permissions`, `api/subscription/status`, `api/onboarding/validate-session`, `api/webhooks`. Use the same pattern: throw `AppError`, catch with `handleApiError`.

| Priority | Pros | Cons |
|----------|------|------|
| **High** | Consistent error shape; better security; easier client handling and logging | Need to audit and update each route that still uses raw NextResponse.json for errors |

---

### 2.2 Flatten nested package layout (hooks/hooks, utils/utils) ✅ Done

**Completed:**  
- Moved `packages/lib/utils/utils/*` → `packages/lib/utils/` (single level).  
- Moved `packages/lib/hooks/hooks/*` → `packages/lib/hooks/`.  
- Updated package.json exports (target paths now `./utils/...`, `./hooks/...`).  
- Updated index.js and all internal imports (stores: `../../utils/`; hooks: `../utils/`).  
- Removed empty `utils/utils` and `hooks/hooks` directories.  
- **Consumer apps unchanged:** export keys (e.g. `@skill-learn/lib/utils/axios.js`) are unchanged.

| Priority | Pros | Cons |
|----------|------|------|
| **Medium** | Clearer structure; shorter import paths; less confusion | Requires updating every import and export in package and in apps that reference these paths |

---

### 2.3 Migrate remaining usePermissions / useFeatures call sites to stores ✅ Done

**Completed:** All LMS components that used `usePermissions` or `useFeatures` now use the stores directly with selectors and fetch-on-mount where needed.

**Migrated to usePermissionsStore:**  
`dashboard/users/page.jsx`, `UserForm.jsx`, `Header.jsx`, `DashboardLayout.jsx`, `MobileSidebar.jsx`. Each uses selectors (e.g. `(s) => s.hasPermission`, `(s) => s.hasAnyPermission`, `(s) => s.isLoading`, `(s) => s.fetchPermissions`) and a `useEffect` to call `fetchPermissions()` on mount.

**Migrated to useFeaturesStore:**  
`Sidebar.jsx`, `Navigation.jsx`, `MobileSidebar.jsx`, `app-sidebar.jsx`. Each uses selectors (`(s) => s.isEnabled`, `(s) => s.isLoading`, `(s) => s.fetchFeatures`) and a `useEffect` to call `fetchFeatures()` on mount.

**Note:** CMS and LMS features page already used the stores. The hooks `usePermissions` and `useFeatures` remain in the package for backward compatibility but are no longer used in the apps.

| Priority | Pros | Cons |
|----------|------|------|
| **Low** | Fewer re-renders; consistent pattern with rest of codebase | Low urgency; hooks already delegate to stores |

---

## 3. Simplification & Design / Architecture

### 3.1 Single source of schemas (extend package, LMS keeps only app-specific) ✅ Done

**Idea:** All shared validation (courses, users, categories, points, rewards, quizzes, settings) lives in `packages/lib/zodSchemas.js`. LMS only keeps flashcard-related and any other LMS-only schemas in `apps/lms/lib/zodSchemas.js` and re-exports or composes with package schemas if needed.

**Assessment & implementation (completed):**

- **Package (`packages/lib/zodSchemas.js`):**
  - Added `pathParamSchema(paramName)` – factory for route params like `{ [paramName]: objectIdSchema }`.
  - Added `fileUploadSchema` – `{ fileName, contentType, size, isImage }` for upload metadata validation.

- **LMS (`apps/lms/lib/zodSchemas.js`):**
  - Re-exports `pathParamSchema` and `fileUploadSchema` from `@skill-learn/lib`.
  - Added `flashCardDeckUpdateSchema` = `flashCardDeckCreateSchema.partial()` for PATCH deck.
  - Added `deckIdParamSchema` = `pathParamSchema("deckId")`.
  - Extracted `flashCardBulkCardSchema` and added `flashCardUserBulkCreateSchema` (same shape as bulk import but `cards.min(1)`).

- **Refactored to use shared/LMS schemas:**
  - **Upload routes (5):** `api/admin/upload`, `rewards/upload`, `questions/upload`, `quizzes/upload`, `courses/upload` – removed local `fileUploadSchema`; import from `@skill-learn/lib`.
  - **Flashcard deck:** `api/flashcards/decks/[deckId]/route.js` – uses `deckIdParamSchema` and `flashCardDeckUpdateSchema` from `@/lib/zodSchemas`.
  - **Hide card:** `api/flashcards/decks/[deckId]/hide-card/route.js` – uses `deckIdParamSchema` and `flashCardDeckHideSchema` from `@/lib/zodSchemas`.
  - **Bulk cards:** `api/flashcards/cards/bulk/route.js` – uses `flashCardUserBulkCreateSchema` from `@/lib/zodSchemas`.

| Priority | Pros | Cons |
|----------|------|------|
| **High** | Single source of truth; less duplication; clearer ownership (shared vs LMS-only) | Ensure package version is always in sync with API contracts; may need to add a few schemas to package first |

---

### 3.2 CMS UI alignment with shared UI package

**Current:** CMS has its own primitives under `apps/cms/components/cms/ui/` (e.g. button, card, input, progress, badge) using `@/lib/cms/utils` (cn). LMS uses `@skill-learn/ui` (e.g. Button, Card, Form) with a more complete API (e.g. cva, Radix Slot).

**Refactor:**  
- Prefer `@skill-learn/ui` in CMS for button, card, input, etc., and remove or thin out `apps/cms/components/cms/ui/` to only overrides/theming if needed.

| Priority | Pros | Cons |
|----------|------|------|
| **Medium** | One design system; less code; consistent look and behavior | CMS may need theme/token alignment; possible visual regression |

---

### 3.3 Centralize Uploader in packages/ui

**Idea:** One file-uploader component in `packages/ui` (with optional RenderState or slots), used by both CMS and LMS. Same API: `value`, `onChange`, `onUploadComplete`, `uploadEndpoint`.

| Priority | Pros | Cons |
|----------|------|------|
| **Medium** | Single component; consistent upload behavior and errors | May require moving RenderState or making it configurable (e.g. slots or props) |

---

### 3.4 Explicit package exports for hooks

**Current:** `packages/lib/package.json` exports specific hooks (e.g. useDebounce, usePermissions, useSubscription) but not useAuditLog or useWelcomeContext from the main entry. They exist in `hooks/hooks/` but are not in `index.js`.

**Refactor:**  
- Export useAuditLog and useWelcomeContext (e.g. from `index.js` and/or package.json exports) so apps never need local copies.

| Priority | Pros | Cons |
|----------|------|------|
| **High** | Enables removing duplicate hooks in LMS; clear public API | Trivial change |

---

### 3.5 Remove stray / obsolete artifacts

**Observed:**  
- Git status shows `?? nul` (Windows nul device accidentally added).  
- Deleted scripts: `db-push.js`, `fix-tenant-default-role-index.js`, `seed-flashcard-permissions.js`, etc. – already removed from tree.  
- `docs/PURPOSE.md` describes an "Achieve" directory for archived files – ensure no critical code lives only there.

**Refactor:**  
- Remove or ignore `nul` from the repo.  
- Keep only scripts that are still in use; document any required seed/migration in README or docs.

| Priority | Pros | Cons |
|----------|------|------|
| **Low** | Cleaner repo; less confusion | Minimal impact |

---

## 4. Security & Best Practices (already in good shape)

- **Auth:** API routes use `requireAuth`, `requireAdmin`, `requirePermission`, `requireCanEditCourse` from `@skill-learn/lib/utils/auth.js` and permissions – keep this pattern.  
- **Validation:** Widespread use of Zod via `validateRequestBody`, `validateRequestParams`, `validateRequest` from `@skill-learn/lib/utils/validateRequest.js` – keep.  
- **Responses:** `successResponse` and `handleApiError` used in many routes – extend to remaining routes (see 2.1).  
- **Tenant isolation:** Uses `getTenantId`, `buildTenantContentFilter` for tenant-scoped data – keep and use consistently.

No major security refactors required beyond standardizing error responses (2.1) so that error payloads don’t leak internals.

---

## 5. Priority Summary

| Priority | Item | Section |
|----------|------|---------|
| **High** | Single source for Zod schemas (LMS uses package for shared, keeps only flashcard/local) | 1.1, 3.1 |
| **High** | Remove duplicate LMS utils (apiResponseParser, greetingGenerator, notifications) – use package | 1.2 |
| **High** | Remove duplicate LMS hooks (useAuditLog, useWelcomeContext) – export from package and use there | 1.3, 3.4 |
| **High** | Standardize API error responses (handleApiError / AppError everywhere) | 2.1 |
| **Medium** | Shared file Uploader (packages/ui or lib) for CMS + LMS | 1.4, 3.3 |
| **Medium** | Flatten packages/lib layout (hooks/hooks → hooks, utils/utils → utils) | 2.2 |
| **Medium** | CMS UI alignment with @skill-learn/ui | 3.2 |
| **Low** | Use shared Loader component instead of raw Loader2 where appropriate | 1.5 |
| **Low** | Migrate remaining usePermissions/useFeatures to stores where beneficial | 2.3 |
| **Low** | Clean up nul and obsolete script references | 3.5 |

---

## 6. Suggested order of work

1. **Quick wins:** Export useAuditLog and useWelcomeContext from package; switch LMS to package for these hooks and delete local copies. Switch LMS to package for apiResponseParser, greetingGenerator, notifications and remove local utils.  
2. **Schemas:** Have LMS import all shared schemas from `@skill-learn/lib` and keep only flashcard (and any other LMS-only) schemas in `apps/lms/lib/zodSchemas.js`.  
3. **API errors:** Replace ad-hoc `NextResponse.json({ error: ... })` with AppError + handleApiError in the remaining routes.  
4. **Structure:** Flatten hooks and utils in packages/lib and update exports.  
5. **Uploader / Loader / CMS UI:** Tackle as follow-up refactors when touching those areas.

This keeps functionality, security, and best practices while reducing redundancy and simplifying the project structure.
