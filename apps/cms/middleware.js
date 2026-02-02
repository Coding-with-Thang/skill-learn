/**
 * Next.js middleware entry. Framework only loads middleware.js (not proxy.js).
 * Re-export the Clerk + route logic from proxy.js.
 */
export { default } from "./proxy.js";
