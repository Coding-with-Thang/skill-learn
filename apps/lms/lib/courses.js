import { prisma } from "@skill-learn/database";

/**
 * Default include for course with chapters and lessons (ordered by position).
 * Use with prisma.course.findUnique or findMany.
 */
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

/**
 * Get a single course by ID with all chapters and lessons from the database.
 * Chapters and lessons are ordered by position ascending.
 *
 * @param {string} courseId - Course ObjectId
 * @returns {Promise<object|null>} Course with category, chapters, and lessons, or null if not found
 */
export async function getCourseWithChaptersAndLessons(courseId) {
  if (!courseId) return null;

  return prisma.course.findUnique({
    where: { id: courseId },
    include: courseWithChaptersAndLessonsInclude,
  });
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
