import { NotFound as NotFoundComponent } from "@skill-learn/ui/components/not-found";

/**
 * Root 404 page for paths outside [locale] (e.g. /unknown).
 * Uses default English text; locale-specific 404s are handled by app/[locale]/not-found.tsx.
 */
export default function NotFound() {
  return (
    <NotFoundComponent
      homeHref="/en"
      homeLabel="Back to Home"
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
    />
  );
}

