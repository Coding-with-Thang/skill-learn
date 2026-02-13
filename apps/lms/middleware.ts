/**
 * Next.js middleware entry. Auth and rate-limiting are implemented in proxy.ts.
 * Next.js only invokes a file named middleware.ts at the app root.
 */
export { default } from "./proxy";
