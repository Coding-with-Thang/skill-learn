/**
 * Shared types for Next.js App Router API route handlers (CMS).
 */
import type { NextRequest } from "next/server";

export type RouteContext<TParams extends Record<string, string> = Record<string, string>> = {
  params: Promise<TParams>;
};

export type RouteContextNoParams = RouteContext<Record<string, never>>;
