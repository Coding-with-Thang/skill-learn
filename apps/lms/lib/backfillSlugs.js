/**
 * Backfill slug for Chapter and Lesson based on title.
 * Ensures uniqueness per course for chapters and per chapter for lessons.
 * Can be run per-tenant (processes all courses, optionally grouped by tenantId for logging).
 *
 * @param {import('@prisma/client').PrismaClient} prisma - Prisma client instance
 * @param {{ dryRun?: boolean, verbose?: boolean, log?: (msg: string) => void }} [options]
 * @returns {Promise<{ chaptersUpdated: number, lessonsUpdated: number, tenantsProcessed: number }>}
 */
async function backfillChapterAndLessonSlugs(prisma, options = {}) {
  const { dryRun = false, verbose = false, log = console.log } = options;

  let chaptersUpdated = 0;
  let lessonsUpdated = 0;
  const tenantIds = new Set();

  // Use shared slugify (from lib) or inline for script usage
  const slugify =
    typeof require !== "undefined"
      ? require("@skill-learn/lib/utils/utils.js").slugify
      : (await import("@skill-learn/lib/utils/utils.js")).slugify;

  function makeSlugUnique(baseSlug, existingSlugs) {
    let slug = baseSlug;
    let n = 1;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${++n}`;
    }
    return slug;
  }

  // Get all courses with tenantId for grouping (and their chapters/lessons)
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      tenantId: true,
    },
    orderBy: { createdAt: "asc" },
  });

  for (const course of courses) {
    if (course.tenantId) tenantIds.add(course.tenantId);
    if (verbose && log)
      log(
        `Course: ${course.title} (${course.slug})${course.tenantId ? ` [tenant ${course.tenantId}]` : " [global]"}`
      );

    const chapters = await prisma.chapter.findMany({
      where: { courseId: course.id },
      orderBy: { position: "asc" },
      select: { id: true, title: true, slug: true, courseId: true },
    });

    const usedChapterSlugs = new Set(
      chapters.filter((ch) => ch.slug).map((ch) => ch.slug)
    );

    for (const chapter of chapters) {
      const baseSlug = slugify(chapter.title) || "chapter";
      const slug = makeSlugUnique(baseSlug, usedChapterSlugs);
      usedChapterSlugs.add(slug);

      if (chapter.slug !== slug) {
        if (!dryRun) {
          await prisma.chapter.update({
            where: { id: chapter.id },
            data: { slug },
          });
        }
        chaptersUpdated++;
        if (verbose && log)
          log(
            `  Chapter "${chapter.title}" → slug: ${slug}${chapter.slug ? ` (was ${chapter.slug})` : ""}`
          );
      }
    }

    for (const chapter of chapters) {
      const lessons = await prisma.lesson.findMany({
        where: { chapterId: chapter.id },
        orderBy: { position: "asc" },
        select: { id: true, title: true, slug: true, chapterId: true },
      });

      const usedLessonSlugs = new Set(
        lessons.filter((l) => l.slug).map((l) => l.slug)
      );

      for (const lesson of lessons) {
        const baseSlug = slugify(lesson.title) || "lesson";
        const slug = makeSlugUnique(baseSlug, usedLessonSlugs);
        usedLessonSlugs.add(slug);

        if (lesson.slug !== slug) {
          if (!dryRun) {
            await prisma.lesson.update({
              where: { id: lesson.id },
              data: { slug },
            });
          }
          lessonsUpdated++;
          if (verbose && log)
            log(
              `  Lesson "${lesson.title}" → slug: ${slug}${lesson.slug ? ` (was ${lesson.slug})` : ""}`
            );
        }
      }
    }
  }

  return {
    chaptersUpdated,
    lessonsUpdated,
    tenantsProcessed: tenantIds.size,
  };
}

module.exports = { backfillChapterAndLessonSlugs };
