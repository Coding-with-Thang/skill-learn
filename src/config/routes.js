// Define protected routes that require authentication
export const protectedRoutes = [
  // Page routes
  "/home", // User home page (authenticated dashboard)
  "/dashboard(.*)", // All dashboard routes
  "/quiz(.*)", // All quiz routes
  "/achievements(.*)", // User achievements
  "/stats(.*)", // User statistics
  "/store(.*)", // Store related
  "/training(.*)", // Training content and progress
  "/rewards(.*)", // User rewards
  "/leaderboard(.*)", // Personal rankings
  "/games(.*)", // Game progress and states

  // API routes
  "/api/user", // Base user route
  "/api/user/(.*)", // All user-related API routes
  "/api/admin/(.*)", // All admin API routes
  "/api/quiz/(.*)", // Quiz-related endpoints
  "/api/leaderboard/(.*)", // Leaderboard data endpoints
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
