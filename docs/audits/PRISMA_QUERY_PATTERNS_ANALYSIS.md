# Prisma Query Patterns Analysis: findUnique vs findFirst

## Current Issue Summary

The codebase mixes `findUnique` and `findFirst` inconsistently, which can lead to:

1. **Performance issues** - Using `findFirst` when `findUnique` is appropriate
2. **Semantic confusion** - Unclear intent when querying by unique identifiers
3. **Potential bugs** - Missing error handling or incorrect assumptions
4. **Data integrity risks** - Hiding uniqueness constraint violations

## Key Differences: findUnique vs findFirst

### `findUnique`

- **Purpose**: Query by unique fields (primary key, `@unique` fields)
- **Performance**: Optimized for unique lookups (uses index directly)
- **Returns**: Single record or `null`
- **Use when**: You have a unique identifier (id, clerkId, username, etc.)
- **Error handling**: Always check for `null` result

### `findFirst`

- **Purpose**: Query by non-unique fields or complex conditions
- **Performance**: May scan multiple records (less efficient)
- **Returns**: First matching record or `null`
- **Use when**: Querying by non-unique fields or applying filters
- **Error handling**: Always check for `null` result

## Current Problems in Codebase

### Problem 1: Using `findFirst` with Unique Fields

**Example: `src/app/api/categories/[categoryId]/route.js`**

```javascript
// ❌ INCORRECT: Using findFirst with unique field
category = await prisma.category.findFirst({
  where: {
    id: categoryId, // id is unique!
    isActive: true,
  },
});
```

**Issues:**

1. **Performance**: `findFirst` is less efficient than `findUnique` for unique lookups
2. **Semantic confusion**: Suggests multiple records might match, but `id` is unique
3. **Data integrity**: If `id` is truly unique, the `isActive` filter should be checked after fetching

**Correct approach:**

```javascript
// ✅ CORRECT: Use findUnique, then check condition
category = await prisma.category.findUnique({
  where: { id: categoryId },
});

if (!category) {
  throw new AppError("Category not found", ErrorType.NOT_FOUND, {
    status: 404,
  });
}

if (!category.isActive) {
  throw new AppError("Category is not active", ErrorType.VALIDATION, {
    status: 403,
  });
}
```

### Problem 2: Using `findFirst` with Unique ID + Additional Filters

**Example: `src/app/api/user/rewards/claim/[id]/route.js`**

```javascript
// ❌ PROBLEMATIC: Using findFirst with unique id + filters
const redemption = await prisma.rewardLog.findFirst({
  where: {
    id, // id is unique!
    userId: user.id,
    redeemed: true,
    claimed: false,
  },
});
```

**Issues:**

1. **Performance**: Unnecessary scan when `id` is unique
2. **Logic error risk**: If `id` is unique, the additional filters are redundant for lookup
3. **Unclear intent**: Are we checking if the record exists, or validating its state?

**Correct approach:**

```javascript
// ✅ CORRECT: Use findUnique, then validate state
const redemption = await prisma.rewardLog.findUnique({
  where: { id },
  include: { reward: true },
});

if (!redemption) {
  throw new AppError("Reward redemption not found", ErrorType.NOT_FOUND, {
    status: 404,
  });
}

// Validate state after fetching
if (redemption.userId !== user.id) {
  throw new AppError("Unauthorized", ErrorType.AUTH, { status: 403 });
}

if (!redemption.redeemed || redemption.claimed) {
  throw new AppError("Reward cannot be claimed", ErrorType.VALIDATION, {
    status: 400,
  });
}
```

### Problem 3: Correct Usage of `findFirst`

**Example: `src/app/api/user/rewards/redeem/route.js`**

```javascript
// ✅ CORRECT: Using findFirst for existence check
const existingRedemption = await prisma.rewardLog.findFirst({
  where: {
    userId: user.id,
    rewardId: reward.id,
  },
});
```

**Why this is correct:**

- Querying by non-unique fields (`userId`, `rewardId`)
- Checking if ANY record exists matching these conditions
- No unique identifier available

## Potential Bugs and Errors

### Bug 1: Silent Data Integrity Issues

**Scenario:**

```javascript
// If id is unique but we use findFirst with filters
const category = await prisma.category.findFirst({
  where: {
    id: categoryId,
    isActive: true,
  },
});

if (!category) {
  // This could mean:
  // 1. Category doesn't exist (404)
  // 2. Category exists but is inactive (403?)
  // We can't tell which!
}
```

**Impact:**

- Unclear error messages
- Wrong HTTP status codes
- Hides data integrity issues

### Bug 2: Race Conditions

**Scenario:**

```javascript
// Using findFirst when findUnique should be used
const redemption = await prisma.rewardLog.findFirst({
  where: { id, userId: user.id },
});

// Between this check and update, another request could modify the record
await prisma.rewardLog.update({ where: { id }, ... });
```

**Impact:**

- Race conditions in concurrent requests
- Data corruption
- Inconsistent state

### Bug 3: Performance Degradation

**Scenario:**

```javascript
// Inefficient: Scanning when direct lookup is possible
const category = await prisma.category.findFirst({
  where: { id: categoryId }, // Should use findUnique
});
```

**Impact:**

- Slower query execution
- Higher database load
- Poor scalability

## Standardization Guidelines

### Rule 1: Use `findUnique` for Unique Identifiers

**When to use:**

- Querying by primary key (`id`)
- Querying by `@unique` fields (`clerkId`, `username`, etc.)
- You have a guaranteed unique identifier

**Pattern:**

```javascript
const record = await prisma.model.findUnique({
  where: { uniqueField: value },
});

if (!record) {
  throw new AppError("Record not found", ErrorType.NOT_FOUND, { status: 404 });
}

// Validate additional conditions after fetching
if (!record.isActive) {
  throw new AppError("Record is not active", ErrorType.VALIDATION, {
    status: 403,
  });
}
```

### Rule 2: Use `findFirst` for Non-Unique Queries

**When to use:**

- Querying by non-unique fields
- Checking existence of records matching conditions
- No unique identifier available

**Pattern:**

```javascript
const record = await prisma.model.findFirst({
  where: {
    field1: value1,
    field2: value2,
  },
});

if (record) {
  // Record exists - handle accordingly
}
```

### Rule 3: Consistent Error Handling

**Always check for null:**

```javascript
// ✅ CORRECT: Always check result
const record = await prisma.model.findUnique({ where: { id } });

if (!record) {
  throw new AppError("Record not found", ErrorType.NOT_FOUND, { status: 404 });
}
```

**Never assume record exists:**

```javascript
// ❌ INCORRECT: Assuming record exists
const record = await prisma.model.findUnique({ where: { id } });
return successResponse({ data: record.data }); // Could be null!
```

## Migration Strategy

### Step 1: Identify All `findFirst` Usages

1. Search for all `findFirst` calls
2. Categorize by:
   - Using unique field → Should be `findUnique`
   - Using non-unique fields → Keep as `findFirst`

### Step 2: Update Unique Field Queries

**Before:**

```javascript
const category = await prisma.category.findFirst({
  where: { id: categoryId, isActive: true },
});
```

**After:**

```javascript
const category = await prisma.category.findUnique({
  where: { id: categoryId },
});

if (!category) {
  throw new AppError("Category not found", ErrorType.NOT_FOUND, {
    status: 404,
  });
}

if (!category.isActive) {
  throw new AppError("Category is not active", ErrorType.VALIDATION, {
    status: 403,
  });
}
```

### Step 3: Verify Error Handling

Ensure all queries have proper null checks and appropriate error responses.

## Risks of Standardization

### Risk 1: Breaking Changes

**Issue:** Changing `findFirst` to `findUnique` might reveal existing bugs

**Mitigation:**

- Test thoroughly after changes
- Review error handling paths
- Check for edge cases

### Risk 2: Over-Engineering

**Issue:** Some `findFirst` usages might be intentional for specific business logic

**Mitigation:**

- Review each case individually
- Document why `findFirst` is used if kept
- Ensure business logic is preserved

### Risk 3: Performance Assumptions

**Issue:** Assuming `findUnique` is always faster (not always true for complex queries)

**Mitigation:**

- Profile queries if performance is critical
- Use database query analysis tools
- Monitor query performance after changes

## Recommended Standard Pattern

```javascript
// Standard pattern for unique lookups
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // 1. Validate input
    if (!id) {
      throw new AppError("ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    // 2. Query by unique field
    const record = await prisma.model.findUnique({
      where: { id },
      include: {
        /* relations */
      },
    });

    // 3. Check existence
    if (!record) {
      throw new AppError("Record not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // 4. Validate business rules (if needed)
    if (!record.isActive) {
      throw new AppError("Record is not active", ErrorType.VALIDATION, {
        status: 403,
      });
    }

    // 5. Return success
    return successResponse({ record });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Summary

**Current Issues:**

- ✅ 4 instances of `findFirst` with unique fields (should be `findUnique`)
- ✅ Inconsistent error handling patterns
- ✅ Performance inefficiencies
- ✅ Unclear semantic intent

**Benefits of Standardization:**

- ✅ Better performance (direct index lookups)
- ✅ Clearer code intent
- ✅ Consistent error handling
- ✅ Better data integrity validation
- ✅ Easier to maintain and debug

**Recommended Action:**

1. Audit all `findFirst` usages
2. Convert unique field queries to `findUnique`
3. Standardize error handling
4. Add validation after fetching unique records
5. Document any exceptions where `findFirst` is intentionally used
