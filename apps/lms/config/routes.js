// Define public routes that do NOT require authentication
export const publicRoutes = [
  "/", // Landing page
  "/sign-in(.*)", // Sign in page
  "/sign-up(.*)", // Sign up page
  "/api/webhooks(.*)", // Webhooks (Clerk, Stripe, etc)
  "/about", // About page
  "/discover(.*)", // Discover page (public access)
  "/legal(.*)", // Legal pages (Privacy, Terms)
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
