/**
 * Global HTTP security headers for Next.js `headers()` config.
 * Keep CSP off by default — Next.js + Clerk need a nonce-based CSP when enabled.
 */

const BASE_HEADERS = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

/**
 * @returns {import('next').Header[]}
 */
export function getGlobalSecurityHeaders() {
  const headers = [...BASE_HEADERS];
  if (process.env.NODE_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }
  return headers;
}

/**
 * @returns {{ source: string; headers: import('next').Header[] }[]}
 */
export function getSecurityHeaderRouteRules() {
  return [
    {
      source: "/:path*",
      headers: getGlobalSecurityHeaders(),
    },
  ];
}
