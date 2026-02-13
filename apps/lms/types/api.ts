/**
 * Shared types for Next.js App Router API route handlers.
 * Use these for request/context typing to get full type safety.
 */
import type { NextRequest } from "next/server";

/**
 * Route context passed as the second argument to route handlers.
 * In Next.js 15+, dynamic route params are a Promise.
 */
export type RouteContext<TParams extends Record<string, string> = Record<string, string>> = {
  params: Promise<TParams>;
};

/**
 * Typed GET handler (no body).
 * Usage: export async function GET(request: NextRequest, context: RouteContext<{ categoryId: string }>) { ... }
 */
export type GetRouteHandler<TParams extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: RouteContext<TParams>
) => Promise<Response>;

/**
 * Typed POST handler (has body).
 */
export type PostRouteHandler<TParams extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: RouteContext<TParams>
) => Promise<Response>;

/**
 * Typed PUT handler (has body).
 */
export type PutRouteHandler<TParams extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: RouteContext<TParams>
) => Promise<Response>;

/**
 * Typed PATCH handler (has body).
 */
export type PatchRouteHandler<TParams extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: RouteContext<TParams>
) => Promise<Response>;

/**
 * Typed DELETE handler (no body).
 */
export type DeleteRouteHandler<TParams extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: RouteContext<TParams>
) => Promise<Response>;

/**
 * For routes with no dynamic segments, use an empty object:
 * export async function GET(request: NextRequest, _context: RouteContext<Record<string, never>>) { ... }
 * Or omit the second parameter if the route has no params.
 */
export type RouteContextNoParams = RouteContext<Record<string, never>>;
