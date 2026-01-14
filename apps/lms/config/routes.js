// Define public routes that do NOT require authentication
export const publicRoutes = [
  "/", // Landing page
  "/sign-in(.*)", // Sign in page
  "/sign-up(.*)", // Sign up page
  "/api/webhooks(.*)", // Webhooks (Clerk, etc)
  "/api/stripe/webhook", // Stripe webhook endpoint
  "/api/stripe/checkout", // Stripe checkout (supports unauthenticated)
  "/api/onboarding/(.*)", // Onboarding API routes
  "/about", // About page
  "/discover(.*)", // Discover page (public access)
  "/legal(.*)", // Legal pages (Privacy, Terms)
  "/pricing", // Pricing page (public access)
  "/onboarding/start", // Onboarding start (validates payment)
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
