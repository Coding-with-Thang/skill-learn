import { prisma } from '@skill-learn/database';
import { handleApiError } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage.js";
import { getTenantContext, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getTenantContext();
    if (context instanceof Response) return context;
    const { tenantId } = context;

    // CRITICAL: Filter courses by tenant or global content
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

    const res = successResponse({ courses: coursesWithImages || [] }, 200);
    res.headers.set("Cache-Control", "no-store, must-revalidate");
    return res;
  } catch (error) {
    console.error("[courses API] Error:", error);
    console.error("[courses API] Error stack:", error.stack);
    return handleApiError(error);
  }
}
