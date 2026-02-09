import { prisma } from "@skill-learn/database";
import { slugify } from "@skill-learn/lib/utils/utils.js";

/**
 * Default include for course with chapters and lessons (ordered by position).
 * Use with prisma.course.findUnique or findMany.
 */
// Match Prisma schema: Chapter uses "order", CourseChapter uses "position".
// Use "position" if Course.chapters points to CourseChapter; use "order" for Chapter.
export const courseWithChaptersAndLessonsInclude = {
  category: true,
  chapters: {
    orderBy: { position: "asc" },
    include: {
      lessons: {
        orderBy: { position: "asc" },
      },
    },
  },
};

/** Heuristic: ObjectIds are 24-char hex; slugs are shorter and may contain hyphens */
function looksLikeObjectId(str) {
  return typeof str === "string" && /^[a-f0-9]{24}$/i.test(str);
}

/**
 * Check if a course slug is already used within the same tenant (or among global courses when tenantId is null).
 *
 * @param {object} params
 * @param {string} params.slug - Course slug to check
 * @param {string|null} [params.tenantId] - Tenant ID (null = global courses)
 * @param {string} [params.excludeCourseId] - Course ID to exclude (for updates)
 * @returns {Promise<boolean>} True if slug is taken
 */
export async function isCourseSlugTakenInTenant({ slug, tenantId, excludeCourseId }) {
  if (!slug || typeof slug !== "string") return false;
  const where = {
    slug: slug.trim().toLowerCase(),
    tenantId: tenantId ?? null,
  };
  if (excludeCourseId) {
    where.id = { not: excludeCourseId };
  }
  const existing = await prisma.course.findFirst({
    where,
    select: { id: true },
  });
  return !!existing;
}

/**
 * Resolve course id from slug or id. Returns the course id if found, null otherwise.
 * When resolving by slug, pass tenantId to ensure the course belongs to that tenant (or is global).
 *
 * @param {string} courseIdOrSlug - Course id or slug
 * @param {string|null} [tenantId] - When resolving by slug, restrict to this tenant (or null for global)
 * @returns {Promise<string|null>} Course id or null
 */
export async function resolveCourseId(courseIdOrSlug, tenantId) {
  if (!courseIdOrSlug) return null;
  if (looksLikeObjectId(courseIdOrSlug)) {
    const course = await prisma.course.findUnique({
      where: { id: courseIdOrSlug },
      select: { id: true, tenantId: true },
    });
    if (!course) return null;
    if (tenantId !== undefined && course.tenantId !== tenantId && !(tenantId == null && course.tenantId == null)) {
      return null;
    }
    return course?.id ?? null;
  }
  const where = { slug: courseIdOrSlug };
  if (tenantId !== undefined) {
    where.tenantId = tenantId ?? null;
  }
  const course = await prisma.course.findFirst({
    where,
    select: { id: true },
  });
  return course?.id ?? null;
}

/**
 * Get a single course by ID or slug with all chapters and lessons from the database.
 * When courseIdOrSlug is a slug, pass tenantId to resolve within that tenant (or null for global).
 *
 * @param {string} courseIdOrSlug - Course id or slug
 * @param {string|null} [tenantId] - Optional; when resolving by slug, restrict to this tenant
 * @returns {Promise<object|null>} Course with category, chapters, and lessons, or null if not found
 */
export async function getCourseWithChaptersAndLessons(courseIdOrSlug, tenantId) {
  if (!courseIdOrSlug) return null;

  const resolvedId = await resolveCourseId(courseIdOrSlug, tenantId);
  if (!resolvedId) return null;

  return prisma.course.findUnique({
    where: { id: resolvedId },
    include: courseWithChaptersAndLessonsInclude,
  });
}

/**
 * Generate a unique chapter slug within a course. Chapter slugs are unique per course (not per tenant)
 * so different courses can reuse the same chapter slug (e.g. "introduction").
 *
 * @param {import('@prisma/client').PrismaClient} prismaClient - Prisma client
 * @param {string} courseId - Course ID
 * @param {string} title - Chapter title (will be slugified)
 * @param {string} [excludeChapterId] - When updating, exclude this chapter from the uniqueness check
 * @returns {Promise<string>} Unique slug
 */
export async function generateUniqueChapterSlug(prismaClient, courseId, title, excludeChapterId) {
  const baseSlug = slugify(title) || "chapter";
  let slug = baseSlug;
  let n = 1;
  while (true) {
    const where = { courseId, slug };
    if (excludeChapterId) where.id = { not: excludeChapterId };
    const existing = await prismaClient.chapter.findFirst({
      where,
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${++n}`;
  }
}

/**
 * Generate a unique lesson slug within a chapter. Lesson slugs are unique per chapter.
 *
 * @param {import('@prisma/client').PrismaClient} prismaClient - Prisma client
 * @param {string} chapterId - Chapter ID
 * @param {string} title - Lesson title (will be slugified)
 * @param {string} [excludeLessonId] - When updating, exclude this lesson from the uniqueness check
 * @returns {Promise<string>} Unique slug
 */
export async function generateUniqueLessonSlug(prismaClient, chapterId, title, excludeLessonId) {
  const baseSlug = slugify(title) || "lesson";
  let slug = baseSlug;
  let n = 1;
  while (true) {
    const where = { chapterId, slug };
    if (excludeLessonId) where.id = { not: excludeLessonId };
    const existing = await prismaClient.lesson.findFirst({
      where,
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${++n}`;
  }
}

/**
 * Get multiple courses with chapters and lessons from the database.
 * Use for admin listing or when structure is needed. Apply your own `where` filter (e.g. tenant, status).
 *
 * @param {object} [options] - Optional query options
 * @param {object} [options.where] - Prisma where clause (e.g. { status: "Published" })
 * @param {number} [options.take] - Max number of courses to return
 * @param {number} [options.skip] - Number of courses to skip (pagination)
 * @returns {Promise<object[]>} Array of courses with category, chapters, and lessons
 */
export async function getCoursesWithChaptersAndLessons(options = {}) {
  const { where = {}, take, skip } = options;

  return prisma.course.findMany({
    where,
    take,
    skip,
    orderBy: { createdAt: "desc" },
    include: courseWithChaptersAndLessonsInclude,
  });
}
