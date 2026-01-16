/**
 * Define public routes that do NOT require authentication
 * 
 * NOTE: Routes in app/(public)/ are AUTOMATICALLY treated as public routes
 * by the middleware. This follows security best practices by making public
 * routes explicit via folder structure. You don't need to add routes from
 * (public) here, but they're listed for documentation purposes.
 * 
 * To make a route public:
 * 1. Move it to app/(public)/ directory (recommended - automatic)
 * 2. Or add it to this array (for routes outside (public) directory)
 */
export const publicRoutes = [
  "/", // Landing page
  "/sign-in(.*)", // Sign in page
  "/sign-up(.*)", // Sign up page
  "/signn(.*)", // Custom sign in page
  "/api/users/lookup", // User lookup for sign-in (public endpoint)
  "/api/webhooks(.*)", // Webhooks (Clerk, etc)
  "/api/stripe/webhook", // Stripe webhook endpoint
  "/api/stripe/checkout", // Stripe checkout (supports unauthenticated)
  "/api/onboarding/(.*)", // Onboarding API routes
  "/discover(.*)", // Discover page (public access)
  "/onboarding/start", // Onboarding start (validates payment)
  
  // Routes in app/(public)/ - automatically public via middleware
  // Listed here for documentation only:
  "/about", // About page (in app/(public)/about)
  "/contact", // Contact page (in app/(public)/contact)
  "/features", // Features page (in app/(public)/features)
  "/legal(.*)", // Legal pages (in app/(public)/legal)
  "/pricing", // Pricing page (in app/(public)/pricing)
  "/resources(.*)", // Resources pages (in app/(public)/resources)
  "/sitemap(.*)", // Sitemap (in app/(public)/sitemap)
  "/support(.*)", // Support pages (in app/(public)/support)
  "/video-ad(.*)", // Video ad page (in app/(public)/video-ad)
];

// Define routes that require authentication but not a workspace
export const authOnlyRoutes = [
  "/onboarding/account", // Account creation
  "/onboarding/workspace", // Workspace setup
  "/onboarding/complete", // Onboarding complete
];

// Define routes that require both auth and active subscription
export const protectedRoutes = [
  "/dashboard(.*)", // Dashboard pages
  "/home(.*)", // Home pages
  "/training(.*)", // Training pages
  "/quiz(.*)", // Quiz pages
  "/games(.*)", // Games pages
  "/leaderboard(.*)", // Leaderboard
  "/rewards(.*)", // Rewards
  "/settings(.*)", // Settings
];

// Define rate limit configurations for different route types
export const rateLimits = {
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
  },
  protected: {
    windowMs: 60 * 1000, // 1 minute
    max: 120, // 120 requests per window
  },
};
