# Image Storage Analysis & Best Practices

## Executive Summary

This document analyzes all image references in the Skill-Learn project and provides recommendations for optimal storage strategies based on Next.js 15, Firebase Storage, and Prisma tech stack.

## Current Tech Stack

- **Framework**: Next.js 15.5.9
- **Storage**: Firebase Storage (via firebase-admin)
- **Database**: MongoDB (via Prisma)
- **Auth**: Clerk
- **Image Optimization**: Next.js Image component with remote patterns configured

## Image Categories & Recommendations

### ✅ **KEEP IN PUBLIC DIRECTORY** (Static Assets)

These are application-level assets that should remain in `/public`:

#### 1. **Brand Identity Assets**

- `logo.svg`, `logo.png`, `logo.ico` - ✅ **Correctly placed**
  - Used in: `Logo.jsx` component
  - **Reason**: Brand assets are static, version-controlled, and needed at build time
  - **Status**: ✅ Good as is

#### 2. **PWA/Manifest Assets**

- `web-app-manifest-192x192.png`
- `web-app-manifest-512x512.png`
- **Reason**: Required for PWA installation, must be available at build time
- **Status**: ✅ Good as is

#### 3. **UI/UX Static Elements**

- `loader.gif` - ✅ **Correctly placed**
  - Used in: `components/ui/loader.jsx`
  - **Reason**: Static UI element, always needed
  - **Status**: ✅ Good as is

#### 4. **Fallback/Placeholder Images**

- `placeholder-course.jpg` - ⚠️ **Needs decision**

  - Used as fallback in: `course-card.jsx`, `api/courses/route.js`, `training/page.jsx`
  - **Current**: Static file in public
  - **Recommendation**: Keep in public (it's a fallback, not user content)
  - **Status**: ✅ Good as is (but ensure it exists)

- `quiz.png` - ⚠️ **Needs decision**

  - Used as fallback in: `QuizCard.jsx`
  - **Current**: Static file in public
  - **Recommendation**: Keep in public (fallback image)
  - **Status**: ✅ Good as is

- `/user.png` - ✅ **FIXED**
  - ~~Referenced in: `UserBadge.jsx` as fallback~~
  - ~~**Issue**: File doesn't exist in public directory~~
  - **Solution**: Updated `UserBadge.jsx` to use conditional rendering with initials fallback (similar to `LeaderboardWidget`)
  - **Status**: ✅ Fixed - now shows user initials in a styled div when no image is available

#### 5. **Marketing/Landing Page Static Images**

These appear to be static marketing assets:

- `empathy.png` - ✅ **Fixed**

  - Used in: `Training.jsx`
  - ~~**Issue**: Incorrect import path `import empathy from "/public/empathy.png"`~~
  - **Solution**: Removed incorrect import, now using `src="/empathy.png"` directly in Image component
  - **Status**: ✅ Fixed - using correct Next.js public directory path pattern

- `hero-image.jpg` - ✅ Likely static landing asset
- `15break.jpg`, `chicken-dance.jpg`, `flying-pie.jpg`, `guessing-game.jpg`, `lunch.jpg`, `memory-game.jpg`, `play.jpg`, `Soft-Skill.jpg` - ⚠️ **Review needed**
  - **Question**: Are these static marketing images or should they be dynamic?
  - **Recommendation**: If they're part of the landing page/marketing, keep in public. If they're game-specific assets that might change, consider Firebase.

### ⚠️ **MOVE TO FIREBASE STORAGE** (Dynamic Content)

These are user-generated or admin-managed content that should be in Firebase Storage:

#### 1. **Course Images** - ✅ **Already using Firebase**

- **Current Implementation**: ✅ Correct
  - Stored via `fileKey` in database
  - Signed URLs generated via `getSignedUrl()` in `api/admin/courses/[courseId]/route.js`
  - Upload endpoint: `api/admin/courses/upload/route.js`
- **Status**: ✅ Best practice already implemented

#### 2. **Quiz Images** - ⚠️ **Needs Improvement**

- **Current Implementation**:
  - Stored as `imageUrl` string in database (can be any URL - Firebase or external)
  - No `fileKey` field in Quiz schema (unlike Course model)
  - QuizBuilder component uses text input for image URL (no file upload UI)
  - General upload endpoint (`/api/admin/upload`) stores in `courses/` directory
  - No validation that images are from Firebase Storage
- **Issues Found**:
  1. ❌ No file upload UI component in QuizBuilder (admins must paste URLs manually)
  2. ❌ Quiz schema lacks `fileKey` field (inconsistent with Course pattern)
  3. ❌ General upload endpoint stores quiz images in `courses/` directory (should be `quizzes/`)
  4. ❌ No enforcement that quiz images use Firebase Storage URLs
- **Comparison with Courses** (Best Practice):
  - ✅ Courses use `Uploader` component for drag-and-drop file uploads
  - ✅ Courses store both `imageUrl` (preview) and `fileKey` (storage path)
  - ✅ Courses use dedicated upload endpoint with proper path structure
  - ✅ Courses generate signed URLs from `fileKey` when retrieving
- **Recommendations**:
  1. **Add file upload UI to QuizBuilder**:
     - Integrate `Uploader` component (same as courses)
     - Replace text input with drag-and-drop upload
  2. **Update Quiz schema** (optional but recommended):
     - Add `fileKey` field to Quiz model for consistency
     - Store Firebase Storage path in `fileKey`
     - Keep `imageUrl` for preview/signed URLs
  3. **Create dedicated quiz upload endpoint OR update general one**:
     - Option A: Create `/api/admin/quizzes/upload/route.js` (stores in `quizzes/`)
     - Option B: Update `/api/admin/upload/route.js` to accept `type` parameter (courses/quizzes/rewards)
  4. **Add validation**:
     - Validate that `imageUrl` is a Firebase Storage URL (if not using `fileKey`)
     - Or require `fileKey` and generate signed URLs like courses
- **Used in**: `QuizCard.jsx` with fallback to `/quiz.png`
- **Status**: ✅ **IMPLEMENTED** - Now consistent with course image pattern

**Implementation Completed:**

- ✅ Added `fileKey` field to Quiz schema
- ✅ Created `/api/admin/quizzes/upload/route.js` endpoint
- ✅ Updated QuizBuilder to use `Uploader` component
- ✅ Updated API routes to handle `fileKey` and generate signed URLs
- ✅ Added validation for Firebase Storage URLs
- ✅ Updated `Uploader` component to accept custom endpoint prop

**Next Step**: Run `prisma generate` to update Prisma client with new `fileKey` field

#### 3. **Question Images** - ✅ **IMPLEMENTED - Now Consistent with Quiz/Course Pattern**

- **Current Implementation**: ✅ **Complete**
  - ✅ Added `fileKey` field to Question schema (consistent with Quiz/Course models)
  - ✅ QuizBuilder component now uses `Uploader` component for question image uploads
  - ✅ Created dedicated upload endpoint `/api/admin/questions/upload/route.js` (stores in `questions/` directory)
  - ✅ Quiz API routes generate signed URLs from `fileKey` when retrieving questions
  - ✅ Added validation to ensure Firebase Storage URLs when `fileKey` is not provided
  - ✅ Handles image/video mutual exclusivity (can't have both)
- **Implementation Details**:
  1. ✅ **Schema Update**: Added `fileKey String?` field to Question model in `prisma/schema.prisma`
  2. ✅ **Upload Endpoint**: Created `/api/admin/questions/upload/route.js` that stores files in `questions/` directory
  3. ✅ **UI Component**: Replaced text input with `Uploader` component in QuizBuilder for questions
  4. ✅ **API Routes**: Updated quiz GET, POST, and PUT routes to:
     - Accept and store `fileKey` for questions in database
     - Generate signed URLs from `fileKey` when retrieving questions
     - Fallback to existing `imageUrl` if `fileKey` is not available
  5. ✅ **Validation**: Added Zod validation to ensure `imageUrl` is from Firebase Storage or local path if `fileKey` is not provided
- **Pattern Consistency**:
  - ✅ Now matches Quiz and Course image patterns exactly
  - ✅ Uses `Uploader` component for drag-and-drop uploads
  - ✅ Stores both `imageUrl` (preview) and `fileKey` (storage path)
  - ✅ Uses dedicated upload endpoint with proper path structure
  - ✅ Generates signed URLs from `fileKey` when retrieving
- **Used in**: Quiz builder and quiz taking flow
- **Status**: ✅ **Complete** - Now consistent with quiz/course image pattern
- **Next Steps**: Run `prisma generate` to update Prisma client with new `fileKey` field

#### 4. **Reward Images** - ✅ **IMPLEMENTED - Now Consistent with Quiz/Course Pattern**

- **Current Implementation**: ✅ **Complete**
  - ✅ Added `fileKey` field to Reward schema (consistent with Quiz/Course/Question models)
  - ✅ RewardForm component now uses `Uploader` component for drag-and-drop file uploads
  - ✅ Created dedicated upload endpoint `/api/admin/rewards/upload/route.js` (stores in `rewards/` directory)
  - ✅ Reward API routes generate signed URLs from `fileKey` when retrieving rewards
  - ✅ Added validation to ensure Firebase Storage URLs when `fileKey` is not provided
- **Implementation Details**:
  1. ✅ **Schema Update**: Added `fileKey String?` field to Reward model in `prisma/schema.prisma`
  2. ✅ **Upload Endpoint**: Created `/api/admin/rewards/upload/route.js` that stores files in `rewards/` directory
  3. ✅ **UI Component**: Replaced text input with `Uploader` component in RewardForm
  4. ✅ **API Routes**: Updated GET, POST, and PUT routes to:
     - Accept and store `fileKey` for rewards in database
     - Generate signed URLs from `fileKey` when retrieving rewards
     - Fallback to existing `imageUrl` if `fileKey` is not available
  5. ✅ **Validation**: Added Zod validation to ensure `imageUrl` is from Firebase Storage or local path if `fileKey` is not provided
- **Pattern Consistency**:
  - ✅ Now matches Quiz, Course, and Question image patterns exactly
  - ✅ Uses `Uploader` component for drag-and-drop uploads
  - ✅ Stores both `imageUrl` (preview) and `fileKey` (storage path)
  - ✅ Uses dedicated upload endpoint with proper path structure
  - ✅ Generates signed URLs from `fileKey` when retrieving
- **Used in**: Rewards pages and admin dashboard
- **Status**: ✅ **Complete** - Now consistent with quiz/course/question image pattern
- **Next Steps**: Run `prisma generate` to update Prisma client with new `fileKey` field

#### 5. **Category Images** - ✅ **Not Required**

- **Current**: `imageUrl` field exists in Category model but is not needed
- **Decision**: Categories do not require images
- **Status**: ✅ **No action needed** - Category images are not used in the application
- **Note**: The `imageUrl` field in the Category schema can remain for backward compatibility but is not actively used

#### 6. **User Profile Images** - ✅ **Using Clerk with Initials Fallback**

- **Current**: From Clerk authentication (`user.imageUrl`)
- **Fallback**: ✅ **User's initials** displayed in a styled div (implemented in `UserBadge.jsx`)
- **Implementation**:
  - Uses Clerk's `user.imageUrl` when available
  - Falls back to displaying user's initials (first letter of first name, or last name, or "?")
  - Styled with gradient background matching the badge theme
- **Status**: ✅ **Complete** - No missing file needed, uses initials fallback

### ❌ **HARDCODED FIREBASE URLs** (Needs Refactoring)

These components have hardcoded Firebase Storage URLs that should be moved to environment variables or public assets:

#### Landing Page Images

- `BuiltForEveryone.jsx`: Hardcoded Firebase URLs for feature images
  - `courses/features/cowork.jpg`
  - `courses/features/dashboard.jpg`
  - `courses/features/learning.jpg`
  - `courses/features/leadership.jpg`
  - `courses/features/navi - ai companion.png`
- `HeroSection.jsx`: Hardcoded Firebase URLs
  - `courses/features/profile.jpg`
  - Video: `skill-learn demo.mp4`
- `about/page.jsx`: Hardcoded Firebase URLs
  - `profound.png`, `grow.png`, `unnamed.png`, `galaxy.png`

**Recommendation**:

- If these are static marketing assets, move them to `/public` directory
- If they need to be dynamic, create a configuration file or environment variables
- **Best Practice**: Use a constants file for marketing assets

## Best Practices Summary

### ✅ **DO: Keep in Public Directory**

1. **Brand assets** (logos, favicons)
2. **PWA manifest images**
3. **Static UI elements** (loaders, icons)
4. **Fallback/placeholder images**
5. **Static marketing/landing page images** (if they don't change frequently)

### ✅ **DO: Use Firebase Storage**

1. **User-generated content**
2. **Admin-uploaded course content**
3. **Dynamic quiz/reward/question images**
4. **Any content that changes based on user/admin actions**
5. **Large files that benefit from CDN**

### ❌ **DON'T:**

1. Hardcode Firebase Storage URLs in components
2. Mix storage strategies inconsistently
3. Use public directory for user-generated content
4. Reference missing files (`/user.png`)

## Action Items

### High Priority

1. ✅ **Fix missing `/user.png` fallback** - **COMPLETED**
   - ✅ Updated `UserBadge.jsx` to use conditional rendering with initials fallback
   - Shows styled div with user initials when no image is available
2. ✅ **Fix incorrect import in `Training.jsx`** - **COMPLETED**

   - ✅ Removed incorrect import statement
   - ✅ Updated to use `src="/empathy.png"` directly in Image component
   - Follows Next.js best practices for public directory assets

3. ⚠️ **Refactor hardcoded Firebase URLs**
   - Move landing page images to public OR create constants file
   - Consider creating `src/config/marketing-assets.js`

### Medium Priority

4. ⚠️ **Refactor quiz image upload flow** - **REVIEWED - NEEDS IMPROVEMENT**

   - **Current Issues**:

     - QuizBuilder uses text input instead of file upload UI
     - No `fileKey` field in Quiz schema (inconsistent with Course)
     - General upload endpoint stores in `courses/` directory
     - No validation that images are from Firebase Storage

   - **Recommended Actions**:

     1. Add `Uploader` component to QuizBuilder (replace text input)
     2. Consider adding `fileKey` field to Quiz schema for consistency
     3. Create dedicated `/api/admin/quizzes/upload/route.js` OR update general upload to support `type` parameter
     4. Add validation to ensure Firebase Storage URLs

   - **Priority**: Medium (functional but inconsistent with best practices)

5. ⚠️ **Verify reward image upload flow**

   - Ensure consistent Firebase Storage usage
   - Review reward creation/editing flows

6. ✅ **Category Images** - **NOT REQUIRED**
   - Categories do not need images
   - No action needed - category images are not used in the application

### Low Priority

7. 📝 **Document image upload patterns**
   - Create guide for adding new image types
   - Document signed URL expiration strategy

## Recommended File Structure

```
public/
├── logo.svg, logo.png, logo.ico          # Brand assets
├── loader.gif                             # UI elements
├── web-app-manifest-*.png                 # PWA assets
├── placeholder-course.jpg                 # Fallbacks
├── quiz.png                               # Fallbacks
~~├── user.png                               # Default avatar (CREATE THIS)~~ ✅ Not needed - using initials fallback
├── empathy.png                            # Marketing assets
└── [other static marketing images]       # Marketing assets

Firebase Storage:
├── courses/
│   ├── content/                           # Course content files
│   └── features/                          # Feature images (or move to public)
├── quizzes/                               # Quiz images
├── questions/                             # Question images
├── rewards/                               # Reward images
└── categories/                            # Category images
```

## Implementation Notes

### Current Firebase Storage Pattern (Good)

```javascript
// Upload
const storageFileName = `courses/content/${Date.now()}_${originalName}`;
const fileRef = bucket.file(storageFileName);
await fileRef.save(buffer, { metadata: { contentType } });

// Retrieve (signed URL)
const [signedUrl] = await fileRef.getSignedUrl({
  action: "read",
  expires: expiresAt,
});
```

### Recommended Pattern for Static Assets

```javascript
// In component
import Image from "next/image";
<Image src="/logo.svg" alt="Logo" width={48} height={48} />;
```

### Recommended Pattern for Marketing Assets

```javascript
// src/config/marketing-assets.js
export const MARKETING_IMAGES = {
  hero: "/hero-image.jpg",
  empathy: "/empathy.png",
  // or if using Firebase:
  // hero: process.env.NEXT_PUBLIC_MARKETING_HERO_IMAGE_URL,
};
```

## Conclusion

**Overall Assessment**: The project has a good foundation with Firebase Storage for dynamic content. Main issues are:

1. Missing fallback image (`/user.png`)
2. Incorrect import path in `Training.jsx`
3. Hardcoded Firebase URLs in landing components
4. Need to verify all admin upload flows use Firebase consistently

**Recommendation**: Follow the action items above, with high priority on fixing the missing file and import path issues.
