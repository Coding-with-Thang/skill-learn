import { type NextRequest } from "next/server";
import { getCourseWithChaptersAndLessons } from "@/lib/courses";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import { getLocaleFromRequest } from "@/lib/localeFromRequest";
import { localizeCourse, localizeCategory } from "@/lib/localize";
import type { RouteContext } from "@/types";

type CourseIdParams = { courseId: string };

/**
 * GET /api/courses/[courseId]
 * Returns a single published course with chapters and lessons (tenant-aware).
 * Pass ?locale=fr or x-locale header for localized content.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<CourseIdParams>
) {
  try {
    const { courseId } = await params;

    if (!courseId) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const tenantId = await getTenantId();
    const course = await getCourseWithChaptersAndLessons(courseId, tenantId ?? undefined);

    if (!course) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Only return published courses; enforce tenant access
    if (course.status !== "Published") {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const allowed = tenantId
      ? course.tenantId === tenantId || (course.isGlobal && !course.tenantId)
      : course.isGlobal && !course.tenantId;

    if (!allowed) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const locale = getLocaleFromRequest(request);
    let imageUrl = "/placeholder-course.jpg";
    try {
      if (course.fileKey) {
        const url = await getSignedUrl(course.fileKey, 7);
        if (url) imageUrl = url;
      }
    } catch (err) {
      console.warn("Signed URL failed for course", courseId, err instanceof Error ? err.message : err);
    }

    const withImage = { ...course, imageUrl };
    const localized = localizeCourse(withImage, locale);
    if (localized.category) {
      localized.category = localizeCategory(localized.category, locale);
    }
    return successResponse({ course: localized });
  } catch (error) {
    return handleApiError(error);
  }
}
