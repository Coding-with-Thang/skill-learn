/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo SM-2: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 *
 * Quality mapping from UI feedback:
 * - "Needs Review" (😕) → quality = 2
 * - "Got It" (🙂) → quality = 5
 */

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const QUALITY_NEEDS_REVIEW = 2;
const QUALITY_GOT_IT = 5;

/**
 * Compute next SM-2 interval and schedule
 * @param {object} progress - Current progress record
 * @param {number} quality - User feedback quality (0-5)
 * @returns {object} Updated SM-2 values
 */
export function computeSm2Update(progress, quality) {
  const repetitions = (progress?.repetitions ?? 0) + (quality >= 3 ? 1 : 0);
  let intervalDays = progress?.intervalDays ?? 0;
  let easeFactor = progress?.easeFactor ?? DEFAULT_EASE_FACTOR;

  if (quality < 3) {
    // Failed / Needs Review - reset repetitions, keep ease factor
    return {
      repetitions: 0,
      intervalDays: 0,
      easeFactor,
      nextReviewAt: null, // Will be set to "soon" (e.g. same day or next session)
    };
  }

  // Passed - SM-2 formula
  if (repetitions === 1) {
    intervalDays = 1;
  } else if (repetitions === 2) {
    intervalDays = 6;
  } else {
    intervalDays = Math.round(intervalDays * easeFactor);
  }

  // Ease factor adjustment: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + efDelta);

  const now = new Date();
  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);
  nextReviewAt.setHours(0, 0, 0, 0);

  return {
    repetitions,
    intervalDays,
    easeFactor,
    nextReviewAt,
  };
}

/**
 * Map UI feedback to SM-2 quality
 * @param {"needs_review"|"got_it"} feedback - UI feedback key
 * @returns {number} Quality 0-5
 */
export function feedbackToQuality(feedback) {
  switch (feedback) {
    case "needs_review":
      return QUALITY_NEEDS_REVIEW; // 2
    case "got_it":
      return 4;
    case "mastered":
      return 5;
    default:
      return QUALITY_NEEDS_REVIEW;
  }
}

/**
 * Check if a card is due for review (SM-2)
 * @param {object} progress - FlashCardProgress or null
 * @param {Date} [now] - Reference time (default: now)
 * @returns {boolean}
 */
export function isCardDue(progress, now = new Date()) {
  if (!progress) return true;
  if (!progress.nextReviewAt) return true;
  return new Date(progress.nextReviewAt) <= now;
}

export {
  DEFAULT_EASE_FACTOR,
  MIN_EASE_FACTOR,
  QUALITY_NEEDS_REVIEW,
  QUALITY_GOT_IT,
};
