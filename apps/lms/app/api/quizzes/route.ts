import { NextRequest } from "next/server";
import { prisma } from '@skill-learn/database';
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { getTenantContext, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

export const dynamic = "force-dynamic";

/**
 * GET /api/quizzes
 * Returns all quizzes available to the current user (tenant + global).
 * Used by the training page so quizzes show even when categories list is empty or loaded separately.
 */
export async function GET(_request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (context instanceof Response) return context;
    const { tenantId } = context;

    const whereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            isActive: true,
          },
        },
        questions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const quizzesWithImages = await Promise.all(
      quizzes.map(async (quiz) => {
        let imageUrl = quiz.imageUrl || null;
        try {
          if (quiz.fileKey) {
            const signedUrl = await getSignedUrl(quiz.fileKey, 7);
            if (signedUrl) imageUrl = signedUrl;
          }
        } catch (err) {
          console.warn(
            "Failed to generate signed URL for quiz image:",
            quiz.id,
            err instanceof Error ? err.message : err
          );
        }

        return {
          ...quiz,
          imageUrl,
        };
      })
    );

    const res = successResponse({ quizzes: quizzesWithImages }, 200);
    res.headers.set("Cache-Control", "no-store, must-revalidate");
    return res;
  } catch (error) {
    console.error("[quizzes API] Error:", error);
    return handleApiError(error);
  }
}
