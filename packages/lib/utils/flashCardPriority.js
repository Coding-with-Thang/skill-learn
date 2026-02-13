/**
 * Flash card category priority resolution
 * Resolves admin vs user priorities based on override mode
 */

const DEFAULT_PRIORITY = 5;

/**
 * Override modes
 */
export const OVERRIDE_MODES = {
  USER_OVERRIDES_ADMIN: "USER_OVERRIDES_ADMIN",
  ADMIN_OVERRIDES_USER: "ADMIN_OVERRIDES_USER",
  ADMIN_ONLY: "ADMIN_ONLY",
  USER_ONLY: "USER_ONLY",
};

const DEFAULT_OVERRIDE_MODE = OVERRIDE_MODES.USER_OVERRIDES_ADMIN;

/**
 * Resolve effective priority for a category
 * @param {object} params
 * @param {number} [params.adminPriority] - Admin-set priority (1-10)
 * @param {number} [params.userPriority] - User-set priority (1-10)
 * @param {string} [params.overrideMode] - FlashCardPrioritySettings.overrideMode
 * @returns {number} Effective priority 1-10
 */
export function resolveCategoryPriority({
  adminPriority,
  userPriority,
  overrideMode = DEFAULT_OVERRIDE_MODE,
}) {
  const admin = adminPriority != null ? adminPriority : null;
  const user = userPriority != null ? userPriority : null;

  switch (overrideMode) {
    case OVERRIDE_MODES.ADMIN_ONLY:
      return admin ?? DEFAULT_PRIORITY;
    case OVERRIDE_MODES.USER_ONLY:
      return user ?? DEFAULT_PRIORITY;
    case OVERRIDE_MODES.ADMIN_OVERRIDES_USER:
      return admin ?? user ?? DEFAULT_PRIORITY;
    case OVERRIDE_MODES.USER_OVERRIDES_ADMIN:
    default:
      return user ?? admin ?? DEFAULT_PRIORITY;
  }
}

/**
 * Apply mastery weighting to priority for study session selection
 * Low mastery → boost weight (show more), high mastery → suppress
 * @param {number} basePriority - Resolved category priority (1-10)
 * @param {number} masteryScore - 0-1
 * @returns {number} Weighted priority for shuffle
 */
export function applyMasteryWeight(basePriority, masteryScore = 0) {
  if (masteryScore < 0.4) {
    return basePriority * 1.5; // Boost
  }
  if (masteryScore > 0.85) {
    return basePriority * 0.5; // Suppress
  }
  return basePriority;
}
