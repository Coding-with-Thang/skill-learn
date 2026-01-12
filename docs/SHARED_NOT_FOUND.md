# Shared 404 Not-Found Component

This document describes the shared 404 not-found page implementation across LMS, CMS, and public pages.

## Implementation

A shared `NotFound` component has been created in the `@skill-learn/ui` package and is used by both the LMS and CMS applications through Next.js's `not-found.jsx` file system.

## Structure

### Shared Component
- **Location**: `packages/ui/components/not-found.jsx`
- **Export**: `@skill-learn/ui/components/not-found`
- **Type**: Client Component (uses Link and Button)

### App-Level Files
- **LMS**: `apps/lms/app/not-found.jsx`
- **CMS**: `apps/cms/app/not-found.jsx`

## Features

The shared component accepts props for customization:

- `homeHref` (default: `"/"`) - The route to navigate to when clicking the home button
- `homeLabel` (default: `"Go back home"`) - The text for the home button
- `title` (default: `"Oops! Page not found."`) - The main title text
- `description` (default: `"Sorry, we couldn't find the page you're looking for."`) - The description text

## Usage

### LMS Implementation
```jsx
import { NotFound as NotFoundComponent } from "@skill-learn/ui/components/not-found";

export default function NotFound() {
  return <NotFoundComponent homeHref="/" homeLabel="Go back home" />;
}
```

### CMS Implementation
```jsx
import { NotFound as NotFoundComponent } from "@skill-learn/ui/components/not-found";

export default function NotFound() {
  return <NotFoundComponent homeHref="/cms" homeLabel="Go to Dashboard" />;
}
```

## Next.js Integration

Next.js automatically uses the `not-found.jsx` file in the app directory to handle 404 errors. The file:

1. Must export a default React component
2. Should be placed at the app directory level (`app/not-found.jsx`)
3. Is automatically used when:
   - A route doesn't match any page
   - `notFound()` is called from a Server Component or Route Handler

## Styling

The component uses semantic design tokens:
- `bg-background` and `bg-muted` for backgrounds
- `text-primary`, `text-foreground`, and `text-muted-foreground` for text
- Responsive typography (`text-2xl md:text-4xl lg:text-6xl`)
- Proper spacing and padding

## Benefits

1. **Consistency**: Same 404 page design across all apps
2. **Maintainability**: Single source of truth for the 404 component
3. **Flexibility**: Apps can customize the home route and labels
4. **Theme Support**: Uses semantic tokens that work with light/dark themes
5. **Responsive**: Mobile-friendly design with responsive typography
