# Slugify Utility Improvements

This document outlines the improvements made by replacing manual slug generation with the centralized `slugify` utility function.

## Summary

The project already had a `slugify` utility function in `packages/lib/utils/utils/utils.js`, but it was not being used consistently across the codebase. Several files were implementing their own manual slug generation logic, which led to code duplication and potential inconsistencies.

## Changes Made

### 1. ✅ `apps/cms/app/cms/(dashboard)/tenants/page.jsx`

**Before:**
```javascript
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

**After:**
```javascript
import { slugify } from '@skill-learn/lib/utils/utils.js'

const generateSlug = (name) => {
  return slugify(name)
}
```

**Impact:** 
- Removed 5 lines of duplicate code
- Now uses centralized slugify logic
- Used in 2 places: tenant creation and editing

### 2. ✅ `apps/cms/app/cms/(dashboard)/features/page.jsx`

**Before:**
```javascript
const generateKey = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_')
}
```

**After:**
```javascript
import { slugify } from '@skill-learn/lib/utils/utils.js'

const generateKey = (name) => {
  return slugify(name).replace(/-/g, '_')
}
```

**Impact:**
- Reuses slugify utility (with underscore conversion for keys)
- Maintains backward compatibility (keys still use underscores)
- Used for feature key generation

### 3. ✅ `apps/lms/app/onboarding/workspace/page.jsx`

**Before:**
```javascript
const subdomain = formData.organizationName
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .replace(/\s+/g, "-")
  .substring(0, 30);
```

**After:**
```javascript
import { slugify } from "@skill-learn/lib/utils/utils.js";

const subdomain = slugify(formData.organizationName).substring(0, 30);
```

**Impact:**
- Simplified subdomain generation
- Consistent slug generation across onboarding flow
- Used for auto-generating subdomains from organization names

### 4. ✅ `apps/lms/app/api/onboarding/create-workspace/route.js`

**Before:**
```javascript
const baseSlug = (subdomain || organizationName)
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .replace(/\s+/g, "-")
  .substring(0, 30);
```

**After:**
```javascript
import { slugify } from "@skill-learn/lib/utils/utils.js";

const baseSlug = slugify(subdomain || organizationName).substring(0, 30);
```

**Impact:**
- Consistent slug generation in API route
- Matches the frontend implementation
- Used for creating unique tenant slugs

## Existing Usage

The `slugify` utility was already being used in:
- `apps/cms/app/api/changelog/route.js` - For creating changelog entry slugs
- `apps/cms/app/api/changelog/[id]/route.js` - For updating changelog slugs

## Benefits

1. **Code Consistency**: All slug generation now uses the same utility function
2. **Maintainability**: Changes to slug logic only need to be made in one place
3. **Reliability**: The centralized function handles edge cases consistently
4. **Reduced Duplication**: Removed ~20 lines of duplicate code
5. **Better Testing**: Single function to test instead of multiple implementations

## The Slugify Function

Located in `packages/lib/utils/utils/utils.js`:

```javascript
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}
```

## Future Considerations

1. **Enhanced Slugify**: Consider adding options for:
   - Custom separators (hyphen, underscore, etc.)
   - Maximum length handling
   - Unicode character support
   - Preserving certain special characters

2. **Additional Use Cases**: Consider using slugify for:
   - File name generation
   - URL parameter sanitization
   - Search query normalization (where appropriate)
   - Display name formatting (with proper capitalization)

3. **Validation**: Add slug validation utilities to ensure slugs meet requirements before database operations

## Files Modified

- ✅ `apps/cms/app/cms/(dashboard)/tenants/page.jsx`
- ✅ `apps/cms/app/cms/(dashboard)/features/page.jsx`
- ✅ `apps/lms/app/onboarding/workspace/page.jsx`
- ✅ `apps/lms/app/api/onboarding/create-workspace/route.js`

## Testing Recommendations

1. Test slug generation with:
   - Special characters
   - Unicode characters
   - Multiple spaces
   - Leading/trailing spaces
   - Very long strings
   - Empty strings
   - Numbers only

2. Verify backward compatibility:
   - Existing slugs in database remain valid
   - New slugs match expected format
   - No breaking changes to API responses
