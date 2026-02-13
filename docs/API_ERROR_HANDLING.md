# API Error Handling Standard

This document describes the standardized error handling pattern for API routes in the application.

## Overview

All API routes should use the standardized error handling utilities to ensure consistent error responses across the application.

## Standardized Error Handler

The `handleApiError` function from `@skill-learn/lib/utils/errorHandler` provides consistent error handling:

```typescript
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";

export async function GET(request: Request) {
  try {
    // Your route logic here
    return NextResponse.json({ data: "success" });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Error Types

Use `AppError` for structured errors:

```typescript
import { AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";

// Validation error
throw new AppError("Invalid input", ErrorType.VALIDATION, { status: 400 });

// Not found error
throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });

// Auth error
throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
```

## Standardized Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Error message",
  "type": "error_type",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": "Additional details (development only)"
}
```

## Migration Guide

### Before (Inconsistent Patterns)

```typescript
// Pattern 1: Direct NextResponse
catch (error) {
  return NextResponse.json({ error: "Error message" }, { status: 500 });
}

// Pattern 2: Custom handling
catch (error) {
  console.error("Error:", error);
  return NextResponse.json(
    { error: "Internal server error", details: error.message },
    { status: 500 }
  );
}

// Pattern 3: handleApiError (old version)
catch (error) {
  const errorResponse = handleApiError(error);
  return NextResponse.json(errorResponse, { status: errorResponse.status });
}
```

### After (Standardized Pattern)

```typescript
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";

export async function GET(request: Request) {
  try {
    // Validation
    if (!requiredField) {
      throw new AppError("Missing required field", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    // Business logic
    const data = await fetchData();

    if (!data) {
      throw new AppError("Data not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Best Practices

1. **Always use `handleApiError`** in catch blocks
2. **Use `AppError`** for structured errors with proper types
3. **Throw errors** instead of returning error responses directly
4. **Let `handleApiError`** determine the appropriate status code
5. **Use ErrorType enum** for consistent error categorization

## Error Type Reference

- `ErrorType.AUTH` - Authentication/authorization errors (401, 403)
- `ErrorType.VALIDATION` - Input validation errors (400)
- `ErrorType.NOT_FOUND` - Resource not found (404)
- `ErrorType.API` - External API errors
- `ErrorType.NETWORK` - Network-related errors
- `ErrorType.UNKNOWN` - Unexpected errors (500)

## Examples

### Simple Route

```typescript
import { NextResponse } from "next/server";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { requireAuth } from "@skill-learn/lib/utils/auth";

export async function GET(request) {
  try {
    const userId = await requireAuth();
    if (userId instanceof NextResponse) {
      return userId;
    }

    // Your logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Route with Validation

```typescript
import { NextResponse } from "next/server";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      throw new AppError("Name is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Notes

- The error handler automatically includes stack traces in development mode
- Status codes are automatically determined from error types
- All errors are logged to the console
- The response format is consistent across all routes

