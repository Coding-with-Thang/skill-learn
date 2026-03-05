/**
 * Localization helpers for API responses.
 * Resolves JSON localized fields to plain strings based on user locale.
 */
import { getLocalized, normalizeLocale, type LocalizedString } from "@skill-learn/lib/utils/i18nDb";

/**
 * Resolve localized fields on a course for API response.
 * Mutates and returns the object with title, description, excerptDescription resolved.
 */
export function localizeCourse<T extends Record<string, unknown>>(
  course: T,
  locale: string
): T & { title: string; description: string; excerptDescription: string } {
  const loc = normalizeLocale(locale);
  const title = getLocalized(
    (course.titleJson as LocalizedString) ?? course.title,
    loc
  );
  const description = getLocalized(
    (course.descriptionJson as LocalizedString) ?? course.description,
    loc
  );
  const excerptDescription = getLocalized(
    (course.excerptDescriptionJson as LocalizedString) ?? course.excerptDescription,
    loc
  );
  const { titleJson, descriptionJson, excerptDescriptionJson, ...rest } = course;
  return {
    ...rest,
    title: title || (course.title as string),
    description: description || (course.description as string),
    excerptDescription: excerptDescription || (course.excerptDescription as string),
  } as T & { title: string; description: string; excerptDescription: string };
}

/**
 * Resolve localized fields on a quiz for API response.
 */
export function localizeQuiz<T extends Record<string, unknown>>(
  quiz: T,
  locale: string
): T & { title: string; description: string | null } {
  const loc = normalizeLocale(locale);
  const title = getLocalized(
    (quiz.titleJson as LocalizedString) ?? quiz.title,
    loc
  );
  const description = getLocalized(
    (quiz.descriptionJson as LocalizedString) ?? quiz.description,
    loc
  );
  const { titleJson, descriptionJson, ...rest } = quiz;
  return {
    ...rest,
    title: title || (quiz.title as string),
    description: description || (quiz.description as string) || null,
  } as T & { title: string; description: string | null };
}

/**
 * Resolve localized fields on a reward for API response.
 */
export function localizeReward<T extends Record<string, unknown>>(
  reward: T,
  locale: string
): T & { prize: string; description: string | null } {
  const loc = normalizeLocale(locale);
  const prize = getLocalized(
    (reward.prizeJson as LocalizedString) ?? reward.prize,
    loc
  );
  const description = getLocalized(
    (reward.descriptionJson as LocalizedString) ?? reward.description,
    loc
  );
  const { prizeJson, descriptionJson, ...rest } = reward;
  return {
    ...rest,
    prize: prize || (reward.prize as string),
    description: description || (reward.description as string) || null,
    prizeJson: reward.prizeJson,
    descriptionJson: reward.descriptionJson,
  } as unknown as T & { prize: string; description: string | null };
}

/**
 * Resolve localized fields on a category for API response.
 */
export function localizeCategory<T extends Record<string, unknown>>(
  category: T,
  locale: string
): T & { name: string; description: string | null } {
  const loc = normalizeLocale(locale);
  const name = getLocalized(
    (category.nameJson as LocalizedString) ?? category.name,
    loc
  );
  const description = getLocalized(
    (category.descriptionJson as LocalizedString) ?? category.description,
    loc
  );
  const { nameJson, descriptionJson, ...rest } = category;
  return {
    ...rest,
    name: name || (category.name as string),
    description: description || (category.description as string) || null,
  } as T & { name: string; description: string | null };
}
