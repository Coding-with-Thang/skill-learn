import prisma from "@/utils/connect";
import { handleApiError } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";
import { getSignedUrl } from "@/utils/adminStorage";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        category: true,
      },
      where: {
        status: "Published", // Only return published courses
      },
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
    return handleApiError(error);
  }
}

