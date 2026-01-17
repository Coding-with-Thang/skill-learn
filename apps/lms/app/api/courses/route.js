import { prisma } from '@skill-learn/database';
import { handleApiError } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage.js";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant.js";

export async function GET() {
  try {
    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter courses by tenant or global content using standardized utility
    // Pattern: (tenantId = userTenantId OR (isGlobal = true AND tenantId IS NULL))
    const whereClause = buildTenantContentFilter(tenantId, {
      status: "Published", // Only return published courses
    });

    const courses = await prisma.course.findMany({
      include: {
        category: true,
      },
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Resolve signed URLs for thumbnails (fileKey). If unavailable, use default image
    const coursesWithImages = await Promise.all(
      courses.map(async (course) => {
        let imageUrl = "/placeholder-course.jpg";
        try {
          if (course.fileKey) {
            const url = await getSignedUrl(course.fileKey, 7);
            if (url) imageUrl = url;
          }
        } catch (err) {
          console.warn(
            "thumbnail fetch failed for",
            course.id,
            err?.message || err
          );
        }

        return {
          ...course,
          imageUrl,
        };
      })
    );

    return successResponse({ courses: coursesWithImages || [] });
  } catch (error) {
    console.error("[courses API] Error:", error);
    console.error("[courses API] Error stack:", error.stack);
    return handleApiError(error);
  }
}
