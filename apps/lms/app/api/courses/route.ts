import { type NextRequest } from "next/server";
import { prisma } from '@skill-learn/database';
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { getTenantContext, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
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
            err instanceof Error ? err.message : err
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
    console.error("[courses API] Error stack:", error instanceof Error ? error.stack : undefined);
    return handleApiError(error);
  }
}
