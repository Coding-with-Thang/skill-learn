"use client";

import Link from "next/link";
import { Button } from "./button";

/**
 * Shared NotFound component for 404 pages
 * @param {Object} props
 * @param {string} props.homeHref - The href to navigate home (default: "/")
 * @param {string} props.homeLabel - The label for the home button (default: "Go back home")
 * @param {string} props.title - Custom title (default: "Oops! Page not found.")
 * @param {string} props.description - Custom description
 */
export function NotFound({
  homeHref = "/",
  homeLabel = "Go back home",
  title = "Oops! Page not found.",
  description = "Sorry, we couldn't find the page you're looking for."
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-linear-to-br from-background to-muted min-h-screen p-4">
      <h1 className="mt-20 font-bold text-xl text-primary">404</h1>
      <p className="mt-4 text-2xl md:text-4xl lg:text-6xl font-semibold text-foreground text-center">
        {title}
      </p>
      <p className="mt-2 text-muted-foreground text-center max-w-md">
        {description}
      </p>
      <Button className="mt-6" asChild>
        <Link href={homeHref}>{homeLabel}</Link>
      </Button>
    </div>
  );
}
