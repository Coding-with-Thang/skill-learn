import { NotFound as NotFoundComponent } from "@skill-learn/ui/components/not-found";

/**
 * Root 404 page for paths outside [locale] (e.g. /unknown).
 * Uses default English text; locale-specific 404s are handled by app/[locale]/not-found.tsx.
 */
export default function NotFound() {
  return (
    <NotFoundComponent
      homeHref="/en"
      homeLabel="Go Back Home"
      title="Oops! It looks like this page took a learning break."
      description="The page you are looking for might have been moved, graduated, or is currently studying something entirely new."
      searchLabel="Search for Courses"
    />
  );
}

